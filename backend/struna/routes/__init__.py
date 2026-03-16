from flask import Blueprint

from .auth import auth_bp
from .data import data_bp
from .users import users_bp


def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(data_bp)
