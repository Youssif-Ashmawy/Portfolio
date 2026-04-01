# 🧪 Testing Guide: Portfolio Website + RAG System

## 🚀 Quick Start

### **Option 1: Automated Startup (Recommended)**
```bash
./start_both_servers.sh
```

### **Option 2: Manual Startup**
```bash
# Terminal 1: Start RAG API server
python3 rag_server.py

# Terminal 2: Start web server  
python3 -m http.server 8080

# Terminal 3: Start Ollama (if not running)
ollama serve &
```

## 🌐 Access Points

Once running, you can access:

- **📱 Portfolio Website**: http://localhost:8080
- **🔗 RAG API Server**: http://localhost:8000  
- **📖 API Documentation**: http://localhost:8000/docs
- **⚕️ Health Check**: http://localhost:8000/health

## 🧪 Testing Checklist

### **1. Server Status Tests**
```bash
# Test web server
curl -I http://localhost:8080

# Test API server
curl http://localhost:8000/health

# Expected: {"status":"healthy","ollama_available":true,"vector_db_loaded":true}
```

### **2. Browser Tests**

#### **Website Functionality:**
- [ ] Website loads at http://localhost:8080
- [ ] All sections (Hero, Experience, Projects, etc.) display correctly
- [ ] Navigation works smoothly
- [ ] Responsive design on different screen sizes

#### **Chat Interface Tests:**
- [ ] Chat box appears in hero section
- [ ] Input field accepts text
- [ ] Send button works
- [ ] Status indicator shows "Ready"
- [ ] Toggle button minimizes/maximizes chat

#### **RAG Functionality Tests:**
- [ ] Questions about experience return relevant answers
- [ ] Questions about projects return detailed responses  
- [ ] Questions about skills return comprehensive lists
- [ ] Bot responses are contextual and accurate
- [ ] Source documents are retrieved correctly

### **3. Sample Test Questions**

```text
Basic Questions:
• "What is your experience with Kubernetes?"
• "Tell me about FancyGit project"
• "What certifications do you have?"
• "What are your technical skills?"

Advanced Questions:
• "Describe your work at Kuberox Technologies"
• "What technologies did you use in TactileNet?"
• "How did you improve processes at Hydro Ottawa?"
• "What programming languages do you know?"

Edge Cases:
• "What is your favorite color?" (should get fallback response)
• "" (empty message)
• Very long message (should handle gracefully)
```

### **4. API Endpoint Tests**

```bash
# Health check
curl http://localhost:8000/health

# Chat endpoint
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is your experience with Python?"}'

# Available models
curl http://localhost:8000/models
```

### **5. Error Handling Tests**

#### **Server Down Scenarios:**
- [ ] Stop RAG server and test chat (should show error message)
- [ ] Stop Ollama and test (should use fallback responses)
- [ ] Test with invalid JSON (should handle gracefully)

#### **Network Issues:**
- [ ] Test slow network responses
- [ ] Test timeout scenarios
- [ ] Test browser refresh during active chat

## 🔧 Troubleshooting

### **Common Issues & Solutions**

#### **Port Already in Use:**
```bash
# Kill existing processes
lsof -ti:8000 | xargs kill -9
lsof -ti:8080 | xargs kill -9

# Or use different ports
python3 rag_server.py --port 8001
python3 -m http.server 8081
```

#### **Ollama Not Available:**
```bash
# Start Ollama
ollama serve &

# Pull model if needed
ollama pull llama3.2

# Check available models
ollama list
```

#### **Vector Database Issues:**
```bash
# Rebuild database
rm -rf chroma_db
python3 build_vector_db.py
```

#### **Dependencies Missing:**
```bash
# Reinstall dependencies
pip3 install -r requirements.txt
```

### **Debug Mode**

Enable debug logging:
```bash
export RAG_DEBUG=true
python3 rag_server.py
```

Check logs:
```bash
# RAG server logs
tail -f rag_server.log

# Web server logs  
tail -f web_server.log
```

## 📱 Browser Testing

### **Chrome DevTools:**
1. Open Developer Tools (F12)
2. Check Console tab for JavaScript errors
3. Check Network tab for API requests
4. Verify responses in API calls

### **Mobile Testing:**
1. Use Chrome DevTools device emulation
2. Test different screen sizes
3. Verify chat interface responsiveness

## 🚀 Production Deployment

### **For Production:**
1. **Web Server**: Use nginx/Apache instead of Python http.server
2. **API Server**: Use Gunicorn + nginx for production
3. **Security**: Add authentication, rate limiting
4. **HTTPS**: Configure SSL certificates
5. **Domain**: Point domain to your server

### **Example Production Commands:**
```bash
# Production API server
gunicorn rag_server:app --workers 4 --bind 0.0.0.0:8000

# Production web server
nginx -c /path/to/nginx.conf
```

## ✅ Success Criteria

Your RAG system is working correctly when:

- **✅ Both servers start without errors**
- **✅ Website loads properly in browser**
- **✅ Chat interface is functional**
- **✅ API calls succeed**
- **✅ AI responses are relevant and accurate**
- **✅ Error handling works gracefully**
- **✅ Performance is acceptable (<5s response time)**

---

**🎉 Happy Testing!**
