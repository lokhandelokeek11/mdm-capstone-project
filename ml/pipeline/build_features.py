"""Chronological cutoff features, sequences, and shared visitor cohort."""

from __future__ import annotations

import os
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

import numpy as np
import pandas as pd

EVENT_ORDER = ["view", "addtocart", "transaction"]
EVENT_TO_CODE = {e: i for i, e in enumerate(EVENT_ORDER)}
CODE_TO_EVENT = {i: e for e, i in EVENT_TO_CODE.items()}
INACTIVITY_GAP_MS = 30 * 60 * 1000
CUTOFF_PERCENTILE = 0.8
MAX_VISITORS = 35_000
RANDOM_STATE = 42


def resolve_events_path() -> str:
    candidates = [
        os.path.join("data", "raw", "retailrocket", "events.csv"),
        os.path.join("retailrocket", "events.csv"),
    ]
    for path in candidates:
        if os.path.isfile(path):
            return path
    raise FileNotFoundError(
        "RetailRocket events.csv not found. Place it at data/raw/retailrocket/events.csv"
    )


def load_events(path: Optional[str] = None) -> pd.DataFrame:
    path = path or resolve_events_path()
    df = pd.read_csv(path, usecols=["timestamp", "visitorid", "event", "itemid"])
    df = df[df["event"].isin(EVENT_ORDER)].copy()
    df.sort_values(["visitorid", "timestamp"], inplace=True)
    return df


def _session_count(timestamps: np.ndarray) -> int:
    if len(timestamps) == 0:
        return 0
    sessions = 1
    for i in range(1, len(timestamps)):
        if timestamps[i] - timestamps[i - 1] > INACTIVITY_GAP_MS:
            sessions += 1
    return sessions


def _view_to_cart_hours(events: pd.DataFrame) -> float:
    views = events[events["event"] == "view"]["timestamp"].values
    carts = events[events["event"] == "addtocart"]["timestamp"].values
    if len(views) == 0 or len(carts) == 0:
        return -1.0
    first_cart = carts[0]
    prior_views = views[views <= first_cart]
    if len(prior_views) == 0:
        return 0.0
    return (first_cart - prior_views[-1]) / (1000 * 3600)


TRAIN_RATIO = 0.70
VAL_RATIO = 0.10
TEST_RATIO = 0.20


@dataclass
class CohortData:
    cutoff_ts: int
    visitor_ids: np.ndarray
    static_features: pd.DataFrame
    journey_features: pd.DataFrame
    sequences: Dict[int, List[int]]
    y_propensity: np.ndarray
    y_churn: np.ndarray
    y_next_event: np.ndarray
    next_event_mask: np.ndarray
    post_purchased: np.ndarray
    pre_purchased: np.ndarray
    rule_segment: np.ndarray
    journey_stage: np.ndarray
    item_histories: Dict[int, List[int]]
    n_events_loaded: int
    visitor_last_pre_ts: np.ndarray


def build_cohort(
    df: pd.DataFrame,
    cutoff_percentile: float = CUTOFF_PERCENTILE,
    max_visitors: int = MAX_VISITORS,
) -> CohortData:
    cutoff_ts = int(df["timestamp"].quantile(cutoff_percentile))
    pre = df[df["timestamp"] <= cutoff_ts]
    post = df[df["timestamp"] > cutoff_ts]

    post_first = (
        post.sort_values("timestamp")
        .groupby("visitorid")
        .first()[["event"]]
        .rename(columns={"event": "first_post_event"})
    )
    post_purchase = post.groupby("visitorid")["event"].apply(lambda s: (s == "transaction").any())

    pre_visitor_index = pre.groupby("visitorid", sort=False).size().index.to_numpy()
    visitors = pre_visitor_index
    rng = np.random.default_rng(RANDOM_STATE)

    if len(visitors) > max_visitors:
        pool = rng.choice(visitors, size=min(len(visitors), max_visitors * 3), replace=False)
        labels = np.array([bool(post_purchase.get(v, False)) for v in pool], dtype=bool)
        pos = pool[labels]
        neg = pool[~labels]
        n_pos = min(len(pos), max_visitors // 5)
        n_neg = max_visitors - n_pos
        if len(pos) > n_pos:
            pos = rng.choice(pos, size=n_pos, replace=False)
        if len(neg) > n_neg:
            neg = rng.choice(neg, size=n_neg, replace=False)
        visitors = np.concatenate([pos, neg])
        rng.shuffle(visitors)

    visitor_set = set(int(v) for v in visitors)
    pre_cohort = pre[pre["visitorid"].isin(visitor_set)]

    static_rows = []
    journey_rows = []
    sequences: Dict[int, List[int]] = {}
    item_histories: Dict[int, List[int]] = {}
    y_propensity = []
    y_churn = []
    y_next_event = []
    next_event_mask = []
    post_purchased = []
    pre_purchased = []
    rule_segment = []
    journey_stage = []
    visitor_last_pre_ts_list = []

    for vid, pre_v in pre_cohort.groupby("visitorid", sort=False):
        vid = int(vid)
        if vid not in visitor_set:
            continue

        views = int((pre_v["event"] == "view").sum())
        carts = int((pre_v["event"] == "addtocart").sum())
        purchases_pre = int((pre_v["event"] == "transaction").sum())
        total = len(pre_v)
        last_ts = int(pre_v["timestamp"].max())
        first_ts = int(pre_v["timestamp"].min())
        recency_days = (cutoff_ts - last_ts) / (1000 * 3600 * 24)
        duration_days = (last_ts - first_ts) / (1000 * 3600 * 24)
        cart_to_view = carts / (views + 1)
        sessions = _session_count(pre_v["timestamp"].values)
        distinct_items = int(pre_v["itemid"].nunique())
        v2c_hours = _view_to_cart_hours(pre_v)

        seq = [EVENT_TO_CODE[e] for e in pre_v["event"].tolist()]
        sequences[int(vid)] = seq
        item_histories[int(vid)] = pre_v["itemid"].astype(int).tolist()

        purchased_post = bool(post_purchase.get(vid, False))
        y_propensity.append(int(purchased_post))
        post_purchased.append(int(purchased_post))
        pre_purchased.append(int(purchases_pre > 0))

        has_post = vid in post_first.index
        if has_post:
            y_next_event.append(EVENT_TO_CODE[post_first.loc[vid, "first_post_event"]])
            next_event_mask.append(True)
        else:
            y_next_event.append(-1)
            next_event_mask.append(False)

        # Churn: no activity in post-cutoff window through dataset end
        y_churn.append(int(not has_post and total > 0))

        # Rule segment (aligned with dataset pipeline)
        if purchases_pre > 0:
            seg = "Champions & High Value"
        elif carts > 0:
            seg = "Cart Abandoners"
        elif recency_days > 30:
            seg = "At-Risk / Inactive"
        elif sessions > 5:
            seg = "High Intent Cohort"
        else:
            seg = "Recent Browsers"
        rule_segment.append(seg)

        stage = _journey_stage(
            views=views,
            carts=carts,
            purchases_pre=purchases_pre,
            recency_days=recency_days,
            total=total,
            has_post=has_post,
        )
        journey_stage.append(stage)
        visitor_last_pre_ts_list.append(last_ts)

        static_rows.append(
            {
                "visitorid": vid,
                "total_events": total,
                "views": views,
                "carts": carts,
                "purchases_pre": purchases_pre,
                "recency_days": recency_days,
                "duration_days": duration_days,
                "cart_to_view_ratio": cart_to_view,
                "session_count": sessions,
                "distinct_items": distinct_items,
                "view_to_cart_hours": v2c_hours,
            }
        )

        journey_rows.append(
            {
                "visitorid": vid,
                "total_events": total,
                "views": views,
                "carts": carts,
                "purchases_pre": purchases_pre,
                "recency_days": recency_days,
                "duration_days": duration_days,
                "cart_to_view_ratio": cart_to_view,
                "session_count": sessions,
                "distinct_items": distinct_items,
                "view_to_cart_hours": v2c_hours,
                "journey_stage": stage,
                "seq_length": len(seq),
                "last_event_code": seq[-1] if seq else 0,
                "markov_entropy": _markov_entropy(seq),
            }
        )

    static_features = pd.DataFrame(static_rows).set_index("visitorid")
    journey_features = pd.DataFrame(journey_rows).set_index("visitorid")
    visitor_ids = static_features.index.values

    return CohortData(
        cutoff_ts=cutoff_ts,
        visitor_ids=visitor_ids,
        static_features=static_features,
        journey_features=journey_features,
        sequences=sequences,
        y_propensity=np.array(y_propensity, dtype=int),
        y_churn=np.array(y_churn, dtype=int),
        y_next_event=np.array(y_next_event, dtype=int),
        next_event_mask=np.array(next_event_mask, dtype=bool),
        post_purchased=np.array(post_purchased, dtype=int),
        pre_purchased=np.array(pre_purchased, dtype=int),
        rule_segment=np.array(rule_segment, dtype=object),
        journey_stage=np.array(journey_stage, dtype=object),
        item_histories=item_histories,
        n_events_loaded=len(df),
        visitor_last_pre_ts=np.array(visitor_last_pre_ts_list, dtype=np.int64),
    )


def _markov_entropy(seq: List[int]) -> float:
    if len(seq) < 2:
        return 0.0
    trans: Dict[Tuple[int, int], int] = {}
    for i in range(len(seq) - 1):
        key = (seq[i], seq[i + 1])
        trans[key] = trans.get(key, 0) + 1
    from_counts: Dict[int, int] = {}
    for (a, _), c in trans.items():
        from_counts[a] = from_counts.get(a, 0) + c
    entropy = 0.0
    for (a, b), c in trans.items():
        p = c / from_counts[a]
        entropy -= p * np.log2(p + 1e-12)
    return float(entropy)


def _journey_stage(
    views: int,
    carts: int,
    purchases_pre: int,
    recency_days: float,
    total: int,
    has_post: bool,
) -> str:
    if total == 0:
        return "INACTIVE"
    if recency_days > 14 and not has_post:
        return "INACTIVE"
    if purchases_pre > 0:
        return "RETENTION" if purchases_pre >= 2 else "CONVERSION"
    if carts > 0:
        return "HIGH_INTENT"
    if views >= 5:
        return "CONSIDERATION"
    if views >= 2:
        return "EXPLORATION"
    return "INITIAL_ENGAGEMENT"


def train_val_test_split_chronological(
    visitor_ids: np.ndarray,
    last_pre_timestamps: np.ndarray,
    train_ratio: float = TRAIN_RATIO,
    val_ratio: float = VAL_RATIO,
    test_ratio: float = TEST_RATIO,
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Paper Sec. IX-A: chronological visitor split by last activity before cutoff τ.
    Train / validation / test = 70% / 10% / 20% (earliest → latest).
    """
    assert abs(train_ratio + val_ratio + test_ratio - 1.0) < 1e-6
    order = np.argsort(last_pre_timestamps)
    sorted_ids = visitor_ids[order]
    n = len(sorted_ids)
    n_train = int(n * train_ratio)
    n_val = int(n * val_ratio)
    train_ids = sorted_ids[:n_train]
    val_ids = sorted_ids[n_train : n_train + n_val]
    test_ids = sorted_ids[n_train + n_val :]
    return train_ids, val_ids, test_ids


def train_test_split_visitors(
    visitor_ids: np.ndarray,
    y: np.ndarray,
    test_size: float = 0.2,
    random_state: int = RANDOM_STATE,
) -> Tuple[np.ndarray, np.ndarray]:
    """Legacy random split; prefer train_val_test_split_chronological for paper protocol."""
    from sklearn.model_selection import train_test_split

    train_ids, test_ids = train_test_split(
        visitor_ids,
        test_size=test_size,
        random_state=random_state,
        stratify=y if len(np.unique(y)) > 1 else None,
    )
    return train_ids, test_ids
