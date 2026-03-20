# CLV Enterprise Showcase Platform

Production-grade, client-demo-ready **Customer Lifetime Value (CLV)** analytics product.

This README is intentionally written as a **regeneration spec** so another engineer, team, or LLM prompt can rebuild the project end-to-end with consistent quality.

---

## 1. What This Project Is

An end-to-end platform that:
- Ingests customer CSV data
- Detects row-level vs summary-level source quality
- Performs EDA with business interpretation
- Engineers RFM + behavioral features
- Runs multi-method feature selection
- Trains and compares regression + classification models
- Selects best models objectively
- Exposes predictions via FastAPI
- Delivers a React dashboard with business storytelling

Primary outputs:
- `predicted_clv` (regression)
- `high_value_flag` + probability (classification)
- manager/customer-ready action recommendations

---

## 2. Business Problem It Solves

Most organizations misallocate retention and growth spend because customer value is estimated informally.

This platform provides:
- CLV-based budget allocation
- premium customer prioritization
- retention-risk actioning
- operational scoring (single + batch)

---

## 3. Stack and Constraints

### Backend
- Python 3.11+
- FastAPI
- Pydantic
- pandas, numpy, scikit-learn
- SHAP (optional fallback)
- xgboost (optional fallback)
- joblib, matplotlib

### Frontend
- React (Vite)
- Recharts
- axios

### Deployment
- Dockerfile (backend)
- Dockerfile (frontend)
- `docker-compose.yml`
- `.env.example` files

---

## 4. Repository Structure Contract

```text
clv_showcase_project/
├── backend/
│   ├── app/
│   │   ├── api.py
│   │   ├── schemas.py
│   │   ├── predictor.py
│   │   ├── insights.py
│   │   ├── config.py
│   │   └── utils.py
│   ├── training/
│   │   ├── run_pipeline.py
│   │   ├── preprocess.py
│   │   ├── feature_engineering.py
│   │   ├── feature_selection.py
│   │   ├── train_models.py
│   │   ├── evaluate_models.py
│   │   └── explain_model.py
│   ├── models/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── main.py
├── frontend/
│   ├── src/components/
│   ├── src/pages/
│   ├── src/services/
│   ├── src/data/
│   ├── src/utils/
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── data/
│   ├── raw/
│   ├── processed/
│   ├── sample_input/
│   └── demo/
├── reports/
│   ├── figures/
│   ├── metrics/
│   ├── eda_summary.md
│   ├── feature_selection_summary.md
│   ├── model_comparison.md
│   ├── business_recommendations.md
│   └── executive_summary.md
├── docs/
│   ├── executive_story.md
│   ├── client_pitch.md
│   ├── technical_story.md
│   ├── deployment_guide.md
│   └── assumptions.md
├── notebooks/
├── docker-compose.yml
├── Makefile
└── README.md
```

---

## 5. Data Ingestion Rules

Input file may be:
1. Row-level customer dataset
2. Summary-level metrics dataset

### Required behavior
- Detect dataset grain automatically
- If row-level: train directly
- If summary-level: generate calibrated synthetic row-level demo data and continue pipeline
- Never fail hard purely due to missing raw row-level data

---

## 6. Target Handling Rules

### Regression target
Preferred:
- `clv`, `customer_lifetime_value`, `predicted_clv`, or equivalent

Fallback behavior:
- If target is missing or has insufficient variance, generate calibrated CLV target from behavioral features:
  - monetary, frequency, tenure, recency, complaint_rate, renewal_ratio, income proxy

### Classification target
Preferred:
- `high_value_flag` or equivalent binary signal

Fallback behavior:
- derive from CLV quantile on training set
- if still single-class, create surrogate high-value signal from stable numeric drivers

---

## 7. Train/Test Dataset Requirement

Pipeline must always create and persist:
- `data/processed/training_dataset.csv`
- `data/processed/testing_dataset.csv`

Default split:
- 80/20 with fixed random seed for reproducibility

Model fitting must use training split; evaluation on test split.

---

## 8. Feature Engineering Contract

At minimum create:
- `recency`
- `frequency`
- `monetary`
- `average_order_value`
- `claim_rate`
- `complaint_rate`
- `renewal_ratio`
- `premium_efficiency`
- `engagement_score`
- `tenure_band`

Must be adaptive:
- derive from available equivalents when columns differ
- log assumptions/fallbacks
- never crash because one derived feature cannot be produced

---

## 9. Feature Selection Contract

Methods required:
- correlation
- mutual information
- RFECV
- Random Forest importance
- L1/Lasso

Guardrails required:
- remove leakage columns (`high_value_probability`, recommended actions, etc.)
- remove identifier-like columns
- remove high-cardinality weak generalization fields
- remove zero-variance fields

Output required:
- `reports/metrics/feature_selection_scores.csv`
- `reports/metrics/feature_selection_summary.json`
- `reports/feature_selection_summary.md`

---

## 10. Modeling Contract

### Regression candidates
- Linear Regression
- Ridge
- Lasso
- Random Forest Regressor
- Gradient Boosting Regressor
- XGBoost Regressor (if installed)

Metrics:
- R2, MAE, RMSE, MAPE

### Classification candidates
- Logistic Regression
- Random Forest Classifier
- Gradient Boosting Classifier
- XGBoost Classifier (if installed)

Metrics:
- Accuracy, Precision, Recall, F1, ROC-AUC, confusion matrix

Selection rule:
- objective metric sort, not arbitrary choice

Outputs:
- `backend/models/*.pkl`
- `backend/models/metadata.json`
- `reports/metrics/model_metrics.json`

---

## 11. Explainability Contract

- Try SHAP summary plot
- fallback to feature importance/permutation if SHAP unavailable
- provide plain-English driver interpretation

Outputs:
- `reports/figures/shap_summary.png`
- `reports/figures/top_feature_impact.png`
- `reports/business_recommendations.md`

---

## 12. API Contract (FastAPI)

### Required endpoints
- `GET /health`
- `GET /metadata`
- `GET /model-metrics`
- `GET /eda-summary`
- `GET /feature-selection-summary`
- `POST /predict`
- `POST /predict-batch`
- `POST /upload-csv-and-predict`

### `/predict` response should include
- predicted_clv
- high_value_flag
- high_value_probability
- explanation_message
- top_reason_codes
- recommended_action
- budget_treatment
- prediction_context (confidence, segment, churn risk, input completeness)
- model_context

### `/upload-csv-and-predict` should include
- rows processed
- missing expected feature list
- summary (avg CLV, high-value rate, segment mix)
- preview rows
- downloadable enriched CSV text

---

## 13. Frontend Dashboard Contract

Sections required:
1. Hero / value statement
2. Manager-ready overview cards
3. Base data profile
4. EDA insights
5. Feature engineering explanation
6. Feature selection explanation (plain English + charts)
7. Model comparison (tables + charts + winner rationale)
8. Single prediction form + results
9. Batch CSV upload flow with preview + download
10. Business storytelling / action matrix / budget blueprint
11. Deployment footnote

UI requirements:
- professional card layout
- responsive desktop/mobile
- clear headings and labels
- no toy styling

---

## 14. How to Run

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. python -m training.run_pipeline --input-csv <your_input_csv>
PYTHONPATH=. uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### URLs
- Backend: `http://localhost:8000`
- Backend docs: `http://localhost:8000/docs`
- Frontend: `http://localhost:5173`

---

## 15. Docker Run

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

---

## 16. Acceptance Criteria (for regen prompt)

A regenerated project is acceptable only if:
- it creates train/test datasets
- it trains both regression and classification tracks
- it writes model metrics + comparison reports
- it supports summary-level fallback generation
- API returns descriptive business outputs
- dashboard tells complete story without verbal guidance
- CSV upload scoring works end-to-end
- docs/readme/deployment are presentation-ready

---

## 17. LLM Prompt Pack (Copy/Paste)

### 17.1 Master Regeneration Prompt

Use this prompt with any coding LLM:

```text
You are a senior staff-level ML engineer and full-stack product architect.
Build a complete production-quality CLV platform with:
- backend: Python/FastAPI/sklearn
- frontend: React/Vite/Recharts
- outputs: CLV regression + high-value classification
- data ingestion supporting both row-level and summary-level input
- fallback synthetic calibrated dataset when row-level data is unavailable
- EDA + business narrative
- adaptive feature engineering (RFM + behavioral rates)
- multi-method feature selection with reports
- multi-model benchmarking and objective winner selection
- explainability with SHAP fallback
- API endpoints for health/metadata/metrics/predict/batch/upload
- polished dashboard with business storytelling and batch upload flow
- Docker + deployment docs

Must create explicit train/test datasets and train models from training split.
Must produce manager-ready markdown narratives and self-explanatory UI.
Do not output pseudo-code. Produce runnable modular code and complete file structure.
```

### 17.2 Data-Specific Prompt Add-on

```text
Use this CSV as input:
<ABSOLUTE_PATH_TO_INPUT_CSV>
Detect if target CLV has insufficient variance; if yes, generate calibrated CLV target and document assumption.
Persist training_dataset.csv and testing_dataset.csv.
```

---

## 18. Known Practical Notes

- If your `predicted_clv` column is constant, true supervised CLV learning is not possible; calibrated target fallback is required.
- If `high_value_flag` is single-class, classifier fallback should derive or synthesize valid class separation.
- Feature selection on large data can use sampled rows for efficiency; final training should use full training split.

---

## 19. Reference Files

- Main pipeline: [run_pipeline.py](/Users/rituparnapaldas/Documents/Exl_POC/clv6/clv6/clv_showcase_project/backend/training/run_pipeline.py)
- Feature engineering: [feature_engineering.py](/Users/rituparnapaldas/Documents/Exl_POC/clv6/clv6/clv_showcase_project/backend/training/feature_engineering.py)
- Feature selection: [feature_selection.py](/Users/rituparnapaldas/Documents/Exl_POC/clv6/clv6/clv_showcase_project/backend/training/feature_selection.py)
- Model training: [train_models.py](/Users/rituparnapaldas/Documents/Exl_POC/clv6/clv6/clv_showcase_project/backend/training/train_models.py)
- API: [api.py](/Users/rituparnapaldas/Documents/Exl_POC/clv6/clv6/clv_showcase_project/backend/app/api.py)
- Dashboard: [Dashboard.jsx](/Users/rituparnapaldas/Documents/Exl_POC/clv6/clv6/clv_showcase_project/frontend/src/pages/Dashboard.jsx)

