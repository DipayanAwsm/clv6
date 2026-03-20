# Assumptions

- Data source used: `../data/raw/customer_clv_row_level.csv`
- Dataset interpretation: **row_level**
- Pipeline uses adaptive feature engineering and gracefully skips unavailable derived features.
- XGBoost and SHAP are optional dependencies; fallback models and feature importance are used when unavailable.

## Run Notes
- Created train/test datasets: /Users/rituparnapaldas/Documents/Exl_POC/clv6/clv6/clv_showcase_project/data/processed/training_dataset.csv (rows=1440), /Users/rituparnapaldas/Documents/Exl_POC/clv6/clv6/clv_showcase_project/data/processed/testing_dataset.csv (rows=360).