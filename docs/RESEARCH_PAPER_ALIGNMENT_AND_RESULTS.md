# Research paper review, implementation alignment, and where to insert results

**Paper:** [Customer_Journey_Intelligence_Research_Paper.pdf](../Customer_Journey_Intelligence_Research_Paper.pdf)  
**Synopsis:** [Group9_Synopsis.pdf](../Group9_Synopsis.pdf)  
**Latest run:** `2026-10-05T09:52:12Z` via `python ml/train_models.py`

| Artifact | Purpose |
|----------|---------|
| [data/artifacts/research_results.json](../data/artifacts/research_results.json) | RQ1–RQ4, protocol, SHAP, Sec. X analytics |
| [data/artifacts/paper_figures.json](../data/artifacts/paper_figures.json) | Funnel + stage + segment tables for figures |
| [data/artifacts/table_iv_post_cleaning.json](../data/artifacts/table_iv_post_cleaning.json) | Table IV follow-up (post-dedup counts) |
| [data/artifacts/model_metrics.json](../data/artifacts/model_metrics.json) | UI / abstract champion summaries |

Regenerate after code changes: `python ml/train_models.py`

---

## 1. Overall paper quality

### Strengths

| Area | Assessment |
|------|------------|
| Structure | IEEE-style flow matches synopsis (gap → method → RQs → offline evaluation). |
| Honesty | Tables XII–XIII correctly marked as **illustrative** until you paste measured values. |
| RQs | RQ1–RQ4 and Eq. (14)–(15) align with RetailRocket limitations (no causal uplift). |
| Method | 30-min sessions, Markov + classical ML + GRU, NBMA with Wait/Suppress, SHAP, CF. |

### Issues to fix in the PDF/LaTeX (not auto-fixed in code)

| # | Issue | Severity | Action |
|---|--------|----------|--------|
| 1 | Abstract says results are **“pending”** | High | Remove; cite offline RetailRocket run with τ cutoff and 70/10/20 split. |
| 2 | **Section X** in future tense (“will be reported”) | High | Rewrite past tense; insert tables from Section 4 below. |
| 3 | **Table XII / XIII** red demo numbers (71–89% acc.; journey wins RQ4) | High | Replace with Section 4; do **not** keep demo values. |
| 4 | **Table VIII / Fig. 2:** FastAPI backend | Medium | Change to **Next.js REST API + Prisma + PostgreSQL**; Python **only for ML training**. |
| 5 | Sec. IX-A train/val/test | Medium | **Done in code** — copy `experimental_protocol` text into paper (Section 3.1). |
| 6 | PR-AUC in Sec. VII-E / Table XI | Medium | **Done in code** — add `pr_auc` column to propensity tables. |
| 7 | RFM quintile wording (Sec. VII-C) | Low | Say “RFM-derived features + K-Means” (not quintile-only RFM). |
| 8 | Event notation `view/cart/purchase` vs `addtocart/transaction` | Low | One footnote mapping event types. |
| 9 | Abstract “LSTM/GRU” | Low | Results: **GRU** for sequence model. |
| 10 | Sec. XIII “complete experiments” | Low | Replace with live A/B, uplift modelling, multi-retailer. |
| 11 | Table IV post-cleaning row | Medium | **Done in code** — Section 3.2. |
| 12 | Fictional UI metrics (94.2% XGBoost) | Medium | Paper cites JSON only; UI uses API on Models page. |

**Verdict:** Paper is structurally strong. Submission-ready **after** you update Abstract, Sec. X, Tables XII–XIII, and architecture stack text.

---

## 2. Implementation vs paper (alignment matrix)

| Paper claim | Implemented? | Evidence | Gap |
|-------------|-------------|----------|-----|
| RetailRocket (Sec. VI, Table IV raw) | Yes | `data/raw/retailrocket/events.csv` | — |
| Cleaning + dedup (Sec. VI-B) | Yes | `ml/pipeline/preprocess.py` | — |
| Sessionisation θ = 30 min (Eq. 2) | Yes | `build_features.py`, `dataset-pipeline.service.ts` | — |
| Chronological protocol (Sec. IX-A) | Yes | τ @ 80th percentile; 70/10/20 split by last pre-τ activity | Document in paper |
| Journey stages (Table VI) | Yes | Rule classifier in `build_features.py` | — |
| Rule + RFM-KMeans + behavioural K-Means (Sec. VII-C) | Yes | `segments_rq2.py` | Not RFM quintiles alone |
| RQ1 models (Markov, LR, RF, XGB, GRU) | Yes | `next_event_models.py` | — |
| RQ3 static vs journey-aware + **PR-AUC** | Yes | `propensity_models.py` | Val tuning on XGB only |
| SHAP (Sec. VII-H) | Yes | `shap_utils.py` | Local SHAP on sample of test visitors |
| NBMA + Wait/Suppress (Table VII) | Yes | `decision_engine.py` + TS mirror | — |
| CF products (Eq. 12) | Yes | `collaborative_filter.py` | — |
| Sec. X funnel / stages | Yes | `paper_figures.py` | Cohort-level, not full 1.4M visitors |
| Dashboards (Sec. VIII-C) | Yes | React app + ResearchQuestionsPanel | Customer list may use mocks |
| FastAPI (Table VIII) | **No** | Next.js API under `backend/src/app/api/` | **Update paper** |
| PostgreSQL results (Fig. 2) | Optional | `npm run ml:import` | JSON also served by API |

---

## 3. Experimental setup (for Sec. VI & IX)

### 3.1 Protocol (`experimental_protocol`)

| Item | Value |
|------|--------|
| Reference time τ | 80th percentile of event timestamps (`1439871800445`) |
| Features | Events with **t ≤ τ** only |
| Propensity label | 1 if ≥1 **transaction** with **t > τ** |
| Cohort size | **35,000** visitors (stratified cap; reproducible seed 42) |
| Split | **70% train / 10% validation / 20% test** |
| Split rule | Visitors ordered by **last pre-τ activity** (earliest → latest) |
| Train / val / test counts | **24,500 / 3,500 / 7,000** |
| Validation use | Tune XGBoost `scale_pos_weight` on **validation PR-AUC** |
| Post-τ purchase rate (label) | **0.07%** (26 purchasers in cohort) |

**Paragraph for Sec. IX-A (paste/adapt):**

> We fixed a reference time τ at the 80th percentile of the global event timeline. All features were computed from interactions with t ≤ τ. Purchase propensity labels indicated whether a visitor completed at least one transaction after τ. Visitors in the evaluation cohort were sorted by their last pre-τ timestamp and assigned chronologically to training (70%), validation (10%), and test (20%) sets. The validation set was used only to select XGBoost `scale_pos_weight` by maximising PR-AUC. No test labels were used for tuning.

### 3.2 Table IV follow-up (post-cleaning)

Add **below** the raw Kaggle row in Sec. VI:

| Statistic | Value |
|-----------|--------|
| Raw events (as loaded) | 2,756,101 |
| Duplicate rows removed | **460** |
| **Clean events** | **2,755,641** |
| **Clean unique visitors** | **1,407,580** |
| Clean unique items | 235,061 |
| Clean view events | 2,664,218 |
| Clean add-to-cart events | 68,966 |
| Clean transaction events | 22,457 |
| Visitors with ≥1 purchase (full log) | 11,719 |
| High-rate visitors removed | 0 |

Source: `table_iv_post_cleaning.json`.

---

## 4. Measured results for the paper (replace Tables XII–XIII)

### 4.1 RQ1 — Does sequence modelling improve next-event prediction?

Task: predict **first post-τ event type** (view / addtocart / transaction).  
Test visitors with ≥1 post-τ event: **n = 382** (train sequences for next-event: **n = 326**).

| Model | Accuracy | Precision (macro) | Recall (macro) | **F1 (macro)** | Top-2 acc. |
|--------|----------|-------------------|----------------|---------------|------------|
| Markov | 0.9869 | 0.3298 | 0.3325 | 0.3311 | 1.0000 |
| Logistic Regression | 0.9843 | 0.3298 | 0.3316 | 0.3307 | 0.9843 |
| Random Forest | 0.9843 | 0.3298 | 0.3316 | 0.3307 | 0.9843 |
| XGBoost | 0.9895 | 0.3298 | 0.3333 | 0.3316 | 0.9895 |
| **GRU** | **0.9921** | **0.6640** | **0.4167** | **0.4653** | 1.0000 |

**Champion (macro-F1): GRU.**

**Discussion (Sec. X-A):** On this holdout, the **GRU improved macro-F1** over Markov and classical baselines (~0.47 vs ~0.33). High accuracy alone is misleading when class balance is skewed toward views.

**→ Replace Table XII (next-event block)** with this table. Split propensity into **Table XII-b** (below).

---

### 4.2 RQ2 — Separable behavioural segments?

| Method | Silhouette | Notes |
|--------|------------|--------|
| Behavioural K-Means (**K = 4**, best of k=3…8) | **0.5606** | CH = 80,290; DB = 0.474 |
| RFM-feature K-Means (K = 4) | 0.5528 | — |
| Rule segments (cohort counts) | — | At-Risk/Inactive 23,894; Recent Browsers 10,058; Cart Abandoners 672; Champions 283; High Intent 93 |

**Discussion:** Moderate cluster separation; profiles dominated by inactive/dormant behaviour in this sample.

**→ Add Table XIV (Segmentation, RQ2)** in Sec. X.

---

### 4.3 RQ3 — Journey-aware features for purchase propensity?

Label: post-τ purchase. Test **n = 7,000**. Positive rate **0.07%**.

#### Static features

| Model | Acc. | Prec. | Rec. | F1 | ROC-AUC | **PR-AUC** |
|--------|------|-------|------|-----|---------|------------|
| Logistic Regression | 0.8164 | 0.0055 | 0.3889 | 0.0108 | 0.5677 | **0.1483** |
| Random Forest | 0.9973 | 0.0000 | 0.0000 | 0.0000 | 0.6331 | 0.0148 |
| XGBoost | 0.9974 | 0.0000 | 0.0000 | 0.0000 | 0.7473 | 0.0528 |
| GRU (propensity head) | 0.3077 | 0.0008 | 0.2222 | 0.0016 | 0.1598 | 0.0017 |

#### Journey-aware features (+ stage, sessions, GRU embeddings, etc.)

| Model | Acc. | Prec. | Rec. | F1 | ROC-AUC | **PR-AUC** |
|--------|------|-------|------|-----|---------|------------|
| Logistic Regression | 0.5274 | 0.0030 | 0.5556 | 0.0060 | 0.6274 | 0.1050 |
| Random Forest | 0.9961 | 0.0000 | 0.0000 | 0.0000 | 0.7408 | 0.0407 |
| XGBoost (test) | 0.9961 | 0.0000 | 0.0000 | 0.0000 | 0.7269 | 0.0322 |
| GRU | 0.9969 | 0.0000 | 0.0000 | 0.0000 | 0.3674 | 0.0024 |

**Validation (journey-aware XGBoost, tuned `scale_pos_weight = 2.0`):** ROC-AUC **0.9946**, PR-AUC **0.0270**.

**Test-set champion (by PR-AUC):** **static Logistic Regression** (PR-AUC **0.1483**, ROC-AUC **0.5677**).

**Discussion (Sec. X-A):** With extreme imbalance, **PR-AUC and recall** matter more than accuracy. Journey-aware features improved **validation ROC-AUC** for XGBoost but did **not** beat static logistic regression on **test PR-AUC**. Report both validation tuning and held-out test. Many models predict no positives at default thresholds → F1 = 0; mention threshold tuning as future work.

**SHAP global (journey-aware XGBoost, supplementary):**

| Feature | Mean \|SHAP\| |
|---------|----------------|
| stage_code | 2.7318 |
| total_events | 0.1280 |
| recency_days | 0.0278 |
| gru_5 | 0.0051 |

**→ Table XII-b:** Propensity comparison including **PR-AUC** column (paper Sec. VII-E / Table XI).

---

### 4.4 RQ4 — Strategy simulation (Eq. 15, offline proxies)

Test set **n = 7,000**. **Not causal uplift.**

| Strategy | Prectarget | Coverage | Unnecessary interventions | Wait + Suppress |
|----------|------------|----------|---------------------------|-----------------|
| Generic | 0.0026 | **1.0000** | 71 | 0 |
| Segment-based | 0.0026 | **1.0000** | 285 | 0 |
| Journey-intelligence | 0.0023 | 0.3333 | 149 | **4,391** |

**Winner (code metric: Prectarget, then lower Unn): generic.**

Journey-intelligence action mix (examples): WAIT 4,348; RE_ENGAGEMENT 2,397; CART_REMINDER 156; STOP_MARKETING 43.

**Discussion (Sec. X-A):** Journey-intelligence **materially reduced promotional actions** via Wait/Suppress but **lowered coverage** and did **not** improve Prectarget on this sparse-purchase holdout. Interpret the three metrics **together**, as the paper already notes.

**→ Replace Table XIII** with this table. **Do not** use illustrative 3% / 7% / 15% demo values.

---

### 4.5 Section X — Journey funnel and stage analytics

From `paper_figures.json` (pre-τ, **35k cohort**):

**Visitor funnel**

| Stage | Count | % of cohort |
|--------|-------|-------------|
| All cohort visitors | 35,000 | 100% |
| ≥1 product view | 34,913 | 99.75% |
| ≥1 add-to-cart | 928 | **2.65%** |
| ≥1 purchase (pre-τ) | 283 | **0.81%** |

Drop-off: view→cart (visitor) **2.66%**; cart→purchase (visitor) **30.5%**.

**Journey stage distribution (top 3)**

| Stage | Count | % |
|--------|-------|---|
| INACTIVE | 29,997 | 85.71% |
| INITIAL_ENGAGEMENT | 3,388 | 9.68% |
| EXPLORATION | 1,109 | 3.17% |

Use for a **bar chart / funnel figure** in Sec. X.

---

## 5. Where to insert results in the paper (checklist)

| Location | Action |
|----------|--------|
| **Abstract** | Remove “pending”; 2–3 sentences: τ cutoff, 70/10/20 split, GRU next-event F1 0.47, propensity PR-AUC 0.15 (static LR), RQ4 trade-offs. |
| **Sec. VI** | Add Table IV follow-up (Section 3.2). |
| **Sec. IX-A** | Paste protocol paragraph (Section 3.1). |
| **Table XII** | RQ1 next-event table (Section 4.1). |
| **New Table XII-b** | RQ3 propensity + **PR-AUC** (Section 4.3). |
| **Table XIII** | RQ4 simulation (Section 4.4). |
| **New Table XIV** | RQ2 segmentation (Section 4.2). |
| **Sec. X** | Funnel + stage/segment narrative + tables (Section 4.5); past tense. |
| **Sec. X-A** | “We found…” per RQ using Section 4 discussions. |
| **Table VIII / Fig. 2** | Next.js API; Python for ML batch only. |
| **Sec. XIII** | Remove “complete experiments”; keep A/B test, uplift, PR threshold tuning. |
| **Appendix** | `pip install -r ml/requirements.txt && python ml/train_models.py`; seed 42. |

---

## 6. Code ↔ paper alignment (completed in repo)

| Requirement | Module | Output key |
|-------------|--------|------------|
| PR-AUC | `ml/pipeline/metrics_utils.py` | `*.pr_auc` |
| Table IV cleaning | `ml/pipeline/preprocess.py` | `table_iv_post_cleaning` |
| 70/10/20 chronological split | `ml/pipeline/build_features.py` | `experimental_protocol` |
| Val tuning (XGB) | `ml/pipeline/propensity_models.py` | `validation_champion_journey_xgb` |
| Sec. X figures data | `ml/pipeline/paper_figures.py` | `section_x_journey_funnel_analytics` |
| UI metrics | `ModelsPage`, `ResearchQuestionsPanel` | `GET /api/models/research` |

---

## 7. Pending (paper PDF + optional product)

### Must-do (PDF)

1. Insert all tables in Section 4.  
2. Rewrite Abstract, Sec. X, Conclusion (past tense).  
3. Fix FastAPI → Next.js in Table VIII and Fig. 2.  
4. RQ4 narrative: journey policy **reduces actions** (Wait/Suppress) but **generic wins Prectarget** on this holdout.

### Optional (product)

- Set `USE_MOCK = false` for live customer API.  
- Run `cd backend && npm run ml:import` after `db:seed`.  
- Re-run training with larger `MAX_VISITORS` if hardware allows (currently 35,000).  
- Legacy ROC demo blocks on Models page detail tabs — cite JSON for the paper only.

---

## 8. Commands

```bash
pip install -r ml/requirements.txt
python ml/train_models.py

# Optional DB sync
cd backend
npm run ml:import
```

---

## 9. Conclusion paragraph (adapt for Sec. XIII)

After cleaning **2,755,641** RetailRocket events (460 duplicates removed), we evaluated a **35,000-visitor cohort** with reference time τ at the **80th percentile**, a **70/10/20** chronological train/validation/test split, and post-τ purchase labels (positive rate **0.07%**). **GRU** achieved the best next-event **macro-F1 (0.465)** on the holdout. **Static logistic regression** achieved the highest test **PR-AUC (0.148)** for purchase propensity; journey-aware XGBoost reached **0.995 ROC-AUC on validation** after hyperparameter tuning. Behavioural **K-Means (K = 4)** yielded silhouette **0.561**. The journey-intelligence NBMA policy issued **4,391** Wait/Suppress decisions on the test simulation, reducing coverage to **33%** without improving **Prectarget** versus generic email—consistent with **offline proxy** evaluation and the need for live A/B validation before deployment.

---

*Group 9 — Customer Journey Intelligence. Numbers sourced from `research_results.json` generated 2026-10-05.*
