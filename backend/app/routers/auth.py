import time
import hashlib
import secrets
from fastapi import APIRouter, BackgroundTasks
from app.models.schemas import (
    ApiResponse, RegisterRequest, LoginRequest, VerifyOtpRequest, ResendOtpRequest,
    VerifyEmailRequest, ResendEmailOtpRequest, ForgotPasswordRequest, ResetPasswordRequest,
    VerifyTrustedContactRequest, AcceptTrustedContactStartRequest, AcceptTrustedContactConfirmRequest
)
from app.services.store import (
    mock_users, failed_attempts, last_attempt_timestamp, 
    active_otps, email_verification_otps, generate_and_send_email_otp,
    send_trusted_contact_invitation_code_email, log_telemetry_event
)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post("/register", response_model=ApiResponse[dict])
async def register_user(body: RegisterRequest, background_tasks: BackgroundTasks):
    if not body.username or not body.password:
        return ApiResponse(ok=False, errorCode="INVALID_CREDENTIALS", data=None)

    if len(body.password) < 8:
        return ApiResponse(ok=False, errorCode="WEAK_PASSWORD", data=None)

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
                # Dispatch 6-digit verification OTP directly to the trusted contact's email via Gmail SMTP
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
        'password': body.password,
        'emailVerified': False,
        'accessibilityProfile': body.accessibilityProfile or {},
        'trustedContacts': formatted_contacts
    }

    # Generate and send email OTP concurrently in background for main account registration
    background_tasks.add_task(generate_and_send_email_otp, body.username)

    log_telemetry_event("USER_REGISTERED", step="Register", metadata={"username": body.username})

    return ApiResponse(
        ok=True,
        errorCode=None,
        data={
            "username": body.username,
            "trustedContacts": formatted_contacts,
            "qrPlaceholderUrl": f"https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=otpauth://totp/SecureBank:{body.username}?secret=JBSWY3DPEHPK3PXP&issuer=SecureBank",
            "secretKey": "JBSWY3DPEHPK3PXP",
            "message": "Account created successfully"
        }
    )

@router.post("/verify-trusted-contact")
async def verify_trusted_contact(body: VerifyTrustedContactRequest):
    user_key = body.username.strip()
    user = mock_users.get(user_key)
    if not user:
        return {"ok": False, "success": False, "message": "User account not found"}
    
    contacts = user.get("trustedContacts", [])
    contact_email = body.contactEmail.strip().lower()
    found = False

    for c in contacts:
        if c.get("email", "").lower().strip() == contact_email:
            found = True
            break
    
    if not found:
        return {"ok": False, "success": False, "message": f"Contact email '{contact_email}' is not attached to this user account."}

    # Validate 6-digit OTP if code is supplied
    if body.code:
        is_valid, err, _ = check_and_validate_otp(contact_email, body.code, "TRUSTED_CONTACT_VERIFY")
        if not is_valid:
            return {
                "ok": False,
                "success": False,
                "errorCode": err,
                "message": f"The verification code for {contact_email} is incorrect or has expired."
            }

    # Update contact status to ACTIVE
    for c in contacts:
        if c.get("email", "").lower().strip() == contact_email:
            c["status"] = "active"
            c["declineReason"] = None

    user["trustedContacts"] = contacts
    mock_users[user_key] = user
    log_telemetry_event("TRUSTED_CONTACT_VERIFIED", step="Register", metadata={"username": user_key, "contactEmail": contact_email})

    return {
        "ok": True,
        "success": True,
        "message": f"Trusted contact '{contact_email}' verified and activated successfully!",
        "trustedContacts": contacts
    }

@router.post("/resend-contact-otp")
async def resend_contact_otp(body: ResendEmailOtpRequest, background_tasks: BackgroundTasks):
    contact_email = body.email.strip().lower()
    sent, status = generate_and_send_email_otp(contact_email, "TRUSTED_CONTACT_VERIFY", enforce_cooldown=True)
    if status == "COOLDOWN_ACTIVE":
        return {
            "ok": False,
            "success": False,
            "errorCode": "RATE_LIMITED",
            "message": "Please wait 60 seconds before requesting a new verification code."
        }

    return {
        "ok": True,
        "success": True,
        "message": f"A fresh 6-digit verification code was sent to {contact_email}."
    }

@router.get("/trusted-contacts/{username}")
async def get_trusted_contacts(username: str):
    user = mock_users.get(username.strip())
    if not user:
        return {"ok": False, "trustedContacts": []}
    return {"ok": True, "trustedContacts": user.get("trustedContacts", [])}

@router.post("/accept-trusted-contact/start")
async def accept_trusted_contact_start(body: AcceptTrustedContactStartRequest, background_tasks: BackgroundTasks):
    c_email = body.contactEmail.lower().strip()
    inv_code = body.invitationCode.strip().upper()
    now = time.time()

    target_user = None
    target_contact = None

    for username, usr in mock_users.items():
        contacts = usr.get("trustedContacts", [])
        for c in contacts:
            c_code = str(c.get("invitationCode") or c.get("verificationCode") or "").strip().upper()
            if c.get("email", "").lower().strip() == c_email and c_code == inv_code:
                target_user = usr
                target_contact = c
                break
        if target_contact:
            break

    if not target_contact:
        return {
            "ok": False,
            "success": False,
            "errorCode": "INVALID_CODE",
            "message": "The invitation code or email is invalid."
        }

    if target_contact.get("isUsed"):
        return {
            "ok": False,
            "success": False,
            "errorCode": "CODE_USED",
            "message": "This invitation code has already been used."
        }

    code_exp = target_contact.get("codeExpiresAt", 0)
    if code_exp > 0 and now > code_exp:
        return {
            "ok": False,
            "success": False,
            "errorCode": "CODE_EXPIRED",
            "message": "This invitation code has expired. Please request a new invitation."
        }

    background_tasks.add_task(generate_and_send_email_otp, c_email, "TRUSTED_CONTACT_ACTIVATION")
    log_telemetry_event("TRUSTED_CONTACT_INVITE_VALIDATED", step="Register", metadata={"email": c_email, "username": target_user["username"]})

    return {
        "ok": True,
        "success": True,
        "message": f"Invitation code validated! A 6-digit verification code was sent to {c_email}.",
        "data": {
            "username": target_user["username"],
            "contactEmail": c_email,
            "otpRequired": True
        }
    }

@router.post("/accept-trusted-contact/confirm")
async def accept_trusted_contact_confirm(body: AcceptTrustedContactConfirmRequest):
    c_email = body.contactEmail.lower().strip()
    inv_code = body.invitationCode.strip().upper()
    
    is_valid, err, matched_purpose = check_and_validate_otp(c_email, body.otp, "TRUSTED_CONTACT_ACTIVATION")

    if not is_valid:
        return {
            "ok": False,
            "success": False,
            "errorCode": err,
            "message": "The 6-digit verification code is incorrect or has expired."
        }

    target_user = None
    target_contact = None

    for username, usr in mock_users.items():
        contacts = usr.get("trustedContacts", [])
        for c in contacts:
            c_code = str(c.get("invitationCode") or c.get("verificationCode") or "").strip().upper()
            if c.get("email", "").lower().strip() == c_email and c_code == inv_code:
                target_user = usr
                target_contact = c
                break
        if target_contact:
            break

    if not target_contact or not target_user:
        return {
            "ok": False,
            "success": False,
            "errorCode": "NOT_FOUND",
            "message": "Target contact record not found."
        }

    target_contact["status"] = "active"
    target_contact["isUsed"] = True
    target_contact["declineReason"] = None

    mock_users[target_user["username"]] = target_user
    log_telemetry_event("TRUSTED_CONTACT_ACTIVATED", step="Register", metadata={"username": target_user["username"], "contactEmail": c_email})

    return {
        "ok": True,
        "success": True,
        "message": f"Success! You are now an active pre-registered trusted contact for {target_user['username']}."
    }

@router.post("/login", response_model=ApiResponse[dict])
async def login_user(body: LoginRequest, background_tasks: BackgroundTasks):
    now = time.time()
    last_time = last_attempt_timestamp.get(body.username, 0)
    
    # Rate limit check (clicks faster than 300ms)
    if now - last_time < 0.3:
        return ApiResponse(ok=False, errorCode="RATE_LIMITED", data=None)
    last_attempt_timestamp[body.username] = now

    # Account lockout check (5 failures)
    attempts = failed_attempts.get(body.username, 0)
    if attempts >= 5:
        return ApiResponse(ok=False, errorCode="ACCOUNT_LOCKED", data=None)

    existing_user = mock_users.get(body.username)

    # Generic credential check (NEVER reveal if username exists)
    if not existing_user or existing_user.get("password") != body.password:
        new_count = attempts + 1
        failed_attempts[body.username] = new_count

        if new_count >= 5:
            log_telemetry_event("ACCOUNT_LOCKED", step="Login", metadata={"username": body.username, "attempts": new_count})
            return ApiResponse(ok=False, errorCode="ACCOUNT_LOCKED", data=None)

        log_telemetry_event("FAILED_LOGIN", step="Login", metadata={"username": body.username})
        return ApiResponse(ok=False, errorCode="INVALID_CREDENTIALS", data=None)

    # Reset attempts on success
    if body.username in failed_attempts:
        del failed_attempts[body.username]

    # Generate OTP (expires in 5 minutes / 300s)
    code = "123456"
    expires_at = time.time() + 300
    active_otps[body.username] = {"code": code, "expiresAt": expires_at}

    # Dispatch real email OTP via SMTP if username is an email address
    if "@" in body.username:
        background_tasks.add_task(generate_and_send_email_otp, body.username, "LOGIN_2FA")

    return ApiResponse(
        ok=True,
        errorCode=None,
        data={
            "username": body.username,
            "otpRequired": True,
            "expiresInSeconds": 300,
            "demoCodeHint": "123456"
        }
    )

def check_and_validate_otp(username: str, code: str, purpose: str = None) -> tuple[bool, str, dict]:
    """Helper to validate code against both email_verification_otps (real hashed OTP) and active_otps (demo OTP)."""
    user_key = username.lower().strip()
    input_hash = hashlib.sha256(code.strip().encode("utf-8")).hexdigest()
    now = time.time()

    # Purposes to check
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
            
            if rec["otp_hash"] == input_hash or code.strip() == "123456":
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

    # Check active_otps (demo 123456 / in-memory code)
    otp_data = active_otps.get(user_key) or active_otps.get(username)
    if otp_data:
        if now > otp_data["expiresAt"]:
            return False, "OTP_EXPIRED", None
        if otp_data["code"] == code or code == "123456":
            active_otps.pop(user_key, None)
            active_otps.pop(username, None)
            return True, "OK", "DEMO_2FA"
        return False, "OTP_INVALID", None

    # Demo 123456 fallback for demo accounts
    if code == "123456":
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

    log_telemetry_event("SUCCESSFUL_LOGIN", step="VerifyOtp", metadata={"username": body.username, "purpose": matched_purpose})

    user_info = {
        "username": body.username,
        "name": body.username.split("@")[0],
        "role": "customer"
    }

    return {
        "ok": True,
        "success": True,
        "errorCode": None,
        "message": "OTP verified successfully",
        "data": {
            "token": "fastapi-jwt-token-xyz-123",
            "user": user_info
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
async def resend_otp_code(body: ResendOtpRequest, background_tasks: BackgroundTasks):
    user_key = (getattr(body, "email", None) or body.username).lower().strip()
    purpose = (getattr(body, "purpose", None) or "LOGIN_2FA").upper().strip()
    store_key = f"{user_key}:{purpose}"

    # Enforce 60-second cooldown
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

    # Generate and send real email OTP if email format
    if "@" in user_key:
        background_tasks.add_task(generate_and_send_email_otp, user_key, purpose)

    # Update active_otps demo store
    code = "123456"
    expires_at = time.time() + 300
    active_otps[user_key] = {"code": code, "expiresAt": expires_at}

    log_telemetry_event("OTP_RESENT", step="VerifyOtp", metadata={"username": user_key, "purpose": purpose})

    msg_text = "A fresh 6-digit verification code was sent to your registered device/email!"
    return {
        "ok": True,
        "success": True,
        "errorCode": None,
        "message": msg_text,
        "data": {
            "message": msg_text,
            "expiresInSeconds": 300,
            "demoCodeHint": "123456"
        }
    }

@router.post("/forgot-password")
async def forgot_password_request(body: ForgotPasswordRequest, background_tasks: BackgroundTasks):
    email_key = body.email.lower().strip()
    
    # Generate a NEW OTP with purpose="PASSWORD_RESET" and send via SMTP
    background_tasks.add_task(generate_and_send_email_otp, email_key, "PASSWORD_RESET")
    log_telemetry_event("FORGOT_PASSWORD_INITIATED", step="ForgotPassword", metadata={"email": email_key})

    return {
        "success": True,
        "message": "Password reset OTP sent to your email address."
    }

@router.post("/reset-password")
async def reset_password_with_otp(body: ResetPasswordRequest):
    email_key = body.email.lower().strip()
    otp_store_key = f"{email_key}:PASSWORD_RESET"
    
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
    if input_hash != otp_record["otp_hash"]:
        otp_record["attempts"] += 1
        if otp_record["attempts"] >= 5:
            email_verification_otps.pop(otp_store_key, None)
        return {
            "success": False,
            "errorCode": "OTP_INVALID",
            "message": "The verification code is incorrect."
        }

    # Single-use: mark used and delete
    otp_record["used"] = True
    email_verification_otps.pop(otp_store_key, None)

    # Update password in mock_users database
    if email_key in mock_users:
        usr = mock_users.get(email_key)
        if usr:
            usr["password"] = body.newPassword
            mock_users[email_key] = usr

    log_telemetry_event("PASSWORD_RESET_SUCCESS", step="ResetPassword", metadata={"email": email_key})

    return {
        "success": True,
        "message": "Password reset successfully. You can now log in with your new password."
    }

@router.post("/resend-email-otp")
async def resend_email_verification_otp(body: ResendEmailOtpRequest, background_tasks: BackgroundTasks):
    email_key = body.email.lower().strip()
    purpose = (body.purpose or "EMAIL_VERIFICATION").upper().strip()
    otp_store_key = f"{email_key}:{purpose}"

    # Check 60-second cooldown
    existing = email_verification_otps.get(otp_store_key)
    if existing:
        time_since_last = time.time() - existing.get("created_at", 0)
        if time_since_last < 60:
            return {
                "success": False,
                "errorCode": "RATE_LIMITED",
                "message": f"Please wait {int(60 - time_since_last)} seconds before requesting a new verification code."
            }

    background_tasks.add_task(generate_and_send_email_otp, email_key, purpose)
    log_telemetry_event("EMAIL_OTP_RESENT", step="VerifyEmail", metadata={"email": email_key, "purpose": purpose})

    return {
        "success": True,
        "message": "A new verification code has been sent to your email address."
    }

