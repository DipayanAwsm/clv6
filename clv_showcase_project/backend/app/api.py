from __future__ import annotations

import io
from typing import Any, Dict

import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from app.config import MODELS_ROOT, REPORTS_ROOT
from app.insights import safe_top_rows
from app.predictor import CLVPredictor, load_predictor_or_none
from app.schemas import (
    BatchPredictionRequest,
    BatchPredictionResponse,
    BusinessSummaryResponse,
    HealthResponse,
    ModelInfoResponse,
    PredictionRequest,
    PredictionResponse,
    UploadPredictionResponse,
)
from app.utils import get_logger, read_json, read_text

LOGGER = get_logger("clv-api")
router = APIRouter()
PREDICTOR: CLVPredictor | None = load_predictor_or_none()
API_VERSION = "1.2.0"


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        model_ready=PREDICTOR is not None,
        api_version=API_VERSION,
    )


@router.get("/metadata")
def metadata() -> Dict[str, Any]:
    metadata_path = MODELS_ROOT / "metadata.json"
    metadata_obj = read_json(metadata_path, default={})
    if not metadata_obj:
        raise HTTPException(status_code=404, detail="Model metadata not found.")

    return {
        **metadata_obj,
        "api_version": API_VERSION,
        "platform_message": (
            "Model metadata loaded. Use this payload to understand selected models, feature set, and high-value threshold."
        ),
        "decision_rules": {
            "high_value_definition": "Customers above configured CLV quantile are classified as high value.",
            "recommended_operating_mode": "Run batch scoring weekly and trigger action playbooks from prediction output.",
        },
    }


@router.get("/mlflow-info")
def mlflow_info() -> Dict[str, Any]:
    metadata_path = MODELS_ROOT / "metadata.json"
    metadata_obj = read_json(metadata_path, default={})
    if not metadata_obj:
        raise HTTPException(status_code=404, detail="Model metadata not found.")

    mlflow_obj = metadata_obj.get("mlflow", {})
    return {
        "enabled": bool(mlflow_obj.get("enabled", False)),
        "tracking_uri": mlflow_obj.get("tracking_uri"),
        "experiment_name": mlflow_obj.get("experiment_name"),
        "run_id": mlflow_obj.get("run_id"),
        "regressor_model_uri": mlflow_obj.get("regressor_model_uri"),
        "classifier_model_uri": mlflow_obj.get("classifier_model_uri"),
        "message": (
            "MLflow integration details for this trained model set. "
            "Use run_id/model_uri values to inspect experiments and load registry artifacts."
        ),
    }


@router.get("/model-metrics")
def model_metrics() -> Dict[str, Any]:
    metrics = read_json(REPORTS_ROOT / "metrics" / "model_metrics.json", default={})
    if not metrics:
        raise HTTPException(status_code=404, detail="Model metrics not found.")

    reg = metrics.get("regression", [])
    cls = metrics.get("classification", [])

    return {
        **metrics,
        "api_version": API_VERSION,
        "summary": {
            "regression_models_tested": len(reg),
            "classification_models_tested": len(cls),
            "selection_note": "Models are selected using objective holdout performance and business-priority metrics.",
            "business_takeaway": "Final models balance predictive strength with practical decision utility.",
        },
    }


@router.get("/eda-summary")
def eda_summary() -> Dict[str, Any]:
    profile = read_json(REPORTS_ROOT / "metrics" / "dataset_profile.json", default={})
    eda_json = read_json(REPORTS_ROOT / "metrics" / "eda_summary.json", default={})
    summary_md = read_text(REPORTS_ROOT / "eda_summary.md", default="")
    if not profile and not summary_md and not eda_json:
        raise HTTPException(status_code=404, detail="EDA summary not found.")

    top_drivers = eda_json.get("top_drivers", [])
    top_driver_names = [item.get("feature", "") for item in top_drivers[:3] if item.get("feature")]
    state_summary = eda_json.get("state_wise_summary", {})
    state_rows = state_summary.get("rows", []) if isinstance(state_summary, dict) else []
    top_state_by_premium = state_rows[0].get("state") if state_rows else None

    return {
        "profile": profile,
        "eda_metrics": eda_json,
        "state_wise_summary": state_summary,
        "summary_markdown": summary_md,
        "key_findings": [
            "CLV distributions are typically concentrated; a small segment can drive outsized long-term value.",
            "Recency, frequency, and monetary behavior remain core value drivers.",
            (
                f"State-wise premium/loss/claim EDA is available; top premium state in this run: {top_state_by_premium}."
                if top_state_by_premium
                else "State-wise premium/loss/claim EDA was unavailable for this run."
            ),
            (
                f"Top exploratory drivers in this run: {', '.join(top_driver_names)}."
                if top_driver_names
                else "Top exploratory drivers were unavailable for this run."
            ),
        ],
    }


@router.get("/feature-selection-summary")
def feature_selection_summary() -> Dict[str, Any]:
    summary_json = read_json(
        REPORTS_ROOT / "metrics" / "feature_selection_summary.json", default={}
    )
    summary_md = read_text(REPORTS_ROOT / "feature_selection_summary.md", default="")

    shortlist = summary_json.get("final_shortlist", [])

    return {
        "summary": summary_json,
        "summary_markdown": summary_md,
        "plain_english": {
            "what_happened": "Multiple feature selection methods voted on signal strength.",
            "how_to_read": "Features appearing across many methods are usually more reliable drivers.",
            "final_shortlist_count": len(shortlist),
            "why_it_matters": "A compact, high-signal feature set improves generalization and explainability.",
        },
    }


def _ensure_predictor() -> CLVPredictor:
    if PREDICTOR is None:
        raise HTTPException(
            status_code=503,
            detail="Predictor artifacts are not ready. Run backend/training/run_pipeline.py.",
        )
    return PREDICTOR


def _score_dataframe(
    df: pd.DataFrame,
    predictor: CLVPredictor,
) -> tuple[pd.DataFrame, list[Dict[str, Any]], Dict[str, Any], list[str]]:
    records = df.to_dict(orient="records")
    predictions = predictor.predict_batch(records)
    summary = predictor.summarize_batch(predictions)

    output_df = df.copy()
    output_df["predicted_clv"] = [item["predicted_clv"] for item in predictions]
    output_df["high_value_flag"] = [item["high_value_flag"] for item in predictions]
    output_df["high_value_probability"] = [
        item["high_value_probability"] for item in predictions
    ]
    output_df["customer_segment"] = [
        item.get("prediction_context", {}).get("customer_segment", "Unknown")
        for item in predictions
    ]
    output_df["action_priority"] = [
        item.get("prediction_context", {}).get("action_priority", "baseline")
        for item in predictions
    ]
    output_df["recommended_action"] = [
        item.get("recommended_action", "") for item in predictions
    ]

    incoming_columns = list(df.columns)
    missing_expected = [
        feature for feature in predictor.expected_features if feature not in incoming_columns
    ]

    return output_df, predictions, summary, missing_expected


@router.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest) -> PredictionResponse:
    predictor = _ensure_predictor()
    try:
        result = predictor.predict_single(payload.model_dump())
        return PredictionResponse(**result)
    except Exception as exc:
        LOGGER.exception("Prediction failed")
        raise HTTPException(status_code=400, detail=f"Prediction failed: {exc}") from exc


@router.post("/predict-batch", response_model=BatchPredictionResponse)
def predict_batch(payload: BatchPredictionRequest) -> BatchPredictionResponse:
    predictor = _ensure_predictor()
    try:
        predictions = predictor.predict_batch(payload.records)
        summary = predictor.summarize_batch(predictions)
        return BatchPredictionResponse(
            predictions=predictions,
            count=len(predictions),
            summary=summary,
            message="Batch scoring complete. Use summary to prioritize customer actions.",
        )
    except Exception as exc:
        LOGGER.exception("Batch prediction failed")
        raise HTTPException(status_code=400, detail=f"Batch prediction failed: {exc}") from exc


@router.post("/predict/single", response_model=PredictionResponse)
def predict_single_alias(payload: PredictionRequest) -> PredictionResponse:
    return predict(payload)


@router.post("/predict/batch")
async def predict_batch_csv(file: UploadFile = File(...)) -> StreamingResponse:
    predictor = _ensure_predictor()

    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Please upload a CSV file.")

    try:
        raw = await file.read()
        input_df = pd.read_csv(io.BytesIO(raw))
        output_df, _, _, _ = _score_dataframe(input_df, predictor)
        csv_buffer = io.StringIO()
        output_df.to_csv(csv_buffer, index=False)
        csv_buffer.seek(0)
    except Exception as exc:
        LOGGER.exception("CSV batch prediction endpoint failed")
        raise HTTPException(status_code=400, detail=f"Batch prediction failed: {exc}") from exc

    headers = {"Content-Disposition": "attachment; filename=clv_batch_predictions.csv"}
    return StreamingResponse(csv_buffer, media_type="text/csv", headers=headers)


@router.post("/upload-csv-and-predict", response_model=UploadPredictionResponse)
async def upload_csv_and_predict(file: UploadFile = File(...)) -> UploadPredictionResponse:
    predictor = _ensure_predictor()

    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    try:
        raw = await file.read()
        df = pd.read_csv(io.BytesIO(raw))
        output_df, predictions, summary, missing_expected = _score_dataframe(df, predictor)

        csv_buffer = io.StringIO()
        output_df.to_csv(csv_buffer, index=False)

        incoming_columns = list(df.columns)

        preview_columns = [
            col
            for col in [
                "customer_id",
                "predicted_clv",
                "high_value_flag",
                "high_value_probability",
                "customer_segment",
                "action_priority",
                "recommended_action",
            ]
            if col in output_df.columns
        ]
        preview = safe_top_rows(output_df[preview_columns])

        return UploadPredictionResponse(
            filename=file.filename,
            rows_processed=len(df),
            columns_received=incoming_columns,
            missing_expected_features=missing_expected,
            summary=summary,
            preview=preview,
            predictions=predictions,
            predicted_csv=csv_buffer.getvalue(),
            message=(
                "CSV scoring complete. Download the enriched file and use segment/action columns for campaign execution."
            ),
        )
    except Exception as exc:
        LOGGER.exception("CSV upload prediction failed")
        raise HTTPException(status_code=400, detail=f"Failed to process CSV: {exc}") from exc


@router.get("/model/info", response_model=ModelInfoResponse)
def model_info() -> Dict[str, Any]:
    metadata_obj = read_json(MODELS_ROOT / "metadata.json", default={})
    metrics_obj = read_json(REPORTS_ROOT / "metrics" / "model_metrics.json", default={})
    if not metadata_obj:
        raise HTTPException(status_code=404, detail="Model metadata not found.")

    return {
        "best_regression_model": metadata_obj.get("regression_model_selected"),
        "best_classification_model": metadata_obj.get("classification_model_selected"),
        "regression_metrics": next(
            (
                row
                for row in metrics_obj.get("regression", [])
                if row.get("model") == metadata_obj.get("regression_model_selected")
            ),
            {},
        ),
        "classification_metrics": next(
            (
                row
                for row in metrics_obj.get("classification", [])
                if row.get("model") == metadata_obj.get("classification_model_selected")
            ),
            {},
        ),
        "target_definition": metadata_obj.get("target_definition", {}),
        "features_used": metadata_obj.get("selected_features", []),
        "high_value_threshold_value": metadata_obj.get("high_value_threshold_value"),
    }


@router.get("/business/summary", response_model=BusinessSummaryResponse)
def business_summary() -> Dict[str, Any]:
    summary = read_json(REPORTS_ROOT / "metrics" / "business_summary.json", default={})
    if summary:
        return summary

    # Fallback if training summary artifact is unavailable.
    scored_df_path = REPORTS_ROOT.parent / "data" / "processed" / "scored_customers.csv"
    if scored_df_path.exists():
        df = pd.read_csv(scored_df_path)
        if not df.empty and "predicted_clv" in df.columns:
            return {
                "total_customers": int(len(df)),
                "total_predicted_clv": float(df["predicted_clv"].sum()),
                "average_predicted_clv": float(df["predicted_clv"].mean()),
                "high_value_percentage": float(df.get("high_value_flag", pd.Series(dtype=float)).mean() * 100)
                if "high_value_flag" in df.columns
                else 0.0,
                "profitable_percentage": float((df.get("profit", pd.Series(dtype=float)) > 0).mean() * 100)
                if "profit" in df.columns
                else 0.0,
                "top_state_by_clv": None,
            }

    raise HTTPException(status_code=404, detail="Business summary not found. Run training pipeline.")
