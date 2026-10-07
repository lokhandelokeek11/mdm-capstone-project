"""Section X: funnel, journey-stage and segment distributions (paper figures data)."""

from __future__ import annotations

from collections import Counter
from typing import Any, Dict

import numpy as np

from ml.pipeline.build_features import CohortData


def build_paper_figures(cohort: CohortData) -> Dict[str, Any]:
    """Aggregate cohort-level stats for journey funnel and Sec. X reporting."""
    sf = cohort.static_features
    total_views = int(sf["views"].sum())
    total_carts = int(sf["carts"].sum())
    total_purchases_pre = int(sf["purchases_pre"].sum())
    visitors = len(sf)

    visitors_with_view = int((sf["views"] > 0).sum())
    visitors_with_cart = int((sf["carts"] > 0).sum())
    visitors_with_purchase = int((sf["purchases_pre"] > 0).sum())

    def rate(num: int, den: int) -> float:
        return round(num / den, 4) if den else 0.0

    funnel = {
        "description": "Pre-cutoff visitor funnel (unique visitors, paper Sec. X)",
        "stages": [
            {"stage": "All cohort visitors", "count": visitors, "pct_of_cohort": 1.0},
            {"stage": "≥1 product view", "count": visitors_with_view, "pct_of_cohort": rate(visitors_with_view, visitors)},
            {"stage": "≥1 add-to-cart", "count": visitors_with_cart, "pct_of_cohort": rate(visitors_with_cart, visitors)},
            {"stage": "≥1 purchase (pre-cutoff)", "count": visitors_with_purchase, "pct_of_cohort": rate(visitors_with_purchase, visitors)},
        ],
        "drop_off": {
            "view_to_cart_visitor_rate": rate(visitors_with_cart, visitors_with_view),
            "cart_to_purchase_visitor_rate": rate(visitors_with_purchase, visitors_with_cart),
        },
        "event_level_counts": {
            "views": total_views,
            "add_to_cart": total_carts,
            "transactions_pre_cutoff": total_purchases_pre,
        },
        "event_funnel_rates": {
            "cart_per_view_events": rate(total_carts, total_views),
            "purchase_per_cart_events": rate(total_purchases_pre, total_carts),
        },
    }

    stage_counts = Counter(cohort.journey_stage.tolist())
    segment_counts = Counter(cohort.rule_segment.tolist())

    journey_stage_distribution = [
        {"stage": k, "count": int(v), "pct": round(v / visitors, 4)}
        for k, v in sorted(stage_counts.items(), key=lambda x: -x[1])
    ]
    segment_distribution = [
        {"segment": k, "count": int(v), "pct": round(v / visitors, 4)}
        for k, v in sorted(segment_counts.items(), key=lambda x: -x[1])
    ]

    post_purchase_visitors = int(cohort.post_purchased.sum())

    return {
        "funnel": funnel,
        "journey_stage_distribution": journey_stage_distribution,
        "segment_distribution": segment_distribution,
        "post_cutoff_purchasers_in_cohort": post_purchase_visitors,
        "post_cutoff_purchase_rate": round(float(cohort.post_purchased.mean()), 4),
    }
