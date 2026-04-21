# CLV Intelligence Frontend

Premium, enterprise-grade React frontend for a Customer Lifetime Value (CLV) analytics platform focused on insurance/home policy portfolios.

This UI is designed for:
- manager demos
- client demos
- leadership walkthroughs
- analytics storytelling without a technical narrator

## Product Experience

The app is structured as a full analytics SaaS journey:
1. Executive Summary
2. EDA Overview
3. Segmentation
4. Channel Insights
5. Model Insights
6. SHAP Analysis
7. Prediction Studio

Each page explicitly answers a business question and includes:
- title
- subtitle
- helper explanation
- business takeaway

## Tech Stack

- React 18 + Vite
- TypeScript
- Tailwind CSS
- Recharts
- Framer Motion
- Lucide React icons

## Run Locally

From `/Users/rituparnapaldas/Documents/Exl_POC/clv6/clv6/clv_showcase_project/frontend`:

```bash
npm install
npm run dev
```

Open: `http://localhost:5173`

Production build:

```bash
npm run build
npm run preview
```

If visuals look unstyled, run a clean dependency install:

```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Live Backend Data Mode

The dashboard now tries backend APIs first and falls back to mock data only if backend is unavailable.

Backend endpoints used:
- `/business/summary`
- `/eda-summary`
- `/model-metrics`
- `/feature-selection-summary`
- `/metadata`
- `/predict`
- `/predict-batch`

Set backend URL:

```bash
VITE_API_BASE_URL=http://localhost:8000 npm run dev
```

## Project Structure

```text
frontend/
  src/
    api/
      client.ts
    components/
      cards/
      charts/
      common/
      filters/
      forms/
      layout/
      shap/
      tables/
    data/
      mockData.ts
    hooks/
      useDashboardData.ts
      usePrediction.ts
    pages/
      DashboardHome/
      EDAOverview/
      Segmentation/
      ChannelPerformance/
      ModelInsights/
      ShapExplainability/
      PredictionStudio/
    types.ts
    utils/
      cn.ts
      format.ts
    App.tsx
    main.tsx
    index.css
```

## Data Model and Filters

The UI currently uses realistic mock portfolio data from `src/data/mockData.ts`.

Global filters apply across all pages:
- `POLICYRATEDSTATE_TP` equivalent (`state`)
- `year`

Filtering pipeline:
- Filter state/year in `App.tsx`
- Aggregation + chart datasets generated in `useDashboardData.ts`
- Pages consume a single typed `DashboardDataBundle`

## Prediction Studio (Single + Batch)

### Single Prediction
Form-based scoring with fields such as:
- state, year
- earned premium, net loss paid
- tenure, credit score
- payment delay, satisfaction
- claim count, deductible, coverage
- marketing channel, agent experience

Outputs:
- predicted CLV
- segment
- recommended action

### Batch Upload
- CSV upload via drag/drop zone
- parsed + scored rows preview
- download enriched results CSV

Expected CSV headers (case-insensitive aliases supported):
- `state`
- `year`
- `earnedPremium` / `earned_premium`
- `netLossPaid` / `net_loss_paid`
- `customerTenure` / `customer_tenure`
- `creditScore` / `credit_score`
- `paymentDelayDays` / `payment_delay_days`
- `customerSatisfaction` / `customer_satisfaction`
- `claimCount` / `claim_count`
- `deductible`
- `coverageAmount` / `coverage_amount`
- `marketingChannel` / `marketing_channel`
- `agentExperienceYears` / `agent_experience_years`
- `discountRate` / `discount_rate`

## API Integration Notes

This frontend is API-ready.

Replace mock hooks with backend calls:
- `src/hooks/useDashboardData.ts`
- `src/hooks/usePrediction.ts`

Use shared API client:
- `src/api/client.ts`

Recommended backend endpoints:
- `GET /metadata`
- `GET /model-metrics`
- `GET /eda-summary`
- `GET /feature-selection-summary`
- `POST /predict`
- `POST /predict-batch`

## UI and UX Principles

- Executive-friendly visual hierarchy
- Self-explanatory charts and text
- Business-action orientation, not raw technical output
- Subtle motion only (Framer Motion)
- Responsive layout (desktop-first, tablet/mobile compatible)

## Theming

- Light mode default
- Dark mode toggle in top bar
- Theme persisted in local storage

## Future Enhancements

1. Wire live backend scoring and explainability APIs.
2. Add role-based views (executive, underwriting, retention ops).
3. Add export-to-PDF board summary.
4. Add alerting for segment migration and CLV decline.
5. Add backend-driven feature selection and SHAP payloads.
