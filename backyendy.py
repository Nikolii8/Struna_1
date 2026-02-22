from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)

# ---------------- DATABASE CONFIG ----------------
app.config['SQLALCHEMY_DATABASE_URI'] = (
    'postgresql://nikolii:0884999440@localhost:5432/struna'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ---------------- MODELS ----------------

class AllInfo(db.Model):
    __tablename__ = "all_info"

    id = db.Column(db.Integer, primary_key=True)
    angle = db.Column(db.Float, nullable=False)
    created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


class SelectedInfo(db.Model):
    __tablename__ = "selected_info"

    id = db.Column(db.Integer, primary_key=True)
    angle = db.Column(db.Float, nullable=False)

# ---------------- INIT DATABASE ----------------
with app.app_context():
    db.create_all()

    # гарантира, че има точно 1 ред
    if not SelectedInfo.query.first():
        db.session.add(SelectedInfo(id=1, angle=0.0))
        db.session.commit()

# ---------------- HELPERS ----------------
def get_utc_time():
    return datetime.utcnow()

# ---------------- INSERT DATA ----------------
def insert_data(coefficient):
    """
    Записва стойността на coefficient в PostgreSQL:
    - добавя ред в all_info
    - обновява selected_info
    """
    with app.app_context():
        new_entry = AllInfo(
            angle=coefficient,
            created=get_utc_time()
        )
        db.session.add(new_entry)

        selected_entry = SelectedInfo.query.first()
        selected_entry.angle = coefficient

        db.session.commit()

        print(f"[DATABASE] Saved coefficient: {coefficient}")
        print(f"[DATABASE] Current angle updated to {coefficient}")