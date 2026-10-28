def test_status_transition_invalid_jump(client, organizer_auth_headers):
    # Report 2 is OPEN, jumping directly to RESOLVED without IN_PROGRESS must be rejected by state machine
    report_id = "20000000-0000-0000-0000-000000000002"
    payload = {
        "new_status": "resolved",
        "reason": "Direct illegal resolution attempt",
        "resolution_type": "officially_resolved"
    }
    res = client.patch(f"/api/reports/{report_id}/status", json=payload, headers=organizer_auth_headers)
    assert res.status_code == 400
    assert "Illegal transition" in res.json()["detail"]

def test_citizen_cannot_officially_resolve(client, citizen_auth_headers):
    report_id = "20000000-0000-0000-0000-000000000001" # In progress
    payload = {
        "new_status": "resolved",
        "reason": "Citizen claiming official resolution",
        "resolution_type": "officially_resolved"
    }
    res = client.patch(f"/api/reports/{report_id}/status", json=payload, headers=citizen_auth_headers)
    assert res.status_code == 403
    assert "Official resolution requires verification" in res.json()["detail"]

def test_citizen_cannot_access_admin_metrics(client, citizen_auth_headers):
    res = client.get("/api/admin/metrics", headers=citizen_auth_headers)
    assert res.status_code == 403

def test_moderator_can_access_metrics(client, moderator_auth_headers):
    res = client.get("/api/admin/metrics", headers=moderator_auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "summary" in data

def test_moderator_cannot_access_admin_audit_logs(client, moderator_auth_headers):
    res = client.get("/api/admin/audit-logs", headers=moderator_auth_headers)
    assert res.status_code == 403

def test_admin_can_access_audit_logs(client, admin_auth_headers):
    res = client.get("/api/admin/audit-logs", headers=admin_auth_headers)
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) > 0

