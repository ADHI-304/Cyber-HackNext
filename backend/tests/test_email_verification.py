"""
Tests for Real Email OTP Verification and Password Reset Feature
"""

from fastapi.testclient import TestClient
from app.main import app
from app.services.store import email_verification_otps, mock_users
import hashlib

client = TestClient(app)

def test_email_otp_registration_and_verification():
    test_email = "test_reg_otp@gmail.com"
    
    # 1. Register User
    reg_res = client.post("/api/v1/auth/register", json={
        "username": test_email,
        "password": "Password123!"
    })
    assert reg_res.status_code == 200
    res_data = reg_res.json()
    assert res_data["ok"] is True
    
    # Verify raw secret code is NOT returned
    assert "otp" not in res_data.get("data", {})
    assert "code" not in res_data.get("data", {})
    assert mock_users[test_email]["emailVerified"] is False
    
    # Verify store record
    store_key = f"{test_email}:EMAIL_VERIFICATION"
    assert store_key in email_verification_otps
    record = email_verification_otps[store_key]
    assert "otp_hash" in record
    assert record["attempts"] == 0

    # 2. Test Invalid OTP
    inv_res = client.post("/verify-email", json={
        "email": test_email,
        "otp": "000000"
    })
    assert inv_res.json()["success"] is False
    assert inv_res.json()["errorCode"] == "OTP_INVALID"

    # 3. Test Successful Verification
    dummy_otp = "654321"
    record["otp_hash"] = hashlib.sha256(dummy_otp.encode("utf-8")).hexdigest()
    email_verification_otps[store_key] = record
    
    val_res = client.post("/verify-email", json={
        "email": test_email,
        "otp": dummy_otp
    })
    assert val_res.json()["success"] is True
    assert mock_users[test_email]["emailVerified"] is True

    # 4. Verify Single-Use (reuse fails)
    reuse_res = client.post("/verify-email", json={
        "email": test_email,
        "otp": dummy_otp
    })
    assert reuse_res.json()["success"] is False
    assert reuse_res.json()["errorCode"] in ["OTP_EXPIRED", "OTP_INVALID"]

def test_forgot_password_and_reset_flow():
    test_email = "forgot_pass_user@gmail.com"
    mock_users[test_email] = {
        "username": test_email,
        "password": "OldPassword123!",
        "emailVerified": True
    }
    
    # 1. Initiate Forgot Password
    forgot_res = client.post("/api/v1/auth/forgot-password", json={
        "email": test_email
    })
    assert forgot_res.status_code == 200
    assert forgot_res.json()["success"] is True
    
    store_key = f"{test_email}:PASSWORD_RESET"
    assert store_key in email_verification_otps
    record = email_verification_otps[store_key]
    assert record["purpose"] == "PASSWORD_RESET"
    
    # 2. Reset Password using OTP
    dummy_otp = "987654"
    record["otp_hash"] = hashlib.sha256(dummy_otp.encode("utf-8")).hexdigest()
    email_verification_otps[store_key] = record
    
    reset_res = client.post("/api/v1/auth/reset-password", json={
        "email": test_email,
        "otp": dummy_otp,
        "newPassword": "BrandNewPassword123!"
    })
    assert reset_res.status_code == 200
    assert reset_res.json()["success"] is True
    from app.services.security import verify_password
    is_valid, _ = verify_password("BrandNewPassword123!", mock_users[test_email]["password"])
    assert is_valid is True

def test_resend_cooldown():
    test_email = "cooldown_test@gmail.com"
    client.post("/api/v1/auth/register", json={
        "username": test_email,
        "password": "Password123!"
    })
    
    # Fast resend triggers 60s cooldown error
    resend_res = client.post("/api/v1/auth/resend-email-otp", json={
        "email": test_email
    })
    assert resend_res.status_code == 200
    assert resend_res.json()["success"] is False
    assert resend_res.json()["errorCode"] == "RATE_LIMITED"
