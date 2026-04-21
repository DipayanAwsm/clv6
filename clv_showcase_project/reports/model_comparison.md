# Model Comparison

## Regression Models (CLV Prediction)
| model                     |       r2 |           mae |          rmse |         mape |
|:--------------------------|---------:|--------------:|--------------:|-------------:|
| LinearRegression          | 1        |   2.16276e-09 |   3.91297e-09 |  1.17785e-10 |
| Ridge                     | 1        |   0.47005     |   0.831467    |  0.103597    |
| Lasso                     | 1        |   0.603982    |   1.06847     |  0.0833994   |
| GradientBoostingRegressor | 0.999614 | 102.947       | 406.706       | 25.3927      |
| RandomForestRegressor     | 0.999443 |  46.5474      | 488.688       |  3.10906     |

## Classification Models (High-Value Identification)
| model                      |   accuracy |   precision |   recall |       f1 |   roc_auc |
|:---------------------------|-----------:|------------:|---------:|---------:|----------:|
| GradientBoostingClassifier |     0.9997 |    1        |   0.9985 | 0.999249 |  0.999994 |
| RandomForestClassifier     |     0.9995 |    1        |   0.9975 | 0.998748 |  1        |
| LogisticRegression         |     0.996  |    0.993952 |   0.986  | 0.98996  |  0.998346 |

## Final Model Selection Rationale
- Selected regression model: **LinearRegression** based on strongest R2 with competitive MAE/RMSE stability.
- Selected classification model: **GradientBoostingClassifier** based on best F1 and recall balance for premium-customer capture.
- Selection prioritized business utility: high-value customer miss rate was treated as costly, so recall and F1 were emphasized.