import React from 'react';
import MetricCard from './MetricCard';

const BaseDataSection = ({ profile, eda }) => {
  const rows = profile?.shape?.rows || 0;
  const columns = profile?.shape?.columns || 0;
  const duplicateRows = profile?.duplicate_rows || 0;
  const missingValues = profile?.missing_values
    ? Object.values(profile.missing_values).reduce((acc, v) => acc + Number(v), 0)
    : 0;
  const targetReadiness = eda?.eda_metrics?.target_readiness || {};
  const targetColumn = eda?.eda_metrics?.target_column || 'not detected pre-model';
  const targetUnique = Number(targetReadiness?.target_unique_values || 0);
  const targetStd = Number(targetReadiness?.target_std || 0);
  const targetStatus =
    targetReadiness?.target_available && targetReadiness?.target_numeric && targetUnique > 10 && targetStd > 1e-6
      ? 'Ready'
      : 'Needs Derivation';

  const missingTop = Object.entries(profile?.missing_values || {})
    .filter(([, value]) => Number(value) > 0)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 5);

  const sourcePath = profile?.source_path || 'n/a';

  return (
    <section className="section-card">
      <div className="section-header-row">
        <h2>Base Data Profile</h2>
        <span className="tag">Input Quality Snapshot</span>
      </div>
      <p>Profile customer data quality, coverage, and target readiness before modeling.</p>

      <div className="metric-grid">
        <MetricCard title="Customer Rows" value={rows.toLocaleString()} subtitle="records available" />
        <MetricCard title="Columns" value={columns.toLocaleString()} subtitle="feature fields" />
        <MetricCard title="Duplicates" value={duplicateRows.toLocaleString()} subtitle="duplicate row count" />
        <MetricCard title="Missing Cells" value={missingValues.toLocaleString()} subtitle="data quality watch" />
        <MetricCard title="Target Readiness" value={targetStatus} subtitle={targetColumn} />
      </div>

      <article className="mini-card">
        <h3>Data Source & Quality Commentary</h3>
        <p>
          <strong>Source:</strong> {sourcePath}
        </p>
        <p>
          Quality checks include type profiling, duplicate scans, missingness diagnostics, and downstream fallback logic
          to keep modeling resilient even when some fields are unavailable.
        </p>
        {missingTop.length ? (
          <p>
            <strong>Top columns with missing values:</strong>{' '}
            {missingTop.map(([column, count]) => `${column} (${count})`).join(', ')}
          </p>
        ) : (
          <p>
            <strong>Missingness status:</strong> No major missing-value concentration detected in profiled columns.
          </p>
        )}
      </article>

      <article className="mini-card">
        <h3>Target Readiness Before Modeling</h3>
        <p>
          <strong>Detected target column:</strong> {targetColumn}
        </p>
        <p>
          <strong>Unique target values:</strong> {targetUnique.toLocaleString()} | <strong>Std Dev:</strong>{' '}
          {targetStd.toFixed(4)}
        </p>
        <p>
          If target readiness is low (constant or missing), the backend applies fallback target derivation logic so
          model training can proceed safely.
        </p>
      </article>

      <article className="mini-card">
        <h3>Columns</h3>
        <div className="chips-wrap">
          {(profile?.columns || []).map((col) => (
            <span key={col} className="chip">
              {col}
            </span>
          ))}
        </div>
      </article>
    </section>
  );
};

export default BaseDataSection;
