#!/bin/bash

echo "🛑 Stopping Portfolio Website + RAG System"
echo "======================================="

# Function to check if process is running and kill it
kill_process() {
    local process_name="$1"
    local display_name="$2"
    
    if pgrep -f "$process_name" > /dev/null; then
        echo "⏹️  Stopping $display_name..."
        pkill -f "$process_name"
        sleep 2
        
        # Force kill if still running
        if pgrep -f "$process_name" > /dev/null; then
            echo "⚡ Force killing $display_name..."
            pkill -9 -f "$process_name"
        fi
        
        echo "✅ $display_name stopped"
    else
        echo "ℹ️  $display_name is not running"
    fi
}

# Stop all services
kill_process "python3 rag_server.py" "RAG API Server"
kill_process "python3 -m http.server" "Web Server"
kill_process "ollama serve" "Ollama Server"

# Clean up any remaining processes on specific ports
echo ""
echo "🧹 Cleaning up ports..."

# Port 8000 (RAG API)
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "🔌 Closing port 8000..."
    lsof -ti:8000 | xargs kill -9 2>/dev/null
fi

# Port 8080 (Web Server)  
if lsof -ti:8080 > /dev/null 2>&1; then
    echo "🔌 Closing port 8080..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null
fi

# Port 11434 (Ollama)
if lsof -ti:11434 > /dev/null 2>&1; then
    echo "🔌 Closing port 11434..."
    lsof -ti:11434 | xargs kill -9 2>/dev/null
fi

# Clean up log files
echo ""
echo "🗑️  Cleaning up log files..."
if [ -f "rag_server.log" ]; then
    rm rag_server.log
    echo "📄 Removed rag_server.log"
fi

if [ -f "web_server.log" ]; then
    rm web_server.log
    echo "📄 Removed web_server.log"
fi

echo ""
echo "✅ All services stopped successfully!"
echo "================================"
echo "💡 Run './quick_start.sh' to start everything again"

# Show final status
echo ""
echo "📊 Final Status Check:"
echo "-------------------"

# Check if any processes are still running
if pgrep -f "rag_server.py" > /dev/null; then
    echo "❌ RAG Server: Still running"
else
    echo "✅ RAG Server: Stopped"
fi

if pgrep -f "http.server" > /dev/null; then
    echo "❌ Web Server: Still running"  
else
    echo "✅ Web Server: Stopped"
fi

if pgrep -f "ollama serve" > /dev/null; then
    echo "❌ Ollama: Still running"
else
    echo "✅ Ollama: Stopped"
fi

echo ""
echo "🎉 All systems clean!"
