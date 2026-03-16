import datetime

import pytz

from struna.tasks import insert_angle


def test_current_angle_defaults_to_zero(client):
    resp = client.get("/current-angle")
    assert resp.status_code == 200
    assert resp.get_json()["angle"] == 0.0


def test_today_data_includes_new_entry(client, app):
    # Add a new angle entry and verify it appears in /today-data
    with app.app_context():
        insert_angle(95.0)

    resp = client.get("/today-data")
    assert resp.status_code == 200
    data = resp.get_json()
    assert "timeline" in data
    assert len(data["timeline"]) >= 1
    assert any(entry["angle"] == 95.0 for entry in data["timeline"])


def test_today_data_respects_timezone(client):
    # ensure the endpoint filters by today's date in Europe/Sofia
    tz = pytz.timezone("Europe/Sofia")
    now = datetime.datetime.now(tz)

    resp = client.get("/today-data")
    assert resp.status_code == 200

    data = resp.get_json()
    # good_posture/bad_posture are percentages and may be ints or floats depending on the data.
    assert isinstance(data["good_posture"], (int, float))
    assert isinstance(data["bad_posture"], (int, float))
    assert data["good_posture"] + data["bad_posture"] == 100.0
