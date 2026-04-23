# Model Comparison

## Regression Models (CLV Prediction)
| model                     |       r2 |          mae |         rmse |        mape |
|:--------------------------|---------:|-------------:|-------------:|------------:|
| LinearRegression          | 1        |  5.45652e-12 |  7.01948e-12 | 7.23933e-13 |
| Ridge                     | 1        |  0.254142    |  0.358896    | 0.0330109   |
| Lasso                     | 0.999999 |  0.797372    |  1.14122     | 0.102475    |
| RandomForestRegressor     | 0.999219 |  2.88445     | 42.9832      | 0.456964    |
| GradientBoostingRegressor | 0.99881  | 20.1003      | 53.0402      | 1.89561     |

## Classification Models (High-Value Identification)
| model                      |   accuracy |   precision |   recall |       f1 |   roc_auc |
|:---------------------------|-----------:|------------:|---------:|---------:|----------:|
| GradientBoostingClassifier |     0.9997 |     1       |   0.9985 | 0.999249 |  0.99996  |
| RandomForestClassifier     |     0.9995 |     1       |   0.9975 | 0.998748 |  1        |
| LogisticRegression         |     0.9974 |     0.99598 |   0.991  | 0.993484 |  0.999876 |

## Final Model Selection Rationale
- Selected regression model: **LinearRegression** based on strongest R2 with competitive MAE/RMSE stability.
- Selected classification model: **GradientBoostingClassifier** based on best F1 and recall balance for premium-customer capture.
- Selection prioritized business utility: high-value customer miss rate was treated as costly, so recall and F1 were emphasized.