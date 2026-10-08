import time
import random
import string
import secrets
import hmac
import hashlib
import base64
import struct
from fastapi import APIRouter, BackgroundTasks, HTTPException, status
from app.config import DEMO_MODE, RECOVERY_DELAY_SECONDS
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
from app.services.security import verify_totp_code

router = APIRouter(prefix="/api/v1/recovery", tags=["Account Recovery"])

def get_user_preregistered_contacts(username: str) -> list:
    user_rec = mock_users.get(username) or {}
    all_contacts = user_rec.get('trustedContacts') or []
    
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
    user = mock_users.get(username)
    
    if not user or not user.get("phoneVerified"):
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

    raw_otp = f"{secrets.randbelow(1000000):06d}"
    active_otps[username] = {"code": raw_otp, "expiresAt": time.time() + 300}

    print(f"\n=======================================================")
    print(f"[RECOVERY PHONE OTP DISPATCH] User: {username} | Phone: {registered_phone} ({masked_phone}) | Code: {raw_otp}")
    print(f"=======================================================\n")

    log_telemetry_event("PHONE_RECOVERY_OTP_SENT", step="Recovery", metadata={"username": username, "maskedPhone": masked_phone})
    
    res_data = {
        "message": f"6-digit verification code sent to registered phone {masked_phone}",
        "maskedPhone": masked_phone,
        "demoCodeHint": raw_otp
    }

    return ApiResponse(ok=True, errorCode=None, data=res_data)

@router.post("/verify-phone-otp", response_model=ApiResponse[dict])
async def verify_phone_recovery_otp(body: VerifyPhoneRecoveryRequest):
    username = (body.username or "user@securebank.com").lower().strip()
    code = body.code.strip()

    if len(code) < 6:
        return ApiResponse(
            ok=False,
            errorCode="OTP_INCOMPLETE",
            data={"success": False, "message": "Please enter a valid 6-digit OTP."}
        )

    otp_data = active_otps.get(username)
    if (otp_data and otp_data["code"] == code) or (DEMO_MODE and code == "123456"):
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
        data={"success": False, "message": "Invalid OTP"}
    )

@router.post("/request-email-otp", response_model=ApiResponse[dict])
async def request_email_recovery_otp(body: EmailRecoveryRequest, background_tasks: BackgroundTasks):
    email = body.email.lower().strip()
    background_tasks.add_task(generate_and_send_email_otp, email, "PASSWORD_RESET")
    log_telemetry_event("EMAIL_RECOVERY_OTP_SENT", step="Recovery", metadata={"email": email})
    
    res_data = {"message": f"Recovery code/link sent to {email}"}
    return ApiResponse(ok=True, errorCode=None, data=res_data)

@router.post("/verify-email-otp", response_model=ApiResponse[dict])
async def verify_email_recovery_otp(body: VerifyEmailRecoveryRequest):
    email = body.email.lower().strip()
    code = body.code.strip()
    
    otp_key = f"{email}:PASSWORD_RESET"
    rec = email_verification_otps.get(otp_key)
    
    if (rec and not rec.get("used")) or (DEMO_MODE and code == "123456"):
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

@router.post("/verify-totp", response_model=ApiResponse[dict])
async def verify_totp_recovery(body: VerifyTotpRecoveryRequest):
    username = (body.username or "user@securebank.com").lower().strip()
    code = body.code.strip()
    
    user = mock_users.get(username)
    totp_secret = (user.get("totpSecret") if user else None) or "JBSWY3DPEHPK3PXP"
    
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
    recovery_id = f"rec_{secrets.token_urlsafe(12)}"
    username = body.username or 'user@securebank.com'

    preregistered_contacts = get_user_preregistered_contacts(username)
    approval_tokens = {idx: secrets.token_urlsafe(16) for idx in range(len(preregistered_contacts))}

    new_session = {
        'id': recovery_id,
        'username': username,
        'contacts': preregistered_contacts,
        'approvals': 0,
        'requiredApprovals': min(2, len(preregistered_contacts)),
        'createdAt': time.time(),
        'delaySeconds': RECOVERY_DELAY_SECONDS,
        'delayStartedAt': 0,
        'approvalTokens': approval_tokens,
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
    session = recovery_sessions.get(recovery_id)

    # Unknown recovery ID handling: return 404 (Fixes Phase 11)
    if not session:
        if DEMO_MODE and recovery_id in ["rec_demo", "demo"]:
            preregistered = get_user_preregistered_contacts('user@securebank.com')
            session = {
                'id': recovery_id,
                'username': 'user@securebank.com',
                'contacts': preregistered,
                'approvals': 0,
                'requiredApprovals': min(2, len(preregistered)),
                'createdAt': time.time() - 20,
                'delaySeconds': 60,
                'delayStartedAt': 0,
                'approvalTokens': {},
                'completed': False
            }
            recovery_sessions[recovery_id] = session
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recovery session not found or expired."
            )

    contacts = session.get('contacts', [])
    approved_count = sum(1 for c in contacts if c.get('status') == 'approved')
    mandatory_approved = len(contacts) > 0 and contacts[0].get('status') == 'approved'

    session['approvals'] = approved_count
    session['requiredApprovals'] = min(2, len(contacts))

    now = time.time()
    # Check if approvals threshold is satisfied
    if mandatory_approved and approved_count >= session['requiredApprovals']:
        if session.get('delayStartedAt', 0) == 0:
            session['delayStartedAt'] = now
            
        elapsed = now - session['delayStartedAt']
        session['delayRemaining'] = max(0, int(session['delaySeconds'] - elapsed))
        
        # Enforce Backend Security Delay (Fixes Phase 10)
        if elapsed >= session['delaySeconds']:
            session['completed'] = True
        else:
            session['completed'] = False
    else:
        session['completed'] = False
        session['delayRemaining'] = session['delaySeconds']

    recovery_sessions[recovery_id] = session
    return ApiResponse(ok=True, errorCode=None, data=session)

@router.post("/approve", response_model=ApiResponse[dict])
async def approve_recovery_request(body: ApproveRecoveryRequest):
    rec_key = body.recoveryId
    session = recovery_sessions.get(rec_key)

    if not session:
        if DEMO_MODE:
            preregistered = get_user_preregistered_contacts('user@securebank.com')
            session = {
                'id': rec_key,
                'username': 'user@securebank.com',
                'contacts': preregistered,
                'approvals': 0,
                'requiredApprovals': min(2, len(preregistered)),
                'createdAt': time.time() - 20,
                'delaySeconds': 60,
                'delayStartedAt': 0,
                'approvalTokens': {},
                'completed': False
            }
            recovery_sessions[rec_key] = session
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recovery session not found."
            )

    if session and 0 <= body.contactIndex < len(session['contacts']):
        session['contacts'][body.contactIndex]['status'] = body.decision
        contacts = session['contacts']
        approved_count = sum(1 for c in contacts if c.get('status') == 'approved')
        mandatory_approved = len(contacts) > 0 and contacts[0].get('status') == 'approved'

        session['approvals'] = approved_count
        session['requiredApprovals'] = min(2, len(contacts))

        now = time.time()
        if mandatory_approved and approved_count >= session['requiredApprovals']:
            if session.get('delayStartedAt', 0) == 0:
                session['delayStartedAt'] = now
            if (now - session['delayStartedAt']) >= session['delaySeconds']:
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
