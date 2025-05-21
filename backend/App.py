from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required
from datetime import timedelta
from ultralytics import YOLO
from PIL import Image
import os
import tempfile
from flask_cors import CORS
from dotenv import load_dotenv
import io
import base64
import cv2
import numpy as np

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": [
    "http://188.225.45.142:80",
    "https://188.225.45.142"
]}})
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'supersecretkey'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)

model = YOLO('yolo_model.pt')

os.environ['NUM_WORKERS'] = '0'

bcrypt = Bcrypt(app)
db = SQLAlchemy(app)
jwt = JWTManager(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    def __init__(self, username, password):
        self.username = username
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409
    user = User(data['username'], data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        token = create_access_token(identity=user.username)
        return jsonify({'token': token}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/predict', methods=['POST'])
@jwt_required()
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image = Image.open(request.files['image'].stream).convert('RGB')
    image_np = np.array(image)

    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
        image.save(tmp.name)
        results = model(tmp.name)

    result = results[0]
    orig_w, orig_h = result.orig_shape[1], result.orig_shape[0]

    # Копия изображения для рисования
    annotated_image = image_np.copy()

    for box in result.boxes.data.cpu().numpy():
        x1, y1, x2, y2, score, cls = box
        label = f"{model.names[int(cls)]} {score:.2f}"

        # Нарисовать прямоугольник и текст
        cv2.rectangle(annotated_image, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
        cv2.putText(annotated_image, label, (int(x1), int(y1) - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)

    # Конвертировать изображение обратно в PIL и затем в base64
    annotated_pil = Image.fromarray(annotated_image)
    buffer = io.BytesIO()
    annotated_pil.save(buffer, format='JPEG')
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.read()).decode('utf-8')

    return jsonify({
        'image_base64': img_base64,
        'image_size': [orig_w, orig_h]
    })

if __name__ == '__main__':
    # Create tables if they don't exist
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000)
