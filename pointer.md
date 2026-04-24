# CLV Executive Presentation (Slide-by-Slide Content)

Use this as direct copy/paste content into PowerPoint.
Project: CLV Enterprise Demo (Insurance Portfolio)
Data Source: `backend/data/clv_realistic_50000_5yr_with_agentname.csv`
Model Run Date: April 24, 2026

---

## Slide 1: Title
**Customer Lifetime Value (CLV) Intelligence Platform**

- Predicting CLV and identifying high-value customers for better budget allocation.
- Insurance portfolio use case with deployable ML + dashboard stack.
- Prepared for: leadership and client demo.

---

## Slide 2: Background
**Why this matters now**

- Retention and acquisition budgets are often allocated without a quantified lifetime value lens.
- A small subset of customers typically drives a large share of long-term value.
- Insurance portfolios need combined visibility of premium, loss, and renewal behavior.
- We built a production-style CLV platform to move from intuition to measurable action.

**Management takeaway:**
Use CLV as a financial control metric for customer prioritization.

---

## Slide 3: Business Use Case
**Business questions solved by this platform**

1. Which customers should receive high-touch retention investment?
2. Which segments should be prioritized for upsell/cross-sell?
3. Which customers can be shifted to lower-cost automation journeys?
4. How should budgets be redistributed by expected customer value and risk?

**Operational outputs from the system**

- Predicted CLV (regression output)
- High-value probability + flag (classification output)
- Segment-level action recommendations
- API + dashboard for single and batch scoring

---

## Slide 4: Key Challenge
**Core challenges addressed**

- Target complexity: CLV must reflect insurance economics (premium vs loss).
- Data heterogeneity: mixed numeric, behavioral, and policy variables.
- Scalability: 50,000-row portfolio with 54 columns.
- Model trust: need explainable outputs for business stakeholders.
- Deployment readiness: transition from notebook-style analysis to API + frontend product.

**How we handled this**

- Defined CLV formula: `clv = earnedpremium_am - netloss_paid_am`
- Built robust train/test pipeline and feature selection workflow
- Added explainability artifacts and business-action narratives

---

## Slide 5: Data Interpretation
**Portfolio snapshot (training input)**

- Total rows: **50,000**
- Total columns: **54**
- Train/Test split: **40,000 / 10,000**

**State-wise business signal (example)**

- CA: Premium 41.5M | Losses 133.0M | Claims 4,069
- FL: Premium 30.4M | Losses 72.9M | Claims 4,063
- NY: Premium 28.0M | Losses 85.0M | Claims 2,213
- TX emerged as top state by average CLV in summary output

**Interpretation**

- Loss concentration is materially higher than premium in several states.
- Portfolio profitability leakage is driven by adverse loss behavior.
- CLV segmentation is required to avoid uniform, inefficient spend.

---

## Slide 6: Model
**Modeling strategy**

- Regression objective: predict CLV value
- Classification objective: predict high-value customer
- High-value definition: top **20%** CLV (`quantile = 0.8`)
- High-value CLV cutoff: **3297.924**

**Selected production models**

- Regression winner: **Ridge**
  - R2: **0.99994**
  - MAE: **110.92**
  - RMSE: **155.06**

- Classification winner: **GradientBoostingClassifier**
  - Accuracy: **0.9771**
  - Precision: **0.9395**
  - Recall: **0.9465**
  - F1: **0.9430**
  - ROC-AUC: **0.9972**

**Top feature drivers (importance view)**

- `netloss_paid_am` (dominant)
- `monetary`
- `directwrittenpremium_am`
- `claim_rate`

---

## Slide 7: Outcome
**Business outcomes from the latest run**

- Total customers scored: **50,000**
- Total CLV (portfolio): **-238.4M**
- Average CLV (raw baseline): **-4767.74**
- Average predicted CLV: **-4768.01**
- High-value customers identified: **10,054** (**20.11%**)
- Profitable customer share: **78.57%**

**Action framework**

- High CLV + high risk: urgent retention intervention
- High CLV + low risk: loyalty and upsell
- Medium CLV: nurture programs
- Low CLV: low-cost automation

**Executive conclusion**

The platform is ready for data-driven budget allocation, customer prioritization, and scalable deployment through API and dashboard.

---

## Optional Slide 8: Implementation Snapshot
**Tech stack and deployment readiness**

- Backend: FastAPI + scikit-learn + MLflow
- Frontend: React + Vite + Recharts
- Supports single and batch prediction workflows
- Containerized for local and cloud deployment (Docker Compose / Azure Container Apps)

