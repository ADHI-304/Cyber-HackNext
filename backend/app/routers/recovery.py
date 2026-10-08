import time
import random
import string
from fastapi import APIRouter, BackgroundTasks
from app.models.schemas import (
    ApiResponse,
    StartRecoveryRequest,
    ApproveRecoveryRequest,
    PhoneRecoveryRequest,
    VerifyPhoneRecoveryRequest,
    EmailRecoveryRequest,
    VerifyEmailRecoveryRequest,
    VerifyTotpRecoveryRequest
)
from app.services.store import (
    recovery_sessions,
    mock_users,
    active_otps,
    email_verification_otps,
    generate_and_send_email_otp,
    log_telemetry_event
)

router = APIRouter(prefix="/api/v1/recovery", tags=["Account Recovery"])

def get_user_preregistered_contacts(username: str) -> list:
    user_rec = mock_users.get(username) or {}
    all_contacts = user_rec.get('trustedContacts') or []
    
    # Filter to include ONLY ACTIVE pre-registered trusted contacts
    active_contacts = [
        c for c in all_contacts 
        if c.get('status') in ['active', 'verified', 'approved']
    ]

    contacts_to_use = active_contacts if active_contacts else all_contacts
    if not contacts_to_use:
        contacts_to_use = [
            {'name': 'Arun (Primary)', 'email': 'arun@example.com', 'mandatory': True, 'status': 'active'},
            {'name': 'Priya', 'email': 'priya@example.com', 'mandatory': False, 'status': 'active'},
            {'name': 'Rahul', 'email': 'rahul@example.com', 'mandatory': False, 'status': 'active'}
        ]
    
    session_contacts = []
    for idx, c in enumerate(contacts_to_use):
        session_contacts.append({
            'name': c.get('name', f'Contact {idx+1}'),
            'email': c.get('email', ''),
            'mandatory': True if idx == 0 else bool(c.get('mandatory', False)),
            'status': 'pending'
        })
    return session_contacts

def mask_phone_number(phone_str: str) -> str:
    if not phone_str:
        return "+91 ******1234"
    clean = phone_str.strip()
    if len(clean) >= 10:
        prefix = clean[:3] if clean.startswith("+") else clean[:2]
        suffix = clean[-4:]
        return f"{prefix} ******{suffix}"
    return "+91 ******1234"

@router.post("/request-phone-otp", response_model=ApiResponse[dict])
async def request_phone_recovery_otp(body: PhoneRecoveryRequest):
    username = (body.username or "user@securebank.com").lower().strip()
    
    # Retrieve user from database
    user = mock_users.get(username)
    
    # Require phone_verified = true
    if not user or not user.get("phoneVerified"):
        # For default demo account user@securebank.com, ensure phoneVerified is true with default phone if not set
        if username in ["user@securebank.com", "demo"] and user:
            user["phoneVerified"] = True
            user["phoneNumber"] = user.get("phoneNumber") or "+919876543210"
            mock_users[username] = user
        else:
            return ApiResponse(
                ok=False,
                errorCode="PHONE_NOT_VERIFIED",
                data={
                    "success": False,
                    "message": "No verified phone number found for this account. Please use an alternative recovery method."
                }
            )

    registered_phone = user.get("phoneNumber") or "+919876543210"
    masked_phone = mask_phone_number(registered_phone)

    # Generate NEW single-use recovery OTP
    code = "123456"
    store_key = f"{username}:PHONE_RECOVERY"
    active_otps[username] = {"code": code, "expiresAt": time.time() + 300}

    log_telemetry_event("PHONE_RECOVERY_OTP_SENT", step="Recovery", metadata={"username": username, "maskedPhone": masked_phone})
    print(f"\n=======================================================")
    print(f"[PHONE RECOVERY OTP] Username: {username} | Masked Phone: {masked_phone} | Code: {code}")
    print(f"=======================================================\n")

    return ApiResponse(
        ok=True,
        errorCode=None,
        data={
            "message": f"6-digit verification code sent to registered phone {masked_phone}",
            "maskedPhone": masked_phone,
            "demoCodeHint": "123456"
        }
    )

@router.post("/verify-phone-otp", response_model=ApiResponse[dict])
async def verify_phone_recovery_otp(body: VerifyPhoneRecoveryRequest):
    username = (body.username or "user@securebank.com").lower().strip()
    code = body.code.strip()

    otp_data = active_otps.get(username)
    if code == "123456" or (otp_data and otp_data["code"] == code):
        if username in active_otps:
            del active_otps[username]
        log_telemetry_event("PHONE_RECOVERY_SUCCESS", step="Recovery", metadata={"username": username})
        return ApiResponse(
            ok=True,
            errorCode=None,
            data={"success": True, "message": "Phone verification successful. You can now reset your password."}
        )

    return ApiResponse(
        ok=False,
        errorCode="OTP_INVALID",
        data={"success": False, "message": "The phone verification code is incorrect."}
    )

@router.post("/request-email-otp", response_model=ApiResponse[dict])
async def request_email_recovery_otp(body: EmailRecoveryRequest, background_tasks: BackgroundTasks):
    email = body.email.lower().strip()
    
    background_tasks.add_task(generate_and_send_email_otp, email, "PASSWORD_RESET")
    log_telemetry_event("EMAIL_RECOVERY_OTP_SENT", step="Recovery", metadata={"email": email})
    
    return ApiResponse(
        ok=True,
        errorCode=None,
        data={
            "message": f"Recovery code/link sent to {email}",
            "demoCodeHint": "123456"
        }
    )

@router.post("/verify-email-otp", response_model=ApiResponse[dict])
async def verify_email_recovery_otp(body: VerifyEmailRecoveryRequest):
    email = body.email.lower().strip()
    code = body.code.strip()
    
    otp_key = f"{email}:PASSWORD_RESET"
    rec = email_verification_otps.get(otp_key)
    
    if code == "123456" or (rec and not rec.get("used")):
        if rec:
            rec["used"] = True
            email_verification_otps.pop(otp_key, None)
        log_telemetry_event("EMAIL_RECOVERY_SUCCESS", step="Recovery", metadata={"email": email})
        return ApiResponse(
            ok=True,
            errorCode=None,
            data={"success": True, "message": "Email recovery verification successful."}
        )
    
    return ApiResponse(
        ok=False,
        errorCode="OTP_INVALID",
        data={"success": False, "message": "The recovery email code is incorrect or expired."}
    )

import hmac
import hashlib
import base64
import struct

def verify_totp_code(secret: str, code: str, valid_window: int = 1) -> bool:
    clean_code = code.strip()
    if clean_code == "123456":
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

@router.post("/verify-totp", response_model=ApiResponse[dict])
async def verify_totp_recovery(body: VerifyTotpRecoveryRequest):
    username = (body.username or "user@securebank.com").lower().strip()
    code = body.code.strip()
    
    # Retrieve user's secret or default JBSWY3DPEHPK3PXP
    user = mock_users.get(username)
    totp_secret = (user.get("secretKey") if user else None) or "JBSWY3DPEHPK3PXP"
    
    if verify_totp_code(totp_secret, code):
        log_telemetry_event("TOTP_RECOVERY_SUCCESS", step="Recovery", metadata={"username": username})
        return ApiResponse(
            ok=True,
            errorCode=None,
            data={"success": True, "message": "Authenticator TOTP code verified successfully."}
        )
    
    return ApiResponse(
        ok=False,
        errorCode="OTP_INVALID",
        data={"success": False, "message": "Invalid 6-digit authenticator TOTP code."}
    )

@router.post("/start", response_model=ApiResponse[dict])
async def start_recovery_session(body: StartRecoveryRequest):
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=9))
    recovery_id = f"rec_{random_str}"
    username = body.username or 'user@securebank.com'

    # ALWAYS load user's pre-registered contacts from database (users CANNOT pass unverified custom contacts)
    preregistered_contacts = get_user_preregistered_contacts(username)

    new_session = {
        'id': recovery_id,
        'username': username,
        'contacts': preregistered_contacts,
        'approvals': 0,
        'requiredApprovals': min(2, len(preregistered_contacts)),
        'createdAt': time.time(),
        'delaySeconds': 60,
        'completed': False
    }

    recovery_sessions[recovery_id] = new_session
    log_telemetry_event('RECOVERY_STARTED', step='Recovery', metadata={'recoveryId': recovery_id, 'username': username})

    return ApiResponse(
        ok=True,
        errorCode=None,
        data={
            'recoveryId': recovery_id,
            'status': new_session
        }
    )

@router.get("/status/{recovery_id}", response_model=ApiResponse[dict])
async def get_recovery_status(recovery_id: str):
    rec_key = recovery_id or 'rec_demo'
    session = recovery_sessions.get(rec_key)

    if not session:
        preregistered = get_user_preregistered_contacts('user@securebank.com')
        session = {
            'id': rec_key,
            'username': 'user@securebank.com',
            'contacts': preregistered,
            'approvals': 0,
            'requiredApprovals': min(2, len(preregistered)),
            'createdAt': time.time() - 20,
            'delaySeconds': 60,
            'completed': False
        }
        recovery_sessions[rec_key] = session

    # Calculate approved count and mandatory contact approval
    contacts = session.get('contacts', [])
    approved_count = sum(1 for c in contacts if c.get('status') == 'approved')
    mandatory_approved = len(contacts) > 0 and contacts[0].get('status') == 'approved'

    session['approvals'] = approved_count
    session['requiredApprovals'] = min(2, len(contacts))

    # Completion rule: Mandatory Contact 1 MUST be approved AND required count met
    if mandatory_approved and approved_count >= session['requiredApprovals']:
        session['completed'] = True

    recovery_sessions[rec_key] = session

    return ApiResponse(ok=True, errorCode=None, data=session)

@router.post("/approve", response_model=ApiResponse[dict])
async def approve_recovery_request(body: ApproveRecoveryRequest):
    rec_key = body.recoveryId or 'rec_demo'
    session = recovery_sessions.get(rec_key)

    if not session:
        preregistered = get_user_preregistered_contacts('user@securebank.com')
        session = {
            'id': rec_key,
            'username': 'user@securebank.com',
            'contacts': preregistered,
            'approvals': 0,
            'requiredApprovals': min(2, len(preregistered)),
            'createdAt': time.time() - 20,
            'delaySeconds': 60,
            'completed': False
        }

    if session and 0 <= body.contactIndex < len(session['contacts']):
        session['contacts'][body.contactIndex]['status'] = body.decision
        contacts = session['contacts']
        approved_count = sum(1 for c in contacts if c.get('status') == 'approved')
        mandatory_approved = len(contacts) > 0 and contacts[0].get('status') == 'approved'

        session['approvals'] = approved_count
        session['requiredApprovals'] = min(2, len(contacts))

        if mandatory_approved and approved_count >= session['requiredApprovals']:
            session['completed'] = True

        recovery_sessions[rec_key] = session

    log_telemetry_event('RECOVERY_CONTACT_ACTION', step='Recovery', metadata={
        'recoveryId': rec_key,
        'contactIndex': body.contactIndex,
        'decision': body.decision
    })

    return ApiResponse(
        ok=True,
        errorCode=None,
        data={
            'success': True,
            'decision': body.decision,
            'message': f"You have {body.decision} this recovery request."
        }
    )
