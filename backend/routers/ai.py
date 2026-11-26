from fastapi import APIRouter, HTTPException
from ml.recommender import recommend_block_minutes
from routers.sessions import _IN_MEMORY_SESSION_STORE
from schemas.models import AiChatRequest

router = APIRouter()


@router.get("/recommendation")
def get_recommendation(user_id: str) -> dict[str, object]:
    user_records = [s for s in _IN_MEMORY_SESSION_STORE if s.user_id == user_id]
    return recommend_block_minutes(user_records)


@router.post("/chat")
def chat_endpoint(_payload: AiChatRequest) -> dict[str, object]:
    raise HTTPException(
        status_code=503,
        detail="AI service is not configured on the Python backend scaffold.",
    )
