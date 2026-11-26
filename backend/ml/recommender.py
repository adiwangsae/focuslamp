from typing import Sequence
import numpy as np
from sklearn.linear_model import LogisticRegression
from schemas.models import FocusSessionRecord, SessionStatus


def recommend_block_minutes(records: Sequence[FocusSessionRecord]) -> dict[str, object]:
    """
    Scikit-learn scaffolding for future completion-probability modeling.
    Note: Physical sensors never measure cognitive attention; features only
    use planned duration, phone lift count, and away event count.
    """
    if len(records) < 5:
        return {
            "status": "insufficient_data",
            "recommended_minutes": 25,
            "sample_size": len(records),
        }

    X = np.array(
        [[r.planned_minutes, r.phone_lift_events, r.away_events] for r in records],
        dtype=float,
    )
    y = np.array(
        [1 if r.status == SessionStatus.COMPLETED else 0 for r in records],
        dtype=int,
    )

    if len(set(y)) < 2:
        avg_completed = int(np.round(np.mean([r.planned_minutes for r in records])))
        return {
            "status": "baseline_only",
            "recommended_minutes": max(15, min(60, avg_completed)),
            "sample_size": len(records),
        }

    model = LogisticRegression()
    model.fit(X, y)
    candidates = [15, 25, 30, 45]
    probs = [float(model.predict_proba([[m, 0, 0]])[0][1]) for m in candidates]
    best_minutes = candidates[int(np.argmax(probs))]

    return {
        "status": "scaffold_fit",
        "recommended_minutes": best_minutes,
        "sample_size": len(records),
    }
