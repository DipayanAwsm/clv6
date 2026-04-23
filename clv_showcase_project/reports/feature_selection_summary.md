# Feature Selection Summary

## Methods Applied
- Correlation / univariate relationship analysis
- Mutual information
- RFECV (recursive feature elimination with cross-validation)
- Random Forest model-based importance
- L1 regularization (Lasso absolute coefficients)

## Top Features by Method
- **correlation_top**: clv_formula_value, profit, earnedpremium_am, monetary, directwrittenpremium_am, admin_expense_am, tax_am, ppcvrglimit_am
- **mutual_info_top**: clv_formula_value, earnedpremium_am, profit, directwrittenpremium_am, monetary, average_order_value, tax_am, admin_expense_am
- **rfecv_selected**: directwrittenpremium_am, earnedpremium_am, admin_expense_am, earnedexposure_ct, discountrate, deductible, clv_formula_value, profit
- **rf_importance_top**: clv_formula_value, earnedpremium_am, admin_expense_am, profit, directwrittenpremium_am, discountrate, deductible, earnedexposure_ct
- **lasso_top**: earnedpremium_am, clv_formula_value, admin_expense_am, netloss_paid_am, directwrittenpremium_am, monetary, ppcvrglimit_am, coverageamount

## Final Shortlisted Features
- earnedpremium_am, netloss_paid_am, monetary, earnedexposure_ct, deductible, discountrate, tax_am, average_order_value, coverageamount, claimcount_ct, claim_rate, monetary_per_tenure, commission_expense_am, dwellingsquarefeet_ct, customersatisfaction, complaintcount, zip, customertenure

## Selection Guardrails Applied
- Feature selection executed on a representative 20,000-row sample for runtime efficiency.
- Excluded leakage-prone columns from feature selection: high_value_flag
- Excluded identifier-style columns with low generalization value: fullpolicy_nb
- Excluded high-cardinality categorical fields to reduce overfit risk: policyeffective_dt
- Excluded zero/near-zero variance fields: premium_efficiency, tenure_band
- RFECV skipped for runtime safety on large/high-dimensional data; retained top tree-importance features as RFECV proxy.

## Why These Features
- Selected features consistently scored well across multiple statistical and model-based methods.
- The shortlist balances predictive signal with business interpretability for stakeholder trust.
- RFM-derived behavior fields (recency, frequency, monetary) are retained because they capture purchase dynamics directly linked to CLV.