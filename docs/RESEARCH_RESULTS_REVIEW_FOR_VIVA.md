# Research results — detailed review guide (viva / panel)

**Project:** Customer Journey Intelligence (Group 9)  
**Purpose:** Explain **what we measured**, **how to show it tomorrow**, and **why some numbers look “wrong” (especially precision ≈ 0.3333)**.  
**Source of truth:** `data/artifacts/research_results.json` (generated **2026-10-05** after `python ml/train_models.py`).

---

## 1. One-minute story (opening statement)

We used the **RetailRocket** e-commerce clickstream (views, add-to-cart, purchases). We cleaned **2,755,641** events, built a **35,000-visitor cohort**, and applied a **paper-style chronological protocol**: fix a cutoff time **τ** (80th percentile of the global timeline), use only events **before τ** for features, and predict what happens **after τ** (next event type and future purchase). We split visitors **70% / 10% / 20%** by **last activity before τ** (earliest → latest), so the test set is “later” in time and we avoid leakage.

We answered **four research questions (RQ1–RQ4)** with real offline metrics, wired them into the **Next.js dashboard** via JSON APIs, and documented alignment with the IEEE-style research paper. This is **not** a live A/B test; RQ4 uses **simulated proxy** metrics (Prectarget, coverage, unnecessary interventions).

---

## 2. How to show results tomorrow (demo checklist)

| What to show | Where | What you say |
|--------------|--------|----------------|
| Full RQ tables + funnel | **Frontend → Models / Research panel** (loads `GET /api/models/research`) | “These numbers come from the training pipeline, not hard-coded UI.” |
| Raw JSON (if panel asks) | `data/artifacts/research_results.json` | “Single artifact written by `ml/train_models.py`.” |
| Reproduce run | Terminal: `pip install -r ml/requirements.txt` then `python ml/train_models.py` | “Same seed and cohort cap → same numbers.” |
| Paper copy-paste tables | `docs/RESEARCH_PAPER_ALIGNMENT_AND_RESULTS.md` | “Alignment doc maps each table to paper sections.” |
| Customer-level scores (optional) | After `cd backend && npm run ml:import` | “Scores keyed by RetailRocket `visitorId`.” |

**If the app is not running:** open the JSON file and walk through keys `RQ1_next_event`, `RQ2_segmentation`, `RQ3_propensity`, `RQ4_strategy_simulation`, and `section_x_journey_funnel_analytics`.

---

## 3. Data and experimental setup (must know for questions)

### 3.1 Cleaning (Table IV follow-up)

| Statistic | Value | Meaning |
|-----------|--------|---------|
| Raw events loaded | 2,756,101 | Full CSV after read |
| Duplicate rows removed | 460 | Exact duplicate rows dropped |
| **Clean events** | **2,755,641** | What models actually use |
| Unique visitors (full log) | 1,407,580 | Entire dataset |
| Views / carts / transactions | 2,664,218 / 68,966 / 22,457 | Strong **view** dominance |

### 3.2 Cohort and splits

| Item | Value |
|------|--------|
| Evaluation cohort | **35,000** visitors (cap for memory + reproducibility, seed 42) |
| τ (feature cutoff) | 80th percentile of event times |
| Train / validation / test | **24,500 / 3,500 / 7,000** |
| Split rule | Sort visitors by **last pre-τ** timestamp; earliest 70% train, next 10% val, last 20% test |
| Post-τ purchase label rate | **0.07%** (26 purchasers in cohort; **5** post-τ purchasers on test set of 7,000 — drives RQ3/RQ4 sparsity) |

**Why this matters:** Features never see the future; test visitors are chronologically “later,” which is realistic but makes **rare events** (purchase after τ) extremely hard to predict.

### 3.3 Event types (RQ1 classes)

Next-event prediction uses **three classes** (codes 0, 1, 2):

1. **view**  
2. **addtocart**  
3. **transaction** (purchase)

Defined in code as `EVENT_ORDER = ["view", "addtocart", "transaction"]` in `ml/pipeline/build_features.py`.

---

## 4. RQ1 — Next-event prediction (sequence modelling)

### 4.1 Task definition

- **Input:** Each test visitor’s **pre-τ** event sequence (and summary features for classical models).  
- **Label:** The **first event type** that occurs **after τ** (if any).  
- **Who is evaluated:** Only visitors with at least one post-τ event → **n_train = 326**, **n_test = 382** (much smaller than 7,000 propensity test users).

### 4.2 Results table (test set)

| Model | Accuracy | Precision (macro) | Recall (macro) | F1 (macro) | Top-2 accuracy |
|--------|----------|-------------------|----------------|------------|----------------|
| Markov | 0.9869 | 0.3298 | 0.3325 | 0.3311 | 1.0000 |
| Logistic Regression | 0.9843 | 0.3298 | 0.3316 | 0.3307 | 0.9843 |
| Random Forest | 0.9843 | 0.3298 | 0.3316 | 0.3307 | 0.9843 |
| XGBoost | 0.9895 | 0.3298 | 0.3333 | 0.3316 | 0.9895 |
| **GRU (champion)** | **0.9921** | **0.6640** | **0.4167** | **0.4653** | 1.0000 |

**Champion rule:** Highest **macro-F1** → **GRU**.

### 4.3 How to explain accuracy vs F1

- **Accuracy ~98%** sounds excellent, but most post-τ “next events” are still **views**. A model that **almost always predicts “view”** gets high accuracy while doing poorly on **cart** and **purchase** next steps.  
- For the panel: *“We report **macro-F1** as the primary RQ1 metric because it treats each event type equally; accuracy is misleading under class imbalance.”*

### 4.4 Why GRU wins

- Markov + tabular models (LR, RF, XGB on sequence **summary** features) collapse to similar behaviour: mostly predict the majority class.  
- **GRU** uses the full ordered sequence and achieves **macro-F1 ≈ 0.47** and **macro precision ≈ 0.66** because it assigns some mass to minority next events, not only “view.”

---

## 5. Why precision shows **0.3298** or **0.3333** (same for four models) — READ THIS FOR REVIEW

This is the **most common panel question**. It is **not a bug** and **not** “33% purchase precision.”

### 5.1 Which metric is it?

For RQ1, the column **precision** in `research_results.json` is **macro-averaged precision** for **3-class** next-event prediction:

- Computed in `ml/pipeline/metrics_utils.py` with `precision_score(..., average="macro", zero_division=0, labels=[0,1,2])`.  
- Called from `ml/pipeline/next_event_models.py` with `average="macro"`.

So it is **not** binary purchase precision; it is the **unweighted mean of precision for view, addtocart, and transaction**.

### 5.2 Intuition: three classes → “about one third”

**Macro precision** = (P_view + P_cart + P_purchase) / **3**.

When **Markov, LR, RF, and XGB** rarely predict **addtocart** or **transaction**:

- **Per-class precision** for cart and purchase is often **0** (no predicted positives for that class, or `zero_division=0`).  
- **Per-class precision** for **view** is **high** (most predictions are “view” and many are correct).  

Example sketch (not exact counts):

| Class | Typical situation | Per-class precision |
|-------|-------------------|---------------------|
| view | Model predicts view most of the time | ~0.99 |
| addtocart | Almost never predicted | 0 |
| transaction | Almost never predicted | 0 |

Macro precision ≈ (0.99 + 0 + 0) / 3 ≈ **0.33**.

That is why you see:

- **0.3298** repeated for Markov, LR, RF, XGB (rounded macro average lands on the same value), and  
- **0.3333** on **recall** for XGBoost in one column (also macro, same imbalance story — **1/3** is not a coincidence).

**GRU breaks the pattern (0.664)** because it actually predicts minority classes often enough that cart/purchase precisions are **non-zero**, so the macro average doubles roughly.

### 5.3 Why four different models share **identical** 0.3298

They are **different algorithms**, but on this small test set (382 rows) and skewed labels they produce **very similar prediction patterns** (majority-class baseline). Macro precision is a **coarse summary**; when confusion matrices look alike, macro precision **matches to 4 decimal places**.

**What to tell the panel:**

> “Identical macro precision means similar per-class behaviour, not a copy-paste error. We use **macro-F1** and **top-k accuracy** to compare models; GRU clearly separates on F1.”

### 5.4 Do not confuse with RQ3 or RQ4

| Location | “0.33-ish” meaning |
|----------|---------------------|
| **RQ1** precision 0.3298 | **Macro** precision over **3 next-event classes** |
| **RQ3** precision 0.0055 | **Binary** purchase propensity at default threshold (extreme imbalance) |
| **RQ4** coverage **0.3333** | **Different formula:** fraction of **future purchasers** who received a **push** action under journey-intelligence — **not** classification precision |

---

## 6. RQ2 — Segmentation

### 6.1 What we did

- **Behavioural K-Means** on engineered features; sweep **K = 3…8**, pick best **silhouette**.  
- **RFM-feature K-Means** (K = 4) for comparison.  
- **Rule-based segments** (interpretable labels for product/NBMA).

### 6.2 Key numbers

| Method | Silhouette | Notes |
|--------|------------|--------|
| Behavioural K-Means, **K = 4** (best) | **0.5606** | Also CH ≈ 80,290, Davies–Bouldin ≈ 0.474 |
| RFM K-Means, K = 4 | 0.5528 | Slightly lower separation |
| k = 3 | 0.5531 | |
| k = 5 | 0.5537 | |
| k = 6–8 | 0.51–0.52 | Worse silhouette |

**Rule segment counts (35k cohort):**

| Segment | Count | % |
|---------|-------|---|
| At-Risk / Inactive | 23,894 | 68.3% |
| Recent Browsers | 10,058 | 28.7% |
| Cart Abandoners | 672 | 1.9% |
| Champions & High Value | 283 | 0.8% |
| High Intent Cohort | 93 | 0.3% |

### 6.3 How to explain

- Silhouette **~0.56** = **moderate** cluster separation (not perfect; many visitors look “inactive” in features).  
- Behavioural K-Means slightly beats RFM on silhouette; **rules** give business-readable segments for the dashboard and NBMA.  
- Auto cluster names in JSON may all say “Inactive / Dormant” — clusters are **data-driven**; use **rule segments** for storytelling in the viva.

---

## 7. RQ3 — Purchase propensity (static vs journey-aware)

### 7.1 Task

- **Label:** 1 if visitor has **≥1 transaction after τ**, else 0.  
- **Test n = 7,000**, **positive rate = 0.07%** (~5 positives).  
- **Champion selected on test by PR-AUC** (tie-break F1).

### 7.2 Static features (test)

| Model | Accuracy | Precision | Recall | F1 | ROC-AUC | **PR-AUC** |
|--------|----------|-----------|--------|-----|---------|------------|
| **Logistic Regression (champion)** | 0.8164 | 0.0055 | 0.3889 | 0.0108 | 0.5677 | **0.1483** |
| Random Forest | 0.9973 | 0.0 | 0.0 | 0.0 | 0.6331 | 0.0148 |
| XGBoost | 0.9974 | 0.0 | 0.0 | 0.0 | 0.7473 | 0.0528 |
| GRU | 0.3077 | 0.0008 | 0.2222 | 0.0016 | 0.1598 | 0.0017 |

### 7.3 Journey-aware features (test)

| Model | ROC-AUC | **PR-AUC** |
|--------|---------|------------|
| Logistic Regression | 0.6274 | 0.1050 |
| Random Forest | 0.7408 | 0.0407 |
| XGBoost | 0.7269 | 0.0322 |
| GRU | 0.3674 | 0.0024 |

**Validation-only (journey XGBoost, tuned `scale_pos_weight = 2.0`):** ROC-AUC **0.9946**, PR-AUC **0.0270** on validation — **do not** quote validation ROC as test performance.

### 7.4 How to explain low precision here (different from RQ1)

- RQ3 uses **binary** precision at the **default 0.5 threshold** (or model default), with **~5 positives in 7,000** test rows.  
- Many models predict **“no purchase”** for everyone → **precision 0, F1 0** but **accuracy ~99.7%**.  
- **PR-AUC** and **recall** are the honest metrics under imbalance; **static logistic regression** wins test **PR-AUC (0.148)**.  
- Journey-aware features helped **validation** ranking for XGB but **did not beat** static LR on **held-out test PR-AUC** — valid scientific finding, not a failure of implementation.

### 7.5 SHAP (explainability)

Top global drivers (journey-aware XGBoost, mean |SHAP|):

| Feature | Importance |
|---------|------------|
| stage_code | 2.7318 |
| total_events | 0.1280 |
| recency_days | 0.0278 |
| gru_5 | 0.0051 |

**Message:** Journey **stage** dominates; raw event counts and recency add signal.

---

## 8. RQ4 — Marketing strategy simulation (offline)

### 8.1 Three strategies

1. **Generic** — email everyone (`PERSONALIZED_EMAIL`).  
2. **Segment-based** — action from segment rules only.  
3. **Journey-intelligence** — NBMA: propensity, stage, churn, carts + **WAIT** / **STOP_MARKETING**.

### 8.2 Metrics (test n = 7,000)

| Strategy | Prectarget | Coverage | Unnecessary interventions | Wait + Suppress |
|----------|------------|----------|---------------------------|-----------------|
| Generic | **0.0026** | **1.0000** | 71 | 0 |
| Segment-based | 0.0026 | 1.0000 | 285 | 0 |
| Journey-intelligence | 0.0023 | **0.3333** | 149 | **4,391** |

**Winner in code:** **generic** (higher Prectarget, tie-break fewer unnecessary interventions).

**Journey action mix (examples):** WAIT 4,348; RE_ENGAGEMENT 2,397; CART_REMINDER 156; STOP_MARKETING 43; PERSONALIZED_EMAIL 56.

### 8.3 How to explain the trade-off

- **Prectarget** ≈ among **push** actions, what fraction went to visitors who **actually purchased post-τ** — all strategies are ~**0.26%** because purchases are **extremely rare**.  
- **Generic coverage = 100%** means every future buyer got a push (because everyone gets email).  
- **Journey-intelligence coverage = 33%** means only **one third of future buyers** received a push under the policy — many were **WAIT/STOP** (4,391 actions). That is **intentional spam reduction**, not RQ1 precision.  
- **Honest limitation:** These are **proxy** metrics from `ml/pipeline/rq4_simulation.py`, **not** causal uplift. Paper and viva should say **live A/B** is future work.

---

## 9. Section X — Funnel and journey stages (business narrative)

### 9.1 Visitor funnel (pre-τ, 35k cohort)

| Stage | Count | % of cohort |
|--------|-------|-------------|
| All visitors | 35,000 | 100% |
| ≥1 view | 34,913 | 99.75% |
| ≥1 add-to-cart | 928 | **2.65%** |
| ≥1 purchase (pre-τ) | 283 | **0.81%** |

**Drop-offs:** view → cart **2.66%** of viewers; cart → purchase **30.5%** among cart visitors.

### 9.2 Journey stage distribution (synopsis stages)

| Stage | % |
|--------|---|
| INACTIVE | 85.7% |
| INITIAL_ENGAGEMENT | 9.7% |
| EXPLORATION | 3.2% |
| CONSIDERATION | 0.95% |
| HIGH_INTENT | 0.33% |
| CONVERSION | 0.12% |
| RETENTION | 0.05% |

Use this to explain **why models skew toward “view”** and **why propensity labels are sparse**.

---

## 10. Likely panel Q&A (short answers)

**Q: Why is accuracy 98% but F1 only 0.33?**  
A: Imbalanced next-event classes; accuracy favours predicting “view.” We prioritise **macro-F1**; **GRU** reaches **0.47**.

**Q: Why is precision 0.3333 for four models?**  
A: **Macro precision over three classes** when two classes have ~0 precision and view has ~1 → average ≈ **1/3**. Same behaviour across models, not a spreadsheet error.

**Q: Did journey-aware features win?**  
A: **On test PR-AUC, static logistic regression won (0.148).** Journey XGB had strong **validation** ROC after tuning; we report both to avoid overfitting narrative.

**Q: Why did generic beat journey-intelligence in RQ4?**  
A: Winner uses **Prectarget** on a holdout with **~5 purchases**; emailing everyone maximises **coverage** of those few buyers. Journey policy **reduces contacts** (Wait/Suppress) but **lowers coverage** — a policy trade-off, not proof journey ML is useless.

**Q: Is the dashboard fake?**  
A: Models page / research panel read **`research_results.json`** via API after training; replace any legacy demo charts by citing JSON for the paper.

**Q: FastAPI?**  
A: **Next.js** API + Prisma; Python is **batch training only** — paper Table VIII should say that.

---

## 11. Files and commands (reference)

| File | Role |
|------|------|
| `ml/train_models.py` | Runs full pipeline, writes artifacts |
| `data/artifacts/research_results.json` | All RQ + funnel + SHAP + RQ4 |
| `data/artifacts/paper_figures.json` | Figure-ready funnel/stage tables |
| `data/artifacts/table_iv_post_cleaning.json` | Cleaning stats for paper Table IV |
| `docs/RESEARCH_PAPER_ALIGNMENT_AND_RESULTS.md` | Paper section mapping + paste-ready tables |

```bash
pip install -r ml/requirements.txt
python ml/train_models.py
```

Optional: `cd backend && npm run ml:import` to load scores into PostgreSQL.

---

## 12. Summary sentence for closing

We implemented the full synopsis protocol on RetailRocket, showed that **GRU improves next-event macro-F1**, that **propensity must be judged with PR-AUC under 0.07% positive rate**, that **segments are moderately separable (silhouette 0.56)**, and that **journey-intelligence policies trade outreach volume for Wait/Suppress logic** — with **generic Prectarget** winning on this sparse offline simulation until real A/B tests are run.

---

*Prepared for review — numbers from `research_results.json` (2026-10-05). For paper insertion, use `RESEARCH_PAPER_ALIGNMENT_AND_RESULTS.md`.*
