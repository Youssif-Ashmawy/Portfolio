# 📊 Data Sources for RAG System

Your portfolio RAG system can work with multiple data sources. Choose the one that best fits your needs.

## 📄 Available Data Sources

### **1. data.txt** 
- **Size**: 3,456 bytes
- **Format**: Structured text with clear sections
- **Quality**: Clean, well-organized data
- **Best for**: Accurate, structured responses
- **Command**: `python3 build_data_source.py txt`

### **2. Youssif_Ashmawy_Resume.pdf**
- **Size**: 173,640 bytes (50x more data!)
- **Format**: Complete resume with full details
- **Quality**: Comprehensive, professional formatting
- **Best for**: Detailed responses about experience
- **Command**: `python3 build_data_source.py pdf`

## 🔄 Switching Between Sources

### **Quick Switch Commands:**
```bash
# Use structured data (recommended for most accurate results)
python3 build_data_source.py txt

# Use PDF resume (recommended for comprehensive responses)
python3 build_data_source.py pdf
```

### **What Happens When You Switch:**
1. **Automatic Backup**: Current vector database is backed up with timestamp
2. **Clean Rebuild**: New vector database is built from scratch
3. **Immediate Testing**: Sample queries are tested automatically
4. **Server Ready**: RAG API uses new data immediately

## 📈 Comparison

| Feature | data.txt | PDF Resume |
|---------|-----------|-------------|
| **Data Volume** | 3.5KB | 174KB |
| **Structure** | Manual, clean | Professional format |
| **Experience Detail** | Summary | Full descriptions |
| **Education Detail** | Basic | Complete degree info |
| **Projects Detail** | Highlights | Full project details |
| **Certifications** | List | All certifications |
| **Contact Info** | Basic | Complete contact details |
| **Accuracy** | High | Very High |
| **Response Quality** | Good | Excellent |

## 🎯 Recommendations

### **Use data.txt when:**
- You want fast, concise responses
- You need structured, clean data
- You prefer manually curated information
- You want consistent formatting

### **Use PDF Resume when:**
- You want comprehensive, detailed responses
- You need full project descriptions
- You want complete experience details
- You need all certifications and skills
- You want the most information available

## 🗂️ File Management

### **Backups:**
When you switch sources, automatic backups are created:
```
chroma_db_backup_YYYYMMDD_HHMMSS/
```

### **Cleanup:**
To remove old backups:
```bash
# Remove backups older than 7 days
find . -name "chroma_db_backup_*" -mtime +7 -exec rm -rf {} \;
```

## 🧪 Testing After Switching

After switching data sources, test with these questions:

### **For data.txt:**
```text
• "What is your experience with Kubernetes?"
• "Tell me about FancyGit project"
• "What certifications do you have?"
```

### **For PDF Resume:**
```text
• "Describe your educational background"
• "What are your technical skills?"
• "Tell me about your work at Hydro Ottawa"
• "What projects demonstrate your AI/ML expertise?"
```

## 🔧 Advanced Usage

### **Custom Data Sources:**
To add your own data source:

1. **Create parser** in `pdf_to_vector_db.py` style
2. **Add to switcher** in `build_data_source.py`
3. **Update documentation** here

### **Batch Processing:**
To process multiple files:
```bash
# Process all PDFs in directory
for pdf in *.pdf; do
    python3 pdf_to_vector_db.py "$pdf"
done
```

---

**💡 Tip**: Start with PDF resume for the most comprehensive responses, then switch to data.txt if you prefer more concise answers!
