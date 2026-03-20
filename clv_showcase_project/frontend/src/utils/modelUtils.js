const normalizeHigherIsBetter = (values) => {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max - min === 0) return values.map(() => 1);
  return values.map((value) => (value - min) / (max - min));
};

const normalizeLowerIsBetter = (values) => {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max - min === 0) return values.map(() => 1);
  return values.map((value) => (max - value) / (max - min));
};

export const computeRegressionComposite = (rows = []) => {
  if (!rows.length) return [];

  const r2 = normalizeHigherIsBetter(rows.map((row) => Number(row.r2) || 0));
  const mae = normalizeLowerIsBetter(rows.map((row) => Number(row.mae) || 0));
  const rmse = normalizeLowerIsBetter(rows.map((row) => Number(row.rmse) || 0));

  return rows.map((row, idx) => ({
    ...row,
    model_score: Number((0.45 * r2[idx] + 0.3 * mae[idx] + 0.25 * rmse[idx]).toFixed(4))
  }));
};

export const computeClassificationComposite = (rows = []) => {
  if (!rows.length) return [];

  return rows.map((row) => {
    const accuracy = Number(row.accuracy) || 0;
    const precision = Number(row.precision) || 0;
    const recall = Number(row.recall) || 0;
    const f1 = Number(row.f1) || 0;
    const roc = Number.isFinite(Number(row.roc_auc)) ? Number(row.roc_auc) : 0.5;

    return {
      ...row,
      model_score: Number((0.2 * accuracy + 0.2 * precision + 0.25 * recall + 0.25 * f1 + 0.1 * roc).toFixed(4))
    };
  });
};

export const toPercent = (value, digits = 1) => `${(Number(value || 0) * 100).toFixed(digits)}%`;
