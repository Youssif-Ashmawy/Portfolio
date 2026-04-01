import PyPDF2
import re
import chromadb
from sentence_transformers import SentenceTransformer
from typing import List, Dict
import os

class PDFDataExtractor:
    def __init__(self, pdf_path: str):
        self.pdf_path = pdf_path
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.client = chromadb.PersistentClient(path="./chroma_db")
        self.collection = self.client.get_or_create_collection(
            name="portfolio_data",
            metadata={"hnsw:space": "cosine"}
        )
    
    def extract_text_from_pdf(self) -> str:
        """Extract all text from PDF file."""
        try:
            with open(self.pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                
                for page_num in range(len(pdf_reader.pages)):
                    page = pdf_reader.pages[page_num]
                    text += page.extract_text() + "\n"
                
                return text
        except Exception as e:
            print(f"Error extracting PDF: {e}")
            return ""
    
    def parse_resume_data(self, text: str) -> List[Dict[str, str]]:
        """Parse resume text into structured sections."""
        documents = []
        
        # Clean up common PDF extraction artifacts
        text = re.sub(r'\s+', ' ', text)  # Replace multiple spaces with single space
        text = re.sub(r'\n+', '\n', text)  # Replace multiple newlines with single newline
        
        print("📝 Extracted text preview (first 500 chars):")
        print(text[:500])
        print("...")
        
        # Create documents from the entire text first, then try to parse sections
        if len(text) > 100:
            documents.append({
                'section': 'Resume Overview',
                'content': text,
                'text': f"Resume: {text}"
            })
        
        # Try to split into sections based on common resume headers
        sections = {
            'Personal Information': [],
            'Experience': [],
            'Education': [],
            'Projects': [],
            'Certifications': [],
            'Technical Skills': []
        }
        
        current_section = None
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Detect section headers (more flexible matching)
            line_upper = line.upper()
            if any(keyword in line_upper for keyword in ['EXPERIENCE', 'WORK', 'EMPLOYMENT', 'PROFESSIONAL']):
                current_section = 'Experience'
                print(f"📍 Found Experience section: {line}")
            elif any(keyword in line_upper for keyword in ['EDUCATION', 'ACADEMIC', 'UNIVERSITY', 'COLLEGE', 'DEGREE']):
                current_section = 'Education'
                print(f"📍 Found Education section: {line}")
            elif any(keyword in line_upper for keyword in ['PROJECT', 'PROJECTS', 'PORTFOLIO']):
                current_section = 'Projects'
                print(f"📍 Found Projects section: {line}")
            elif any(keyword in line_upper for keyword in ['CERTIFICATION', 'CERTIFICATE', 'LICENSE']):
                current_section = 'Certifications'
                print(f"📍 Found Certifications section: {line}")
            elif any(keyword in line_upper for keyword in ['SKILLS', 'TECHNICAL', 'TECHNOLOGIES', 'TOOLS']):
                current_section = 'Technical Skills'
                print(f"📍 Found Skills section: {line}")
            elif any(keyword in line_upper for keyword in ['CONTACT', 'EMAIL', 'PHONE', 'ADDRESS']):
                current_section = 'Personal Information'
                print(f"📍 Found Contact section: {line}")
            elif current_section and len(line) > 5:  # Only add substantial content
                sections[current_section].append(line)
        
        # Create documents from parsed sections
        for section_name, content_list in sections.items():
            if content_list:
                content = ' '.join(content_list)
                if len(content) > 50:  # Only include substantial content
                    documents.append({
                        'section': section_name,
                        'content': content,
                        'text': f"{section_name}: {content}"
                    })
                    print(f"📊 Added {section_name} section with {len(content)} characters")
        
        return documents
    
    def chunk_documents(self, documents: List[Dict[str, str]], chunk_size: int = 600) -> List[str]:
        """Split documents into smaller chunks for better retrieval."""
        chunks = []
        
        for doc in documents:
            text = doc['text']
            section = doc['section']
            
            # Split long documents into chunks
            words = text.split()
            for i in range(0, len(words), chunk_size):
                chunk = ' '.join(words[i:i + chunk_size])
                chunks.append(f"{section}: {chunk}")
        
        return chunks
    
    def build_vector_db(self):
        """Build vector database from PDF data."""
        print(f"📄 Extracting text from {self.pdf_path}...")
        text = self.extract_text_from_pdf()
        
        if not text:
            print("❌ No text extracted from PDF")
            return
        
        print("📝 Parsing resume structure...")
        documents = self.parse_resume_data(text)
        
        print(f"📊 Found {len(documents)} sections:")
        for doc in documents:
            print(f"   - {doc['section']}: {len(doc['content'])} characters")
        
        print("🔪 Creating chunks for better retrieval...")
        chunks = self.chunk_documents(documents)
        
        print(f"📦 Created {len(chunks)} chunks")
        
        print("🧠 Generating embeddings...")
        embeddings = self.embedding_model.encode(chunks)
        
        # Clear existing collection
        try:
            self.collection.delete()
            self.collection = self.client.get_or_create_collection(
                name="portfolio_data",
                metadata={"hnsw:space": "cosine"}
            )
        except Exception:
            pass

        print("💾 Storing in ChromaDB...")
        # Add documents to collection
        self.collection.add(
            documents=chunks,
            embeddings=embeddings.tolist(),
            ids=[f"pdf_chunk_{i}" for i in range(len(chunks))],
            metadatas=[{"source": f"{os.path.basename(self.pdf_path)}_chunk_{i}"} for i in range(len(chunks))]
        )
        
        print("✅ Successfully built vector database from PDF!")
        print("📍 Database saved to: ./chroma_db")
        print(f"📄 Source: {self.pdf_path}")
        
        # Test the database
        print("\n🧪 Testing database with sample queries...")
        test_queries = [
            "What is your experience with Kubernetes?",
            "Tell me about your education",
            "What projects have you worked on?",
            "What certifications do you have?"
        ]
        
        for query in test_queries:
            results = self.collection.query(
                query_texts=[query],
                n_results=2
            )
            
            print(f"\n🔍 Query: {query}")
            for i, (doc, distance) in enumerate(zip(results['documents'][0], results['distances'][0])):
                print(f"   Result {i+1} (distance: {distance:.4f}):")
                print(f"   {doc[:100]}..." if len(doc) > 100 else f"   {doc}")

def main():
    pdf_file = "Youssif_Ashmawy_Resume.pdf"
    
    if not os.path.exists(pdf_file):
        print(f"❌ PDF file '{pdf_file}' not found!")
        print("📄 Available files:")
        for file in os.listdir('.'):
            if file.lower().endswith('.pdf'):
                print(f"   - {file}")
        return
    
    extractor = PDFDataExtractor(pdf_file)
    extractor.build_vector_db()

if __name__ == "__main__":
    main()
