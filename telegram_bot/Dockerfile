FROM yolo-base:latest

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

COPY yolo_model.pt .

CMD ["bash", "./entrypoint.sh"]
