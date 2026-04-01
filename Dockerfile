FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed by some ML packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (layer cached unless requirements change)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source and pre-built vector database
COPY rag_server.py pdf_to_vector_db.py build_vector_db.py ./
COPY Youssif_Ashmawy_Resume.pdf .
COPY chroma_db/ ./chroma_db/

# Render (and most PaaS providers) inject a $PORT environment variable.
# Default to 8000 for local docker run.
ENV PORT=8000

EXPOSE $PORT

CMD ["sh", "-c", "uvicorn rag_server:app --host 0.0.0.0 --port ${PORT}"]
