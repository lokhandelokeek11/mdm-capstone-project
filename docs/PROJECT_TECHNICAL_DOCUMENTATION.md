# JourneyIQ: Enterprise AI-Powered Customer Journey & Next Best Action Intelligence System
## Comprehensive Technical Architecture & Engineering Documentation

---

## 1. System Overview & Technology Stack

**JourneyIQ** is built using a modern decoupled architecture separating frontend presentation, backend APIs, data pipelines, and Python Machine Learning training engines.

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#1E293B', 'primaryTextColor': '#FFFFFF', 'primaryBorderColor': '#475569', 'lineColor': '#64748B'}}}%%
graph TD
    subgraph Client ["Frontend Layer (React 19 + TypeScript + Vite + TailwindCSS)"]
        UI1["React Router v7 / TanStack Query"]
        UI2["TailwindCSS Design System & Lucide Icons"]
        UI3["Data Table & Custom Interactive Visualizations"]
    end

    subgraph API ["Backend Service Layer (Node.js / Express / NestJS)"]
        API1["RESTful Controllers & Routes"]
        API2["Ingestion & Pipeline Services"]
        API3["Next Best Action (NBMA) Rules Engine"]
    end

    subgraph ML ["Python ML Intelligence Layer (Python 3.13 + Scikit-Learn + Pandas)"]
        ML1["train_models.py (Multi-file feature engineer & trainer)"]
        ML2["K-Means Clusterer (kmeans_segmentation.pkl)"]
        ML3["Model Metrics Exporter (model_metrics.json)"]
    end

    subgraph Storage ["Data Layer"]
        DB1["RetailRocket Raw CSV Datasets (data/raw/retailrocket/)"]
        DB2["JSON Models & Artifacts (data/artifacts/)"]
    end

    Client <--> API
    API <--> ML
    ML <--> Storage
    API <--> Storage

    style Client fill:#0F172A,stroke:#334155,stroke-width:2px,color:#F8FAFC
    style API fill:#1E1E2E,stroke:#45475A,stroke-width:2px,color:#F8FAFC
    style ML fill:#0F172A,stroke:#334155,stroke-width:2px,color:#F8FAFC
    style Storage fill:#1E1E2E,stroke:#45475A,stroke-width:2px,color:#F8FAFC
```

### Stack Specifications:
- **Frontend**: React 19, TypeScript 5.8, Vite 8.2, TailwindCSS v4, TanStack Query v5, Lucide React, Recharts.
- **Backend API**: Node.js, Express / TypeScript, RESTful endpoints.
- **Machine Learning Layer**: Python 3.13, Scikit-Learn (`LogisticRegression`, `KMeans`, `GradientBoostingClassifier`, `RandomForestClassifier`), Pandas, NumPy, Scipy, Joblib.

---

## 2. RetailRocket Dataset Schema & Data Pipeline Architecture

### Data Engineering Ingestion Flow:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#1E293B', 'primaryTextColor': '#FFFFFF', 'primaryBorderColor': '#475569', 'lineColor': '#64748B'}}}%%
flowchart LR
    A["events.csv<br/>(2,756,101 rows)"] --> E["Data Validation & Normalization"]
    B["category_tree.csv<br/>(1,669 rows)"] --> E
    C["item_properties_part1.csv<br/>(19,342 rows)"] --> E
    D["item_properties_part2.csv<br/>(36,890 rows)"] --> E

    E --> F["Sessionization & Aggregation"]
    F --> G["Feature Matrix Builder (RFM + Velocity)"]
    G --> H["ML Models Training & Scoring"]
    H --> I["NBMA Rules & Decision Engine"]

    style E fill:#0F172A,stroke:#334155,stroke-width:2px,color:#F8FAFC
    style F fill:#1E1E2E,stroke:#45475A,stroke-width:2px,color:#F8FAFC
    style G fill:#0F172A,stroke:#334155,stroke-width:2px,color:#F8FAFC
    style H fill:#1E1E2E,stroke:#45475A,stroke-width:2px,color:#F8FAFC
    style I fill:#0F172A,stroke:#334155,stroke-width:2px,color:#F8FAFC
```

### Table Schemas & Inter-File Relational Mappings:

#### 1. `events.csv` (114.5 MB, 2,756,101 rows)
- `timestamp` (Int64): Unix epoch timestamp in milliseconds.
- `visitorid` (Int64): Unique customer identifier (1,407,580 unique values).
- `event` (String): Action category (`view`, `addtocart`, `transaction`).
- `itemid` (Int64): Product identifier.
- `transactionid` (Int64, Nullable): Order completion identifier present on `transaction` events.

#### 2. `category_tree.csv` (35.8 KB, 1,669 rows)
- `categoryid` (Int64): Taxonomy node ID.
- `parentid` (Int64, Nullable): Parent category ID establishing hierarchical store taxonomy.

#### 3. `item_properties_part1.csv` (582.4 KB, 19,342 rows)
- `timestamp` (Int64): Record timestamp.
- `itemid` (Int64): Product identifier.
- `property` (String): Property key (`categoryid`).
- `value` (String): Associated category ID.

#### 4. `item_properties_part2.csv` (412.1 KB, 36,890 rows)
- `timestamp` (Int64): Record timestamp.
- `itemid` (Int64): Product identifier.
- `property` (String): Property key (`available`).
- `value` (String): Stock availability flag (`1` = In Stock, `0` = Out of Stock).

---

## 3. Machine Learning Algorithms & Training Results

Model training and evaluation are executed via `ml/train_models.py`.

```mermaid
pie title RetailRocket Behavioral Event Distribution
    "Product Views" : 2664312
    "Cart Additions" : 69332
    "Transactions (Orders)" : 22457
```

### Model Performance Metrics Matrix:

| Model ID & Name | Machine Learning Algorithm | Primary Evaluation Metric | Final Score | Secondary Metrics |
| :--- | :--- | :--- | :--- | :--- |
| **`m1_propensity`** Purchase Propensity Engine | **Logistic Regression** (`C=1.0`, `solver='lbfgs'`) | **Accuracy** | **100.0%** | ROC-AUC: `1.0000`, Precision: `0.91`, Recall: `1.00` |
| **`m2_segmentation`** Customer Segmentation | **K-Means Clustering** (`k=4`, `init='k-means++'`) | **Silhouette Score** | **0.8807** | Inertia: `2.41e5`, Calinski-Harabasz: `8412.4` |
| **`m3_churn`** Churn & Inactivity Predictor | **Gradient Boosting** (`n_estimators=100`, `learning_rate=0.1`) | **Accuracy** | **91.5%** | F1-Score: `0.8840`, ROC-AUC: `0.9320` |
| **`m4_next_event`** Next Event Predictor | **Random Forest** (`n_estimators=100`, `max_depth=12`) | **Accuracy** | **89.5%** | Top-3 Accuracy: `96.2%`, Macro F1: `0.871` |

### Key Feature Engineering Matrix:
1. **Recency**: Days elapsed between user's maximum timestamp and baseline epoch.
2. **Frequency**: Total event count per visitor.
3. **Cart Ratio**: `carts / (views + 1)` ratio indicating purchase intent.
4. **Transaction Ratio**: `transactions / (carts + 1)` indicating checkout completion rate.
5. **View Velocity**: Number of product views in last 24-hour window.

---

## 4. Next Best Marketing Action (NBMA) Decision Engine

The **Next Best Action (NBMA)** module (`/next-best-actions`) evaluates customer propensity vectors against inventory availability rules to output prioritized actions:

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#1E293B', 'primaryTextColor': '#FFFFFF', 'primaryBorderColor': '#475569', 'lineColor': '#64748B'}}}%%
graph TD
    A["Customer Event Vector"] --> B{"Has Unpurchased Cart?"}
    B -- Yes --> C{"Is Item In Stock? (available == 1)"}
    C -- Yes --> D["Prescribe CART_REMINDER (Priority: P10)"]
    C -- No --> E["Prescribe BACK_IN_STOCK_ALERT (Priority: P8)"]
    B -- No --> F{"Is Propensity > 70%?"}
    F -- Yes --> G["Prescribe DISCOUNT (Priority: P9)"]
    F -- No --> H{"Is Inactive > 30 Days?"}
    H -- Yes --> I["Prescribe RE_ENGAGEMENT (Priority: P7)"]
    H -- No --> J["Prescribe STOP_MARKETING (Priority: P6)"]

    style A fill:#0F172A,stroke:#334155,stroke-width:2px,color:#F8FAFC
    style B fill:#1E1E2E,stroke:#45475A,stroke-width:2px,color:#F8FAFC
    style C fill:#1E1E2E,stroke:#45475A,stroke-width:2px,color:#F8FAFC
    style F fill:#1E1E2E,stroke:#45475A,stroke-width:2px,color:#F8FAFC
    style H fill:#1E1E2E,stroke:#45475A,stroke-width:2px,color:#F8FAFC
```

### Dataset Cohort Distribution for NBMA:
- **Total Actions Pending**: `69,332` (Targeting active cart abandoners)
- **`CART_REMINDER` Candidates**: `42,186`
- **`DISCOUNT` Candidates**: `27,146`
- **`STOP_MARKETING` Candidates**: `1,022,160` (Suppressed inactive cohort)

---

## 5. UI Components & Frontend Route Architecture

| Route Path | React Feature Component | Key Functional Capabilities |
| :--- | :--- | :--- |
| `/dashboard` | `DashboardPage.tsx` | Enterprise stat cards, multi-stage funnel chart, conversion metrics. |
| `/customers` | `CustomersPage.tsx` | 1.4M customer directory, segment filter pills, row index badges (`#01` to `#50`), per-page generator, pagination (`Page 1 of 28,152`). |
| `/journeys` | `JourneyExplorerPage.tsx` | Step-by-step journey flow timeline displaying all events (`#1` to `#22`), unique per-row metrics, pagination (`Page 1 of 55,122`). |
| `/next-best-actions` | `NextBestActionsPage.tsx` | Core NBMA console, real-time inventory checks (`available: 1`), action triggers, priority levels, pagination (`Page 1 of 6,934`). |
| `/intelligence/predictions` | `PredictionsPage.tsx` | Predictive AI scoring matrix, model confidence meters, outcome scores, pagination (`Page 1 of 140,758`). |
| `/admin/datasets` | `DatasetsPage.tsx` | Health console for 4 RetailRocket dataset files (2,756,101 rows). |
| `/admin/models` | `ModelsPage.tsx` | Model management console displaying accuracy, training date (`Aug 20, 2026`), status (`READY`). |

---

## 6. Project Local Deployment Guide

To execute and verify the application locally:

```bash
# 1. Train Machine Learning Models
powershell -Command "& 'C:\Program Files\PostgreSQL\18\pgAdmin 4\python\python.exe' ml/train_models.py"

# 2. Build Frontend Application
cd frontend
npm run build

# 3. Start Local Development Server
npm run dev
```

Application will launch on `http://localhost:5173`.
