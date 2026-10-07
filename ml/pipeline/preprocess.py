"""Event cleaning and Table IV post-cleaning statistics (paper Sec. VI-B)."""

from __future__ import annotations

from typing import Any, Dict, Tuple

import numpy as np
import pandas as pd

from ml.pipeline.build_features import EVENT_ORDER

# Paper: flag implausibly high event rates (automated traffic)
MAX_EVENTS_PER_VISITOR_DAY = 500


def clean_events(df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """Validate, deduplicate, and filter events; return stats for Table IV follow-up."""
    stats: Dict[str, Any] = {
        "raw_rows_read": int(len(df)),
        "raw_unique_visitors": int(df["visitorid"].nunique()) if len(df) else 0,
    }

    df = df.copy()
    missing_id = df["visitorid"].isna() | (df["visitorid"].astype(str).str.strip() == "")
    missing_ts = df["timestamp"].isna()
    invalid_ts = pd.to_numeric(df["timestamp"], errors="coerce").isna() | (df["timestamp"] <= 0)
    stats["rows_missing_visitor_id"] = int(missing_id.sum())
    stats["rows_invalid_timestamp"] = int((missing_ts | invalid_ts).sum())

    df = df[~missing_id & ~missing_ts & ~invalid_ts].copy()
    df["timestamp"] = df["timestamp"].astype(np.int64)

    unknown = ~df["event"].isin(EVENT_ORDER)
    stats["rows_unknown_event_type"] = int(unknown.sum())
    df = df[~unknown]

    stats["rows_after_schema_validation"] = int(len(df))
    stats["visitors_after_schema_validation"] = int(df["visitorid"].nunique())

    before_dedup = len(df)
    df.drop_duplicates(subset=["timestamp", "visitorid", "event", "itemid"], inplace=True)
    stats["duplicate_rows_removed"] = int(before_dedup - len(df))

    # High-rate visitors (paper: flagged and excluded)
    span_ms = df.groupby("visitorid")["timestamp"].agg(["min", "max", "count"])
    span_ms["days"] = ((span_ms["max"] - span_ms["min"]) / (1000 * 3600 * 24)).clip(lower=1.0)
    span_ms["events_per_day"] = span_ms["count"] / span_ms["days"]
    bots = span_ms.index[span_ms["events_per_day"] > MAX_EVENTS_PER_VISITOR_DAY]
    stats["high_rate_visitors_flagged"] = int(len(bots))
    stats["events_from_high_rate_visitors"] = int(df["visitorid"].isin(bots).sum())
    df = df[~df["visitorid"].isin(bots)]

    stats["clean_events"] = int(len(df))
    stats["clean_unique_visitors"] = int(df["visitorid"].nunique())
    stats["clean_unique_items"] = int(df["itemid"].nunique())
    stats["clean_view_events"] = int((df["event"] == "view").sum())
    stats["clean_addtocart_events"] = int((df["event"] == "addtocart").sum())
    stats["clean_transaction_events"] = int((df["event"] == "transaction").sum())
    stats["visitors_with_at_least_one_purchase"] = int(
        df.groupby("visitorid")["event"].apply(lambda s: (s == "transaction").any()).sum()
    )

    df.sort_values(["visitorid", "timestamp"], inplace=True)
    return df, stats
