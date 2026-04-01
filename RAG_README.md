# Portfolio RAG System

A Retrieval-Augmented Generation (RAG) system integrated into Youssif Ashmawy's portfolio website, allowing visitors to ask questions about his experience, projects, and skills using AI-powered responses.

## Features

- **Vector Database**: Uses ChromaDB to store and retrieve relevant portfolio information
- **AI-Powered Chat**: Local Ollama integration with Llama2 model for intelligent responses
- **Fallback System**: Works even without Ollama using keyword-based responses
- **Modern UI**: Beautiful chat interface integrated into the hero section
- **Real-time Status**: Shows server connection status and typing indicators

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   FastAPI        │    │   Vector DB     │
│   (HTML/JS/CSS)│◄──►│   Server         │◄──►│   (ChromaDB)    │
│                 │    │                  │    │                 │
│ • Chat UI       │    │ • RAG Endpoint   │    │ • Embeddings    │
│ • Status Check  │    │ • Ollama Client  │    │ • Similarity    │
│ • Message Flow  │    │ • Fallback Logic │    │   Search        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │   Ollama        │
                       │   (Local LLM)   │
                       │                  │
                       │ • Llama2 Model  │
                       │ • AI Responses  │
                       └──────────────────┘
```

## Quick Start

### Option 1: Automated Setup (Recommended)

Run the automated startup script:

```bash
./start_rag.sh
```

This script will:
- Install all dependencies
- Build the vector database from `data.txt`
- Start Ollama service
- Download the Llama2 model
- Launch the FastAPI server

### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   pip3 install -r requirements.txt
   ```

2. **Install Ollama**
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

3. **Build Vector Database**
   ```bash
   python3 build_vector_db.py
   ```

4. **Start Ollama**
   ```bash
   ollama serve &
   ollama pull llama2
   ```

5. **Start FastAPI Server**
   ```bash
   python3 rag_server.py
   ```

6. **Open Website**
   Open `index.html` in your browser

## Usage

1. **Open the website** in your browser
2. **Chat interface** appears in the hero section
3. **Ask questions** like:
   - "What is your experience with Kubernetes?"
   - "Tell me about your FancyGit project"
   - "What certifications do you have?"
   - "What are your technical skills?"

4. **Toggle chat** using the minimize/maximize button

## File Structure

```
Portfolio/
├── data.txt              # Portfolio data source
├── requirements.txt       # Python dependencies
├── build_vector_db.py     # Vector database builder
├── rag_server.py         # FastAPI RAG server
├── start_rag.sh          # Startup script
├── index.html            # Main website with chat UI
├── styles.css            # Styling including chat interface
├── script.js             # JavaScript including chat functionality
├── chroma_db/            # Vector database (created automatically)
└── RAG_README.md         # This documentation
```

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server status and Ollama availability

### Chat
- **POST** `/chat`
- Body: `{"message": "your question", "model": "llama2"}`
- Returns: `{"response": "AI response", "sources": ["source documents"]}`

### Available Models
- **GET** `/models`
- Returns list of available Ollama models

## Configuration

### Server Configuration
- **API URL**: `http://localhost:8000` (configurable in `script.js`)
- **Model**: `llama2` (configurable in chat requests)
- **Vector DB**: `./chroma_db` (configurable in `rag_server.py`)

### Chat Interface
- **Max Input Length**: 500 characters
- **Auto-resize**: Input field grows with content
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line

## Troubleshooting

### Common Issues

1. **"Cannot connect to server"**
   - Ensure FastAPI server is running: `python3 rag_server.py`
   - Check if port 8000 is available

2. **"Ollama not available"**
   - Start Ollama: `ollama serve`
   - Pull model: `ollama pull llama2`

3. **"Vector database not found"**
   - Build database: `python3 build_vector_db.py`
   - Ensure `data.txt` exists in project root

4. **Slow responses**
   - First response may be slow (model loading)
   - Consider using smaller models for faster responses

### Debug Mode

Enable debug logging by setting environment variable:
```bash
export RAG_DEBUG=true
python3 rag_server.py
```

## Customization

### Adding New Data
1. Update `data.txt` with new information
2. Rebuild vector database: `python3 build_vector_db.py`

### Changing Models
1. Pull new model: `ollama pull <model-name>`
2. Update model in chat requests

### Styling
- Modify chat styles in `styles.css` (lines 1382+)
- Chat interface uses CSS custom properties from the existing design system

## Performance

- **Vector Search**: < 100ms for typical queries
- **AI Response**: 1-5 seconds depending on model and query complexity
- **Fallback Responses**: < 50ms
- **Memory Usage**: ~500MB (vector database + model embeddings)

## Security

- **Local Only**: All processing happens locally
- **No External APIs**: Works offline after initial setup
- **Data Privacy**: Your portfolio data never leaves your machine

## Future Enhancements

- [ ] Support for multiple Ollama models
- [ ] Conversation history/memory
- [ ] Voice input/output
- [ ] Source document highlighting
- [ ] Export chat conversations
- [ ] Multi-language support

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: FastAPI, Python 3.8+
- **Vector Database**: ChromaDB
- **Embeddings**: Sentence-Transformers
- **LLM**: Ollama with Llama2
- **UI/UX**: Custom CSS with glassmorphism effects

## Support

For issues or questions:
1. Check this README first
2. Review the troubleshooting section
3. Check browser console for JavaScript errors
4. Verify all services are running correctly

---

**Note**: This RAG system is designed to work locally. For production deployment, consider additional security measures and scaling considerations.
