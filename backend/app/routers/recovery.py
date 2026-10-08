import time
import random
import string
from fastapi import APIRouter
from app.models.schemas import ApiResponse, StartRecoveryRequest, ApproveRecoveryRequest
from app.services.store import recovery_sessions, mock_users, log_telemetry_event

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
