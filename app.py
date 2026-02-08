from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import pytz
import jwt

app = Flask(__name__)
app.secret_key = 'your_secret_key'

BULGARIA_TZ = pytz.timezone('Europe/Sofia')

# ------------------ DATABASE CONFIG ------------------
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://nikolii:0884999440@localhost:5432/struna'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# ------------------ JWT CONFIG ------------------
JWT_SECRET = 'your_jwt_secret_key'
JWT_ALGORITHM = 'HS256'
JWT_EXP_DELTA_HOURS = 1

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


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    birthdate = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)

# ------------------ AUTH CHECK ------------------
@app.before_request
def require_login():
    allowed_routes = {
        'login', 'signup', 'index', 'about', 'contact',
        'verify_email', 'static', 'current_angle', 'today_data_route'
    }

    if request.endpoint not in allowed_routes and 'user_id' not in session:
        return redirect(url_for('login'))

# ------------------ ROUTES ------------------

@app.route('/')
def index():
    return render_template('index.html', username=session.get('user_name'))

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        name = request.form['name']
        birthdate = request.form['birthdate']
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']

        if password != confirm_password:
            flash('Passwords do not match', 'danger')
            return render_template('signup.html')

        if User.query.filter_by(email=email).first():
            flash('Email already exists', 'warning')
            return render_template('signup.html')

        user = User(
            name=name,
            birthdate=birthdate,
            email=email,
            password=generate_password_hash(password)
        )

        db.session.add(user)
        db.session.commit()

        flash('Registration successful', 'success')
        return redirect(url_for('login'))

    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password_input = request.form['password']

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password_input):
            session['user_id'] = user.id
            session['user_name'] = user.name
            return redirect(url_for('report'))

        flash('Invalid credentials', 'danger')

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('index'))

@app.route('/report')
def report():
    return render_template('report.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

# ------------------ DATA ROUTES ------------------

@app.route('/current-angle')
def current_angle():
    data = SelectedInfo.query.get(1)
    if data:
        return jsonify({"angle": data.angle})
    return jsonify({"error": "No data"}), 404

@app.route('/today-data')
def today_data_route():
    data = AllInfo.query.order_by(AllInfo.created).all()

    if not data:
        return jsonify({"timeline": [], "good_posture": 100, "bad_posture": 0})

    timeline = []
    bad = 0

    for entry in data:
        local_time = pytz.utc.localize(entry.created).astimezone(BULGARIA_TZ)
        slouched = entry.angle < 85 or entry.angle > 100
        if slouched:
            bad += 1

        timeline.append({
            "time": local_time.strftime("%H:%M:%S"),
            "angle": entry.angle,
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

# ------------------ INIT ------------------
if __name__ == '__main__':
    with app.app_context():
        db.create_all()

        # гарантира 1 ред в selected_info
        if not SelectedInfo.query.get(1):
            db.session.add(SelectedInfo(id=1, angle=0.0))
            db.session.commit()

    app.run(debug=True)
