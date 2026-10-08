from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, recovery, telemetry, tts, ai
from app.config import CORS_ORIGINS

app = FastAPI(
    title="AuthBuddy Backend API",
    description="FastAPI REST API for AuthBuddy human-first authentication, recovery, and friction telemetry.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware setup with configured origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(recovery.router)
app.include_router(telemetry.router)
app.include_router(tts.router)
app.include_router(ai.router)

@app.get("/", tags=["Health Check"])
async def root_health_check():
    return {
        "status": "healthy",
        "service": "AuthBuddy FastAPI Backend",
        "version": "1.0.0",
        "documentation": "/docs"
    }

@app.post("/verify-email", tags=["Authentication"])
async def verify_email_top_level(body: auth.VerifyEmailRequest):
    return await auth.verify_email_otp(body)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=5000, reload=True)
