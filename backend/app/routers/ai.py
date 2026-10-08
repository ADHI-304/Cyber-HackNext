from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, List
from app.models.schemas import ApiResponse
from app.services.security import calculate_risk_score, get_ai_risk_explanation

router = APIRouter(prefix="/api/v1/ai", tags=["AI & Risk Engine"])

class RiskAssessmentRequest(BaseModel):
    failedLoginAttempts: Optional[int] = 0
    otpFailures: Optional[int] = 0
    isNewDevice: Optional[bool] = False
    isUnusualTime: Optional[bool] = False
    recoveryAttempted: Optional[bool] = False

@router.post("/risk-assessment", response_model=ApiResponse[dict])
async def evaluate_risk_and_explain(body: RiskAssessmentRequest):
    # Deterministic Risk Engine Calculation (0-100 Score)
    risk_info = calculate_risk_score(
        failed_login_attempts=body.failedLoginAttempts or 0,
        otp_failures=body.otpFailures or 0,
        is_new_device=body.isNewDevice or False,
        is_unusual_time=body.isUnusualTime or False,
        recovery_attempted=body.recoveryAttempted or False
    )

    # Hybrid AI Layer: Gemini API generates human-readable explanation
    # AI Failure Safety: If Gemini fails, deterministic summary is returned cleanly
    explanation = await get_ai_risk_explanation(risk_info)

    return ApiResponse(
        ok=True,
        errorCode=None,
        data={
            "score": risk_info["score"],
            "level": risk_info["level"],
            "action": risk_info["action"],
            "reasons": risk_info["reasons"],
            "explanation": explanation,
            "engine": "Hybrid Deterministic Policy + Gemini AI Explainer"
        }
    )
