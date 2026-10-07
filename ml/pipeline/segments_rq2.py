"""RQ2: segmentation and cluster quality."""

from __future__ import annotations

from typing import Any, Dict, List

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import calinski_harabasz_score, davies_bouldin_score, silhouette_score


def _name_cluster(centroid: np.ndarray) -> str:
    recency, freq, views, carts = centroid
    if carts > 0.5 and recency < 5:
        return "High Intent / Cart Active"
    if recency > 10:
        return "Inactive / Dormant"
    if freq > 10 and views > 5:
        return "Engaged Browsers"
    return "Light Browsers"


def run_rq2_segmentation(static_features: pd.DataFrame, rule_segment: np.ndarray) -> Dict[str, Any]:
    X_beh = static_features[["recency_days", "total_events", "views", "carts"]].values
    X_rfm = static_features[["recency_days", "total_events", "carts"]].values

    k_sweep: List[Dict[str, Any]] = []
    best_k = 4
    best_sil = -1.0
    sample_idx = np.random.default_rng(42).choice(len(X_beh), min(5000, len(X_beh)), replace=False)

    for k in range(3, 9):
        km = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = km.fit_predict(X_beh)
        sil = float(silhouette_score(X_beh[sample_idx], labels[sample_idx]))
        ch = float(calinski_harabasz_score(X_beh, labels))
        db = float(davies_bouldin_score(X_beh, labels))
        k_sweep.append({"k": k, "silhouette": round(sil, 4), "calinski_harabasz": round(ch, 2), "davies_bouldin": round(db, 4)})
        if sil > best_sil:
            best_sil = sil
            best_k = k

    kmeans = KMeans(n_clusters=best_k, random_state=42, n_init=10)
    behavioural_labels = kmeans.fit_predict(X_beh)
    rfm_km = KMeans(n_clusters=4, random_state=42, n_init=10)
    rfm_labels = rfm_km.fit_predict(X_rfm)

    cluster_names = {}
    for i, c in enumerate(kmeans.cluster_centers_):
        cluster_names[int(i)] = _name_cluster(c)

    rule_counts = pd.Series(rule_segment).value_counts().to_dict()

    return {
        "k_sweep": k_sweep,
        "best_k": best_k,
        "behavioural_kmeans": {
            "silhouette": round(float(silhouette_score(X_beh[sample_idx], behavioural_labels[sample_idx])), 4),
            "calinski_harabasz": round(float(calinski_harabasz_score(X_beh, behavioural_labels)), 2),
            "davies_bouldin": round(float(davies_bouldin_score(X_beh, behavioural_labels)), 4),
            "cluster_names": cluster_names,
        },
        "rfm_kmeans": {
            "silhouette": round(float(silhouette_score(X_rfm[sample_idx], rfm_labels[sample_idx])), 4),
            "clusters": 4,
        },
        "rule_segments": rule_counts,
        "behavioural_labels": behavioural_labels,
        "rfm_labels": rfm_labels,
        "kmeans_model": kmeans,
    }
