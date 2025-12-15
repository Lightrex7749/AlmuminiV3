FROM python:3.13-slim

WORKDIR /app

# Copy backend files
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/

# Expose port
EXPOSE 8001

# Run the application
CMD ["uvicorn", "backend.server:app", "--host", "0.0.0.0", "--port", "8001"]
