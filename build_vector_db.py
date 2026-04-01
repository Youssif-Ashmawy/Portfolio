import chromadb
from sentence_transformers import SentenceTransformer
import re
from typing import List, Dict
import os

class VectorDBBuilder:
    def __init__(self, data_file: str = "data.txt", db_path: str = "./chroma_db"):
        self.data_file = data_file
        self.db_path = db_path
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.client = chromadb.PersistentClient(path=db_path)
        self.collection = self.client.get_or_create_collection(
            name="portfolio_data",
            metadata={"hnsw:space": "cosine"}
        )
    
    def parse_data_file(self) -> List[Dict[str, str]]:
        """Parse the data.txt file and extract structured information."""
        with open(self.data_file, 'r', encoding='utf-8') as file:
            content = file.read()
        
        documents = []
        
        current_section = None
        current_content = []
        
        for line in content.split('\n'):
            line = line.strip()
            if not line:
                continue
                
            # Identify section headers
            if line in ['Experience', 'Projects', 'Education', 'Certifications', 'Technical Skills & Tools']:
                if current_section and current_content:
                    documents.append({
                        'section': current_section,
                        'content': ' '.join(current_content),
                        'text': f"{current_section}: {' '.join(current_content)}"
                    })
                current_section = line
                current_content = []
            else:
                current_content.append(line)
        
        # Add the last section
        if current_section and current_content:
            documents.append({
                'section': current_section,
                'content': ' '.join(current_content),
                'text': f"{current_section}: {' '.join(current_content)}"
            })
        
        # Add personal information as a separate document
        personal_info = []
        for line in content.split('\n')[:4]:
            if line.strip():
                personal_info.append(line.strip())
        
        if personal_info:
            documents.insert(0, {
                'section': 'Personal Information',
                'content': ' '.join(personal_info),
                'text': f"Personal Information: {' '.join(personal_info)}"
            })
        
        return documents
    
    def chunk_documents(self, documents: List[Dict[str, str]], chunk_size: int = 500) -> List[str]:
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
        """Build the vector database from the data file."""
        print("Parsing data file...")
        documents = self.parse_data_file()
        
        print(f"Found {len(documents)} documents")
        
        print("Creating chunks...")
        chunks = self.chunk_documents(documents)
        
        print(f"Created {len(chunks)} chunks")
        
        print("Generating embeddings...")
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

        print("Storing in ChromaDB...")
        # Add documents to collection
        self.collection.add(
            documents=chunks,
            embeddings=embeddings.tolist(),
            ids=[f"chunk_{i}" for i in range(len(chunks))],
            metadatas=[{"source": f"data.txt_chunk_{i}"} for i in range(len(chunks))]
        )
        
        print(f"Successfully built vector database with {len(chunks)} chunks!")
        print(f"Database saved to: {self.db_path}")
        
        # Test the database
        print("\nTesting database with a sample query...")
        test_query = "What is Youssif's experience with Kubernetes?"
        results = self.collection.query(
            query_texts=[test_query],
            n_results=3
        )
        
        print("Sample results:")
        for i, (doc, distance) in enumerate(zip(results['documents'][0], results['distances'][0])):
            print(f"\nResult {i+1} (distance: {distance:.4f}):")
            print(doc[:200] + "..." if len(doc) > 200 else doc)

if __name__ == "__main__":
    # Check if data file exists
    if not os.path.exists("data.txt"):
        print("Error: data.txt file not found!")
        exit(1)
    
    builder = VectorDBBuilder()
    builder.build_vector_db()
