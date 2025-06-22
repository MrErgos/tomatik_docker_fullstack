from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager, create_access_token, verify_jwt_in_request,
    get_jwt_identity, get_csrf_token, set_access_cookies
)
import logging
from datetime import timedelta
from ultralytics import YOLO
from PIL import Image
import os
import tempfile
from flask_cors import CORS
from dotenv import load_dotenv
import re

def sanitize_header_value(value):
    if value is None:
        return None
    return value.replace('\n', '').replace('\r', '').strip()

def validate_origin(value):
    if value is None:
        return None
    if re.search(r'[\r\n]', value):
        raise ValueError(f"Invalid origin value: contains forbidden characters: {repr(value)}")
    return value.strip()

ENV = os.getenv("FLASK_ENV", "development")
load_dotenv(dotenv_path=f".env.{ENV}")

app = Flask(__name__)

logging.basicConfig(level=logging.DEBUG)

origins = validate_origin(os.getenv("CORS_ORIGINS", "*"))
CORS(app, supports_credentials=True, resources={r"/*": {"origins": origins}})
app.logger.debug(f"CORS_ORIGINS: {repr(origins)}")
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///instance/users.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'changeme')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=int(os.getenv('JWT_EXPIRES_DAYS', 1)))
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_ACCESS_COOKIE_NAME'] = os.getenv('JWT_ACCESS_COOKIE_NAME', 'access_token')

model = YOLO('yolo_model.pt')
os.environ['NUM_WORKERS'] = '0'

bcrypt = Bcrypt(app)
db = SQLAlchemy(app)
jwt = JWTManager(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)

    def __init__(self, email, password):
        self.email = email
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

@app.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers.add("Access-Control-Allow-Origin", os.getenv("CORS_ORIGINS", "*"))
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        return response

    data = request.json
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'email and password required'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'email already exists'}), 409

    user = User(data['email'], data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        access_token = create_access_token(identity=user.email)
        resp = make_response({'message': 'Login successful'})
        resp.headers['X-CSRF-TOKEN'] = get_csrf_token(access_token)
        set_access_cookies(resp, access_token)
        return resp
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/analyse', methods=['POST'])
def predict():
    try:
        verify_jwt_in_request(locations=["cookies"])
    except Exception as e:
        return jsonify({'error': str(e)}), 401

    current_user = get_jwt_identity()

    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image = Image.open(request.files['image'].stream).convert('RGB')

    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
        image.save(tmp.name)
        results = model(tmp.name)

    result = results[0]
    orig_w, orig_h = result.orig_shape[1], result.orig_shape[0]

    detections = []
    for box in result.boxes.data.cpu().numpy():
        x1, y1, x2, y2, score, cls = box
        detections.append({
            'bbox': [float(x1), float(y1), float(x2), float(y2)],
            'score': float(score),
            'class_id': int(cls),
            'class_name': model.names[int(cls)]
        })

    return jsonify({
        'detections': detections,
        'image_size': [orig_w, orig_h]
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=int(os.getenv("PORT", 5000)))
