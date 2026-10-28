from datetime import datetime, timezone, timedelta

def test_list_opportunities(client):
    res = client.get("/api/volunteer-opportunities")
    assert res.status_code == 200
    opps = res.json()
    assert len(opps) >= 2
    assert "title" in opps[0]
    assert "capacity" in opps[0]

def test_citizen_cannot_create_opportunity(client, citizen_auth_headers):
    now = datetime.now(timezone.utc)
    payload = {
        "title": "Unauthorized Drive",
        "description": "Citizens should not be able to create an official organizer drive.",
        "location": "Central Park",
        "start_at": (now + timedelta(days=2)).isoformat(),
        "end_at": (now + timedelta(days=2, hours=2)).isoformat(),
        "capacity": 20
    }
    res = client.post("/api/volunteer-opportunities", json=payload, headers=citizen_auth_headers)
    assert res.status_code == 403

def test_organizer_can_create_opportunity(client, organizer_auth_headers):
    now = datetime.now(timezone.utc)
    payload = {
        "title": "Community Park Tree Sapling Drive",
        "description": "Volunteers will plant 50 native tree saplings along the boundary wall.",
        "location": "Biju Patnaik Park, Cuttack",
        "start_at": (now + timedelta(days=5)).isoformat(),
        "end_at": (now + timedelta(days=5, hours=3)).isoformat(),
        "capacity": 15,
        "skills_needed": ["gardening", "digging"]
    }
    res = client.post("/api/volunteer-opportunities", json=payload, headers=organizer_auth_headers)
    assert res.status_code == 201
    created = res.json()
    assert created["title"] == payload["title"]

def test_volunteer_signup_and_duplicate_prevention(client, volunteer_auth_headers):
    opp_id = "40000000-0000-0000-0000-000000000002"
    # First signup
    res1 = client.post(f"/api/volunteer-opportunities/{opp_id}/signup", json={"notes": "I can bring gloves"}, headers=volunteer_auth_headers)
    assert res1.status_code == 200
    assert res1.json()["success"] is True

    # Duplicate signup attempt must fail
    res2 = client.post(f"/api/volunteer-opportunities/{opp_id}/signup", json={"notes": "Second attempt"}, headers=volunteer_auth_headers)
    assert res2.status_code == 400
    assert "already registered" in res2.json()["detail"]

    # Withdrawal
    res3 = client.post(f"/api/volunteer-opportunities/{opp_id}/withdraw", headers=volunteer_auth_headers)
    assert res3.status_code == 200
    assert res3.json()["success"] is True

