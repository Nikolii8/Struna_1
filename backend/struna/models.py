from datetime import datetime

from .extensions import db


class AllInfo(db.Model):
    __tablename__ = "all_info"

    id = db.Column(db.Integer, primary_key=True)
    angle = db.Column(db.Float, nullable=False)
    created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


class SelectedInfo(db.Model):
    __tablename__ = "selected_info"

    id = db.Column(db.Integer, primary_key=True, default=1)
    angle = db.Column(db.Float, nullable=False)
    created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    birthdate = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    profile_pic = db.Column(db.String(200), default='avatar.png')
