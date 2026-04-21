import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const numberFmt = (value) => {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return '0';
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
};

const topByMetric = (rows, metric, limit = 10) =>
  [...rows]
    .sort((a, b) => Number(b?.[metric] || 0) - Number(a?.[metric] || 0))
    .slice(0, limit);

const EDASection = ({ eda }) => {
  const topDrivers = eda?.eda_metrics?.top_drivers || [];
  const summaryMarkdown = eda?.summary_markdown || '';
  const keyFindings = eda?.key_findings || [];
  const stateRows = eda?.state_wise_summary?.rows || eda?.eda_metrics?.state_wise_summary?.rows || [];
  const premiumByState = topByMetric(stateRows, 'total_premium');
  const lossesByState = topByMetric(stateRows, 'total_losses');
  const claimsByState = topByMetric(stateRows, 'total_claim_count');
  const hasStateEda = stateRows.length > 0;

  return (
    <section className="section-card">
      <div className="section-header-row">
        <h2>Exploratory Data Analysis</h2>
        <span className="tag">Business + Statistical Lens</span>
      </div>
      <p>
        EDA validates whether customer value is concentrated, which features correlate with CLV, and where service or
        retention risk may be emerging.
      </p>

      {keyFindings.length ? (
        <article className="mini-card">
          <h3>Executive Key Findings</h3>
          <ul>
            {keyFindings.map((finding) => (
              <li key={finding}>{finding}</li>
            ))}
          </ul>
        </article>
      ) : null}

      <div className="chart-wrapper">
        <h3>Top Exploratory Drivers of CLV</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={topDrivers} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="feature" angle={-25} textAnchor="end" height={70} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="abs_corr" fill="#0f766e" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {hasStateEda ? (
        <>
          <article className="mini-card">
            <h3>State-Wise EDA Overview</h3>
            <p>
              Portfolio distribution by state for premium, losses, and claim count. These views help identify where
              value concentration and claims burden are strongest.
            </p>
          </article>

          <div className="state-eda-grid">
            <div className="chart-wrapper">
              <h3>State-Wise Premium</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={premiumByState} margin={{ top: 10, right: 15, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="state" angle={-20} textAnchor="end" height={60} />
                  <YAxis tickFormatter={numberFmt} />
                  <Tooltip formatter={(value) => numberFmt(value)} />
                  <Bar dataKey="total_premium" fill="#0e4a8a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-wrapper">
              <h3>State-Wise Losses</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={lossesByState} margin={{ top: 10, right: 15, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="state" angle={-20} textAnchor="end" height={60} />
                  <YAxis tickFormatter={numberFmt} />
                  <Tooltip formatter={(value) => numberFmt(value)} />
                  <Bar dataKey="total_losses" fill="#b45309" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-wrapper">
              <h3>State-Wise Claim Count</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={claimsByState} margin={{ top: 10, right: 15, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="state" angle={-20} textAnchor="end" height={60} />
                  <YAxis tickFormatter={numberFmt} />
                  <Tooltip formatter={(value) => numberFmt(value)} />
                  <Bar dataKey="total_claim_count" fill="#0f766e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : null}

      <div className="markdown-box">
        <h3>EDA Interpretation (Auto-Generated Narrative)</h3>
        <pre>{summaryMarkdown.slice(0, 1800) || 'EDA summary will appear after pipeline execution.'}</pre>
      </div>
    </section>
  );
};

export default EDASection;
