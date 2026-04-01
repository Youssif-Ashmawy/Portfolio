#!/bin/bash

echo "📊 Portfolio RAG System Status"
echo "============================"

# Function to check if process is running
check_process() {
    local process_name="$1"
    local display_name="$2"
    local port="$3"
    
    if pgrep -f "$process_name" > /dev/null; then
        echo "✅ $display_name: Running"
        if [ -n "$port" ]; then
            if lsof -ti:$port > /dev/null 2>&1; then
                echo "   📍 Port $port: Active"
            else
                echo "   ⚠️  Port $port: Not accessible"
            fi
        fi
        return 0
    else
        echo "❌ $display_name: Not running"
        return 1
    fi
}

# Check all services
echo ""
echo "🤖 API Server:"
check_process "python3 rag_server.py" "RAG API Server" "8000"

echo ""
echo "🌐 Web Server:"
check_process "python3 -m http.server" "Web Server" "8080"

echo ""
echo "🧠 Ollama Server:"
check_process "ollama serve" "Ollama Server" "11434"

echo ""
echo "📂 Files & Directories:"
if [ -d "chroma_db" ]; then
    echo "✅ Vector Database: Exists"
else
    echo "❌ Vector Database: Missing"
fi

if [ -f "data.txt" ]; then
    echo "✅ Data File: Exists"
else
    echo "❌ Data File: Missing"
fi

echo ""
echo "🔗 Service Endpoints:"
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    health=$(curl -s http://localhost:8000/health)
    echo "✅ Health Check: http://localhost:8000/health"
    echo "   Status: $(echo $health | grep -o '"status":"[^"]*' | cut -d'"' -f4)"
    echo "   Ollama: $(echo $health | grep -o '"ollama_available":[^,]*' | cut -d':' -f2)"
else
    echo "❌ Health Check: Not accessible"
fi

if curl -s -I http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ Website: http://localhost:8080"
else
    echo "❌ Website: Not accessible"
fi

echo ""
echo "📖 Documentation:"
echo "   API Docs: http://localhost:8000/docs"
echo "   Testing Guide: TESTING_GUIDE.md"
echo "   RAG README: RAG_README.md"

echo ""
echo "🎛️  Quick Commands:"
echo "   Start: ./quick_start.sh"
echo "   Stop:  ./quick_kill.sh"
echo "   Status: ./status.sh"

# Show PIDs if running
echo ""
echo "🔍 Process Details:"
if pgrep -f "rag_server.py" > /dev/null; then
    echo "   RAG Server PID: $(pgrep -f rag_server.py)"
fi

if pgrep -f "http.server" > /dev/null; then
    echo "   Web Server PID: $(pgrep -f http.server)"
fi

if pgrep -f "ollama serve" > /dev/null; then
    echo "   Ollama PID: $(pgrep -f ollama serve)"
fi

echo ""
echo "🎉 Status check complete!"
