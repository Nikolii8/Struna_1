import json


def test_signup_and_login(client):
    # Signup a new user
    payload = {
        "name": "test",
        "birthdate": "2000-01-01",
        "email": "test@example.com",
        "password": "pass123",
        "confirm_password": "pass123",
    }

    resp = client.post("/signup", json=payload)
    assert resp.status_code == 201
    assert resp.get_json()["message"] == "Registration successful"

    # Login with created user
    resp = client.post("/login", json={"email": "test@example.com", "password": "pass123"})
    assert resp.status_code == 200
    assert resp.get_json()["message"] == "Logged in successfully"
    assert "user_id" in resp.get_json()

    # Verify we can fetch the user
    user_id = resp.get_json()["user_id"]
    resp = client.get(f"/users/{user_id}")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "test"


def test_logout_clears_session(client):
    # Logout should always return success even if no session exists
    resp = client.post("/logout")
    assert resp.status_code == 200
    assert resp.get_json()["message"] == "Logged out successfully"
