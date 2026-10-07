"""TreeSHAP for champion propensity model."""

from __future__ import annotations

from typing import Any, Dict, List

import numpy as np
import shap


def compute_shap_summary(model, X_sample: np.ndarray, feature_names: List[str]) -> Dict[str, Any]:
    if X_sample.shape[0] == 0:
        return {"global": [], "note": "empty sample"}
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_sample)
    if isinstance(shap_values, list):
        vals = shap_values[1] if len(shap_values) > 1 else shap_values[0]
    else:
        vals = shap_values
    mean_abs = np.abs(vals).mean(axis=0)
    global_importance = [
        {"feature": feature_names[i], "importance": round(float(mean_abs[i]), 4)}
        for i in np.argsort(-mean_abs)[:12]
    ]
    return {"global": global_importance}


def local_shap_top_features(
    model,
    row: np.ndarray,
    feature_names: List[str],
    top_n: int = 5,
) -> List[Dict[str, float]]:
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(row.reshape(1, -1))
    if isinstance(shap_values, list):
        vals = shap_values[1][0] if len(shap_values) > 1 else shap_values[0][0]
    else:
        vals = shap_values[0]
    order = np.argsort(-np.abs(vals))[:top_n]
    return [
        {"feature": feature_names[i], "shap": round(float(vals[i]), 4)}
        for i in order
    ]
