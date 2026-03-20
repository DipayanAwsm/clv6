import React from 'react';

const PredictionResult = ({ result }) => {
  if (!result) {
    return (
      <div className="result-card muted">
        Submit customer features to receive CLV prediction, premium probability, action priority, and recommended budget
        treatment.
      </div>
    );
  }

  const context = result.prediction_context || {};

  return (
    <div className="result-card">
      <h3>Prediction Output</h3>
      <p>
        <strong>Predicted CLV:</strong> ${Number(result.predicted_clv).toLocaleString()}
      </p>
      <p>
        <strong>High-Value Customer:</strong> {result.high_value_flag ? 'Yes' : 'No'}
      </p>
      <p>
        <strong>High-Value Probability:</strong> {(Number(result.high_value_probability) * 100).toFixed(1)}%
      </p>
      <p>
        <strong>Confidence Band:</strong> {context.confidence_band || 'n/a'} | <strong>Segment:</strong>{' '}
        {context.customer_segment || 'n/a'}
      </p>
      <p>
        <strong>Churn-Risk Score:</strong> {Number(context.churn_risk_score || 0).toFixed(2)} |{' '}
        <strong>Action Priority:</strong> {context.action_priority || 'n/a'}
      </p>
      <p>
        <strong>Input Completeness:</strong> {((Number(context.input_completeness || 0)) * 100).toFixed(1)}%
      </p>
      <p>
        <strong>Narrative:</strong> {result.explanation_message}
      </p>

      <div>
        <strong>Selected Input Fields:</strong>
        <p>{(result.selected_input_fields || []).join(', ')}</p>
      </div>
      {result.missing_expected_fields?.length ? (
        <div>
          <strong>Missing Expected Fields:</strong>
          <p>{result.missing_expected_fields.join(', ')}</p>
        </div>
      ) : null}
      <div>
        <strong>Top Reason Codes:</strong>
        <ul>
          {(result.top_reason_codes || []).map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </div>
      <p>
        <strong>Recommended Action:</strong> {result.recommended_action}
      </p>
      <p>
        <strong>Budget Treatment:</strong> {result.budget_treatment}
      </p>
      <p>
        <strong>Scoring Models:</strong> {result.model_context?.regression_model || 'n/a'} (CLV) +{' '}
        {result.model_context?.classification_model || 'n/a'} (High Value)
      </p>
    </div>
  );
};

export default PredictionResult;
