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

const EDASection = ({ eda }) => {
  const topDrivers = eda?.eda_metrics?.top_drivers || [];
  const summaryMarkdown = eda?.summary_markdown || '';
  const keyFindings = eda?.key_findings || [];

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

      <div className="markdown-box">
        <h3>EDA Interpretation (Auto-Generated Narrative)</h3>
        <pre>{summaryMarkdown.slice(0, 1800) || 'EDA summary will appear after pipeline execution.'}</pre>
      </div>
    </section>
  );
};

export default EDASection;
