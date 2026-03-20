import React, { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const FeatureSelectionSection = ({ featureSelection }) => {
  const summary = featureSelection?.summary || {};
  const methods = summary?.methods || {};
  const finalShortlist = summary?.final_shortlist || [];
  const topRanked = (summary?.top_ranked || []).slice(0, 10);

  const methodCoverage = useMemo(() => {
    const counts = {};
    Object.values(methods).forEach((features) => {
      (features || []).forEach((feature) => {
        counts[feature] = (counts[feature] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([feature, votes]) => ({ feature, votes }))
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 8);
  }, [methods]);

  return (
    <section className="section-card">
      <div className="section-header-row">
        <h2>Feature Selection Explained Clearly</h2>
        <span className="tag">Consensus-Based Signal Discovery</span>
      </div>

      <p>
        This stage answers a business-critical question: <strong>which customer attributes consistently explain lifetime
        value?</strong> We use multiple methods and keep features that repeatedly appear as strong predictors.
      </p>

      <div className="timeline-grid four-col">
        <article className="timeline-step">
          <p className="timeline-step-label">Step 1</p>
          <p>Score each feature using correlation and mutual information.</p>
        </article>
        <article className="timeline-step">
          <p className="timeline-step-label">Step 2</p>
          <p>Run RFECV to recursively remove weak features.</p>
        </article>
        <article className="timeline-step">
          <p className="timeline-step-label">Step 3</p>
          <p>Estimate model-based importance via Random Forest and L1 regularization.</p>
        </article>
        <article className="timeline-step">
          <p className="timeline-step-label">Step 4</p>
          <p>Combine method votes and shortlist stable, interpretable drivers.</p>
        </article>
      </div>

      <div className="grid two-col">
        <article className="mini-card">
          <h3>Final Shortlisted Features ({finalShortlist.length})</h3>
          <div className="chips-wrap">
            {finalShortlist.length
              ? finalShortlist.map((feature) => (
                  <span className="chip" key={feature}>
                    {feature}
                  </span>
                ))
              : 'Run the pipeline to populate shortlisted features.'}
          </div>
        </article>

        <article className="mini-card">
          <h3>Top Features Per Method</h3>
          {Object.keys(methods).length ? (
            <div className="method-grid">
              {Object.entries(methods).map(([method, features]) => (
                <div key={method} className="method-item">
                  <p className="method-title">{method}</p>
                  <p>{(features || []).slice(0, 6).join(', ')}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No feature-selection output loaded yet.</p>
          )}
        </article>
      </div>

      <div className="grid two-col">
        <div className="chart-wrapper">
          <h3>Combined Feature Score (Top Candidates)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topRanked} margin={{ top: 10, right: 20, left: 0, bottom: 45 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="feature" angle={-26} textAnchor="end" height={72} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="combined_score" fill="#0f766e" name="Combined Score" />
              <Bar dataKey="selection_votes" fill="#1d4ed8" name="Method Votes" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
          <h3>Cross-Method Consensus (Vote Count)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={methodCoverage} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="feature" width={130} />
              <Tooltip />
              <Bar dataKey="votes" fill="#b45309" name="Methods Selecting Feature" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p>
        Plain-English interpretation: if a feature is repeatedly selected by independent methods, stakeholders can trust
        it as a stable driver of CLV decisions.
      </p>
    </section>
  );
};

export default FeatureSelectionSection;
