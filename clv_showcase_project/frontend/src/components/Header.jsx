import React from 'react';

const Header = ({ metadata, health }) => {
  return (
    <header className="hero-card">
      <div className="hero-overlay" />
      <div className="hero-content">
        <p className="eyebrow">Enterprise CLV Intelligence Platform</p>
        <h1>Customer Lifetime Value Prediction & High-Value Customer Identification</h1>
        <p className="hero-subtitle">
          Production-style analytics product connecting data diagnostics, model selection, and action playbooks for
          budget allocation and customer prioritization.
        </p>
      </div>

      <div className="hero-badges">
        <span>API Status: {health?.model_ready ? 'Ready' : 'Not Ready'}</span>
        <span>Dataset Mode: {metadata?.dataset_type || 'Unknown'}</span>
        <span>Regressor: {metadata?.regression_model_selected || 'N/A'}</span>
        <span>Classifier: {metadata?.classification_model_selected || 'N/A'}</span>
      </div>
    </header>
  );
};

export default Header;
