from flask import Flask, request, jsonify, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime, time
from apscheduler.schedulers.background import BackgroundScheduler
import pytz
import os

BAD_MIN = 85
BAD_MAX = 100

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Allow CORS for all routes and support credentials (cookies)
CORS(app, supports_credentials=True)

BULGARIA_TZ = pytz.timezone('Europe/Sofia')

# ------------------ DATABASE CONFIG ------------------
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://nikolii:0884999440@localhost:5432/struna'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ------------------ UPLOAD CONFIG ------------------
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ------------------ MODELS ------------------
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

# ------------------ AUTH ROUTES ------------------
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
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

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password_input = data.get('password')

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, password_input):
        session['user_id'] = user.id
        session['user_name'] = user.name
        return jsonify({"message": "Logged in successfully", "user_id": user.id}), 200

    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

# ------------------ USER ROUTES ------------------
@app.route('/users/<int:user_id>', methods=['GET'])
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

@app.route('/users/<int:user_id>/avatar', methods=['POST'])
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
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    user.profile_pic = filename
    db.session.commit()

    return jsonify({"success": True, "profile_pic": filename})

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# ------------------ DATA ROUTES ------------------
@app.route('/current-angle')
def current_angle():
    # use session.get to avoid legacy warning
    data = db.session.get(SelectedInfo, 1)
    if data:
        return jsonify({"angle": round(data.angle, 2)})
    return jsonify({"error": "No data"}), 404

@app.route('/today-data')
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

# ------------------ INSERT ANGLE ------------------
def insert_angle(angle):
    """Записва ъгъл само ако > 100"""
    with app.app_context():
        if angle > 100:
            entry = AllInfo(angle=angle, created=datetime.utcnow())
            db.session.add(entry)

            selected = SelectedInfo.query.first()
            selected.angle = angle
            selected.created = datetime.utcnow()

            db.session.commit()
            print(f"[DB] Saved angle: {angle}")

    with app.app_context():
        if angle > 0:
            entry = AllInfo(angle=angle, created=datetime.utcnow())
            db.session.add(entry)

            selected = SelectedInfo.query.first()
            if selected:
                selected.angle = angle
                selected.created = datetime.utcnow()
            else:
                db.session.add(SelectedInfo(id=1, angle=angle, created=datetime.utcnow()))

            db.session.commit()
            print(f"[DB] Saved angle from device: {angle}")
            return jsonify({"success": True, "angle": angle}), 201
        else:
            return jsonify({"error": "Angle too low"}), 400

# ------------------ DAILY RESET ------------------
def daily_reset():
    """Изтрива all_info и selected_info, създава първоначален ред в selected_info"""
    with app.app_context():
        db.session.execute("TRUNCATE TABLE all_info, selected_info RESTART IDENTITY CASCADE;")
        db.session.add(SelectedInfo(id=1, angle=0.0, created=datetime.utcnow()))
        db.session.commit()
        print("[DB] Daily reset done.")

# Scheduler
scheduler = BackgroundScheduler(timezone=BULGARIA_TZ)
scheduler.add_job(daily_reset, 'cron', hour=0, minute=0)
scheduler.start()

# ------------------ INIT ------------------
if __name__ == '__main__':
    from sqlalchemy import inspect

    with app.app_context():
        # ensure tables exist
        db.create_all()

        # if the selected_info table was created by older code it might lack the
        # `created` column.  inspect the table and add the column if missing so
        # the subsequent SELECT does not fail with "column does not exist".
        insp = inspect(db.engine)
        if insp.has_table('selected_info'):
            cols = [c['name'] for c in insp.get_columns('selected_info')]
            if 'created' not in cols:
                # add column with default value; PostgreSQL lets us use NOW()
                from sqlalchemy import text
                db.session.execute(
                    text("ALTER TABLE selected_info ADD COLUMN created TIMESTAMP NOT NULL DEFAULT NOW();")
                )
                db.session.commit()

        # make sure there is always a row with id=1
        # use Session.get instead of deprecated Query.get
        if not db.session.get(SelectedInfo, 1):
            db.session.add(SelectedInfo(id=1, angle=0.0, created=datetime.utcnow()))
            db.session.commit()

    app.run(host="0.0.0.0", port=5000, debug=True)
