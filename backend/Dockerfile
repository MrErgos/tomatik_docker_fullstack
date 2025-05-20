# tomatik/backend/Dockerfile
FROM python:3.10-slim

# Install required system libraries
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set workdir
WORKDIR /app

#COPY wheels/ ./wheels/

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
#RUN pip install --no-index --find-links=./wheels -r requirements.txt

# Copy all source files
COPY . .

# Expose the port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=App.py
ENV FLASK_RUN_HOST=0.0.0.0

CMD ["flask", "run"]