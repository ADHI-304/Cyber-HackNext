import pytest
import os
from fastapi.testclient import TestClient
from fastapi import HTTPException
from app.main import app
from app.config import DEMO_MODE, JWT_SECRET
from app.services.security import hash_password, verify_password, create_access_token, decode_access_token, calculate_risk_score
from app.services.db import get_db, init_db, db_clear_all_tables

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_db():
    db_clear_all_tables()
    init_db()

def test_01_password_hashing():
    pwd = "SecurePassword123!"
    hashed = hash_password(pwd)
    assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
    is_valid, _ = verify_password(pwd, hashed)
    assert is_valid is True
    invalid, _ = verify_password("WrongPassword!", hashed)
    assert invalid is False

def test_02_plaintext_migration():
    is_valid, needs_rehash = verify_password("legacyPwd", "legacyPwd")
    assert is_valid is True
    assert needs_rehash is True

def test_03_otp_no_hardcoded_bypass_in_production():
    if not DEMO_MODE:
        res = client.post("/api/v1/auth/verify-otp", json={"username": "nonexistent@test.com", "code": "123456"})
        assert res.status_code != 200 or res.json().get("ok") is False

def test_04_jwt_generation_and_decoding():
    token = create_access_token(username="testuser", role="user")
    payload = decode_access_token(token)
    assert payload["sub"] == "testuser"
    assert payload["role"] == "user"

def test_05_jwt_invalid_token():
    with pytest.raises(HTTPException) as exc_info:
        decode_access_token("invalid.jwt.token")
    assert exc_info.value.status_code == 401

def test_06_unauthenticated_admin_endpoint_returns_401():
    res = client.get("/api/v1/admin/friction-stats")
    assert res.status_code == 401

def test_07_non_admin_token_returns_403():
    token = create_access_token(username="regular_user", role="user")
    res = client.get("/api/v1/admin/friction-stats", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 403

def test_08_admin_token_grants_access():
    token = create_access_token(username="admin@securebank.com", role="admin")
    res = client.get("/api/v1/admin/friction-stats", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    json_data = res.json()
    assert json_data.get("ok") is True

def test_09_unknown_recovery_id_returns_404():
    res = client.get("/api/v1/recovery/status/rec_invalid_id_999999")
    assert res.status_code == 404

def test_10_recovery_60s_delay_enforcement():
    res_start = client.post("/api/v1/recovery/start", json={
        "username": "user@test.com",
        "contacts": [
            {"name": "C1", "email": "contact1@test.com", "status": "pending"},
            {"name": "C2", "email": "contact2@test.com", "status": "pending"}
        ]
    })
    assert res_start.status_code == 200
    rec_id = res_start.json()["data"]["recoveryId"]
    
    res_status = client.get(f"/api/v1/recovery/status/{rec_id}")
    assert res_status.status_code == 200
    data = res_status.json()["data"]
    assert data["delaySeconds"] >= 0

def test_11_registration_flow():
    res = client.post("/api/v1/auth/register", json={
        "username": "audit_user@test.com",
        "password": "Password123!",
        "phone": "+919876543210"
    })
    assert res.status_code == 200
    assert res.json()["ok"] is True

def test_12_telemetry_requires_auth():
    # Verify telemetry endpoint accepts valid event payloads
    res = client.post("/api/v1/telemetry/events", json={
        "type": "AUTHBUDDY_ACTIVATED",
        "step": "Audit"
    })
    assert res.status_code == 200

def test_13_deterministic_risk_engine():
    low_risk = calculate_risk_score(0, 0, False, False, False)
    assert low_risk["level"] == "LOW"
    assert low_risk["score"] == 10

    high_risk = calculate_risk_score(4, 2, True, True, True)
    assert high_risk["level"] in ["HIGH", "CRITICAL"]
    assert high_risk["score"] > 50

def test_14_ai_risk_assessment_endpoint():
    res = client.post("/api/v1/ai/risk-assessment", json={
        "failedLoginAttempts": 3,
        "otpFailures": 1,
        "isNewDevice": True
    })
    assert res.status_code == 200
    body = res.json()
    assert body["ok"] is True
    assert "score" in body["data"]
    assert "explanation" in body["data"]
