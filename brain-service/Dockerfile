FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

# Install tribev2 from local source (includes all heavy deps: torch, transformers, etc.)
COPY tribev2/ ./tribev2/
RUN pip install --no-cache-dir -e ./tribev2

# Install FastAPI/uvicorn on top
RUN pip install --no-cache-dir "fastapi==0.115.12" "uvicorn[standard]==0.34.0" "transformers>=4.45.0"

COPY main.py model.py ./

RUN mkdir -p prediction_cache cache

# HF Spaces Docker requires port 7860
EXPOSE 7860

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
