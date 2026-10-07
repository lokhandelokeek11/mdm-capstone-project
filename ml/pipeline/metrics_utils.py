"""Classification metrics for research tables."""

from __future__ import annotations

from typing import Any, Dict, Optional

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    top_k_accuracy_score,
)


def classification_metrics(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    y_prob: Optional[np.ndarray] = None,
    average: str = "binary",
    labels: Optional[np.ndarray] = None,
) -> Dict[str, Any]:
    out: Dict[str, Any] = {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision": round(float(precision_score(y_true, y_pred, average=average, zero_division=0, labels=labels)), 4),
        "recall": round(float(recall_score(y_true, y_pred, average=average, zero_division=0, labels=labels)), 4),
        "f1": round(float(f1_score(y_true, y_pred, average=average, zero_division=0, labels=labels)), 4),
    }
    if y_prob is not None and average == "binary" and len(np.unique(y_true)) > 1:
        if y_prob.ndim == 2:
            prob_pos = y_prob[:, 1]
        else:
            prob_pos = y_prob
        out["roc_auc"] = round(float(roc_auc_score(y_true, prob_pos)), 4)
        try:
            out["pr_auc"] = round(float(average_precision_score(y_true, prob_pos)), 4)
        except ValueError:
            out["pr_auc"] = None
    elif y_prob is not None and average != "binary":
        try:
            out["roc_auc"] = round(float(roc_auc_score(y_true, y_prob, multi_class="ovr", average="macro")), 4)
        except ValueError:
            out["roc_auc"] = None
    return out


def top3_accuracy(y_true: np.ndarray, y_prob: np.ndarray, labels: np.ndarray) -> float:
    if len(y_true) == 0:
        return 0.0
    n_classes = y_prob.shape[1] if y_prob.ndim == 2 else 1
    if n_classes < 2:
        return round(float((y_true == y_prob.argmax(axis=1)).mean()), 4)
    k = min(2, n_classes, len(labels))
    use_labels = labels[:n_classes] if len(labels) >= n_classes else np.arange(n_classes)
    try:
        return round(float(top_k_accuracy_score(y_true, y_prob, k=k, labels=use_labels)), 4)
    except ValueError:
        return round(float((y_true == y_prob.argmax(axis=1)).mean()), 4)
