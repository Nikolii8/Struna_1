from datetime import datetime, time

import pytz
from flask import Blueprint, jsonify

from ..extensions import db
from ..models import AllInfo, SelectedInfo

BAD_MIN = 85
BAD_MAX = 100

BULGARIA_TZ = pytz.timezone('Europe/Sofia')

data_bp = Blueprint('data', __name__)


@data_bp.route('/current-angle')
def current_angle():
    data = db.session.get(SelectedInfo, 1)
    if data:
        return jsonify({"angle": round(data.angle, 2)})
    return jsonify({"error": "No data"}), 404


@data_bp.route('/today-data')
def today_data_route():
    now = datetime.now(BULGARIA_TZ)
    start_of_day = BULGARIA_TZ.localize(datetime.combine(now.date(), time.min))

    data = AllInfo.query.filter(AllInfo.created >= start_of_day).order_by(AllInfo.created).all()
    if not data:
        return jsonify({"timeline": [], "good_posture": 100, "bad_posture": 0})

    timeline = []
    bad = 0
    for entry in data:
        local_time = pytz.utc.localize(entry.created).astimezone(BULGARIA_TZ)
        slouched = entry.angle < BAD_MIN or entry.angle > BAD_MAX
        if slouched:
            bad += 1
        timeline.append({
            "time": local_time.strftime("%H:%M"),
            "angle": round(entry.angle, 2),
            "slouched": slouched
        })

    total = len(data)
    bad_pct = (bad / total) * 100
    good_pct = 100 - bad_pct

    return jsonify({
        "timeline": timeline,
        "good_posture": round(good_pct, 2),
        "bad_posture": round(bad_pct, 2)
    })
