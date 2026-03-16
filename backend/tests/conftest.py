import os

import pytest


@pytest.fixture(autouse=True)
def set_test_env(monkeypatch, tmp_path):
    """Set up environment variables for tests before importing the app."""
    # Use a fresh SQLite database file per test to avoid cross-test state.
    db_path = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{db_path}")
    monkeypatch.setenv("SECRET_KEY", "test-secret")

    # Use a temporary uploads folder.
    uploads_dir = tmp_path / "uploads"
    uploads_dir.mkdir()
    monkeypatch.setenv("UPLOAD_FOLDER", str(uploads_dir))

    # Ensure dotenv isn't required for tests
    monkeypatch.setenv("FLASK_ENV", "testing")

    # Reload config so DATABASE_URL / UPLOAD_FOLDER values are picked up.
    import importlib
    import config

    importlib.reload(config)


@pytest.fixture()
def app():
    """Create a Flask app for testing."""
    # Import here after environment is configured by set_test_env
    from struna import create_app

    app = create_app()
    app.testing = True

    return app


@pytest.fixture()
def client(app):
    return app.test_client()
