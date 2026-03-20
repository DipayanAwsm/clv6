from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import (
    GradientBoostingClassifier,
    GradientBoostingRegressor,
    RandomForestClassifier,
    RandomForestRegressor,
)
from sklearn.impute import SimpleImputer
from sklearn.linear_model import Lasso, LinearRegression, LogisticRegression, Ridge
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    mean_absolute_error,
    mean_squared_error,
    precision_score,
    r2_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from app.config import MODELS_ROOT
from app.utils import write_json
from training.common import LOGGER, METRICS_DIR, SAMPLE_INPUT_DIR


@dataclass
class TrainingResult:
    best_regression_model: str
    best_classification_model: str
    regression_metrics: pd.DataFrame
    classification_metrics: pd.DataFrame
    high_value_threshold_value: float
    train_rows: int
    test_rows: int


def _safe_mape(y_true: pd.Series, y_pred: np.ndarray) -> float | None:
    y_true_np = np.array(y_true, dtype=float)
    y_pred_np = np.array(y_pred, dtype=float)
    non_zero = np.abs(y_true_np) > 1e-8
    if non_zero.sum() == 0:
        return None
    return float(np.mean(np.abs((y_true_np[non_zero] - y_pred_np[non_zero]) / y_true_np[non_zero])) * 100)


def _build_preprocessor(X: pd.DataFrame, scale_numeric: bool) -> ColumnTransformer:
    numeric_features = X.select_dtypes(include=[np.number]).columns.tolist()
    categorical_features = [col for col in X.columns if col not in numeric_features]

    if scale_numeric:
        numeric_pipe = Pipeline(
            steps=[("imputer", SimpleImputer(strategy="median")), ("scaler", StandardScaler())]
        )
    else:
        numeric_pipe = Pipeline(steps=[("imputer", SimpleImputer(strategy="median"))])

    categorical_pipe = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    return ColumnTransformer(
        transformers=[
            ("num", numeric_pipe, numeric_features),
            ("cat", categorical_pipe, categorical_features),
        ]
    )


def _regression_candidates() -> List[Tuple[str, Any, bool]]:
    candidates: List[Tuple[str, Any, bool]] = [
        ("LinearRegression", LinearRegression(), True),
        ("Ridge", Ridge(alpha=1.0, random_state=42), True),
        ("Lasso", Lasso(alpha=0.001, random_state=42, max_iter=12000), True),
        ("RandomForestRegressor", RandomForestRegressor(n_estimators=320, random_state=42, n_jobs=1), False),
        ("GradientBoostingRegressor", GradientBoostingRegressor(random_state=42), False),
    ]

    try:
        from xgboost import XGBRegressor

        candidates.append(
            (
                "XGBoostRegressor",
                XGBRegressor(
                    n_estimators=350,
                    max_depth=5,
                    learning_rate=0.05,
                    subsample=0.9,
                    colsample_bytree=0.9,
                    reg_lambda=1.2,
                    random_state=42,
                    n_jobs=1,
                ),
                False,
            )
        )
    except Exception:
        LOGGER.info("xgboost not available, skipping XGBoost regressor")

    return candidates


def _classification_candidates() -> List[Tuple[str, Any, bool]]:
    candidates: List[Tuple[str, Any, bool]] = [
        ("LogisticRegression", LogisticRegression(max_iter=1500), True),
        ("RandomForestClassifier", RandomForestClassifier(n_estimators=320, random_state=42, n_jobs=1), False),
        ("GradientBoostingClassifier", GradientBoostingClassifier(random_state=42), False),
    ]

    try:
        from xgboost import XGBClassifier

        candidates.append(
            (
                "XGBoostClassifier",
                XGBClassifier(
                    n_estimators=320,
                    max_depth=4,
                    learning_rate=0.05,
                    subsample=0.9,
                    colsample_bytree=0.9,
                    eval_metric="logloss",
                    random_state=42,
                    n_jobs=1,
                ),
                False,
            )
        )
    except Exception:
        LOGGER.info("xgboost not available, skipping XGBoost classifier")

    return candidates


def train_and_select_models(
    df: pd.DataFrame,
    target_col: str,
    selected_features: List[str],
    high_value_quantile: float,
    dataset_meta: Dict[str, Any],
    train_df: pd.DataFrame | None = None,
    test_df: pd.DataFrame | None = None,
) -> TrainingResult:
    usable_features = [feature for feature in selected_features if feature in df.columns and feature != target_col]
    if not usable_features:
        raise ValueError("No usable features available after selection.")

    classification_target_col = dataset_meta.get("classification_target_column")

    if train_df is not None and test_df is not None:
        X_train = train_df[usable_features].copy()
        X_test = test_df[usable_features].copy()
        y_train_reg = pd.to_numeric(train_df[target_col], errors="coerce").fillna(
            train_df[target_col].median()
        )
        y_test_reg = pd.to_numeric(test_df[target_col], errors="coerce").fillna(
            test_df[target_col].median()
        )
    else:
        X = df[usable_features].copy()
        y_reg = pd.to_numeric(df[target_col], errors="coerce").fillna(df[target_col].median())
        X_train, X_test, y_train_reg, y_test_reg = train_test_split(
            X, y_reg, test_size=0.2, random_state=42
        )

    high_value_threshold = float(y_train_reg.quantile(high_value_quantile))
    if (
        classification_target_col
        and classification_target_col in (train_df.columns if train_df is not None else df.columns)
        and classification_target_col in (test_df.columns if test_df is not None else df.columns)
    ):
        source_train = train_df if train_df is not None else df.loc[X_train.index]
        source_test = test_df if test_df is not None else df.loc[X_test.index]
        y_train_cls = pd.to_numeric(source_train[classification_target_col], errors="coerce").fillna(0).astype(int)
        y_test_cls = pd.to_numeric(source_test[classification_target_col], errors="coerce").fillna(0).astype(int)
        if y_train_cls.nunique() < 2:
            y_train_cls = (y_train_reg >= high_value_threshold).astype(int)
            y_test_cls = (y_test_reg >= high_value_threshold).astype(int)
    else:
        y_train_cls = (y_train_reg >= high_value_threshold).astype(int)
        y_test_cls = (y_test_reg >= high_value_threshold).astype(int)

    if y_train_cls.nunique() < 2:
        median_threshold = float(y_train_reg.median())
        y_train_cls = (y_train_reg > median_threshold).astype(int)
        y_test_cls = (y_test_reg > median_threshold).astype(int)

    if y_train_cls.nunique() < 2:
        surrogate_candidates = [
            col
            for col in [
                "monetary",
                "total_spend",
                "directwrittenpremium_am",
                "earnedpremium_am",
                "coverageamount",
                "householdincome",
                "creditscore",
                "frequency",
                "customertenure",
            ]
            if col in X_train.columns and pd.api.types.is_numeric_dtype(X_train[col])
        ]

        if surrogate_candidates:
            train_signal = X_train[surrogate_candidates].rank(pct=True).mean(axis=1)
            test_signal = X_test[surrogate_candidates].rank(pct=True).mean(axis=1)
            cutoff = float(train_signal.quantile(high_value_quantile))
            y_train_cls = (train_signal >= cutoff).astype(int)
            y_test_cls = (test_signal >= cutoff).astype(int)
            classification_target_col = "surrogate_high_value_signal"
            dataset_meta.setdefault("notes", []).append(
                "Classification target lacked variance; created surrogate high-value classes "
                f"from: {', '.join(surrogate_candidates)}."
            )

    if y_train_cls.nunique() < 2:
        raise ValueError(
            "Unable to build classification target with at least two classes even after fallback."
        )

    reg_metrics: List[Dict[str, Any]] = []
    cls_metrics: List[Dict[str, Any]] = []
    trained_reg_models: Dict[str, Pipeline] = {}
    trained_cls_models: Dict[str, Pipeline] = {}

    for name, estimator, scale_numeric in _regression_candidates():
        preprocessor = _build_preprocessor(X_train, scale_numeric=scale_numeric)
        pipeline = Pipeline([("preprocessor", preprocessor), ("model", estimator)])
        pipeline.fit(X_train, y_train_reg)
        pred = pipeline.predict(X_test)

        rmse = float(np.sqrt(mean_squared_error(y_test_reg, pred)))
        mape = _safe_mape(y_test_reg, pred)
        reg_metrics.append(
            {
                "model": name,
                "r2": float(r2_score(y_test_reg, pred)),
                "mae": float(mean_absolute_error(y_test_reg, pred)),
                "rmse": rmse,
                "mape": mape,
            }
        )
        trained_reg_models[name] = pipeline

    for name, estimator, scale_numeric in _classification_candidates():
        preprocessor = _build_preprocessor(X_train, scale_numeric=scale_numeric)
        pipeline = Pipeline([("preprocessor", preprocessor), ("model", estimator)])
        pipeline.fit(X_train, y_train_cls)

        pred = pipeline.predict(X_test)
        if hasattr(pipeline, "predict_proba"):
            prob = pipeline.predict_proba(X_test)[:, 1]
        else:
            prob = pred.astype(float)

        try:
            roc = float(roc_auc_score(y_test_cls, prob))
        except Exception:
            roc = float("nan")

        cls_metrics.append(
            {
                "model": name,
                "accuracy": float(accuracy_score(y_test_cls, pred)),
                "precision": float(precision_score(y_test_cls, pred, zero_division=0)),
                "recall": float(recall_score(y_test_cls, pred, zero_division=0)),
                "f1": float(f1_score(y_test_cls, pred, zero_division=0)),
                "roc_auc": roc,
                "confusion_matrix": confusion_matrix(y_test_cls, pred).tolist(),
            }
        )
        trained_cls_models[name] = pipeline

    reg_df = pd.DataFrame(reg_metrics)
    reg_df["r2"] = reg_df["r2"].replace([np.inf, -np.inf], np.nan)
    reg_df["r2_sort"] = reg_df["r2"].fillna(-9999)
    reg_df.sort_values(["r2_sort", "rmse"], ascending=[False, True], inplace=True)
    reg_df.drop(columns=["r2_sort"], inplace=True)
    cls_df = pd.DataFrame(cls_metrics).sort_values(["f1", "recall", "roc_auc"], ascending=[False, False, False])

    best_reg_name = str(reg_df.iloc[0]["model"])
    best_cls_name = str(cls_df.iloc[0]["model"])

    best_reg_model = trained_reg_models[best_reg_name]
    best_cls_model = trained_cls_models[best_cls_name]

    joblib.dump(best_reg_model, MODELS_ROOT / "clv_regressor.pkl")
    joblib.dump(best_cls_model, MODELS_ROOT / "high_value_classifier.pkl")
    joblib.dump(best_reg_model.named_steps["preprocessor"], MODELS_ROOT / "preprocessing.pkl")

    reg_df.to_csv(METRICS_DIR / "regression_metrics.csv", index=False)
    cls_df.to_csv(METRICS_DIR / "classification_metrics.csv", index=False)

    metric_payload = {
        "regression": reg_df.to_dict(orient="records"),
        "classification": cls_df.to_dict(orient="records"),
        "selected_regression_model": best_reg_name,
        "selected_classification_model": best_cls_name,
    }
    write_json(METRICS_DIR / "model_metrics.json", metric_payload)

    metadata = {
        "created_at": datetime.utcnow().isoformat() + "Z",
        "dataset_type": dataset_meta.get("dataset_type"),
        "data_source": dataset_meta.get("data_source"),
        "target_column": target_col,
        "train_rows": int(len(X_train)),
        "test_rows": int(len(X_test)),
        "high_value_quantile": high_value_quantile,
        "high_value_threshold_value": high_value_threshold,
        "selected_features": usable_features,
        "training_features": usable_features,
        "regression_model_selected": best_reg_name,
        "classification_model_selected": best_cls_name,
        "notes": dataset_meta.get("notes", []),
        "classification_target_column": classification_target_col or "derived_from_clv_quantile",
    }
    write_json(MODELS_ROOT / "metadata.json", metadata)

    sample_batch = X_test.head(25).copy()
    sample_batch.to_csv(SAMPLE_INPUT_DIR / "prediction_sample.csv", index=False)

    LOGGER.info(
        "Training complete. Best regression model=%s, best classifier=%s",
        best_reg_name,
        best_cls_name,
    )

    return TrainingResult(
        best_regression_model=best_reg_name,
        best_classification_model=best_cls_name,
        regression_metrics=reg_df,
        classification_metrics=cls_df,
        high_value_threshold_value=high_value_threshold,
        train_rows=int(len(X_train)),
        test_rows=int(len(X_test)),
    )
