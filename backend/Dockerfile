FROM yolo-base:latest

# Set workdir chmod 666 ./backend/instance/users.db
              # chmod 777 ./backend/instance
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .


COPY yolo_model.pt .

RUN chmod +x entrypoint.sh

#RUN mkdir -p /app/instance
#COPY instance/users.db /app/instance/users.db

EXPOSE 5000

ENTRYPOINT ["./entrypoint.sh"]