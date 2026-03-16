from datetime import datetime

import pytz
from apscheduler.schedulers.background import BackgroundScheduler
from flask import current_app

from .extensions import db
from .models import AllInfo, SelectedInfo

BULGARIA_TZ = pytz.timezone('Europe/Sofia')


def _ensure_selected_info_exists():
    if not db.session.get(SelectedInfo, 1):
        db.session.add(SelectedInfo(id=1, angle=0.0, created=datetime.utcnow()))
        db.session.commit()


def daily_reset():
    """Reset data tables every day at midnight."""
    with current_app.app_context():
        db.session.execute("TRUNCATE TABLE all_info, selected_info RESTART IDENTITY CASCADE;")
        db.session.add(SelectedInfo(id=1, angle=0.0, created=datetime.utcnow()))
        db.session.commit()
        print("[DB] Daily reset done.")


def insert_angle(angle: float):
    """Insert new angle into database and update the selected value."""
    with current_app.app_context():
        if angle <= 0:
            return {"error": "Angle too low"}, 400

        entry = AllInfo(angle=angle, created=datetime.utcnow())
        db.session.add(entry)

        selected = db.session.get(SelectedInfo, 1)
        if selected:
            selected.angle = angle
            selected.created = datetime.utcnow()
        else:
            db.session.add(SelectedInfo(id=1, angle=angle, created=datetime.utcnow()))

        db.session.commit()
        print(f"[DB] Saved angle: {angle}")
        return {"success": True, "angle": angle}, 201


def start_scheduler(app):
    scheduler = BackgroundScheduler(timezone=BULGARIA_TZ)
    scheduler.add_job(daily_reset, 'cron', hour=0, minute=0)
    scheduler.start()
    app.scheduler = scheduler
