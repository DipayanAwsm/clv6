import React from 'react';

const BusinessStorySection = ({ actions, budgetGuide }) => {
  return (
    <section className="section-card">
      <div className="section-header-row">
        <h2>Business Story: From Prediction to Portfolio Action</h2>
        <span className="tag">Decision Playbook</span>
      </div>

      <article className="mini-card">
        <h3>Why This Matters to Leadership</h3>
        <p>
          This platform transforms CLV scores into an operating model: where to spend retention budget, which accounts
          to prioritize, and how to balance premium service against scalable automation.
        </p>
      </article>

      <div className="grid two-col">
        <article className="mini-card">
          <h3>Budget Allocation Blueprint</h3>
          <table>
            <thead>
              <tr>
                <th>Budget Bucket</th>
                <th>Suggested Share</th>
                <th>Rationale</th>
              </tr>
            </thead>
            <tbody>
              {budgetGuide.map((item) => (
                <tr key={item.bucket}>
                  <td>{item.bucket}</td>
                  <td>{item.recommended_share}</td>
                  <td>{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="mini-card">
          <h3>Action Ownership Matrix</h3>
          <table>
            <thead>
              <tr>
                <th>Segment</th>
                <th>Owner</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((item) => (
                <tr key={item.segment}>
                  <td>{item.segment}</td>
                  <td>{item.owner}</td>
                  <td>{item.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>

      <article className="mini-card">
        <h3>30-60-90 Day Rollout</h3>
        <ul>
          <li><strong>30 days:</strong> Run baseline scoring and align campaign/service owners to segment actions.</li>
          <li><strong>60 days:</strong> Track conversion, churn prevention, and upsell lift by predicted segment.</li>
          <li><strong>90 days:</strong> Recalibrate thresholds and rebalance budget using observed ROI by segment.</li>
        </ul>
      </article>
    </section>
  );
};

export default BusinessStorySection;
