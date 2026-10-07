# Machine learning (synopsis study)

## Setup

```bash
pip install -r ml/requirements.txt
```

Requires RetailRocket `events.csv` at `data/raw/retailrocket/events.csv`.

## Train and evaluate (RQ1–RQ4)

```bash
python ml/train_models.py
```

Writes:

- `data/artifacts/research_results.json` — RQ1–RQ4, `experimental_protocol`, `table_iv_post_cleaning`, Sec. X funnel
- `data/artifacts/paper_figures.json` — funnel and journey-stage tables for the paper
- `data/artifacts/table_iv_post_cleaning.json` — post-dedup dataset counts (Table IV follow-up)
- `data/artifacts/customer_scores.json` — scored test cohort
- `data/artifacts/model_metrics.json` — champion summaries for the UI
- Model weights (`.pkl`, `.pt`)

**Paper protocol (Sec. IX-A):** τ = 80th percentile of timestamps; features use events with t ≤ τ; propensity label = purchase after τ; visitor split **70% / 10% / 20%** (train/validation/test) by last pre-τ activity; XGBoost `scale_pos_weight` tuned on validation **PR-AUC**.

## Import into PostgreSQL (optional)

From `backend/`:

```bash
npm run ml:import
```
