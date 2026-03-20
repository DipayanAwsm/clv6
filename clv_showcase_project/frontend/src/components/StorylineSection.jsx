import React from 'react';

const StorylineSection = ({ steps, script }) => {
  return (
    <section className="section-card">
      <div className="section-header-row">
        <h2>Self-Explanatory Demo Storyline</h2>
        <span className="tag">Manager Walkthrough</span>
      </div>

      <div className="timeline-grid">
        {steps.map((item) => (
          <article key={item.step} className="timeline-step">
            <p className="timeline-step-label">{item.step}</p>
            <p>{item.detail}</p>
          </article>
        ))}
      </div>

      <article className="mini-card">
        <h3>How to Present in 3 Minutes</h3>
        <ol className="ordered-list">
          {script.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </article>
    </section>
  );
};

export default StorylineSection;
