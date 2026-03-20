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
import { computeClassificationComposite, computeRegressionComposite, toPercent } from '../utils/modelUtils';

const ModelComparisonSection = ({ metrics }) => {
  const regression = metrics?.regression || [];
  const classification = metrics?.classification || [];
  const selectedReg = metrics?.selected_regression_model;
  const selectedCls = metrics?.selected_classification_model;

  const regressionScored = useMemo(() => computeRegressionComposite(regression), [regression]);
  const classificationScored = useMemo(
    () => computeClassificationComposite(classification),
    [classification]
  );

  const regressionWinner = regressionScored.find((row) => row.model === selectedReg) || regressionScored[0];
  const classificationWinner =
    classificationScored.find((row) => row.model === selectedCls) || classificationScored[0];

  return (
    <section className="section-card">
      <div className="section-header-row">
        <h2>Model Comparison & Winner Justification</h2>
        <span className="tag">Objective Selection Engine</span>
      </div>

      <div className="selection-callout-grid">
        <article className="callout-panel">
          <p className="callout-kicker">Regression Winner</p>
          <h3>{regressionWinner?.model || 'N/A'}</h3>
          <p>
            Selected for strongest CLV prediction balance across <strong>R2</strong>, <strong>MAE</strong>, and{' '}
            <strong>RMSE</strong>.
          </p>
        </article>
        <article className="callout-panel">
          <p className="callout-kicker">Classification Winner</p>
          <h3>{classificationWinner?.model || 'N/A'}</h3>
          <p>
            Selected to optimize premium-customer detection quality with emphasis on <strong>F1</strong> and{' '}
            <strong>recall</strong>.
          </p>
        </article>
      </div>

      <div className="grid two-col">
        <article className="mini-card">
          <h3>Regression Models (CLV)</h3>
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>R2</th>
                <th>MAE</th>
                <th>RMSE</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {regressionScored.map((row) => (
                <tr key={row.model} className={row.model === selectedReg ? 'highlight-row' : ''}>
                  <td>{row.model}</td>
                  <td>{Number(row.r2).toFixed(3)}</td>
                  <td>{Number(row.mae).toFixed(1)}</td>
                  <td>{Number(row.rmse).toFixed(1)}</td>
                  <td>{toPercent(row.model_score, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>

        <article className="mini-card">
          <h3>Classification Models (High Value)</h3>
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>Acc</th>
                <th>Prec</th>
                <th>Recall</th>
                <th>F1</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {classificationScored.map((row) => (
                <tr key={row.model} className={row.model === selectedCls ? 'highlight-row' : ''}>
                  <td>{row.model}</td>
                  <td>{Number(row.accuracy).toFixed(3)}</td>
                  <td>{Number(row.precision).toFixed(3)}</td>
                  <td>{Number(row.recall).toFixed(3)}</td>
                  <td>{Number(row.f1).toFixed(3)}</td>
                  <td>{toPercent(row.model_score, 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      </div>

      <div className="grid two-col">
        <div className="chart-wrapper">
          <h3>Regression Composite Ranking</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={regressionScored}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis domain={[0, 1]} />
              <Tooltip formatter={(value) => toPercent(value)} />
              <Legend />
              <Bar dataKey="model_score" name="Composite Score" fill="#0f766e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-wrapper">
          <h3>Classification Composite Ranking</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={classificationScored}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis domain={[0, 1]} />
              <Tooltip formatter={(value) => toPercent(value)} />
              <Legend />
              <Bar dataKey="model_score" name="Composite Score" fill="#1d4ed8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p>
        Model selection is transparent: we benchmark all candidates, apply standardized scoring, and highlight winners
        aligned to business goals rather than algorithm preference.
      </p>
    </section>
  );
};

export default ModelComparisonSection;
