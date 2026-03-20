import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import MetricCard from '../components/MetricCard';
import StorylineSection from '../components/StorylineSection';
import BaseDataSection from '../components/BaseDataSection';
import EDASection from '../components/EDASection';
import FeatureEngineeringSection from '../components/FeatureEngineeringSection';
import FeatureSelectionSection from '../components/FeatureSelectionSection';
import ModelComparisonSection from '../components/ModelComparisonSection';
import PredictionForm from '../components/PredictionForm';
import PredictionResult from '../components/PredictionResult';
import UploadSection from '../components/UploadSection';
import BusinessStorySection from '../components/BusinessStorySection';
import {
  getEdaSummary,
  getFeatureSelectionSummary,
  getHealth,
  getMetadata,
  getModelMetrics,
  predictSingle,
  uploadCsvAndPredict
} from '../services/api';
import {
  budgetAllocationGuide,
  businessActions,
  businessHighlights,
  executiveNarrativeSteps,
  featureEngineeringNarrative,
  managerDemoScript
} from '../data/mockContent';

const Dashboard = () => {
  const [health, setHealth] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [eda, setEda] = useState(null);
  const [featureSelection, setFeatureSelection] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [lastInput, setLastInput] = useState(null);
  const [scenarioDelta, setScenarioDelta] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [healthData, metadataData, metricsData, edaData, fsData] = await Promise.all([
          getHealth(),
          getMetadata(),
          getModelMetrics(),
          getEdaSummary(),
          getFeatureSelectionSummary()
        ]);

        setHealth(healthData);
        setMetadata(metadataData);
        setMetrics(metricsData);
        setEda(edaData);
        setFeatureSelection(fsData);
      } catch (err) {
        setError(err?.response?.data?.detail || err.message || 'Failed to load dashboard data.');
      }
    };

    load();
  }, []);

  const handlePredict = async (payload) => {
    setLoadingPrediction(true);
    setScenarioDelta(null);
    try {
      const result = await predictSingle(payload);
      setPrediction(result);
      setLastInput(payload);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Prediction failed.');
    } finally {
      setLoadingPrediction(false);
    }
  };

  const runScenario = async () => {
    if (!lastInput || !prediction) return;
    const adjusted = {
      ...lastInput,
      frequency: Number((lastInput.frequency || 0) * 1.1),
      monetary: Number((lastInput.monetary || 0) * 1.05)
    };

    try {
      const scenario = await predictSingle(adjusted);
      setScenarioDelta(Number(scenario.predicted_clv) - Number(prediction?.predicted_clv || 0));
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Scenario simulation failed.');
    }
  };

  const profile = useMemo(() => eda?.profile || {}, [eda]);
  const fsCount = featureSelection?.plain_english?.final_shortlist_count || 0;

  return (
    <main className="page-shell">
      <Header metadata={metadata} health={health} />

      <section className="section-card">
        <div className="section-header-row">
          <h2>Manager-Ready Overview</h2>
          <span className="tag">Self-Guided Demo</span>
        </div>
        <ul>
          {businessHighlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <div className="metric-grid compact-grid">
          <MetricCard
            title="Model API"
            value={health?.model_ready ? 'Ready' : 'Not Ready'}
            subtitle={`API v${health?.api_version || 'n/a'}`}
          />
          <MetricCard
            title="High-Value Cutoff"
            value={`$${Number(metadata?.high_value_threshold_value || 0).toLocaleString()}`}
            subtitle={`Quantile: ${metadata?.high_value_quantile ?? 'n/a'}`}
          />
          <MetricCard
            title="Features Shortlisted"
            value={String(fsCount)}
            subtitle="multi-method consensus"
          />
          <MetricCard
            title="Models Tested"
            value={`${metrics?.summary?.regression_models_tested || 0}R / ${
              metrics?.summary?.classification_models_tested || 0
            }C`}
            subtitle="objective benchmark"
          />
        </div>

        <p className="context-note">{metadata?.platform_message || metrics?.summary?.business_takeaway}</p>
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <StorylineSection steps={executiveNarrativeSteps} script={managerDemoScript} />

      <BaseDataSection profile={profile} />
      <EDASection eda={eda} />
      <FeatureEngineeringSection narrative={featureEngineeringNarrative} />
      <FeatureSelectionSection featureSelection={featureSelection} />
      <ModelComparisonSection metrics={metrics} />

      <section className="section-card">
        <div className="section-header-row">
          <h2>Single Customer Prediction</h2>
          <span className="tag">Real-Time Decisioning</span>
        </div>
        <p>
          Provide customer features and the system will return predicted CLV, premium probability, confidence, and a
          recommended business action.
        </p>

        <div className="grid two-col">
          <PredictionForm onPredict={handlePredict} loading={loadingPrediction} />
          <PredictionResult result={prediction} />
        </div>

        <div className="mini-card">
          <h3>Scenario Simulator</h3>
          <p>
            Simulate a 10% increase in frequency (with 5% monetary uplift) to quantify potential CLV movement.
          </p>
          <button onClick={runScenario} disabled={!prediction || loadingPrediction}>
            Run +10% Frequency Scenario
          </button>
          {scenarioDelta !== null ? (
            <p>
              Estimated CLV delta: <strong>${scenarioDelta.toFixed(2)}</strong>
            </p>
          ) : null}
        </div>
      </section>

      <UploadSection onUpload={uploadCsvAndPredict} />
      <BusinessStorySection actions={businessActions} budgetGuide={budgetAllocationGuide} />

      <section className="section-card footnote">
        <h2>Deployment & Integration Footnote</h2>
        <p>
          Backend runs on FastAPI (port 8000) and frontend on React + Vite (5173 local, 3000 Docker). The dashboard
          consumes metadata, EDA, feature selection, model comparison, single prediction, and batch scoring APIs.
        </p>
      </section>
    </main>
  );
};

export default Dashboard;
