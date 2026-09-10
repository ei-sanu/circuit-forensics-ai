# Production Dockerfile for CIRCUIT FastAPI Core API
FROM python:3.12-slim

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Non-root user setup
RUN useradd -m -u 1001 circuit

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Application code
COPY app/ ./app/

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app
ENV PORT=3000

RUN chown -R circuit:circuit /app
USER circuit

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000"]
