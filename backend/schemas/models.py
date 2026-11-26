from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class SessionStatus(str, Enum):
    COMPLETED = "Completed"
    INTERRUPTED = "Interrupted"
    ABANDONED = "Abandoned"
    MANUALLY_ENDED = "Manually Ended"


class FocusSessionCreate(BaseModel):
    user_id: str
    date: str
    start_time: str
    planned_minutes: int = Field(ge=1, le=60)
    actual_focus_seconds: int = Field(ge=0)
    away_seconds: int = Field(ge=0)
    away_events: int = Field(ge=0)
    phone_lift_events: int = Field(ge=0)
    disconnect_events: int = Field(ge=0)
    status: SessionStatus
    subject_tag: Optional[str] = "General Study"
    reflection: Optional[str] = None


class FocusSessionRecord(FocusSessionCreate):
    id: str
    xp_earned: int


class AnalyticsSummary(BaseModel):
    total_focus_minutes: int
    completed_sessions: int
    total_sessions: int
    completion_rate: int
    average_session_minutes: int
    total_away_events: int
    total_phone_lift_events: int


class AiChatRequest(BaseModel):
    user_id: str
    prompt: str
    language: str = "en"
