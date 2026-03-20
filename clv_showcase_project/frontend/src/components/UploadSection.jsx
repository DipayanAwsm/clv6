import React, { useState } from 'react';

const parsePreview = (file) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '').trim();
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (!lines.length) {
        resolve({ headers: [], rows: [], totalRows: 0 });
        return;
      }

      const headers = lines[0].split(',').map((col) => col.trim());
      const rows = lines.slice(1, 6).map((line) => line.split(',').map((value) => value.trim()));

      resolve({ headers, rows, totalRows: Math.max(lines.length - 1, 0) });
    };
    reader.onerror = () => resolve({ headers: [], rows: [], totalRows: 0 });
    reader.readAsText(file);
  });

const UploadSection = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [localPreview, setLocalPreview] = useState({ headers: [], rows: [], totalRows: 0 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (candidate) => {
    setFile(candidate);
    setResult(null);
    setError('');

    if (!candidate) {
      setLocalPreview({ headers: [], rows: [], totalRows: 0 });
      return;
    }

    const preview = await parsePreview(candidate);
    setLocalPreview(preview);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    try {
      const response = await onUpload(file);
      setResult(response);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to score uploaded CSV.');
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = () => {
    if (!result?.predicted_csv) return;
    const blob = new Blob([result.predicted_csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `predictions_${result.filename || 'output'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="section-card">
      <div className="section-header-row">
        <h2>Batch Prediction Flow</h2>
        <span className="tag">Upload, Score, Download</span>
      </div>

      <div className="timeline-grid three-col">
        <article className="timeline-step">
          <p className="timeline-step-label">Step 1</p>
          <p>Select a CSV and validate schema preview.</p>
        </article>
        <article className="timeline-step">
          <p className="timeline-step-label">Step 2</p>
          <p>Score customers in batch using CLV + high-value models.</p>
        </article>
        <article className="timeline-step">
          <p className="timeline-step-label">Step 3</p>
          <p>Download enriched file with actions and customer segment tags.</p>
        </article>
      </div>

      <form className="upload-form" onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        />
        <button type="submit" disabled={!file || loading}>
          {loading ? 'Scoring...' : 'Upload and Predict'}
        </button>
      </form>

      {localPreview.headers.length ? (
        <div className="mini-card">
          <h3>Local File Preview</h3>
          <p>
            <strong>Estimated rows:</strong> {localPreview.totalRows} | <strong>Columns:</strong>{' '}
            {localPreview.headers.length}
          </p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {localPreview.headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {localPreview.rows.map((row, index) => (
                  <tr key={`preview-row-${index}`}>
                    {row.map((cell, cellIdx) => (
                      <td key={`cell-${index}-${cellIdx}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {error ? <p className="error-text">{error}</p> : null}

      {result ? (
        <div className="mini-card">
          <h3>Batch Scoring Results</h3>
          <p>{result.message}</p>
          <div className="metric-grid compact-grid">
            <div className="mini-stat">
              <p>Rows Processed</p>
              <strong>{result.rows_processed}</strong>
            </div>
            <div className="mini-stat">
              <p>Avg Predicted CLV</p>
              <strong>${Number(result.summary?.average_predicted_clv || 0).toLocaleString()}</strong>
            </div>
            <div className="mini-stat">
              <p>High-Value Customers</p>
              <strong>{result.summary?.high_value_customers || 0}</strong>
            </div>
            <div className="mini-stat">
              <p>High-Value Rate</p>
              <strong>{((result.summary?.high_value_rate || 0) * 100).toFixed(1)}%</strong>
            </div>
          </div>

          {result.missing_expected_features?.length ? (
            <p>
              <strong>Missing expected model features in upload:</strong>{' '}
              {result.missing_expected_features.join(', ')}
            </p>
          ) : null}

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Predicted CLV</th>
                  <th>High-Value</th>
                  <th>Probability</th>
                  <th>Segment</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {(result.preview || []).map((row, idx) => (
                  <tr key={`result-row-${idx}`}>
                    <td>{row.customer_id || `row_${idx + 1}`}</td>
                    <td>${Number(row.predicted_clv || 0).toLocaleString()}</td>
                    <td>{Number(row.high_value_flag) ? 'Yes' : 'No'}</td>
                    <td>{(Number(row.high_value_probability || 0) * 100).toFixed(1)}%</td>
                    <td>{row.customer_segment || 'N/A'}</td>
                    <td>{row.action_priority || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={downloadCsv}>Download Predicted CSV</button>
        </div>
      ) : null}
    </section>
  );
};

export default UploadSection;
