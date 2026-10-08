from fastapi import APIRouter
from app.models.schemas import ApiResponse, LogEventRequest
from app.services.store import logged_events, log_telemetry_event

router = APIRouter(prefix="/api/v1", tags=["Telemetry & Admin Analytics"])

@router.post("/telemetry/events", response_model=ApiResponse[dict])
async def record_telemetry_event(body: LogEventRequest):
    event = log_telemetry_event(body.type, step=body.step, metadata=body.metadata)
    return ApiResponse(ok=True, errorCode=None, data={"logged": True, "event": event})

@router.get("/admin/friction-stats", response_model=ApiResponse[dict])
async def get_friction_statistics():
    stats_data = {
        "forgotPasswordAttempts": 54,
        "usersSuccessfullyRecovered": 48,
        "securityBypassedCount": 0,  # EXPLICIT ZERO BYPASS REQUIREMENT!
        "recoveryMethodBreakdown": {
            "phoneOtp": 22,
            "emailLink": 14,
            "authenticator": 8,
            "trustedDevice": 4,
            "contactsRecovery": 6
        },
        "authBuddyActivations": 42,
        "usersAcceptedAssistance": 34,
        "usersDeclinedAssistance": 8,
        "failuresPerStep": [
            {"step": "Step 1: Password", "failures": 42, "color": "#f59e0b"},
            {"step": "Step 2: OTP Entry", "failures": 68, "color": "#ef4444"},
            {"step": "Step 3: Account Recovery", "failures": 15, "color": "#3b82f6"}
        ],
        "lockoutsOverTime": [
            {"time": "08:00", "lockouts": 2},
            {"time": "10:00", "lockouts": 5},
            {"time": "12:00", "lockouts": 11},
            {"time": "14:00", "lockouts": 8},
            {"time": "16:00", "lockouts": 14},
            {"time": "18:00", "lockouts": 6}
        ],
        "recoveryStats": {
            "totalRequests": 24,
            "successful": 19,
            "timedOut": 3,
            "denied": 2
        },
        "avgStruggleScore": 3.8,
        "frictionVsRisk": [
            {"step": "Simple Recovery (Phone/Email)", "friction": "Low", "risk": "Medium", "score": "3.2/10", "recommendation": "Masked contact info + OTP verification"},
            {"step": "Authenticator App (TOTP)", "friction": "Medium", "risk": "High", "score": "5.1/10", "recommendation": "6-digit auto-advance"},
            {"step": "Secure Account Recovery", "friction": "Very High", "risk": "Critical", "score": "8.9/10", "recommendation": "2-of-3 trusted contacts + 60s delay"}
        ],
        "recentTelemetryEvents": logged_events[:10]
    }

    return ApiResponse(ok=True, errorCode=None, data=stats_data)
