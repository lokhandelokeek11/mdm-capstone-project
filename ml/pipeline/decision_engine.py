"""Next Best Marketing Action rules (synopsis-aligned)."""

from __future__ import annotations

from typing import Any, Dict, List, Optional


PUSH_ACTIONS = {
    "CART_REMINDER",
    "DISCOUNT",
    "PERSONALIZED_EMAIL",
    "RE_ENGAGEMENT",
    "PRODUCT_RECOMMENDATION",
    "CROSS_SELL",
    "RETARGETING",
}


def decide_action(
    *,
    stage: str,
    segment: str,
    propensity: float,
    churn_risk: float,
    carts: int,
    purchases_pre: int,
    recency_days: float,
    next_event: Optional[str] = None,
) -> Dict[str, Any]:
    if purchases_pre > 0 and recency_days <= 7:
        return {
            "actionType": "WAIT",
            "reason": "Recent purchase detected; suppress promotional noise.",
            "priority": 2,
        }
    if purchases_pre > 0 and recency_days <= 30:
        return {
            "actionType": "STOP_MARKETING",
            "reason": "Customer in post-purchase cooling period.",
            "priority": 3,
        }
    if carts > 0 and purchases_pre == 0:
        return {
            "actionType": "CART_REMINDER",
            "reason": f"Cart abandonment with {propensity * 100:.0f}% purchase propensity.",
            "priority": 10,
        }
    if propensity >= 0.7 and carts == 0:
        return {
            "actionType": "DISCOUNT",
            "reason": f"High intent (propensity {propensity * 100:.0f}%) without cart conversion.",
            "priority": 9,
        }
    if stage in ("HIGH_INTENT", "CONSIDERATION") and next_event == "addtocart":
        return {
            "actionType": "PRODUCT_RECOMMENDATION",
            "reason": "Sequence model predicts cart addition; recommend complementary items.",
            "priority": 8,
        }
    if churn_risk >= 0.6 or stage == "INACTIVE" or recency_days > 14:
        return {
            "actionType": "RE_ENGAGEMENT",
            "reason": f"Inactivity/churn risk {(churn_risk * 100):.0f}%.",
            "priority": 7,
        }
    if propensity < 0.25 and segment == "Recent Browsers":
        return {
            "actionType": "WAIT",
            "reason": "Low propensity browser; wait for stronger intent signals.",
            "priority": 1,
        }
    return {
        "actionType": "PERSONALIZED_EMAIL",
        "reason": "Engaged browsing pattern; nurture with personalized content.",
        "priority": 5,
    }


def segment_only_action(segment: str) -> str:
    mapping = {
        "Cart Abandoners": "CART_REMINDER",
        "Champions & High Value": "CROSS_SELL",
        "At-Risk / Inactive": "RE_ENGAGEMENT",
        "High Intent Cohort": "DISCOUNT",
        "Recent Browsers": "PERSONALIZED_EMAIL",
    }
    return mapping.get(segment, "PERSONALIZED_EMAIL")


def generic_action() -> str:
    return "PERSONALIZED_EMAIL"


def is_push_action(action: str) -> bool:
    return action in PUSH_ACTIONS
