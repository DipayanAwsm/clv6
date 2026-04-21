# Assumptions

- Data source used: `/Users/rituparnapaldas/Documents/Exl_POC/clv6/clv6/clv_showcase_project/data/raw/predictions_clv_realistic_50000_5yr.csv`
- Dataset interpretation: **row_level**
- Pipeline uses adaptive feature engineering and gracefully skips unavailable derived features.
- XGBoost and SHAP are optional dependencies; fallback models and feature importance are used when unavailable.

## Run Notes
- Derived insurance-style CLV target using `earnedpremium_am - netloss_paid_am` and added profitability proxy `profit` after expenses.
- Target `predicted_clv` had insufficient variance; generated calibrated CLV target for modeling.
- Source `high_value_flag` was single-class; rebuilt high-value labels from CLV quantile.
- Feature selection executed on a representative 20,000-row sample for runtime efficiency.
- Excluded leakage-prone columns from feature selection: action_priority, customer_segment, high_value_flag, high_value_probability, predicted_clv, recommended_action
- Excluded identifier-style columns with low generalization value: fullpolicy_nb
- Excluded high-cardinality categorical fields to reduce overfit risk: policyeffective_dt
- Excluded zero/near-zero variance fields: premium_efficiency, tenure_band
- RFECV skipped for runtime safety on large/high-dimensional data; retained top tree-importance features as RFECV proxy.
- Using `high_value_flag` as classification target for high-value customer modeling.
- Created train/test datasets: /Users/rituparnapaldas/Documents/Exl_POC/clv6/clv6/clv_showcase_project/data/processed/training_dataset.csv (rows=40000), /Users/rituparnapaldas/Documents/Exl_POC/clv6/clv6/clv_showcase_project/data/processed/testing_dataset.csv (rows=10000).