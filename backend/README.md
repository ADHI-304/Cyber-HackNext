# AuthBuddy Backend API (FastAPI)

FastAPI REST API backend for **AuthBuddy** built with Python 3.10+, Pydantic v2, Uvicorn, and CORS middleware.

---

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start Server with Hot Reload**:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
   ```

3. **Interactive Swagger API Documentation**:
   Open [http://localhost:5000/docs](http://localhost:5000/docs) in your browser.

---

## 📡 REST API Endpoint Reference

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Health** | `/` | `GET` | Health check & service info |
| **Auth** | `/api/v1/auth/register` | `POST` | Create account & generate TOTP secret |
| **Auth** | `/api/v1/auth/login` | `POST` | Password login & rate limit/lockout check |
| **Auth** | `/api/v1/auth/verify-otp` | `POST` | Verify 6-digit 2FA code |
| **Auth** | `/api/v1/auth/resend-otp` | `POST` | Send fresh 6-digit OTP code |
| **Recovery** | `/api/v1/recovery/start` | `POST` | Start 2-of-3 contact recovery session |
| **Recovery** | `/api/v1/recovery/status/{id}` | `GET` | Fetch live approval & delay progress |
| **Recovery** | `/api/v1/recovery/approve` | `POST` | Trusted contact approval/denial |
| **Telemetry**| `/api/v1/telemetry/events` | `POST` | Log user friction/struggle telemetry |
| **Telemetry**| `/api/v1/admin/friction-stats` | `GET` | Admin UX friction & security metrics |
