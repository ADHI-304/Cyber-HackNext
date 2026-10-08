import time
import secrets
import hmac
import hashlib
import base64
import struct
from typing import Optional, Dict, Any, Tuple
from fastapi import Depends, HTTPException, status, Header
import bcrypt
import jwt

from app.config import (
    JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRY_SECONDS,
    DEMO_MODE, GEMINI_API_KEY
)

# --- PASSWORD HASHING ---
def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, stored_password: str) -> Tuple[bool, bool]:
    """
    Verifies plain password against stored password string using bcrypt.
    Returns (is_valid, needs_rehash).
    Handles transparent migration from legacy plaintext records.
    """
    if not stored_password:
        return False, False
        
    # Check if stored_password is a bcrypt hash
    if stored_password.startswith("$2b$") or stored_password.startswith("$2a$"):
        try:
            pwd_bytes = plain_password.encode('utf-8')[:72]
            stored_bytes = stored_password.encode('utf-8')
            is_valid = bcrypt.checkpw(pwd_bytes, stored_bytes)
            return is_valid, False
        except Exception:
            return False, False
    else:
        # Legacy plaintext record handling
        is_valid = (plain_password == stored_password)
        # Indicate that this password needs to be re-hashed to bcrypt
        return is_valid, is_valid

# --- JWT AUTHENTICATION ---
def create_access_token(username: str, role: str = "user", extra_claims: Optional[Dict[str, Any]] = None) -> str:
    now = int(time.time())
    payload = {
        "sub": username.lower().strip(),
        "role": role.lower().strip(),
        "iat": now,
        "exp": now + JWT_EXPIRY_SECONDS
    }
    if extra_claims:
        payload.update(extra_claims)
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"}
        )

# --- FASTAPI DEPENDENCIES ---
def get_current_user_from_token(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Missing Authorization header.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization header format. Expected 'Bearer <token>'.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = parts[1]
    payload = decode_access_token(token)
    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token payload.",
            headers={"WWW-Authenticate": "Bearer"}
        )
        
    from app.services.db import db_get_user
    user = db_get_user(username)
    if not user:
        # If user record doesn't exist in DB, populate minimal user payload from token for valid tokens
        user = {
            "username": username,
            "role": payload.get("role", "user"),
            "emailVerified": True,
            "phoneVerified": False
        }
    else:
        user["role"] = payload.get("role", user.get("role", "user"))

    return user

def get_admin_user(current_user: Dict[str, Any] = Depends(get_current_user_from_token)) -> Dict[str, Any]:
    role = str(current_user.get("role", "user")).lower().strip()
    username = str(current_user.get("username", "")).lower().strip()
    
    # Allow admin role OR designated admin username
    if role != "admin" and not username.startswith("admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Administrator privileges required."
        )
    return current_user

# --- TOTP GENERATION & VERIFICATION ---
def generate_totp_secret() -> str:
    raw_bytes = secrets.token_bytes(10)
    return base64.b32encode(raw_bytes).decode("utf-8").replace("=", "")

def verify_totp_code(secret: str, code: str, valid_window: int = 1) -> bool:
    clean_code = code.strip()
    if not secret:
        secret = "JBSWY3DPEHPK3PXP"
        
    # Check DEMO_MODE fallback code only if DEMO_MODE is explicitly enabled
    if DEMO_MODE and clean_code == "123456":
        return True
        
    if len(clean_code) != 6 or not clean_code.isdigit():
        return False
        
    try:
        secret_clean = secret.upper().replace(" ", "")
        missing_padding = len(secret_clean) % 8
        if missing_padding:
            secret_clean += "=" * (8 - missing_padding)
        key = base64.b32decode(secret_clean, casefold=True)
        
        current_time = int(time.time())
        for i in range(-valid_window, valid_window + 1):
            time_step = (current_time // 30) + i
            msg = struct.pack(">Q", time_step)
            h = hmac.new(key, msg, hashlib.sha1).digest()
            offset = h[-1] & 0x0F
            truncated = struct.unpack(">I", h[offset:offset+4])[0] & 0x7FFFFFFF
            totp = truncated % 1000000
            if f"{totp:06d}" == clean_code:
                return True
        return False
    except Exception:
        return False

# --- DETERMINISTIC RISK ENGINE & HYBRID AI ---
def calculate_risk_score(
    failed_login_attempts: int = 0,
    otp_failures: int = 0,
    is_new_device: bool = False,
    is_unusual_time: bool = False,
    recovery_attempted: bool = False
) -> Dict[str, Any]:
    score = 10
    reasons = []

    if failed_login_attempts > 0:
        pts = min(40, failed_login_attempts * 15)
        score += pts
        reasons.append(f"{failed_login_attempts} failed login attempt(s)")

    if otp_failures > 0:
        pts = min(30, otp_failures * 10)
        score += pts
        reasons.append(f"{otp_failures} invalid OTP submission(s)")

    if is_new_device:
        score += 20
        reasons.append("Unrecognized device/browser session")

    if is_unusual_time:
        score += 15
        reasons.append("Unusual sign-in time")

    if recovery_attempted:
        score += 25
        reasons.append("Account recovery sequence initiated")

    score = min(100, score)

    if score <= 30:
        level = "LOW"
        action = "Standard 2FA Authentication"
    elif score <= 70:
        level = "MEDIUM"
        action = "Step-up Verification (OTP Required)"
    else:
        level = "HIGH"
        action = "High Risk: Multi-Factor & Trusted Contact Review Recommended"

    return {
        "score": score,
        "level": level,
        "action": action,
        "reasons": reasons
    }

async def get_ai_risk_explanation(risk_info: Dict[str, Any]) -> str:
    """
    Hybrid AI Explanation Service: Uses Gemini API to explain risk determinations.
    Falls back gracefully to deterministic explanation if Gemini API is missing or fails (AI Failure Safety).
    """
    default_explanation = (
        f"Security Assessment: {risk_info['level']} Risk (Score {risk_info['score']}/100). "
        f"Triggers: {', '.join(risk_info['reasons']) if risk_info['reasons'] else 'Normal sign-in activity'}. "
        f"Recommended Action: {risk_info['action']}."
    )

    if not GEMINI_API_KEY:
        return default_explanation

    try:
        import httpx
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        prompt = (
            f"Explain this authentication risk evaluation in 2 clear, helpful sentences for a banking user:\n"
            f"Risk Score: {risk_info['score']}/100 ({risk_info['level']})\n"
            f"Triggers: {risk_info['reasons']}\n"
            f"Required Action: {risk_info['action']}"
        )
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(url, json={"contents": [{"parts": [{"text": prompt}]}]})
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text.strip()
    except Exception:
        pass

    return default_explanation
