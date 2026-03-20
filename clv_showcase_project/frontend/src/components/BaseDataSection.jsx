import React from 'react';
import MetricCard from './MetricCard';

const BaseDataSection = ({ profile }) => {
  const rows = profile?.shape?.rows || 0;
  const columns = profile?.shape?.columns || 0;
  const duplicateRows = profile?.duplicate_rows || 0;
  const missingValues = profile?.missing_values
    ? Object.values(profile.missing_values).reduce((acc, v) => acc + Number(v), 0)
    : 0;

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

      <div className="metric-grid">
        <MetricCard title="Customer Rows" value={rows.toLocaleString()} subtitle="records available" />
        <MetricCard title="Columns" value={columns.toLocaleString()} subtitle="feature fields" />
        <MetricCard title="Duplicates" value={duplicateRows.toLocaleString()} subtitle="duplicate row count" />
        <MetricCard title="Missing Cells" value={missingValues.toLocaleString()} subtitle="data quality watch" />
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
