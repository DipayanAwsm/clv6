import React from 'react';

const MetricCard = ({ title, value, subtitle }) => {
  return (
    <article className="metric-card">
      <p className="metric-title">{title}</p>
      <p className="metric-value">{value}</p>
      {subtitle ? <p className="metric-subtitle">{subtitle}</p> : null}
    </article>
  );
};

export default MetricCard;
