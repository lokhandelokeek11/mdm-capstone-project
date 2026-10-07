"""Synopsis ML study orchestrator — leakage-free RetailRocket evaluation."""

from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone

import joblib
import numpy as np
import torch

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from ml.pipeline.build_features import (  # noqa: E402
    CODE_TO_EVENT,
    CUTOFF_PERCENTILE,
    TRAIN_RATIO,
    VAL_RATIO,
    TEST_RATIO,
    build_cohort,
    load_events,
    train_val_test_split_chronological,
)
from ml.pipeline.paper_figures import build_paper_figures  # noqa: E402
from ml.pipeline.preprocess import clean_events  # noqa: E402
from ml.pipeline.collaborative_filter import build_item_similarity, recommend_items  # noqa: E402
from ml.pipeline.decision_engine import decide_action  # noqa: E402
from ml.pipeline.next_event_models import run_rq1_next_event  # noqa: E402
from ml.pipeline.propensity_models import build_journey_gru_matrix, run_rq3_propensity  # noqa: E402
from ml.pipeline.rq4_simulation import run_rq4_simulation  # noqa: E402
from ml.pipeline.segments_rq2 import run_rq2_segmentation  # noqa: E402
from ml.pipeline.shap_utils import compute_shap_summary, local_shap_top_features  # noqa: E402

ARTIFACTS = os.path.join(ROOT, "data", "artifacts")


def _json_safe(obj):
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, (np.integer, np.floating)):
        return obj.item()
    if isinstance(obj, dict):
        return {k: _json_safe(v) for k, v in obj.items() if k not in ("model", "markov_model", "gru_model", "shap_model", "propensity_xgb", "kmeans_model", "churn_xgboost")}
    if isinstance(obj, list):
        return [_json_safe(x) for x in obj]
    return obj


def main():
    print("=" * 72)
    print("Customer Journey Intelligence — Synopsis ML Study")
    print("=" * 72)

    os.makedirs(ARTIFACTS, exist_ok=True)
    df_raw = load_events()
    df, cleaning_stats = clean_events(df_raw)
    print(f"Cleaned {cleaning_stats['clean_events']:,} events, {cleaning_stats['clean_unique_visitors']:,} visitors.")

    cohort = build_cohort(df)
    print(f"Cohort size: {len(cohort.visitor_ids):,} visitors | cutoff ts: {cohort.cutoff_ts}")

    train_ids, val_ids, test_ids = train_val_test_split_chronological(
        cohort.visitor_ids,
        cohort.visitor_last_pre_ts,
        train_ratio=TRAIN_RATIO,
        val_ratio=VAL_RATIO,
        test_ratio=TEST_RATIO,
    )
    print(f"Split (chronological): train={len(train_ids):,} val={len(val_ids):,} test={len(test_ids):,}")
    id_to_idx = {int(v): i for i, v in enumerate(cohort.visitor_ids)}

    paper_figures = build_paper_figures(cohort)

    print("\n[RQ2] Segmentation...")
    rq2 = run_rq2_segmentation(cohort.static_features, cohort.rule_segment)

    print("\n[RQ1] Next-event prediction...")
    rq1 = run_rq1_next_event(
        train_ids,
        test_ids,
        cohort.sequences,
        cohort.y_next_event,
        cohort.next_event_mask,
        cohort.visitor_ids,
    )

    print("\n[RQ3] Purchase propensity...")
    rq3 = run_rq3_propensity(cohort, train_ids, val_ids, test_ids, rq1["gru_model"])

    print("\n[SHAP] Explainability...")
    shap_summary = compute_shap_summary(
        rq3["shap_model"],
        rq3["shap_X_sample"],
        rq3["shap_feature_names"],
    )

    print("\n[CF] Product recommendations...")
    item_to_idx, _, sim = build_item_similarity(cohort.item_histories)

    prop_model = rq3["propensity_xgb"]
    churn_model = rq3["churn_xgboost"]["model"]
    X_journey_gru = build_journey_gru_matrix(cohort, rq1["gru_model"], cohort.visitor_ids)
    from ml.pipeline.propensity_models import _journey_matrix

    X_journey = _journey_matrix(cohort)
    markov = rq1["markov_model"]

    propensity_all = prop_model.predict_proba(X_journey_gru.values)[:, 1]
    churn_all = churn_model.predict_proba(X_journey.loc[cohort.visitor_ids].values)[:, 1]

    shap_local_cache: dict = {}
    shap_sample_ids = test_ids[:500]
    for vid in shap_sample_ids:
        row = X_journey_gru.loc[int(vid)].values
        shap_local_cache[int(vid)] = local_shap_top_features(
            rq3["shap_model"], row, rq3["shap_feature_names"], top_n=5
        )

    global_shap = shap_summary.get("global", [])
    default_shap = [{"feature": f["feature"], "shap": f["importance"]} for f in global_shap[:5]]

    customer_scores = []
    next_events_str = []

    export_ids = test_ids[:5000]
    for vid in export_ids:
        vid = int(vid)
        idx = id_to_idx[vid]
        prop = float(propensity_all[idx])
        churn = float(churn_all[idx])

        seq = cohort.sequences[vid]
        last = seq[-1] if seq else 0
        mk_probs = markov.predict_proba_row(last)
        next_code = int(np.argmax(mk_probs))
        next_ev = CODE_TO_EVENT.get(next_code, "view")
        next_events_str.append(next_ev)

        static = cohort.static_features.loc[vid]
        action = decide_action(
            stage=str(cohort.journey_stage[idx]),
            segment=str(cohort.rule_segment[idx]),
            propensity=prop,
            churn_risk=churn,
            carts=int(static["carts"]),
            purchases_pre=int(static["purchases_pre"]),
            recency_days=float(static["recency_days"]),
            next_event=next_ev,
        )
        recs = recommend_items(cohort.item_histories.get(vid, []), item_to_idx, sim, top_k=3)

        customer_scores.append(
            {
                "visitorId": vid,
                "journeyStage": str(cohort.journey_stage[idx]),
                "segment": str(cohort.rule_segment[idx]),
                "behaviouralCluster": int(rq2["behavioural_labels"][idx]),
                "propensity": round(prop, 4),
                "churnRisk": round(churn, 4),
                "nextEvent": next_ev,
                "recommendedAction": action,
                "productRecommendations": [{"itemId": int(i), "score": round(s, 4)} for i, s in recs],
                "shapFeatures": shap_local_cache.get(vid, default_shap),
                "postPurchased": int(cohort.post_purchased[idx]),
            }
        )

    all_next_events = []
    for vid in cohort.visitor_ids:
        seq = cohort.sequences[int(vid)]
        last = seq[-1] if seq else 0
        next_code = int(np.argmax(markov.predict_proba_row(last)))
        all_next_events.append(CODE_TO_EVENT.get(next_code, "view"))

    test_mask = np.isin(cohort.visitor_ids, test_ids)
    rq4 = run_rq4_simulation(
        cohort.visitor_ids[test_mask],
        cohort.rule_segment[test_mask],
        cohort.journey_stage[test_mask],
        propensity_all[test_mask],
        churn_all[test_mask],
        cohort.static_features.loc[cohort.visitor_ids[test_mask], "carts"].values,
        cohort.pre_purchased[test_mask],
        cohort.static_features.loc[cohort.visitor_ids[test_mask], "recency_days"].values,
        cohort.post_purchased[test_mask],
        np.array(all_next_events)[test_mask].tolist(),
    )

    val_ts = cohort.visitor_last_pre_ts[[id_to_idx[int(v)] for v in val_ids]]
    test_ts = cohort.visitor_last_pre_ts[[id_to_idx[int(v)] for v in test_ids]]

    research_results = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "table_iv_post_cleaning": cleaning_stats,
        "experimental_protocol": {
            "description": "Paper Sec. IX-A: chronological splits; features from t≤τ; labels from post-τ window",
            "feature_reference_time_tau": cohort.cutoff_ts,
            "tau_percentile": CUTOFF_PERCENTILE,
            "propensity_label": "1 if visitor has ≥1 transaction with timestamp > τ",
            "train_val_test_ratio": f"{TRAIN_RATIO}/{VAL_RATIO}/{TEST_RATIO}",
            "split_method": "Visitors sorted by last pre-τ activity timestamp (earliest→latest)",
            "validation_use": "XGBoost scale_pos_weight tuned on validation PR-AUC (Table X / RQ3)",
            "n_train": int(len(train_ids)),
            "n_validation": int(len(val_ids)),
            "n_test": int(len(test_ids)),
            "validation_last_pre_ts_range": [int(val_ts.min()), int(val_ts.max())] if len(val_ts) else [],
            "test_last_pre_ts_range": [int(test_ts.min()), int(test_ts.max())] if len(test_ts) else [],
        },
        "section_x_journey_funnel_analytics": paper_figures,
        "cohort": {
            "n_visitors": int(len(cohort.visitor_ids)),
            "n_events_clean": cleaning_stats["clean_events"],
            "n_events_loaded_raw": cohort.n_events_loaded,
            "cutoff_ts": cohort.cutoff_ts,
            "n_train": int(len(train_ids)),
            "n_validation": int(len(val_ids)),
            "n_test": int(len(test_ids)),
            "propensity_positive_rate": round(float(cohort.y_propensity.mean()), 4),
        },
        "RQ1_next_event": _json_safe({k: v for k, v in rq1.items() if not k.endswith("_model")}),
        "RQ2_segmentation": _json_safe({k: v for k, v in rq2.items() if k != "kmeans_model" and k != "behavioural_labels" and k != "rfm_labels"}),
        "RQ2_segmentation_note": {
            "behavioural_silhouette": rq2["behavioural_kmeans"]["silhouette"],
            "rfm_silhouette": rq2["rfm_kmeans"]["silhouette"],
        },
        "RQ3_propensity": _json_safe({k: v for k, v in rq3.items() if not k.startswith("shap_") and k not in ("propensity_xgb",)}),
        "RQ3_champion": {
            "feature_set": rq3["champion_feature_set"],
            "model": rq3["champion_model"],
        },
        "explainability": shap_summary,
        "RQ4_strategy_simulation": rq4,
        "champions": {
            "next_event": rq1["champion"],
            "propensity": rq3["champion_model"],
            "propensity_features": rq3["champion_feature_set"],
        },
    }

    with open(os.path.join(ARTIFACTS, "research_results.json"), "w", encoding="utf-8") as f:
        json.dump(research_results, f, indent=2)

    with open(os.path.join(ARTIFACTS, "paper_figures.json"), "w", encoding="utf-8") as f:
        json.dump(paper_figures, f, indent=2)

    with open(os.path.join(ARTIFACTS, "table_iv_post_cleaning.json"), "w", encoding="utf-8") as f:
        json.dump(cleaning_stats, f, indent=2)

    with open(os.path.join(ARTIFACTS, "customer_scores.json"), "w", encoding="utf-8") as f:
        json.dump(customer_scores, f, indent=2)

    # Legacy model_metrics.json for existing UI hooks
    prop_champion_fs = rq3["champion_feature_set"]
    prop_champion_name = rq3["champion_model"]
    model_metrics = [
        {
            "id": "model_propensity_v1",
            "name": f"Purchase Propensity ({prop_champion_fs} / {prop_champion_name})",
            "version": "3.0.0",
            "modelType": "purchase_propensity",
            "status": "READY",
            "metrics": rq3[prop_champion_fs][prop_champion_name],
            "createdAt": datetime.now().strftime("%b %d, %Y"),
        },
        {
            "id": "model_segmentation_v1",
            "name": "Customer Segmentation v3",
            "version": "3.0.0",
            "modelType": "segmentation",
            "status": "READY",
            "metrics": rq2["behavioural_kmeans"],
            "createdAt": datetime.now().strftime("%b %d, %Y"),
        },
        {
            "id": "model_churn_v1",
            "name": "Churn & Inactivity Risk v3",
            "version": "3.0.0",
            "modelType": "churn_risk",
            "status": "READY",
            "metrics": {k: v for k, v in rq3["churn_xgboost"].items() if k != "model"},
            "createdAt": datetime.now().strftime("%b %d, %Y"),
        },
        {
            "id": "model_next_event_v1",
            "name": f"Next Event ({rq1['champion']})",
            "version": "3.0.0",
            "modelType": "next_event",
            "status": "READY",
            "metrics": rq1[rq1["champion"]],
            "createdAt": datetime.now().strftime("%b %d, %Y"),
        },
    ]
    with open(os.path.join(ARTIFACTS, "model_metrics.json"), "w", encoding="utf-8") as f:
        json.dump(model_metrics, f, indent=2)

    joblib.dump(rq2["kmeans_model"], os.path.join(ARTIFACTS, "kmeans_segmentation.pkl"))
    joblib.dump(prop_model, os.path.join(ARTIFACTS, "propensity_xgboost.pkl"))
    joblib.dump(churn_model, os.path.join(ARTIFACTS, "churn_xgboost.pkl"))
    joblib.dump(markov, os.path.join(ARTIFACTS, "markov_next_event.pkl"))
    torch.save(rq1["gru_model"].state_dict(), os.path.join(ARTIFACTS, "gru_next_event.pt"))

    print("\nArtifacts written to data/artifacts/")
    print("Done.")


if __name__ == "__main__":
    main()
