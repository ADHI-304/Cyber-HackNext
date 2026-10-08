from typing import Generic, TypeVar, Optional, Any, List, Dict
from pydantic import BaseModel, Field

T = TypeVar('T')

class ApiResponse(BaseModel, Generic[T]):
    ok: bool
    errorCode: Optional[str] = None
    data: Optional[T] = None

class TrustedContactModel(BaseModel):
    name: str
    email: str
    mandatory: Optional[bool] = False
    status: Optional[str] = 'pending'

class RegisterRequest(BaseModel):
    username: str
    password: str
    accessibilityProfile: Optional[Dict[str, Any]] = None
    trustedContacts: Optional[List[TrustedContactModel]] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class VerifyOtpRequest(BaseModel):
    username: str
    code: str

class ResendOtpRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    purpose: Optional[str] = "EMAIL_VERIFICATION"

class VerifyEmailRequest(BaseModel):
    email: str
    otp: str
    purpose: Optional[str] = "EMAIL_VERIFICATION"

class ResendEmailOtpRequest(BaseModel):
    email: str
    purpose: Optional[str] = "EMAIL_VERIFICATION"

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    email: str
    otp: str
    newPassword: str

class ContactModel(BaseModel):
    name: str
    email: str
    status: Optional[str] = 'pending'

class StartRecoveryRequest(BaseModel):
    username: str
    contacts: List[ContactModel]

class ApproveRecoveryRequest(BaseModel):
    recoveryId: str
    contactIndex: int
    decision: Optional[str] = 'approved'

class VerifyTrustedContactRequest(BaseModel):
    username: str
    contactEmail: str
    decision: Optional[str] = 'approved'
    reason: Optional[str] = None
    code: Optional[str] = None

class AcceptTrustedContactStartRequest(BaseModel):
    contactEmail: str
    invitationCode: str

class AcceptTrustedContactConfirmRequest(BaseModel):
    contactEmail: str
    invitationCode: str
    otp: str

class LogEventRequest(BaseModel):
    type: str
    step: Optional[str] = 'General'
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
