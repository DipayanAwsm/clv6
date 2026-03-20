# Model Comparison

## Regression Models (CLV Prediction)
| model                     |       r2 |     mae |    rmse |    mape |
|:--------------------------|---------:|--------:|--------:|--------:|
| Ridge                     | 0.77524  | 311.077 | 399.559 | 8.18103 |
| Lasso                     | 0.775214 | 311.16  | 399.582 | 8.18343 |
| LinearRegression          | 0.775214 | 311.161 | 399.582 | 8.18345 |
| RandomForestRegressor     | 0.759246 | 324.867 | 413.531 | 8.54171 |
| GradientBoostingRegressor | 0.75202  | 324.41  | 419.692 | 8.48643 |
| XGBoostRegressor          | 0.744824 | 330.093 | 425.737 | 8.61256 |

## Classification Models (High-Value Identification)
| model                      |   accuracy |   precision |   recall |       f1 |   roc_auc |
|:---------------------------|-----------:|------------:|---------:|---------:|----------:|
| LogisticRegression         |   0.916667 |    0.797101 | 0.774648 | 0.785714 |  0.962864 |
| XGBoostClassifier          |   0.911111 |    0.767123 | 0.788732 | 0.777778 |  0.95531  |
| GradientBoostingClassifier |   0.911111 |    0.782609 | 0.760563 | 0.771429 |  0.947415 |
| RandomForestClassifier     |   0.908333 |    0.787879 | 0.732394 | 0.759124 |  0.952775 |

## Final Model Selection Rationale
- Selected regression model: **Ridge** based on strongest R2 with competitive MAE/RMSE stability.
- Selected classification model: **LogisticRegression** based on best F1 and recall balance for premium-customer capture.
- Selection prioritized business utility: high-value customer miss rate was treated as costly, so recall and F1 were emphasized.