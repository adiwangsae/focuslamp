import math
from schemas.models import SessionStatus

LEVEL_THRESHOLDS = [
    (1, 0),
    (2, 100),
    (3, 250),
    (4, 450),
    (5, 700),
    (6, 1000),
]


def calculate_session_xp(actual_focus_seconds: int, status: SessionStatus) -> int:
    """XP = floor(actual focus minutes) + 5 XP completion bonus for Completed sessions."""
    actual_minutes = math.floor(max(0, actual_focus_seconds) / 60)
    if actual_minutes < 1:
        return 0
    bonus = 5 if status == SessionStatus.COMPLETED else 0
    return actual_minutes + bonus


def resolve_level(total_xp: int) -> int:
    safe_xp = max(0, total_xp)
    level = 1
    for lvl, threshold in LEVEL_THRESHOLDS:
        if safe_xp >= threshold:
            level = lvl
    return level
