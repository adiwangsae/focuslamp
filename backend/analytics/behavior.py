from typing import Sequence
import numpy as np
import pandas as pd
from schemas.models import AnalyticsSummary, FocusSessionRecord, SessionStatus


def summarize_sessions(records: Sequence[FocusSessionRecord]) -> AnalyticsSummary:
    if not records:
        return AnalyticsSummary(
            total_focus_minutes=0,
            completed_sessions=0,
            total_sessions=0,
            completion_rate=0,
            average_session_minutes=0,
            total_away_events=0,
            total_phone_lift_events=0,
        )

    df = pd.DataFrame([r.model_dump() for r in records])
    total_sessions = int(len(df))
    completed_sessions = int((df["status"] == SessionStatus.COMPLETED.value).sum())
    total_focus_minutes = int(np.round(df["actual_focus_seconds"].sum() / 60.0))
    completion_rate = int(np.round((completed_sessions / total_sessions) * 100.0))
    average_session_minutes = int(np.round(total_focus_minutes / total_sessions))

    return AnalyticsSummary(
        total_focus_minutes=total_focus_minutes,
        completed_sessions=completed_sessions,
        total_sessions=total_sessions,
        completion_rate=completion_rate,
        average_session_minutes=average_session_minutes,
        total_away_events=int(df["away_events"].sum()),
        total_phone_lift_events=int(df["phone_lift_events"].sum()),
    )
