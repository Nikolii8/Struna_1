import os
from datetime import datetime

from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename

from ..extensions import db
from ..models import User
from config import UPLOAD_FOLDER, ALLOWED_EXTENSIONS

users_bp = Blueprint('users', __name__)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@users_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "profile_pic": user.profile_pic
    })


@users_bp.route('/users/<int:user_id>/avatar', methods=['POST'])
def change_avatar(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if 'profile_pic' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['profile_pic']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file"}), 400

    filename = secure_filename(f"{user_id}_{int(datetime.utcnow().timestamp())}_{file.filename}")
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    user.profile_pic = filename
    db.session.commit()

    return jsonify({"success": True, "profile_pic": filename})


@users_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)
