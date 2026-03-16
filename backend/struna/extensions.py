from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# Flask extensions are created here and initialized in create_app().
db = SQLAlchemy()
cors = CORS()
