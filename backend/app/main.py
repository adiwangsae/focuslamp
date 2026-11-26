import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import sessions, analytics, ai

app = FastAPI(
    title="FocusLamp API",
    description="API scaffolding for FocusLamp session telemetry, behavioral analytics, and FocusMate AI.",
    version="0.1.0-scaffold",
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sessions.router, prefix="/api/sessions", tags=["sessions"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["analytics"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])


@app.get("/api/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "mode": "scaffold"}
