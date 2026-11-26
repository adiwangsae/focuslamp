import uuid
from fastapi import APIRouter
from schemas.models import FocusSessionCreate, FocusSessionRecord
from services.gamification_service import calculate_session_xp

router = APIRouter()
_IN_MEMORY_SESSION_STORE: list[FocusSessionRecord] = []


@router.get("/", response_model=list[FocusSessionRecord])
def list_sessions(user_id: str) -> list[FocusSessionRecord]:
    return [s for s in _IN_MEMORY_SESSION_STORE if s.user_id == user_id]


@router.post("/", response_model=FocusSessionRecord)
def create_session(payload: FocusSessionCreate) -> FocusSessionRecord:
    xp = calculate_session_xp(payload.actual_focus_seconds, payload.status)
    record = FocusSessionRecord(
        id=f"sess-{uuid.uuid4().hex[:8]}",
        xp_earned=xp,
        **payload.model_dump(),
    )
    _IN_MEMORY_SESSION_STORE.insert(0, record)
    return record
