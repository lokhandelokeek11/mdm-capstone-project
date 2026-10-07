"""RQ4: offline strategy comparison (simulated proxies)."""

from __future__ import annotations

from collections import Counter
from typing import Any, Dict, List

import numpy as np

from ml.pipeline.decision_engine import decide_action, generic_action, is_push_action, segment_only_action


def run_rq4_simulation(
    visitor_ids: np.ndarray,
    segments: np.ndarray,
    stages: np.ndarray,
    propensity: np.ndarray,
    churn: np.ndarray,
    carts: np.ndarray,
    purchases_pre: np.ndarray,
    recency: np.ndarray,
    post_purchased: np.ndarray,
    next_events: List[str],
) -> Dict[str, Any]:
    strategies = ["generic", "segment_based", "journey_intelligence"]
    out: Dict[str, Any] = {}

    for strategy in strategies:
        actions = []
        for i in range(len(visitor_ids)):
            if strategy == "generic":
                act = generic_action()
            elif strategy == "segment_based":
                act = segment_only_action(str(segments[i]))
            else:
                act = decide_action(
                    stage=str(stages[i]),
                    segment=str(segments[i]),
                    propensity=float(propensity[i]),
                    churn_risk=float(churn[i]),
                    carts=int(carts[i]),
                    purchases_pre=int(purchases_pre[i]),
                    recency_days=float(recency[i]),
                    next_event=next_events[i] if i < len(next_events) else None,
                )["actionType"]
            actions.append(act)

        push_mask = np.array([is_push_action(a) for a in actions])
        purchased_post = post_purchased.astype(bool)
        pre_buy = purchases_pre.astype(bool)

        # Targeting precision: push actions where visitor later purchased
        push_count = int(push_mask.sum())
        precision = (
            float((push_mask & purchased_post).sum() / push_count) if push_count else 0.0
        )
        # Coverage: future purchasers who got a relevant push
        future_buyers = int(purchased_post.sum())
        coverage = (
            float((push_mask & purchased_post).sum() / future_buyers) if future_buyers else 0.0
        )
        # Unnecessary interventions
        unnecessary = int(
            (push_mask & pre_buy).sum()
            + sum(
                1
                for j, a in enumerate(actions)
                if a in ("CART_REMINDER", "DISCOUNT") and not purchased_post[j] and propensity[j] < 0.3
            )
        )
        wait_suppress = sum(1 for a in actions if a in ("WAIT", "STOP_MARKETING"))

        out[strategy] = {
            "targeting_precision": round(precision, 4),
            "coverage": round(coverage, 4),
            "unnecessary_interventions": unnecessary,
            "wait_or_suppress_count": wait_suppress,
            "action_distribution": dict(Counter(actions)),
            "disclaimer": "Offline simulated proxy metrics; not causal lift.",
        }

    out["winner"] = max(
        strategies,
        key=lambda s: (out[s]["targeting_precision"], -out[s]["unnecessary_interventions"]),
    )
    return out
