#!/usr/bin/env python3

import os
import sys
import shutil
from datetime import datetime

def switch_data_source(source):
    """Switch between different data sources for the RAG system."""
    
    print(f"🔄 Switching to {source} data source...")
    
    # Backup current vector database if it exists
    if os.path.exists("./chroma_db"):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = f"./chroma_db_backup_{timestamp}"
        shutil.move("./chroma_db", backup_path)
        print(f"📦 Backed up current database to: {backup_path}")
    
    if source == "txt":
        print("📄 Building from data.txt...")
        os.system("python3 build_vector_db.py")
    elif source == "pdf":
        print("📄 Building from Youssif_Ashmawy_Resume.pdf...")
        os.system("python3 pdf_to_vector_db.py")
    else:
        print(f"❌ Unknown source: {source}")
        print("Available sources: txt, pdf")
        return False
    
    print(f"✅ Successfully switched to {source} data source!")
    return True

def main():
    if len(sys.argv) != 2:
        print("Usage: python3 build_data_source.py [txt|pdf]")
        print("")
        print("Examples:")
        print("  python3 build_data_source.py txt   # Build from data.txt")
        print("  python3 build_data_source.py pdf   # Build from PDF resume")
        print("")
        print("Current files:")
        if os.path.exists("data.txt"):
            print("  📄 data.txt - " + str(os.path.getsize("data.txt")) + " bytes")
        if os.path.exists("Youssif_Ashmawy_Resume.pdf"):
            print("  📄 Youssif_Ashmawy_Resume.pdf - " + str(os.path.getsize("Youssif_Ashmawy_Resume.pdf")) + " bytes")
        return
    
    source = sys.argv[1].lower()
    switch_data_source(source)

if __name__ == "__main__":
    main()
