from flask import Blueprint, request, jsonify, session
from werkzeug.security import generate_password_hash, check_password_hash

from ..extensions import db
from ..models import User

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json() or {}
    name = data.get('name')
    birthdate = data.get('birthdate')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')

    if password != confirm_password:
        return jsonify({"message": "Passwords do not match"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"message": "Email already exists"}), 400

    user = User(
        name=name,
        birthdate=birthdate,
        email=email,
        password=generate_password_hash(password),
        profile_pic='avatar.png'
    )

    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Registration successful"}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password_input = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, password_input):
        session['user_id'] = user.id
        session['user_name'] = user.name
        return jsonify({"message": "Logged in successfully", "user_id": user.id}), 200

    return jsonify({"message": "Invalid credentials"}), 401


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200
