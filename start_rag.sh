#!/bin/bash

echo "🚀 Starting Portfolio RAG System"
echo "================================"

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "⚠️  Ollama is not installed. Installing Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
    echo "✅ Ollama installed"
fi

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

# Download resume PDF from private assets repo if PAT is available
RESUME_PDF="Youssif_Ashmawy_Resume_2.pdf"
if [ ! -f "$RESUME_PDF" ] && [ -n "$ASSETS_PAT" ]; then
    echo "📥 Downloading resume from private assets repo..."
    curl -s -L \
        -H "Authorization: token $ASSETS_PAT" \
        -H "Accept: application/vnd.github.v3.raw" \
        "https://api.github.com/repos/youssif-ashmawy/portfolio_assets/contents/$RESUME_PDF" \
        -o "$RESUME_PDF"
    if [ -f "$RESUME_PDF" ] && [ -s "$RESUME_PDF" ]; then
        echo "✅ Resume downloaded"
    else
        echo "⚠️  Failed to download resume PDF"
        rm -f "$RESUME_PDF"
    fi
fi

# Build vector database if it doesn't exist
if [ ! -d "chroma_db" ]; then
    echo "🗄️  Building vector database..."
    if [ -f "$RESUME_PDF" ]; then
        echo "📄 Building from $RESUME_PDF..."
        python3 pdf_to_vector_db.py "$RESUME_PDF"
    elif [ -f "data.txt" ]; then
        echo "📄 Building from data.txt..."
        python3 build_vector_db.py
    else
        echo "❌ No data source found (need $RESUME_PDF or data.txt)"
        exit 1
    fi
    echo "✅ Vector database built"
else
    echo "✅ Vector database already exists"
fi

# Start Ollama in background
echo "🤖 Starting Ollama..."
ollama serve &
OLLAMA_PID=$!
sleep 5

# Pull llama2 model if not already downloaded
echo "📥 Downloading Llama2 model (this may take a while)..."
ollama pull llama2

# Start FastAPI server
echo "🌐 Starting FastAPI server..."
python3 rag_server.py &
API_PID=$!

echo ""
echo "✅ RAG System is now running!"
echo "================================"
echo "📱 Chat Interface: Open index.html in your browser"
echo "🔗 API Server: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $API_PID 2>/dev/null
    kill $OLLAMA_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for background processes
wait
