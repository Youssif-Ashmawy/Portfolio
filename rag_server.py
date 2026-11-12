import os
import re
import time
from collections import defaultdict, deque

import chromadb
import requests
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    import ollama
    OLLAMA_SDK_AVAILABLE = True
except ImportError:
    OLLAMA_SDK_AVAILABLE = False

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

app = FastAPI(title="Portfolio RAG API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_MESSAGE_CHARS = 500
RATE_LIMIT_REQUESTS = 10
RATE_LIMIT_WINDOW_SECONDS = 60

class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=MAX_MESSAGE_CHARS)
    model: str = "llama3.2"

class RateLimiter:
    """In-memory sliding-window limit per client IP (single Render instance)."""

    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.hits: dict[str, deque] = defaultdict(deque)

    def allow(self, key: str) -> bool:
        now = time.monotonic()
        hits = self.hits[key]
        while hits and now - hits[0] > self.window_seconds:
            hits.popleft()
        if len(hits) >= self.max_requests:
            return False
        hits.append(now)
        # Drop idle clients so the table doesn't grow forever
        if len(self.hits) > 10_000:
            for k in [k for k, v in self.hits.items() if not v]:
                del self.hits[k]
        return True

rate_limiter = RateLimiter(RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW_SECONDS)

def client_ip(request: Request) -> str:
    # Render sits behind a proxy; the first X-Forwarded-For entry is the visitor
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

class ChatResponse(BaseModel):
    response: str
    sources: list[str]

class RAGService:
    def __init__(self):
        self.db_path = "./chroma_db"
        self.client = chromadb.PersistentClient(path=self.db_path)
        self.collection = self.client.get_collection("portfolio_data")
        self._embedding_model = None  # lazy-loaded on first request
        self.ollama_base_url = "http://localhost:11434"

    @property
    def embedding_model(self):
        if self._embedding_model is None:
            from sentence_transformers import SentenceTransformer
            self._embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        return self._embedding_model
    
    def check_ollama_available(self) -> bool:
        """Check if Ollama is available."""
        try:
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except Exception:  # noqa: BLE001
            return False
    
    def get_relevant_documents(self, query: str, n_results: int = 3) -> list[str]:
        """Retrieve relevant documents from the vector database."""
        try:
            # Embed the query ourselves so ChromaDB doesn't load a second copy of the model
            query_embedding = self.embedding_model.encode([query]).tolist()
            # Fetch many candidates to account for Resume Overview chunks crowding out section chunks
            results = self.collection.query(
                query_embeddings=query_embedding,
                n_results=n_results * 5
            )
            docs = results['documents'][0] if results['documents'] else []
            # Prefer section-specific chunks over the generic Resume Overview duplicates
            section_docs = [d for d in docs if not d.startswith("Resume Overview:")]
            overview_docs = [d for d in docs if d.startswith("Resume Overview:")]
            combined = section_docs + overview_docs
            return combined[:n_results * 2]
        except Exception as e:  # noqa: BLE001
            print(f"Error retrieving documents: {e}")
            return []
    
    def format_response(self, text: str) -> str:
        """Ensure bullet points and section headers are separated by newlines."""
        # Fix PDF artifact: "Technologies :" glued to previous item (e.g. "CI/CD Technologies :")
        text = re.sub(r'(?<!\n)(Technologies\s*:)', r'\n\n\1', text)
        # Only treat • as a bullet (avoids mangling hyphens inside words like "dependency-aware")
        # Add newline before • if not already preceded by one
        text = re.sub(r'(?<!\n)(•)', r'\n\1', text)
        # Collapse multiple blank lines between bullets to a single newline
        text = re.sub(r'\n{2,}(•)', r'\n\1', text)
        # Add a blank line before a section header (non-bullet line that follows a bullet line)
        text = re.sub(r'(\n•[^\n]+)\n([^•\n])', r'\1\n\n\2', text)
        # Collapse 3+ consecutive newlines to 2
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    def generate_response_with_groq(self, query: str, context: str) -> str:
        """Generate response using Groq API — free-tier Llama (production LLM)."""
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))

        prompt = f"""You are an assistant answering questions about Youssif Ashmawy's portfolio.

Rules:
1. Answer ONLY using information explicitly present in the context below. Never invent or infer details not stated.
2. If the context does not contain the answer, respond with exactly: "I don't have an answer to this question. I'll be happy to help you know more about his experience, projects or skills."
3. Do NOT add category titles or headings like "Work Experience", "Projects", "Technical Skills", or similar. Jump straight into the content.
4. Scan ALL context chunks and include EVERY item found — do not stop early.
5. Formatting rules by content type:
   - Experience: "Company Name | Date Range" on one line, "Job Title, Location" on the next line, then bullet points for responsibilities. Blank line between jobs.
   - Projects: "Project Name" on one line, then "Skills used: [comma-separated list of technologies]" on the next line, then bullet points. Blank line between projects. Do NOT include GitHub Repo, Live Demo, Research Paper, or any links.
   - Skills: List each subcategory (e.g. "Programming Languages :") on its own line followed by bullet points. Include ALL subcategories present in the context. Blank line between subcategories.

Context:
{context}

Question: {query}

Answer:"""

        # llama-3.3-70b-versatile was shut down by Groq; override with GROQ_MODEL if this one is retired too
        completion = client.chat.completions.create(
            model=os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
            max_completion_tokens=2048,
            reasoning_effort="low",
            include_reasoning=False,
            messages=[{"role": "user", "content": prompt}]
        )
        return self.format_response(completion.choices[0].message.content)

    def generate_response_with_ollama(self, query: str, context: str, model: str = "llama3.2") -> str:
        """Generate response using local Ollama model."""
        prompt = f"""You are an assistant answering questions about Youssif Ashmawy's portfolio.

Rules:
1. Answer ONLY using information explicitly present in the context below. Never invent or infer details not stated.
2. If the context does not contain the answer, respond with exactly: "I don't have an answer to this question. I'll be happy to help you know more about his experience, projects or skills."
3. Do NOT add category titles or headings like "Work Experience", "Projects", "Technical Skills", or similar. Jump straight into the content.
4. Scan ALL context chunks and include EVERY item found — do not stop early.
5. Formatting rules by content type:
   - Experience: "Company Name | Date Range" on one line, "Job Title, Location" on the next line, then bullet points for responsibilities. Blank line between jobs.
   - Projects: "Project Name" on one line, then "Skills used: [comma-separated list of technologies]" on the next line, then bullet points. Blank line between projects. Do NOT include GitHub Repo, Live Demo, Research Paper, or any links.
   - Skills: List each subcategory (e.g. "Programming Languages :") on its own line followed by bullet points. Include ALL subcategories present in the context. Blank line between subcategories.

Context:
{context}

Question: {query}

Answer:"""

        try:
            # Check if Ollama is available
            if not self.check_ollama_available():
                return "Ollama is not running. Please start Ollama first by running 'ollama serve' in your terminal."
            
            # Try to use the ollama Python library
            try:
                if OLLAMA_SDK_AVAILABLE:
                    response = ollama.generate(model=model, prompt=prompt)
                    return self.format_response(response['response'])
                raise ImportError("ollama SDK not installed")
            except Exception:  # noqa: BLE001
                # Fallback to direct API call
                response = requests.post(
                    f"{self.ollama_base_url}/api/generate",
                    json={
                        "model": model,
                        "prompt": prompt,
                        "stream": False
                    },
                    timeout=30
                )
                if response.status_code == 200:
                    return self.format_response(response.json().get('response', 'Sorry, I could not generate a response.'))
                else:
                    return f"Error from Ollama: {response.status_code}"

        except Exception as e:  # noqa: BLE001
            return f"Error generating response: {e!s}"
    
    def generate_fallback_response(self, query: str, context: str) -> str:
        """Generate a simple fallback response without Ollama."""
        # Simple keyword-based responses
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['experience', 'work', 'job']):
            if 'kubernetes' in query_lower or 'k8s' in query_lower:
                return "At Nutanix, Youssif deployed and configured Nutanix hyperconverged Kubernetes and AI platforms, and designed a two-phase Velero migration workflow that reduced downtime by 50%."
            elif 'nutanix' in query_lower:
                return "Youssif was an AI Systems Engineer at Nutanix (Sep 2025 - May 2026), where he deployed Nutanix hyperconverged Kubernetes and AI platforms and cut migration downtime by 50% with a two-phase Velero workflow. He holds five Nutanix certifications: NCA, NCP-MCI, NCP-CN, NCP-MCA and NCP-AI."
            elif 'bsf' in query_lower or 'fransi' in query_lower or 'vllm' in query_lower:
                return "Youssif is an MLOps Engineer at Banque Saudi Fransi (BSF) since Jun 2026. He cut the latency of locally hosted LLMs by 90% by tuning vLLM inference parameters, built a Grafana dashboard on vLLM and DCGM metrics, and is redesigning GPU allocation and load balancing."
            else:
                return "Youssif is an MLOps Engineer at Banque Saudi Fransi (BSF). Before that he was an AI Systems Engineer at Nutanix and an Automation Engineer at Hydro Ottawa."
        
        elif any(word in query_lower for word in ['education', 'degree', 'university', 'college']):
            return "Youssif graduated with a Bachelor of Computer Science Honours with High Distinction from Carleton University (Sep 2022 - Aug 2025)."
        
        elif any(word in query_lower for word in ['project', 'projects']):
            if 'fancygit' in query_lower:
                return "FancyGit is an intelligent CLI wrapper for Git that provides AI-generated explanations, dry-run previews, and interactive learning quizzes. It was built with Python, Git, Ollama, CI/CD, PyPI, and GitHub Actions."
            elif 'tactilenet' in query_lower:
                return "TactileNet is a project that expanded tactile datasets and integrated multimodal feedback using Transformers, boosting model robustness by 25%. It was built with Python, PyTorch, Transformers, Diffusers, PEFT, and LoRA."
            elif 'graph' in query_lower:
                return "LeGraphTheory constructed NBA assist networks from PBP Stats API data, modeled as weighted graphs with NetworkX to analyze team structure and dynamics."
            else:
                return "Youssif's projects include the MLOps Bias Monitoring Pipeline (Kafka, XGBoost, Fairlearn), RAG ME (GitHub code Q&A with hybrid retrieval), FancyGit (AI-powered Git CLI), MiMi Assistant (offline macOS assistant), TactileNet Modified (multimodal tactile learning) and LeGraphTheory (NBA network analysis)."

        elif any(word in query_lower for word in ['skill', 'skills', 'technology', 'tech']):
            return "Youssif's skills include: Languages (Python, Java, C, C++, JavaScript, SQL), Cloud/DevOps (AWS, Nutanix, Azure, Docker, Kubernetes, Linux, CI/CD, GitHub Actions, Velero, OpenStack), AI/ML (PyTorch, Transformers, Diffusers, Scikit-Learn, OpenCV, RAG, MLflow) and tools such as Grafana and Kafka."
        
        elif any(word in query_lower for word in ['contact', 'email', 'phone']):
            return "You can contact Youssif at ashmawyyoussif@gmail.com or +966-543-241-340. His GitHub is github.com/youssif-ashmawy and LinkedIn is linkedin.com/in/youssif-ashmawy."
        
        else:
            return "I don't have an answer to this question. I'll be happy to help you know more about his experience, projects or skills."

# Initialize RAG service
rag_service = RAGService()

@app.get("/")
@app.head("/")
async def root():
    return {"message": "Portfolio RAG API is running"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    ollama_status = rag_service.check_ollama_available()
    return {
        "status": "healthy",
        "ollama_available": ollama_status,
        "vector_db_loaded": True
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, http_request: Request):
    """Chat endpoint with RAG functionality."""
    if not rate_limiter.allow(client_ip(http_request)):
        raise HTTPException(
            status_code=429,
            detail="Too many questions in a short time. Please wait a minute and try again.",
        )
    try:
        # Retrieve relevant documents
        relevant_docs = rag_service.get_relevant_documents(request.message, n_results=5)
        
        if not relevant_docs:
            return ChatResponse(
                response="I don't have an answer to this question. I'll be happy to help you know more about his experience, projects or skills.",
                sources=[]
            )
        
        # Combine context — reverse so highest-similarity chunks appear last (recency bias)
        context = "\n\n".join(reversed(relevant_docs))
        # Fix PDF extraction artifact before sending to the model:
        # "CI/CD" (last DevOps item) gets merged with "Technologies :" (next subcategory header)
        context = re.sub(r'\bCI/CD\s+(Technologies\s*:)', r'CI/CD\nTechnologies :', context)
        
        # Generate response — priority: Groq (free Llama) → Ollama → keyword fallback
        if GROQ_AVAILABLE and os.getenv("GROQ_API_KEY"):
            response = rag_service.generate_response_with_groq(request.message, context)
        elif rag_service.check_ollama_available():
            response = rag_service.generate_response_with_ollama(
                request.message, context, request.model
            )
        else:
            response = rag_service.generate_fallback_response(request.message, context)
        
        return ChatResponse(
            response=response,
            sources=relevant_docs
        )

    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Error processing request: {e!s}")

@app.get("/models")
async def get_available_models():
    """Get available Ollama models."""
    try:
        if not rag_service.check_ollama_available():
            return {"models": [], "message": "Ollama is not available"}

        response = requests.get(f"{rag_service.ollama_base_url}/api/tags")  # noqa: ASYNC210
        if response.status_code == 200:
            models = response.json().get('models', [])
            return {"models": [model['name'] for model in models]}
        else:
            return {"models": [], "message": "Could not retrieve models"}

    except Exception as e:  # noqa: BLE001
        return {"models": [], "message": f"Error: {e!s}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
