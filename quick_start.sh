#!/bin/bash

echo "🚀 Starting Portfolio Website + RAG System"
echo "======================================"

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping all servers..."
    pkill -f "python3 rag_server.py" 2>/dev/null
    pkill -f "python3 -m http.server" 2>/dev/null
    echo "✅ All servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if Ollama is running
if ! pgrep -f "ollama serve" > /dev/null; then
    echo "⚠️  Ollama is not running. Starting Ollama..."
    ollama serve &
    OLLAMA_PID=$!
    sleep 5
    echo "✅ Ollama started (PID: $OLLAMA_PID)"
else
    echo "✅ Ollama is already running"
fi

# Install dependencies if needed
if [ ! -d "chroma_db" ]; then
    echo "📦 Installing dependencies and building vector database..."
    pip3 install -r requirements.txt > /dev/null 2>&1
    python3 build_vector_db.py
    echo "✅ Dependencies installed and vector database built"
fi

# Start RAG API server
echo "🤖 Starting RAG API server..."
cd /Users/youssif/Documents/Projects/Portfolio
nohup python3 rag_server.py > rag_server.log 2>&1 &
API_PID=$!
sleep 3

# Check if RAG server started successfully
sleep 2
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ RAG API server started (PID: $API_PID)"
else
    echo "⚠️  RAG API server may still be starting..."
    echo "   Check with: curl http://localhost:8000/health"
fi

# Start Web server
echo "🌐 Starting web server..."
nohup python3 -m http.server 8080 > web_server.log 2>&1 &
WEB_PID=$!
sleep 2

echo ""
echo "🎉 Both servers are now running!"
echo "================================"
echo "📱 Portfolio Website: http://localhost:8080"
echo "🔗 RAG API Server: http://localhost:8000"
echo "📖 API Documentation: http://localhost:8000/docs"
echo ""
echo "💡 The website will have full RAG chat functionality!"
echo ""
echo "Run './quick_kill.sh' to stop both servers"

