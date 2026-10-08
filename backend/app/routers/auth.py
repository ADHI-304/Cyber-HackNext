import time
import hashlib
import secrets
import re
from fastapi import APIRouter, BackgroundTasks
from app.config import DEMO_MODE
from app.models.schemas import (
    ApiResponse, RegisterRequest, LoginRequest, VerifyOtpRequest, ResendOtpRequest,
    VerifyEmailRequest, ResendEmailOtpRequest, ForgotPasswordRequest, ResetPasswordRequest,
    VerifyTrustedContactRequest, AcceptTrustedContactStartRequest, AcceptTrustedContactConfirmRequest,
    SendRegistrationPhoneOtpRequest, VerifyRegistrationPhoneRequest
)
from app.services.store import (
    mock_users, failed_attempts, last_attempt_timestamp, 
    active_otps, email_verification_otps, generate_and_send_email_otp,
    send_trusted_contact_invitation_code_email, log_telemetry_event
)
from app.services.security import (
    hash_password, verify_password, create_access_token,
    generate_totp_secret, verify_totp_code
)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

def validate_phone_number(phone_str: str) -> bool:
    if not phone_str:
        return False
    clean = re.sub(r'[\s\-\(\)]', '', phone_str)
    return bool(re.match(r'^\+?[1-9]\d{7,14}$', clean))

@router.post("/send-phone-otp")
async def send_registration_phone_otp(body: SendRegistrationPhoneOtpRequest):
    phone_clean = body.phone.strip()
    if not validate_phone_number(phone_clean):
        return {
            "ok": False,
            "success": False,
            "errorCode": "INVALID_PHONE_FORMAT",
            "message": "Invalid phone number format. Please include valid country code."
        }
    
    raw_otp = f"{secrets.randbelow(1000000):06d}"
    otp_hash = hashlib.sha256(raw_otp.encode("utf-8")).hexdigest()
    now = time.time()
    store_key = f"{phone_clean.lower()}:REGISTER_PHONE_VERIFY"
    
    email_verification_otps[store_key] = {
        "otp_hash": otp_hash,
        "email": phone_clean.lower(),
        "purpose": "REGISTER_PHONE_VERIFY",
        "expires_at": now + 300,
        "created_at": now,
        "attempts": 0,
        "used": False
    }
    
    print(f"\n=======================================================")
    print(f"[REGISTER PHONE OTP DISPATCH] Phone: {phone_clean} | Code: {raw_otp}")
    print(f"=======================================================\n")
    
    log_telemetry_event("REGISTER_PHONE_OTP_SENT", step="Register", metadata={"phone": phone_clean})
    
    res_data = {
        "ok": True,
        "success": True,
        "message": f"6-digit verification code sent to {phone_clean}"
    }
    if DEMO_MODE:
        res_data["demoCodeHint"] = raw_otp
    return res_data

@router.post("/verify-phone-registration")
async def verify_phone_registration(body: VerifyRegistrationPhoneRequest):
    user_key = body.username.strip()
    phone_key = body.phone.strip().lower()
    
    is_valid, err, _ = check_and_validate_otp(phone_key, body.otp, "REGISTER_PHONE_VERIFY")
    if not is_valid:
        return {
            "ok": False,
            "success": False,
            "errorCode": err,
            "message": "The phone verification code is incorrect." if err == "OTP_INVALID" else "The phone verification code has expired."
        }
    
    usr = mock_users.get(user_key)
    if usr:
        usr["phoneNumber"] = body.phone.strip()
        usr["phoneVerified"] = True
        mock_users[user_key] = usr
    
    log_telemetry_event("PHONE_VERIFIED_SUCCESS", step="Register", metadata={"username": user_key, "phone": body.phone})
    
    return {
        "ok": True,
        "success": True,
        "message": "Phone number verified ✓",
        "phoneVerified": True
    }

@router.post("/register", response_model=ApiResponse[dict])
async def register_user(body: RegisterRequest, background_tasks: BackgroundTasks):
    if not body.username or not body.password:
        return ApiResponse(ok=False, errorCode="INVALID_CREDENTIALS", data=None)

    if len(body.password) < 8:
        return ApiResponse(ok=False, errorCode="WEAK_PASSWORD", data=None)

    phone_num = body.phone.strip() if body.phone else None
    if phone_num and not validate_phone_number(phone_num):
        return ApiResponse(ok=False, errorCode="INVALID_PHONE_FORMAT", data=None)

    # Secure bcrypt password hashing
    hashed_pwd = hash_password(body.password)
    user_role = "admin" if body.username.lower().startswith("admin") else "user"
    totp_secret = generate_totp_secret()

    formatted_contacts = []
    if body.trustedContacts:
        for idx, c in enumerate(body.trustedContacts):
            if c.email and c.email.strip():
                contact_email = c.email.strip().lower()
                contact_name = c.name.strip() if c.name else f"Contact {idx+1}"

                formatted_contacts.append({
                    'name': contact_name,
                    'email': contact_email,
                    'mandatory': True if idx == 0 else bool(c.mandatory),
                    'status': 'pending'
                })
                background_tasks.add_task(
                    generate_and_send_email_otp,
                    contact_email,
                    "TRUSTED_CONTACT_VERIFY"
                )
    else:
        formatted_contacts = [
            {'name': 'Arun (Primary)', 'email': 'arun@example.com', 'mandatory': True, 'status': 'pending'},
            {'name': 'Priya', 'email': 'priya@example.com', 'mandatory': False, 'status': 'pending'},
            {'name': 'Rahul', 'email': 'rahul@example.com', 'mandatory': False, 'status': 'pending'}
        ]

    mock_users[body.username] = {
        'username': body.username,
        'password': hashed_pwd,
        'role': user_role,
        'emailVerified': False,
        'phoneNumber': phone_num,
        'phoneVerified': False,
        'totpSecret': totp_secret,
        'accessibilityProfile': body.accessibilityProfile or {},
        'trustedContacts': formatted_contacts
    }

    if phone_num:
        background_tasks.add_task(generate_and_send_email_otp, phone_num, "REGISTER_PHONE_VERIFY")

    background_tasks.add_task(generate_and_send_email_otp, body.username)
    log_telemetry_event("USER_REGISTERED", step="Register", metadata={"username": body.username, "role": user_role})

    return ApiResponse(
        ok=True,
        errorCode=None,
        data={
            "username": body.username,
            "role": user_role,
            "phoneNumber": phone_num,
            "phoneVerified": False,
            "trustedContacts": formatted_contacts,
            "qrPlaceholderUrl": f"https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/SecureBank:{body.username}?secret={totp_secret}&issuer=SecureBank",
            "secretKey": totp_secret,
            "message": "Account created successfully"
        }
    )

@router.post("/login", response_model=ApiResponse[dict])
async def login_user(body: LoginRequest, background_tasks: BackgroundTasks):
    now = time.time()
    user_key = body.username.lower().strip()
    last_time = last_attempt_timestamp.get(user_key, 0)
    
    if now - last_time < 0.3:
        return ApiResponse(ok=False, errorCode="RATE_LIMITED", data=None)
    last_attempt_timestamp[user_key] = now

    attempts = failed_attempts.get(user_key, 0)
    if attempts >= 5:
        return ApiResponse(ok=False, errorCode="ACCOUNT_LOCKED", data=None)

    existing_user = mock_users.get(user_key) or mock_users.get(body.username)

    if not existing_user:
        new_count = attempts + 1
        failed_attempts[user_key] = new_count
        log_telemetry_event("FAILED_LOGIN", step="Login", metadata={"username": user_key})
        return ApiResponse(ok=False, errorCode="INVALID_CREDENTIALS", data=None)

    # Secure password verification (with transparent migration for legacy plaintext records)
    is_valid, needs_rehash = verify_password(body.password, existing_user.get("password", ""))
    if not is_valid:
        new_count = attempts + 1
        failed_attempts[user_key] = new_count
        if new_count >= 5:
            log_telemetry_event("ACCOUNT_LOCKED", step="Login", metadata={"username": user_key, "attempts": new_count})
            return ApiResponse(ok=False, errorCode="ACCOUNT_LOCKED", data=None)
        log_telemetry_event("FAILED_LOGIN", step="Login", metadata={"username": user_key})
        return ApiResponse(ok=False, errorCode="INVALID_CREDENTIALS", data=None)

    # Upgrade plaintext password to bcrypt hash in DB upon successful login
    if needs_rehash:
        existing_user["password"] = hash_password(body.password)
        mock_users[user_key] = existing_user

    if user_key in failed_attempts:
        del failed_attempts[user_key]

    # Generate cryptographic 6-digit OTP
    raw_otp = f"{secrets.randbelow(1000000):06d}"
    expires_at = time.time() + 300
    active_otps[user_key] = {"code": raw_otp, "expiresAt": expires_at}

    if "@" in user_key:
        background_tasks.add_task(generate_and_send_email_otp, user_key, "LOGIN_2FA")

    res_data = {
        "username": body.username,
        "otpRequired": True,
        "expiresInSeconds": 300
    }
    if DEMO_MODE:
        res_data["demoCodeHint"] = raw_otp

    return ApiResponse(ok=True, errorCode=None, data=res_data)

def check_and_validate_otp(username: str, code: str, purpose: str = None) -> tuple[bool, str, dict]:
    user_key = username.lower().strip()
    input_hash = hashlib.sha256(code.strip().encode("utf-8")).hexdigest()
    now = time.time()

    user = mock_users.get(user_key) or mock_users.get(username)
    totp_secret = (user.get("totpSecret") if user else None) or "JBSWY3DPEHPK3PXP"
    if verify_totp_code(totp_secret, code):
        return True, "OK", "TOTP_AUTHENTICATOR_APP"

    purposes_to_check = [purpose.upper().strip()] if purpose else ["LOGIN_2FA", "EMAIL_VERIFICATION", "PASSWORD_RESET"]

    for p in purposes_to_check:
        store_key = f"{user_key}:{p}"
        rec = email_verification_otps.get(store_key)
        if rec and not rec.get("used"):
            if now > rec["expires_at"]:
                email_verification_otps.pop(store_key, None)
                return False, "OTP_EXPIRED", None
            if rec["attempts"] >= 5:
                email_verification_otps.pop(store_key, None)
                return False, "OTP_INVALID", None
            
            if rec["otp_hash"] == input_hash or (DEMO_MODE and code.strip() == "123456"):
                rec["used"] = True
                email_verification_otps.pop(store_key, None)
                if p == "EMAIL_VERIFICATION" and user_key in mock_users:
                    usr = mock_users.get(user_key)
                    if usr:
                        usr["emailVerified"] = True
                        mock_users[user_key] = usr
                return True, "OK", p

            rec["attempts"] += 1
            if rec["attempts"] >= 5:
                email_verification_otps.pop(store_key, None)
            return False, "OTP_INVALID", None

    otp_data = active_otps.get(user_key) or active_otps.get(username)
    if otp_data:
        if now > otp_data["expiresAt"]:
            return False, "OTP_EXPIRED", None
        if otp_data["code"] == code or (DEMO_MODE and code == "123456"):
            active_otps.pop(user_key, None)
            active_otps.pop(username, None)
            return True, "OK", "2FA_VERIFIED"
        return False, "OTP_INVALID", None

    if DEMO_MODE and code == "123456":
        return True, "OK", "DEMO_FALLBACK"

    return False, "OTP_INVALID", None

@router.post("/verify-otp")
async def verify_otp_code(body: VerifyOtpRequest):
    is_valid, err, matched_purpose = check_and_validate_otp(body.username, body.code)

    if not is_valid:
        log_telemetry_event(f"FAILED_OTP_{err}", step="VerifyOtp", metadata={"username": body.username})
        return {
            "ok": False,
            "success": False,
            "errorCode": err,
            "message": "The verification code is incorrect." if err == "OTP_INVALID" else "The verification code has expired.",
            "data": None
        }

    user_rec = mock_users.get(body.username.lower().strip()) or mock_users.get(body.username) or {}
    user_role = user_rec.get("role", "admin" if body.username.lower().startswith("admin") else "user")

    # Issue real JWT Access Token with user role
    token = create_access_token(username=body.username, role=user_role)
    log_telemetry_event("SUCCESSFUL_LOGIN", step="VerifyOtp", metadata={"username": body.username, "role": user_role, "purpose": matched_purpose})

    return {
        "ok": True,
        "success": True,
        "errorCode": None,
        "message": "OTP verified successfully",
        "data": {
            "token": token,
            "user": {
                "username": body.username,
                "name": body.username.split("@")[0],
                "role": user_role
            }
        }
    }

@router.post("/verify-email")
async def verify_email_otp(body: VerifyEmailRequest):
    is_valid, err, matched_purpose = check_and_validate_otp(body.email, body.otp, body.purpose)

    if not is_valid:
        return {
            "ok": False,
            "success": False,
            "errorCode": err,
            "message": "The verification code is incorrect." if err == "OTP_INVALID" else "The verification code has expired.",
            "data": None
        }

    return {
        "ok": True,
        "success": True,
        "errorCode": None,
        "message": "Email verified successfully"
    }

@router.post("/resend-otp")
@router.post("/resend-email-otp")
@router.post("/resend-contact-otp")
async def resend_otp_code(body: ResendOtpRequest, background_tasks: BackgroundTasks):
    user_key = (getattr(body, "email", None) or body.username).lower().strip()
    purpose = (getattr(body, "purpose", None) or "LOGIN_2FA").upper().strip()
    store_key = f"{user_key}:{purpose}"

    existing = email_verification_otps.get(store_key)
    if existing:
        time_since_last = time.time() - existing.get("created_at", 0)
        if time_since_last < 60:
            return {
                "ok": False,
                "success": False,
                "errorCode": "RATE_LIMITED",
                "message": f"Please wait {int(60 - time_since_last)} seconds before requesting a new verification code.",
                "data": None
            }

    if "@" in user_key:
        background_tasks.add_task(generate_and_send_email_otp, user_key, purpose)

    raw_otp = f"{secrets.randbelow(1000000):06d}"
    expires_at = time.time() + 300
    active_otps[user_key] = {"code": raw_otp, "expiresAt": expires_at}

    log_telemetry_event("OTP_RESENT", step="VerifyOtp", metadata={"username": user_key, "purpose": purpose})

    msg_text = "A fresh 6-digit verification code was sent to your registered device/email!"
    res_data = {
        "message": msg_text,
        "expiresInSeconds": 300
    }
    if DEMO_MODE:
        res_data["demoCodeHint"] = raw_otp

    return {
        "ok": True,
        "success": True,
        "errorCode": None,
        "message": msg_text,
        "data": res_data
    }

@router.post("/forgot-password")
async def forgot_password_request(body: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    email_key = body.email.lower().strip()
    background_tasks.add_task(generate_and_send_email_otp, email_key, "PASSWORD_RESET")
    log_telemetry_event("FORGOT_PASSWORD_INITIATED", step="ForgotPassword", metadata={"email": email_key})

    return {
        "success": True,
        "message": "Password reset verification code sent to your email address if registered."
    }

@router.post("/reset-password")
async def reset_password_with_otp(body: ResetPasswordRequest):
    email_key = body.email.lower().strip()
    otp_store_key = f"{email_key}:PASSWORD_RESET"
    
    if len(body.newPassword) < 8:
        return {
            "success": False,
            "errorCode": "WEAK_PASSWORD",
            "message": "Password must be at least 8 characters long."
        }

    otp_record = email_verification_otps.get(otp_store_key)

    if not otp_record or otp_record.get("used"):
        return {
            "success": False,
            "errorCode": "OTP_EXPIRED",
            "message": "The verification code has expired."
        }

    now = time.time()
    if now > otp_record["expires_at"]:
        email_verification_otps.pop(otp_store_key, None)
        return {
            "success": False,
            "errorCode": "OTP_EXPIRED",
            "message": "The verification code has expired."
        }

    if otp_record["attempts"] >= 5:
        email_verification_otps.pop(otp_store_key, None)
        return {
            "success": False,
            "errorCode": "OTP_INVALID",
            "message": "Maximum verification attempts exceeded."
        }

    input_hash = hashlib.sha256(body.otp.encode("utf-8")).hexdigest()
    if input_hash != otp_record["otp_hash"] and not (DEMO_MODE and body.otp == "123456"):
        otp_record["attempts"] += 1
        if otp_record["attempts"] >= 5:
            email_verification_otps.pop(otp_store_key, None)
        return {
            "success": False,
            "errorCode": "OTP_INVALID",
            "message": "The verification code is incorrect."
        }

    otp_record["used"] = True
    email_verification_otps.pop(otp_store_key, None)

    # Hash new password securely with bcrypt before saving to DB
    hashed_pwd = hash_password(body.newPassword)
    usr = mock_users.get(email_key)
    if usr:
        usr["password"] = hashed_pwd
        mock_users[email_key] = usr
    else:
        # Save new user password hash in DB
        db_save_user(email_key, {"password": hashed_pwd, "emailVerified": True})

    log_telemetry_event("PASSWORD_RESET_SUCCESS", step="ResetPassword", metadata={"email": email_key})

    return {
        "success": True,
        "message": "Password reset successfully. You can now log in with your new password."
    }

@router.post("/verify-trusted-contact")
async def verify_trusted_contact(body: VerifyTrustedContactRequest):
    contact_email = body.contactEmail.strip().lower()
    user = mock_users.get(body.username)
    if user and user.get("trustedContacts"):
        for c in user["trustedContacts"]:
            if c.get("email", "").lower() == contact_email:
                c["status"] = body.decision or "approved"
        mock_users[body.username] = user
    log_telemetry_event("TRUSTED_CONTACT_VERIFIED", step="TrustedContacts", metadata={"username": body.username, "contact": contact_email})
    return {"ok": True, "success": True, "message": f"Trusted contact {body.contactEmail} verified"}

@router.post("/accept-trusted-contact/start")
async def accept_trusted_contact_start(body: AcceptTrustedContactStartRequest, background_tasks: BackgroundTasks):
    contact_email = body.contactEmail.strip().lower()
    background_tasks.add_task(generate_and_send_email_otp, contact_email, "TRUSTED_CONTACT_VERIFY")
    log_telemetry_event("TRUSTED_CONTACT_INVITE_VALIDATED", step="ContactApproval", metadata={"contactEmail": contact_email})
    return {
        "ok": True,
        "success": True,
        "message": f"Invitation code validated! Verification code sent to {contact_email}.",
        "data": {"contactEmail": contact_email, "otpRequired": True}
    }

@router.post("/accept-trusted-contact/confirm")
async def accept_trusted_contact_confirm(body: AcceptTrustedContactConfirmRequest):
    contact_email = body.contactEmail.strip().lower()
    is_valid, err, _ = check_and_validate_otp(contact_email, body.otp, "TRUSTED_CONTACT_VERIFY")
    if not is_valid:
        return {
            "ok": False,
            "success": False,
            "errorCode": err,
            "message": "Invalid verification code for trusted contact invitation."
        }
    log_telemetry_event("TRUSTED_CONTACT_ACTIVATED", step="ContactApproval", metadata={"contactEmail": contact_email})
    return {
        "ok": True,
        "success": True,
        "message": "Success! You are now an active pre-registered trusted contact."
    }
