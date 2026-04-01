# Youssif Ashmawy — Portfolio Website

A modern, dark-themed personal portfolio showcasing my experience, projects, certifications, and an AI-powered chatbot built with a custom RAG pipeline.

🌐 **Live site**: [youssif-ashmawy.github.io/Portfolio](https://youssif-ashmawy.github.io/Portfolio)

---

## 🛠️ Tech Stack

### Frontend
- **HTML5 / CSS3 / Vanilla JavaScript** — no frameworks, built from scratch
- **Google Fonts** — Inter and JetBrains Mono
- **Intersection Observer API** — scroll-triggered reveal animations

### AI Chatbot (RAG Pipeline)
- **FastAPI** — backend API server
- **ChromaDB** — vector database for semantic search
- **sentence-transformers** (`all-MiniLM-L6-v2`) — text embeddings
- **Groq API** — free-tier Llama 3.3 70B for production inference
- **Ollama** — local inference during development

### Infrastructure & CI/CD
- **GitHub Pages** — frontend hosting
- **Render** — backend Docker container hosting
- **GitHub Actions** — CI (ruff linting) + CD (auto-deploy on push to `main`)
- **Docker** — containerized backend with CPU-only PyTorch

---

## 📁 Project Structure

```
Portfolio/
├── index.html              # Main HTML structure
├── styles.css              # Design system and styling
├── script.js               # Animations, interactions, chat UI
├── rag_server.py           # FastAPI RAG backend
├── pdf_to_vector_db.py     # Builds ChromaDB from resume PDF
├── build_vector_db.py      # Builds ChromaDB from text file
├── Dockerfile              # Backend container definition
├── requirements.txt        # Python dependencies
├── .github/workflows/      # CI/CD pipelines
│   ├── ci.yml              # Lint on every push/PR
│   └── deploy.yml          # Deploy frontend + trigger backend
└── images/                 # Project and certification images
```

---

## 🤖 How the RAG Chatbot Works

1. Resume PDF is parsed and chunked into sections (Experience, Projects, Skills, etc.)
2. Each chunk is embedded using `all-MiniLM-L6-v2` and stored in ChromaDB
3. On a user query, the top semantically similar chunks are retrieved
4. Retrieved context is passed to **Groq's Llama 3.3 70B** to generate a grounded answer
5. Falls back to Ollama (local dev) or keyword matching if neither is available

---

## 🚀 Running Locally

**Quick start (all-in-one):**
```bash
./quick_start.sh
```
This will:
1. Start Ollama if not already running
2. Install dependencies and build the ChromaDB vector DB (first run only — prompts you to choose between `data.txt` or the PDF resume)
3. Launch the RAG API server on `http://localhost:8000`
4. Launch the frontend on `http://localhost:8080`

**Stop everything:**
```bash
./quick_kill.sh
```
Gracefully stops all three servers, force-kills any stragglers, frees ports 8000, 8080, and 11434, and removes log files.

**Manual setup:**
```bash
pip install -r requirements.txt
python3 pdf_to_vector_db.py   # build the vector DB once
python3 rag_server.py         # API on http://localhost:8000
python3 -m http.server 8080   # frontend on http://localhost:8080
```

---

## 📱 Sections

- **Hero** — animated intro with name, tagline, and CTA
- **Experience** — interactive vertical timeline of work history
- **Education** — academic background at Carleton University
- **Projects** — showcase with GitHub links and tech tags
- **Certifications** — Nutanix, Google, Red Hat
- **AI Chat** — RAG-powered chatbot answering questions about me

---

## 🌐 Browser Compatibility

- Chrome 60+, Firefox 55+, Safari 12+, Edge 79+, iOS Safari, Chrome Mobile

---

## 📝 License

Copyright 2026 Youssif Ashmawy

This project is available under the [Apache License 2.0](LICENSE).

---

**Built by Youssif Ashmawy**
