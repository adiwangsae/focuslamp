from fastapi import APIRouter
from ml.recommender import recommend_block_minutes
from routers.sessions import _IN_MEMORY_DEMO_STORE
from schemas.models import AiChatRequest

router = APIRouter()


@router.get("/recommendation")
def get_recommendation(user_id: str) -> dict[str, object]:
    user_records = [s for s in _IN_MEMORY_DEMO_STORE if s.user_id == user_id]
    return recommend_block_minutes(user_records)


@router.post("/chat")
def chat_stub(payload: AiChatRequest) -> dict[str, object]:
    return {
        "simulated": True,
        "reply": (
            f"[FastAPI Scaffold Response] Received prompt ({len(payload.prompt)} chars) "
            f"in language={payload.language}."
        ),
    }
