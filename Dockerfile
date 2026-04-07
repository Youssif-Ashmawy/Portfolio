FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed by some ML packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first (layer cached unless requirements change)
COPY requirements.txt .
# Install CPU-only PyTorch first to avoid pulling in multi-GB CUDA/NVIDIA packages
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY rag_server.py pdf_to_vector_db.py build_vector_db.py ./

# Download resume PDF from private assets repo at build time
ARG ASSETS_PAT
RUN curl -fsSL \
    -H "Authorization: token ${ASSETS_PAT}" \
    -H "Accept: application/vnd.github.v3.raw" \
    "https://api.github.com/repos/youssif-ashmawy/portfolio_assets/contents/Youssif_Ashmawy_Resume_2.pdf" \
    -o Youssif_Ashmawy_Resume_2.pdf

# Build the vector DB using the exact chromadb version installed above.
# This guarantees no schema mismatch between the DB and the running code.
RUN python3 pdf_to_vector_db.py Youssif_Ashmawy_Resume_2.pdf

# Remove the PDF after building the DB (not needed at runtime)
RUN rm Youssif_Ashmawy_Resume_2.pdf

# Render (and most PaaS providers) inject a $PORT environment variable.
# Default to 8000 for local docker run.
ENV PORT=8000

EXPOSE $PORT

CMD ["sh", "-c", "uvicorn rag_server:app --host 0.0.0.0 --port ${PORT}"]
