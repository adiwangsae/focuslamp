from fastapi import APIRouter
from analytics.behavior import summarize_sessions
from routers.sessions import _IN_MEMORY_SESSION_STORE
from schemas.models import AnalyticsSummary

router = APIRouter()


@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(user_id: str) -> AnalyticsSummary:
    user_records = [s for s in _IN_MEMORY_SESSION_STORE if s.user_id == user_id]
    return summarize_sessions(user_records)
