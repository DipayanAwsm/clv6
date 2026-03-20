# EDA Summary

## Base Data Overview
- Rows: **1800**
- Columns: **16**
- Duplicate rows: **0**
- Numeric columns: **12**
- Categorical columns: **4**

## Data Quality
- Missing values report saved to `reports/metrics/missing_values_report.csv`.
- Numeric profile saved to `reports/metrics/numeric_summary.csv`.
- Categorical profile saved to `reports/metrics/categorical_summary.csv` when applicable.

## Business Interpretation
- CLV skew is moderate, suggesting value concentration exists but is not extreme.
- Complaint indicators should be tracked as service-experience risk signals that can suppress long-term value.
- No explicit payment delay feature was available; risk proxies should be added in future ingestion.
- Renewal behavior appears in the dataset and is expected to be a major CLV driver.
- High spend, long tenure, and healthy renewal behavior generally indicate premium-value customer profiles.

## Exploratory Drivers
- `total_spend` shows strong exploratory correlation with CLV (|corr|=0.67).
- `premium_amount` shows strong exploratory correlation with CLV (|corr|=0.64).
- `transactions` shows strong exploratory correlation with CLV (|corr|=0.57).
- `annual_income` shows strong exploratory correlation with CLV (|corr|=0.49).
- `renewals_count` shows strong exploratory correlation with CLV (|corr|=0.23).

## Artifacts
- `reports/figures/clv_histogram.png`
- `reports/figures/clv_boxplot.png`
- `reports/figures/correlation_heatmap.png`
- `reports/metrics/segment_summary.csv`