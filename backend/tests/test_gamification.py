from schemas.models import SessionStatus
from services.gamification_service import calculate_session_xp, resolve_level


def test_calculate_session_xp() -> None:
    assert calculate_session_xp(25 * 60, SessionStatus.COMPLETED) == 30
    assert calculate_session_xp(10 * 60, SessionStatus.MANUALLY_ENDED) == 10
    assert calculate_session_xp(45, SessionStatus.MANUALLY_ENDED) == 0


def test_resolve_level() -> None:
    assert resolve_level(0) == 1
    assert resolve_level(100) == 2
    assert resolve_level(250) == 3
    assert resolve_level(450) == 4
    assert resolve_level(700) == 5
    assert resolve_level(1000) == 6
