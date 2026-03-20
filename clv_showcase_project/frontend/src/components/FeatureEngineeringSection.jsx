import React from 'react';

const FeatureEngineeringSection = ({ narrative }) => {
  return (
    <section className="section-card">
      <div className="section-header-row">
        <h2>Feature Engineering & RFM Logic</h2>
        <span className="tag">Behavior Intelligence</span>
      </div>
      <p>
        Engineered features convert raw attributes into decision-ready signals. RFM features capture purchasing behavior,
        while complaint/claim/renewal ratios capture service and retention quality.
      </p>

      <div className="grid two-col">
        <article className="mini-card">
          <h3>RFM in This Platform</h3>
          <ul>
            <li><strong>Recency:</strong> How long since last meaningful interaction/purchase.</li>
            <li><strong>Frequency:</strong> How often the customer transacts.</li>
            <li><strong>Monetary:</strong> How much value the customer contributes.</li>
          </ul>
        </article>

        <article className="mini-card">
          <h3>Additional Derived Features</h3>
          <ul>
            <li>Average order value and monetary-per-tenure.</li>
            <li>Claim rate and complaint rate as burden/risk indicators.</li>
            <li>Renewal ratio, premium efficiency, tenure bands, engagement score.</li>
          </ul>
        </article>
      </div>

      <article className="mini-card">
        <h3>Why It Matters</h3>
        <ul>
          {narrative.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    </section>
  );
};

export default FeatureEngineeringSection;
