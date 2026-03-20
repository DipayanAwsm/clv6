# Feature Selection Summary

## Methods Applied
- Correlation / univariate relationship analysis
- Mutual information
- RFECV (recursive feature elimination with cross-validation)
- Random Forest model-based importance
- L1 regularization (Lasso absolute coefficients)

## Top Features by Method
- **correlation_top**: total_spend, monetary, premium_amount, engagement_score, transactions, frequency, annual_income, average_order_value
- **mutual_info_top**: monetary, total_spend, premium_amount, engagement_score, transactions, frequency, annual_income, monetary_per_tenure
- **rfecv_selected**: age, annual_income, tenure_months, total_spend, premium_amount, recency, monetary, average_order_value
- **rf_importance_top**: annual_income, total_spend, monetary, engagement_score, premium_amount, tenure_months, average_order_value, renewal_ratio
- **lasso_top**: total_spend, annual_income, renewal_ratio, transactions, days_since_last_purchase, tenure_months, complaint_rate, renewals_count

## Final Shortlisted Features
- total_spend, annual_income, monetary, average_order_value, frequency, premium_efficiency, age, renewals_count, monetary_per_tenure, complaints_count, claim_rate, tenure_band, region, channel, engagement_style

## Selection Guardrails Applied
- No additional guardrails were required.

## Why These Features
- Selected features consistently scored well across multiple statistical and model-based methods.
- The shortlist balances predictive signal with business interpretability for stakeholder trust.
- RFM-derived behavior fields (recency, frequency, monetary) are retained because they capture purchase dynamics directly linked to CLV.