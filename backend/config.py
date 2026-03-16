import os

# Load environment variables from .env file if python-dotenv is installed.
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    # It's safe to continue without dotenv if it's not installed (e.g., in minimal environments).
    pass

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://nikolii:0884999440@localhost:5432/struna')

# Flask secret key
SECRET_KEY = os.getenv('SECRET_KEY', 'your_secret_key')

# Upload configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}