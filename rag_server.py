from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chromadb
from sentence_transformers import SentenceTransformer
import ollama
import requests
import json
from typing import List, Dict, Any
import os

app = FastAPI(title="Portfolio RAG API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    model: str = "llama3.2"

class ChatResponse(BaseModel):
    response: str
    sources: List[str]

class RAGService:
    def __init__(self):
        self.db_path = "./chroma_db"
        self.client = chromadb.PersistentClient(path=self.db_path)
        self.collection = self.client.get_collection("portfolio_data")
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.ollama_base_url = "http://localhost:11434"
    
    def check_ollama_available(self) -> bool:
        """Check if Ollama is available."""
        try:
            response = requests.get(f"{self.ollama_base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def get_relevant_documents(self, query: str, n_results: int = 3) -> List[str]:
        """Retrieve relevant documents from the vector database."""
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results
            )
            return results['documents'][0] if results['documents'] else []
        except Exception as e:
            print(f"Error retrieving documents: {e}")
            return []
    
    def generate_response_with_ollama(self, query: str, context: str, model: str = "llama3.2") -> str:
        """Generate response using local Ollama model."""
        prompt = f"""You are a helpful assistant answering questions about Youssif Ashmawy's portfolio. 
Use the following context to answer the question. If the context doesn't contain the answer, say you don't have that information.

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
                response = ollama.generate(model=model, prompt=prompt)
                return response['response']
            except:
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
                    return response.json().get('response', 'Sorry, I could not generate a response.')
                else:
                    return f"Error from Ollama: {response.status_code}"
                    
        except Exception as e:
            return f"Error generating response: {str(e)}"
    
    def generate_fallback_response(self, query: str, context: str) -> str:
        """Generate a simple fallback response without Ollama."""
        # Simple keyword-based responses
        query_lower = query.lower()
        
        if any(word in query_lower for word in ['experience', 'work', 'job']):
            if 'kubernetes' in query_lower or 'k8s' in query_lower:
                return "Based on the portfolio, Youssif has extensive experience with Kubernetes. At Kuberox Technologies, he deployed and configured Nutanix hyperconverged cloud Kubernetes platforms and built a dependency-aware Kubernetes migration orchestrator using FastAPI and NetworkX."
            elif 'nutanix' in query_lower:
                return "Youssif works at Kuberox Technologies as an IT Systems Engineer where he deploys and configures Nutanix hyperconverged cloud Kubernetes and AI platforms. He also holds multiple Nutanix certifications including NCA, NCP-MCI, NCP-CN, NCP-MCA, and NCP-AI."
            else:
                return "Youssif works as an IT Systems Engineer at Kuberox Technologies and previously as a Cybersecurity Assistant at Hydro Ottawa. He has experience with cloud platforms, AI/ML systems, and cybersecurity automation."
        
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
                return "Youssif has worked on several projects including FancyGit (AI-powered Git CLI), TactileNet (multimodal tactile learning), and LeGraphTheory (NBA network analysis)."
        
        elif any(word in query_lower for word in ['skill', 'skills', 'technology', 'tech']):
            return "Youssif's technical skills include: Programming Languages (Python, Java, C/C++, HTML/CSS, JavaScript, SQL, NodeJS, React), DevOps & Cloud (Nutanix, AWS, Docker, Kubernetes, Linux, Git, CI/CD), and Technologies (PyTorch, Transformers, Scikit-Learn, NetworkX)."
        
        elif any(word in query_lower for word in ['contact', 'email', 'phone']):
            return "You can contact Youssif at ashmawyyoussif@gmail.com or +966-543-241-340. His GitHub is github.com/youssif-ashmawy and LinkedIn is linkedin.com/in/youssif-ashmawy."
        
        else:
            return "I can help you with information about Youssif's experience, education, projects, skills, or contact details. What would you like to know more about?"

# Initialize RAG service
rag_service = RAGService()

@app.get("/")
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
async def chat(request: ChatRequest):
    """Chat endpoint with RAG functionality."""
    try:
        # Retrieve relevant documents
        relevant_docs = rag_service.get_relevant_documents(request.message, n_results=3)
        
        if not relevant_docs:
            return ChatResponse(
                response="I couldn't find relevant information in the portfolio. Please try asking about Youssif's experience, education, projects, or skills.",
                sources=[]
            )
        
        # Combine context
        context = "\n\n".join(relevant_docs)
        
        # Generate response
        if rag_service.check_ollama_available():
            response = rag_service.generate_response_with_ollama(
                request.message, context, request.model
            )
        else:
            response = rag_service.generate_fallback_response(request.message, context)
        
        return ChatResponse(
            response=response,
            sources=relevant_docs
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.get("/models")
async def get_available_models():
    """Get available Ollama models."""
    try:
        if not rag_service.check_ollama_available():
            return {"models": [], "message": "Ollama is not available"}
        
        response = requests.get(f"{rag_service.ollama_base_url}/api/tags")
        if response.status_code == 200:
            models = response.json().get('models', [])
            return {"models": [model['name'] for model in models]}
        else:
            return {"models": [], "message": "Could not retrieve models"}
            
    except Exception as e:
        return {"models": [], "message": f"Error: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
