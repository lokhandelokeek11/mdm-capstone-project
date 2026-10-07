"""RQ3: purchase propensity (static vs journey-aware features)."""

from __future__ import annotations

from typing import Any, Dict, List, Tuple

import numpy as np
import pandas as pd
import torch
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier

from ml.pipeline.build_features import CohortData
from ml.pipeline.metrics_utils import classification_metrics
from ml.pipeline.next_event_models import EventGRU, _pad_sequences, _sequence_summary_features


STAGE_TO_CODE = {
    "INITIAL_ENGAGEMENT": 0,
    "EXPLORATION": 1,
    "CONSIDERATION": 2,
    "HIGH_INTENT": 3,
    "CONVERSION": 4,
    "RETENTION": 5,
    "INACTIVE": 6,
}


def _static_matrix(cohort: CohortData) -> pd.DataFrame:
    return cohort.static_features[
        ["total_events", "views", "carts", "recency_days", "cart_to_view_ratio"]
    ].copy()


def _journey_matrix(cohort: CohortData) -> pd.DataFrame:
    jf = cohort.journey_features.copy()
    jf["stage_code"] = jf["journey_stage"].map(STAGE_TO_CODE).fillna(0)
    return jf[
        [
            "total_events",
            "views",
            "carts",
            "recency_days",
            "cart_to_view_ratio",
            "session_count",
            "distinct_items",
            "view_to_cart_hours",
            "seq_length",
            "last_event_code",
            "markov_entropy",
            "stage_code",
        ]
    ]


def _gru_embeddings(
    visitor_ids: np.ndarray,
    sequences: Dict[int, List[int]],
    gru_model: EventGRU,
    max_len: int = 50,
) -> np.ndarray:
    gru_model.eval()
    seqs = [sequences[int(v)] for v in visitor_ids]
    X = torch.tensor(_pad_sequences(seqs, max_len))
    with torch.no_grad():
        emb = gru_model.encode(X).cpu().numpy()
    return emb


class PropensityGRU(torch.nn.Module):
    def __init__(self, static_dim: int, n_event_classes: int = 3, hidden: int = 32):
        super().__init__()
        self.event_gru = EventGRU(n_classes=n_event_classes, hidden=hidden)
        self.head = torch.nn.Sequential(
            torch.nn.Linear(hidden + static_dim, 32),
            torch.nn.ReLU(),
            torch.nn.Linear(32, 2),
        )

    def forward(self, seq_x, static_x):
        h = self.event_gru.encode(seq_x)
        return self.head(torch.cat([h, static_x], dim=1))


def _train_propensity_gru(
    train_ids: np.ndarray,
    test_ids: np.ndarray,
    cohort: CohortData,
    y_train: np.ndarray,
    y_test: np.ndarray,
    max_train: int = 8_000,
) -> Dict[str, Any]:
    if len(train_ids) > max_train:
        pick = np.random.default_rng(42).choice(len(train_ids), max_train, replace=False)
        train_ids = train_ids[pick]
        y_train = y_train[pick]

    static = _static_matrix(cohort)
    X_static_train = torch.tensor(static.loc[train_ids].values, dtype=torch.float32)
    X_static_test = torch.tensor(static.loc[test_ids].values, dtype=torch.float32)
    train_seqs = [cohort.sequences[int(v)] for v in train_ids]
    test_seqs = [cohort.sequences[int(v)] for v in test_ids]
    X_seq_train = torch.tensor(_pad_sequences(train_seqs))
    X_seq_test = torch.tensor(_pad_sequences(test_seqs))

    model = PropensityGRU(static_dim=X_static_train.shape[1])
    opt = torch.optim.Adam(model.parameters(), lr=0.001)
    loss_fn = torch.nn.CrossEntropyLoss()
    y_tr = torch.tensor(y_train, dtype=torch.long)
    y_te = torch.tensor(y_test, dtype=torch.long)

    model.train()
    for _ in range(4):
        opt.zero_grad()
        logits = model(X_seq_train, X_static_train)
        loss = loss_fn(logits, y_tr)
        loss.backward()
        opt.step()

    model.eval()
    with torch.no_grad():
        logits = model(X_seq_test, X_static_test)
        prob = torch.softmax(logits, dim=1).cpu().numpy()
        pred = prob.argmax(axis=1)

    return classification_metrics(y_test, pred, prob, average="binary")


def build_journey_gru_matrix(
    cohort: CohortData,
    gru_model: EventGRU,
    visitor_ids: np.ndarray | None = None,
) -> pd.DataFrame:
    visitor_ids = visitor_ids if visitor_ids is not None else cohort.visitor_ids
    X_journey = _journey_matrix(cohort)
    emb = _gru_embeddings(visitor_ids, cohort.sequences, gru_model)
    X = X_journey.loc[visitor_ids].copy()
    for i in range(emb.shape[1]):
        X[f"gru_{i}"] = emb[:, i]
    return X


def _tune_xgb_scale_pos_weight(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_val: np.ndarray,
    y_val: np.ndarray,
) -> tuple[float, Dict[str, Any]]:
    from ml.pipeline.metrics_utils import classification_metrics

    best_w = 2.0
    best_val: Dict[str, Any] = {}
    best_pr = -1.0
    for w in (1.0, 2.0, 5.0, 10.0, 20.0):
        clf = XGBClassifier(
            n_estimators=120,
            max_depth=5,
            learning_rate=0.08,
            random_state=42,
            scale_pos_weight=w,
        )
        clf.fit(X_train, y_train)
        prob = clf.predict_proba(X_val)
        pred = clf.predict(X_val)
        m = classification_metrics(y_val, pred, prob, average="binary")
        pr = m.get("pr_auc") or 0.0
        if pr > best_pr:
            best_pr = pr
            best_w = w
            best_val = m
    return best_w, best_val


def run_rq3_propensity(
    cohort: CohortData,
    train_ids: np.ndarray,
    val_ids: np.ndarray,
    test_ids: np.ndarray,
    gru_next_model: EventGRU,
) -> Dict[str, Any]:
    y_all = cohort.y_propensity
    id_to_idx = {int(v): i for i, v in enumerate(cohort.visitor_ids)}
    y_train = np.array([y_all[id_to_idx[int(v)]] for v in train_ids])
    y_test = np.array([y_all[id_to_idx[int(v)]] for v in test_ids])

    X_static = _static_matrix(cohort)
    X_journey = _journey_matrix(cohort)

    train_emb = _gru_embeddings(train_ids, cohort.sequences, gru_next_model)
    test_emb = _gru_embeddings(test_ids, cohort.sequences, gru_next_model)
    emb_cols = [f"gru_{i}" for i in range(train_emb.shape[1])]
    X_journey_gru = X_journey.copy()
    for i, col in enumerate(emb_cols):
        X_journey_gru[col] = 0.0
        X_journey_gru.loc[train_ids, col] = train_emb[:, i]
        X_journey_gru.loc[test_ids, col] = test_emb[:, i]

    y_val = np.array([y_all[id_to_idx[int(v)]] for v in val_ids])

    results: Dict[str, Any] = {
        "n_train": len(train_ids),
        "n_validation": len(val_ids),
        "n_test": len(test_ids),
        "positive_rate": round(float(y_all.mean()), 4),
        "static": {},
        "journey_aware": {},
        "validation_champion_journey_xgb": {},
    }

    champions: List[Tuple[str, str, float, Any]] = []

    for feature_set_name, X in [("static", X_static), ("journey_aware", X_journey_gru)]:
        X_train = X.loc[train_ids].values
        X_test = X.loc[test_ids].values
        bucket = results[feature_set_name]
        for name, clf in [
            ("logistic_regression", LogisticRegression(max_iter=1000, class_weight="balanced")),
            ("random_forest", RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, class_weight="balanced")),
            ("xgboost", None),
        ]:
            if name == "xgboost":
                X_val = X.loc[val_ids].values
                spw, val_metrics = _tune_xgb_scale_pos_weight(X_train, y_train, X_val, y_val)
                clf = XGBClassifier(
                    n_estimators=120,
                    max_depth=5,
                    learning_rate=0.08,
                    random_state=42,
                    scale_pos_weight=spw,
                )
                if feature_set_name == "journey_aware":
                    results["validation_champion_journey_xgb"] = {
                        **val_metrics,
                        "scale_pos_weight": spw,
                    }
            else:
                clf = (
                    LogisticRegression(max_iter=1000, class_weight="balanced")
                    if name == "logistic_regression"
                    else RandomForestClassifier(
                        n_estimators=100, max_depth=10, random_state=42, class_weight="balanced"
                    )
                )
                clf.fit(X_train, y_train)
            if name == "xgboost":
                clf.fit(X_train, y_train)
            pred = clf.predict(X_test)
            prob = clf.predict_proba(X_test)
            bucket[name] = classification_metrics(y_test, pred, prob, average="binary")
            if name == "xgboost" and feature_set_name == "journey_aware":
                bucket[name]["scale_pos_weight_tuned"] = spw
            champions.append((feature_set_name, name, bucket[name].get("pr_auc", 0) or bucket[name]["f1"], clf))

        bucket["gru"] = _train_propensity_gru(train_ids, test_ids, cohort, y_train, y_test)

    best = max(champions, key=lambda t: (t[2], t[3] is not None))
    results["champion_selection_metric"] = "pr_auc_on_test (tie-break f1)"
    results["champion_feature_set"] = best[0]
    results["champion_model"] = best[1]

    # Churn model (XGBoost) — inactive after cutoff
    y_churn_train = np.array([cohort.y_churn[id_to_idx[int(v)]] for v in train_ids])
    y_churn_test = np.array([cohort.y_churn[id_to_idx[int(v)]] for v in test_ids])
    churn_clf = XGBClassifier(n_estimators=80, max_depth=5, random_state=42)
    churn_clf.fit(X_journey.loc[train_ids].values, y_churn_train)
    churn_pred = churn_clf.predict(X_journey.loc[test_ids].values)
    churn_prob = churn_clf.predict_proba(X_journey.loc[test_ids].values)
    results["churn_xgboost"] = classification_metrics(y_churn_test, churn_pred, churn_prob, average="binary")
    results["churn_xgboost"]["model"] = churn_clf

    # Keep best propensity xgboost on journey features for SHAP
    spw_champ = results["validation_champion_journey_xgb"].get("scale_pos_weight", 2.0)
    prop_xgb = XGBClassifier(
        n_estimators=120,
        max_depth=5,
        learning_rate=0.08,
        random_state=42,
        scale_pos_weight=spw_champ,
    )
    prop_xgb.fit(
        np.vstack([X_journey_gru.loc[train_ids].values, X_journey_gru.loc[val_ids].values]),
        np.concatenate([y_train, y_val]),
    )
    results["shap_model"] = prop_xgb
    results["shap_feature_names"] = list(X_journey_gru.columns)
    results["shap_X_sample"] = X_journey_gru.loc[test_ids].values[:500]
    results["propensity_xgb"] = prop_xgb

    return results
