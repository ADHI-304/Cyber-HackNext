"""
AuthBuddy Backend API Test Suite
Automated Pytest verification of authentication, OTP, recovery, and friction telemetry.
"""

import pytest
import time
from fastapi.testclient import TestClient
from app.main import app
from app.services.db import init_db, db_clear_all_tables
from app.services.security import create_access_token

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_environment():
    db_clear_all_tables()
    init_db()

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["status"] == "healthy"
    assert "version" in json_data

def test_user_registration():
    # Test valid registration
    response = client.post("/api/v1/auth/register", json={
        "username": "newuser@securebank.com",
        "password": "Password123!",
        "accessibilityProfile": {"largeText": True}
    })
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert "secretKey" in data["data"]

    # Test weak password rejection
    weak_res = client.post("/api/v1/auth/register", json={
        "username": "weak@securebank.com",
        "password": "123"
    })
    assert weak_res.json()["ok"] is False
    assert weak_res.json()["errorCode"] == "WEAK_PASSWORD"

def test_login_flow():
    # Register user first for deterministic credentials
    client.post("/api/v1/auth/register", json={
        "username": "user@securebank.com",
        "password": "Password123!"
    })

    # Test successful login attempt
    response = client.post("/api/v1/auth/login", json={
        "username": "user@securebank.com",
        "password": "Password123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["ok"] is True
    assert data["data"]["otpRequired"] is True

    # Test invalid credentials
    time.sleep(0.35)
    bad_res = client.post("/api/v1/auth/login", json={
        "username": "user@securebank.com",
        "password": "WrongPassword!"
    })
    assert bad_res.json()["ok"] is False
    assert bad_res.json()["errorCode"] == "INVALID_CREDENTIALS"

def test_verify_otp():
    # Register user first
    client.post("/api/v1/auth/register", json={
        "username": "demo",
        "password": "Password123!"
    })

    # Initiate login to generate active OTP
    login_res = client.post("/api/v1/auth/login", json={
        "username": "demo",
        "password": "Password123!"
    })
    assert login_res.json()["ok"] is True

    # Verify invalid OTP first while active
    bad_otp = client.post("/api/v1/auth/verify-otp", json={
        "username": "demo",
        "code": "000000"
    })
    assert bad_otp.json()["ok"] is False
    assert bad_otp.json()["errorCode"] == "OTP_INVALID"

def test_recovery_flow():
    # Start recovery
    start_res = client.post("/api/v1/recovery/start", json={
        "username": "user@securebank.com",
        "contacts": [
            {"name": "Arun", "email": "arun@example.com", "status": "pending"},
            {"name": "Priya", "email": "priya@example.com", "status": "pending"}
        ]
    })
    assert start_res.status_code == 200
    rec_id = start_res.json()["data"]["recoveryId"]
    assert rec_id.startswith("rec_")

    # Get status
    status_res = client.get(f"/api/v1/recovery/status/{rec_id}")
    assert status_res.status_code == 200
    assert status_res.json()["data"]["id"] == rec_id

    # Approve contact
    app_res = client.post("/api/v1/recovery/approve", json={
        "recoveryId": rec_id,
        "contactIndex": 0,
        "decision": "approved"
    })
    assert app_res.status_code == 200
    assert app_res.json()["data"]["decision"] == "approved"

def test_telemetry_and_friction_stats():
    # Log event
    log_res = client.post("/api/v1/telemetry/events", json={
        "type": "AUTHBUDDY_ACTIVATED",
        "step": "Login",
        "metadata": {"struggleScore": 4}
    })
    assert log_res.status_code == 200
    assert log_res.json()["data"]["logged"] is True

    # Get friction stats with admin auth token
    admin_token = create_access_token(username="admin@securebank.com", role="admin")
    stats_res = client.get("/api/v1/admin/friction-stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert stats_res.status_code == 200
    data = stats_res.json()["data"]
    assert data["securityBypassedCount"] == 0
    assert "failuresPerStep" in data
    assert "frictionVsRisk" in data
