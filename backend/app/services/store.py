import time
from typing import Dict, Any, List
from datetime import datetime

import os
import secrets
import hashlib
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.services.db import (
    db_get_user, db_save_user, db_get_all_users,
    db_get_email_otp, db_save_email_otp, db_delete_email_otp,
    db_get_active_otp, db_save_active_otp, db_delete_active_otp,
    db_get_failed_attempts, db_set_failed_attempts, db_delete_failed_attempts,
    db_get_last_attempt, db_set_last_attempt,
    db_get_recovery_session, db_save_recovery_session,
    db_log_telemetry, db_get_telemetry_events
)

class UsersDbProxy(dict):
    def get(self, key, default=None):
        usr = db_get_user(str(key))
        return usr if usr is not None else default

    def __getitem__(self, key):
        usr = db_get_user(str(key))
        if usr is None:
            raise KeyError(key)
        return usr

    def __setitem__(self, key, value):
        db_save_user(str(key), value)

    def __contains__(self, key):
        return db_get_user(str(key)) is not None

    def items(self):
        return db_get_all_users().items()

    def values(self):
        return db_get_all_users().values()


class EmailOtpsDbProxy(dict):
    def get(self, key, default=None):
        rec = db_get_email_otp(str(key))
        return rec if rec is not None else default

    def __getitem__(self, key):
        rec = db_get_email_otp(str(key))
        if rec is None:
            raise KeyError(key)
        return rec

    def __setitem__(self, key, value):
        db_save_email_otp(str(key), value)

    def __contains__(self, key):
        return db_get_email_otp(str(key)) is not None

    def pop(self, key, default=None):
        rec = db_get_email_otp(str(key))
        if rec is not None:
            db_delete_email_otp(str(key))
            return rec
        return default

    def __delitem__(self, key):
        db_delete_email_otp(str(key))


class ActiveOtpsDbProxy(dict):
    def get(self, key, default=None):
        rec = db_get_active_otp(str(key))
        return rec if rec is not None else default

    def __getitem__(self, key):
        rec = db_get_active_otp(str(key))
        if rec is None:
            raise KeyError(key)
        return rec

    def __setitem__(self, key, value):
        db_save_active_otp(str(key), value.get('code', '123456'), value.get('expiresAt', time.time() + 300))

    def __contains__(self, key):
        return db_get_active_otp(str(key)) is not None

    def pop(self, key, default=None):
        rec = db_get_active_otp(str(key))
        if rec is not None:
            db_delete_active_otp(str(key))
            return rec
        return default

    def __delitem__(self, key):
        db_delete_active_otp(str(key))


class FailedAttemptsDbProxy(dict):
    def get(self, key, default=0):
        return db_get_failed_attempts(str(key))

    def __getitem__(self, key):
        return db_get_failed_attempts(str(key))

    def __setitem__(self, key, value):
        db_set_failed_attempts(str(key), int(value))

    def __contains__(self, key):
        return db_get_failed_attempts(str(key)) > 0

    def __delitem__(self, key):
        db_delete_failed_attempts(str(key))


class LastAttemptTimestampDbProxy(dict):
    def get(self, key, default=0.0):
        return db_get_last_attempt(str(key))

    def __getitem__(self, key):
        return db_get_last_attempt(str(key))

    def __setitem__(self, key, value):
        db_set_last_attempt(str(key), float(value))

    def __contains__(self, key):
        return db_get_last_attempt(str(key)) > 0


class RecoverySessionsDbProxy(dict):
    def get(self, key, default=None):
        rec = db_get_recovery_session(str(key))
        return rec if rec is not None else default

    def __getitem__(self, key):
        rec = db_get_recovery_session(str(key))
        if rec is None:
            raise KeyError(key)
        return rec

    def __setitem__(self, key, value):
        db_save_recovery_session(str(key), value)

    def __contains__(self, key):
        return db_get_recovery_session(str(key)) is not None

# Instantiate proxies to replace transient dictionaries seamlessly
mock_users = UsersDbProxy()
email_verification_otps = EmailOtpsDbProxy()
active_otps = ActiveOtpsDbProxy()
failed_attempts = FailedAttemptsDbProxy()
last_attempt_timestamp = LastAttemptTimestampDbProxy()
recovery_sessions = RecoverySessionsDbProxy()

def send_system_email_otp(to_email: str, otp: str, purpose: str = "EMAIL_VERIFICATION") -> bool:
    smtp_user = os.getenv("SMTP_USER") or os.getenv("GMAIL_ADDRESS")
    smtp_pass = os.getenv("SMTP_PASSWORD") or os.getenv("GMAIL_APP_PASSWORD")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    sender_name = os.getenv("SMTP_SENDER_NAME", "AuthBuddy Security")

    if not smtp_user or not smtp_pass or smtp_user == "your_email@gmail.com":
        return False

    try:
        msg = MIMEMultipart()
        msg["From"] = f"{sender_name} <{smtp_user}>"
        msg["To"] = to_email
        
        if purpose == "PASSWORD_RESET":
            msg["Subject"] = "AuthBuddy - Password Reset Code"
            body_text = (
                f"Hello,\n\n"
                f"Your AuthBuddy password reset verification code is: {otp}\n\n"
                f"This code will expire in 5 minutes.\n"
                f"If you did not request a password reset, please ignore this message.\n\n"
                f"Best regards,\n"
                f"AuthBuddy Security Team"
            )
        elif purpose == "TRUSTED_CONTACT_VERIFY":
            msg["Subject"] = "AuthBuddy - Trusted Recovery Contact Verification Code"
            body_text = (
                f"Hello,\n\n"
                f"An AuthBuddy account user has designated your email ({to_email}) as a Pre-Registered Trusted Recovery Contact.\n\n"
                f"Your 6-digit Verification Code is: {otp}\n\n"
                f"Please share or enter this verification code in the AuthBuddy application to verify and activate your trusted contact status.\n\n"
                f"This code will expire in 5 minutes.\n\n"
                f"Best regards,\n"
                f"AuthBuddy Security Team"
            )
        else:
            msg["Subject"] = "AuthBuddy - Email Verification Code"
            body_text = (
                f"Hello,\n\n"
                f"Your AuthBuddy email verification code is: {otp}\n\n"
                f"This code will expire in 5 minutes.\n"
                f"If you did not request this verification code, please ignore this message.\n\n"
                f"Best regards,\n"
                f"AuthBuddy Security Team"
            )

        msg.attach(MIMEText(body_text, "plain"))

        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        print(f"[SMTP SUCCESS] OTP email sent to {to_email} (Purpose: {purpose})")
        return True
    except Exception as e:
        print(f"[SMTP WARNING] Could not send email to {to_email} via SMTP ({type(e).__name__}: {e})")
        return False

def generate_and_send_email_otp(email: str, purpose: str = "EMAIL_VERIFICATION", enforce_cooldown: bool = False):
    email_key = email.lower().strip()
    purpose_key = purpose.upper().strip()
    otp_store_key = f"{email_key}:{purpose_key}"
    now = time.time()

    existing = email_verification_otps.get(otp_store_key)
    if enforce_cooldown and existing:
        time_since_last = now - existing.get("created_at", 0)
        if time_since_last < 60:
            return False, "COOLDOWN_ACTIVE"

    raw_otp = f"{secrets.randbelow(1000000):06d}"
    otp_hash = hashlib.sha256(raw_otp.encode("utf-8")).hexdigest()

    # Overwrite previous OTP for this (email, purpose) combination (invalidates previous OTP)
    email_verification_otps[otp_store_key] = {
        "otp_hash": otp_hash,
        "email": email_key,
        "purpose": purpose_key,
        "expires_at": now + 300,  # 5 minutes expiry
        "created_at": now,        # For 60-second cooldown check
        "attempts": 0,
        "used": False
    }

    print(f"\n=======================================================")
    print(f"[OTP DISPATCH] To: {email_key} | Purpose: {purpose_key} | Code: {raw_otp}")
    print(f"=======================================================\n")

    sent = send_system_email_otp(email_key, raw_otp, purpose=purpose_key)
    return sent, "OK"

def send_trusted_contact_invitation_code_email(user_email: str, contact_name: str, contact_email: str, invitation_code: str) -> bool:
    smtp_user = os.getenv("SMTP_USER") or os.getenv("GMAIL_ADDRESS")
    smtp_pass = os.getenv("SMTP_PASSWORD") or os.getenv("GMAIL_APP_PASSWORD")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    sender_name = os.getenv("SMTP_SENDER_NAME", "AuthBuddy Security")

    if not smtp_user or not smtp_pass or smtp_user == "your_email@gmail.com":
        return False

    try:
        msg = MIMEMultipart()
        msg["From"] = f"{sender_name} <{smtp_user}>"
        msg["To"] = contact_email
        msg["Subject"] = f"AuthBuddy - Trusted Contact Invitation Code for {user_email}"
        
        body_text = (
            f"Hello {contact_name or 'Friend'},\n\n"
            f"User {user_email} has added you as a Pre-Registered Trusted Recovery Contact for their AuthBuddy account.\n\n"
            f"Your Invitation Code is: {invitation_code}\n\n"
            f"To accept this invitation:\n"
            f"1. Open the AuthBuddy application.\n"
            f"2. Select 'Accept Trusted Contact'.\n"
            f"3. Enter your email address ({contact_email}) and Invitation Code ({invitation_code}).\n"
            f"4. Verify the 6-digit email OTP sent to your inbox to activate.\n\n"
            f"This invitation code will expire in 30 minutes and can only be used once.\n\n"
            f"Best regards,\n"
            f"AuthBuddy Security Team"
        )

        msg.attach(MIMEText(body_text, "plain"))

        server = smtplib.SMTP(smtp_host, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()
        return True
    except Exception:
        return False

def log_telemetry_event(event_type: str, step: str = 'General', metadata: Dict[str, Any] = None) -> Dict[str, Any]:
    return db_log_telemetry(event_type, step, metadata)

class LoggedEventsProxy(list):
    def __getitem__(self, index):
        events = db_get_telemetry_events()
        return events[index]

    def __iter__(self):
        return iter(db_get_telemetry_events())

    def __len__(self):
        return len(db_get_telemetry_events())

logged_events = LoggedEventsProxy()
