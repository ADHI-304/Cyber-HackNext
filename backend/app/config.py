import os
from dotenv import load_dotenv

load_dotenv()

# Environment settings
DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() in ["true", "1", "yes"]
JWT_SECRET = os.getenv("JWT_SECRET", "authbuddy-secure-jwt-secret-key-change-in-production-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_SECONDS = int(os.getenv("JWT_EXPIRY_SECONDS", "86400"))  # 24 hours

# CORS settings
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173").split(",")

# OTP & Security timing standardization
OTP_EXPIRY_SECONDS = int(os.getenv("OTP_EXPIRY_SECONDS", "300"))  # 5 minutes
RESEND_COOLDOWN_SECONDS = int(os.getenv("RESEND_COOLDOWN_SECONDS", "60"))  # 60 seconds
MAX_OTP_ATTEMPTS = int(os.getenv("MAX_OTP_ATTEMPTS", "5"))
MAX_LOGIN_ATTEMPTS = int(os.getenv("MAX_LOGIN_ATTEMPTS", "5"))
RECOVERY_DELAY_SECONDS = int(os.getenv("RECOVERY_DELAY_SECONDS", "60"))  # 60 seconds backend delay

# Gemini AI integration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
