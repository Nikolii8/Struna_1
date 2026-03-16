import os
from datetime import datetime

from flask import Flask

import config

from .extensions import db, cors
from .models import AllInfo, SelectedInfo, User
from .routes import register_blueprints
from .tasks import start_scheduler


def create_app():
    """Create and configure the Flask application."""

    app = Flask(__name__)
    app.secret_key = config.SECRET_KEY

    # config
    app.config["SQLALCHEMY_DATABASE_URI"] = config.DATABASE_URL
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # uploads
    os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)
    app.config["UPLOAD_FOLDER"] = config.UPLOAD_FOLDER

    # extensions
    db.init_app(app)
    cors.init_app(app, supports_credentials=True)

    # register routes
    register_blueprints(app)

    # initialize DB and scheduler
    with app.app_context():
        db.create_all()

        from sqlalchemy import inspect, text

        insp = inspect(db.engine)
        if insp.has_table('selected_info'):
            cols = [c['name'] for c in insp.get_columns('selected_info')]
            if 'created' not in cols:
                db.session.execute(
                    text("ALTER TABLE selected_info ADD COLUMN created TIMESTAMP NOT NULL DEFAULT NOW();")
                )
                db.session.commit()

        if not db.session.get(SelectedInfo, 1):
            db.session.add(SelectedInfo(id=1, angle=0.0, created=datetime.utcnow()))
            db.session.commit()

    start_scheduler(app)

    return app
