from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd

from app.config import MODELS_ROOT
from app.insights import (
    confidence_band,
    customer_segment_from_clv,
    explanation_message,
    infer_churn_risk_score,
    reason_codes,
    recommended_strategy,
    summarize_batch_predictions,
)
from app.utils import get_logger, read_json

LOGGER = get_logger("clv-predictor")


@dataclass
class PredictionArtifactBundle:
    regressor: Any
    classifier: Any
    preprocessing: Any
    metadata: Dict[str, Any]


class CLVPredictor:
    def __init__(self, models_root: Path = MODELS_ROOT) -> None:
        self.models_root = models_root
        self.bundle = self._load_artifacts()

    def _load_artifacts(self) -> PredictionArtifactBundle:
        reg_path = self.models_root / "clv_regressor.pkl"
        cls_path = self.models_root / "high_value_classifier.pkl"
        prep_path = self.models_root / "preprocessing.pkl"
        metadata_path = self.models_root / "metadata.json"

        if not reg_path.exists() or not cls_path.exists() or not metadata_path.exists():
            raise FileNotFoundError(
                "Required model artifacts are missing. Run backend/training/run_pipeline.py first."
            )

        regressor = joblib.load(reg_path)
        classifier = joblib.load(cls_path)
        preprocessing = joblib.load(prep_path) if prep_path.exists() else None
        metadata = read_json(metadata_path, default={})
        return PredictionArtifactBundle(regressor, classifier, preprocessing, metadata)

    @property
    def is_ready(self) -> bool:
        return self.bundle is not None

    @property
    def expected_features(self) -> List[str]:
        features = self.bundle.metadata.get("selected_features")
        if features:
            return list(features)
        return self.bundle.metadata.get("training_features", [])

    @property
    def high_value_threshold(self) -> float:
        return float(self.bundle.metadata.get("high_value_threshold_value", 0.0))

    @property
    def model_context(self) -> Dict[str, Any]:
        metadata = self.bundle.metadata
        return {
            "regression_model": metadata.get("regression_model_selected", "unknown"),
            "classification_model": metadata.get("classification_model_selected", "unknown"),
            "high_value_threshold_value": float(metadata.get("high_value_threshold_value", 0.0)),
            "high_value_quantile": metadata.get("high_value_quantile"),
        }

    def _prepare_dataframes(self, records: List[Dict[str, Any]]) -> Tuple[pd.DataFrame, pd.DataFrame]:
        raw_df = pd.DataFrame(records)
        if raw_df.empty:
            raise ValueError("No records were provided for prediction.")

        model_df = raw_df.copy()
        for col in self.expected_features:
            if col not in model_df.columns:
                model_df[col] = np.nan

        if self.expected_features:
            model_df = model_df[self.expected_features]

        return raw_df, model_df

    def _input_details(self, raw_row: pd.Series) -> Tuple[List[str], List[str], float]:
        expected = self.expected_features
        selected_fields = [key for key, value in raw_row.to_dict().items() if pd.notna(value)]

        missing_expected = [
            feature for feature in expected if pd.isna(raw_row.get(feature, np.nan))
        ]

        if expected:
            completeness = round((len(expected) - len(missing_expected)) / len(expected), 4)
        else:
            completeness = 1.0

        return selected_fields[:10], missing_expected, completeness

    def predict_batch(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        raw_df, model_df = self._prepare_dataframes(records)

        clv_predictions = np.array(self.bundle.regressor.predict(model_df), dtype=float)
        if hasattr(self.bundle.classifier, "predict_proba"):
            probabilities = np.array(
                self.bundle.classifier.predict_proba(model_df)[:, 1], dtype=float
            )
        else:
            raw_pred = self.bundle.classifier.predict(model_df)
            probabilities = np.array(raw_pred, dtype=float)

        flags = (probabilities >= 0.5).astype(int)

        outputs: List[Dict[str, Any]] = []
        for idx in range(len(model_df)):
            model_row = model_df.iloc[idx]
            raw_row = raw_df.iloc[idx]

            clv_value = float(clv_predictions[idx])
            prob = float(probabilities[idx])
            flag = int(flags[idx])
            churn_risk = infer_churn_risk_score(model_row)

            reason_list = reason_codes(model_row, flag, clv_value, churn_risk)
            strategy = recommended_strategy(flag, prob, churn_risk)
            segment = customer_segment_from_clv(clv_value, self.high_value_threshold)
            selected_fields, missing_fields, completeness = self._input_details(raw_row)

            payload = {
                "predicted_clv": round(clv_value, 2),
                "high_value_flag": flag,
                "high_value_probability": round(prob, 4),
                "selected_input_fields": selected_fields,
                "missing_expected_fields": missing_fields,
                "top_reason_codes": reason_list,
                "explanation_message": explanation_message(clv_value, flag, prob, churn_risk),
                "recommended_action": strategy["recommended_action"],
                "budget_treatment": strategy["budget_treatment"],
                "prediction_context": {
                    "customer_segment": segment,
                    "confidence_band": confidence_band(prob),
                    "churn_risk_score": churn_risk,
                    "input_completeness": completeness,
                    "action_priority": strategy["action_priority"],
                },
                "model_context": self.model_context,
            }

            customer_id = raw_row.get("customer_id")
            if pd.notna(customer_id):
                payload["customer_id"] = customer_id

            outputs.append(payload)

        return outputs

    def summarize_batch(self, predictions: List[Dict[str, Any]]) -> Dict[str, Any]:
        return summarize_batch_predictions(predictions)

    def predict_single(self, record: Dict[str, Any]) -> Dict[str, Any]:
        return self.predict_batch([record])[0]


def load_predictor_or_none() -> CLVPredictor | None:
    try:
        return CLVPredictor()
    except Exception as exc:  # pragma: no cover - startup resilience
        LOGGER.warning("Predictor artifacts unavailable: %s", exc)
        return None
