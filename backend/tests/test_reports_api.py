def test_list_reports_as_guest(client):
    res = client.get("/api/reports")
    assert res.status_code == 200
    data = res.json()
    assert "items" in data
    assert data["total"] >= 3
    assert data["page"] == 1

def test_filter_reports_by_category(client):
    res = client.get("/api/reports?category=sanitation")
    assert res.status_code == 200
    data = res.json()
    for item in data["items"]:
        assert item["category"] == "sanitation"

def test_create_report_unauthenticated_fails(client):
    payload = {
        "title": "Unauth Test Report",
        "description": "This is a detailed description of a community issue.",
        "category": "sanitation",
        "approximate_public_location": "Bhubaneswar"
    }
    res = client.post("/api/reports", json=payload)
    assert res.status_code == 401

def test_create_report_authenticated_succeeds(client, citizen_auth_headers):
    payload = {
        "title": "Broken Handpump near Panchayat Hall",
        "description": "The local community handpump handle has detached, stopping water access for 20 households.",
        "category": "water",
        "user_confirmed_urgency": "high",
        "approximate_public_location": "Panchayat Hall, Balianta",
        "preferred_language": "en"
    }
    res = client.post("/api/reports", json=payload, headers=citizen_auth_headers)
    assert res.status_code == 201
    created = res.json()
    assert created["title"] == payload["title"]
    assert created["status"] == "open"
    assert created["creator"]["id"] == "00000000-0000-0000-0000-000000000001"

def test_toggle_follow_report(client, citizen_auth_headers):
    report_id = "20000000-0000-0000-0000-000000000002"
    res = client.post(f"/api/reports/{report_id}/follow", headers=citizen_auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "is_followed" in data
    assert "total_follows" in data

