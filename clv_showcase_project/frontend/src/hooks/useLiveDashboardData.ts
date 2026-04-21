import { useEffect, useMemo, useState } from 'react';

import { apiClient } from '../api/client';
import { useDashboardData } from './useDashboardData';
import type { DashboardDataBundle, FilterState } from '../types';

interface LivePayload {
  businessSummary?: Record<string, any>;
  edaSummary?: Record<string, any>;
  modelMetrics?: Record<string, any>;
  featureSelection?: Record<string, any>;
  metadata?: Record<string, any>;
}

interface LiveDashboardResult {
  data: DashboardDataBundle;
  source: 'backend' | 'mock';
  loading: boolean;
  error: string | null;
}

const toNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toFraction = (value: unknown) => {
  const numeric = toNumber(value, 0);
  return numeric > 1 ? numeric / 100 : numeric;
};

const prettifyModelName = (name: string) => name.replace(/([a-z])([A-Z])/g, '$1 $2').trim();

const pickSelectedClassifierRow = (modelMetrics: Record<string, any> | undefined, selectedName: string) => {
  const rows = (modelMetrics?.classification || []) as Array<Record<string, any>>;
  if (!rows.length) return null;

  const exact = rows.find((row) => String(row.model || '') === selectedName);
  if (exact) return exact;

  const fuzzy = rows.find((row) => {
    const candidate = String(row.model || '').toLowerCase();
    return candidate.includes(selectedName.toLowerCase()) || selectedName.toLowerCase().includes(candidate);
  });

  return fuzzy || rows[0];
};

const buildConfusionMatrix = (selectedClassifier: Record<string, any> | null) => {
  const matrix = selectedClassifier?.confusion_matrix;
  if (!Array.isArray(matrix) || matrix.length < 2 || !Array.isArray(matrix[0]) || !Array.isArray(matrix[1])) {
    return null;
  }

  const tn = toNumber(matrix?.[0]?.[0]);
  const fp = toNumber(matrix?.[0]?.[1]);
  const fn = toNumber(matrix?.[1]?.[0]);
  const tp = toNumber(matrix?.[1]?.[1]);

  return [
    { label: 'True Positive', value: tp, tone: 'good' as const },
    { label: 'False Positive', value: fp, tone: 'neutral' as const },
    { label: 'False Negative', value: fn, tone: 'risk' as const },
    { label: 'True Negative', value: tn, tone: 'good' as const }
  ];
};

const buildFeatureImportance = (
  metadata: Record<string, any> | undefined,
  featureSelection: Record<string, any> | undefined,
  fallback: DashboardDataBundle
) => {
  const selectedFeatures =
    (metadata?.selected_features as string[] | undefined) ||
    (featureSelection?.summary?.final_shortlist as string[] | undefined) ||
    [];

  if (!selectedFeatures.length) return fallback.modelInsights.featureImportance;

  const topRanked = (featureSelection?.summary?.top_ranked || []) as Array<Record<string, any>>;
  const rankedMap = new Map<string, number>(
    topRanked.map((row) => [String(row.feature), toNumber(row.combined_score)])
  );

  const rawScores = selectedFeatures.slice(0, 8).map((feature, index) => {
    const score = rankedMap.get(feature);
    if (score && score > 0) return score;
    return Math.max(0.25 - index * 0.02, 0.05);
  });

  const maxScore = Math.max(...rawScores, 1);

  return selectedFeatures.slice(0, 8).map((feature, index) => ({
    feature,
    importance: Number((rawScores[index] / maxScore).toFixed(3))
  }));
};

const stateRowsFromEda = (edaSummary: Record<string, any> | undefined) => {
  const direct = edaSummary?.state_wise_summary?.rows;
  if (Array.isArray(direct) && direct.length) return direct as Array<Record<string, any>>;

  const nested = edaSummary?.eda_metrics?.state_wise_summary?.rows;
  if (Array.isArray(nested) && nested.length) return nested as Array<Record<string, any>>;

  return [] as Array<Record<string, any>>;
};

const mergeWithLiveData = (fallback: DashboardDataBundle, live: LivePayload): DashboardDataBundle => {
  const merged: DashboardDataBundle = {
    ...fallback,
    executive: { ...fallback.executive },
    eda: { ...fallback.eda },
    modelInsights: { ...fallback.modelInsights }
  };

  const stateRows = stateRowsFromEda(live.edaSummary);
  const totalPremium = stateRows.reduce((acc, row) => acc + toNumber(row.total_premium), 0);
  const totalLoss = stateRows.reduce((acc, row) => acc + toNumber(row.total_losses), 0);

  if (live.businessSummary) {
    const summary = live.businessSummary;

    merged.executive.kpis = merged.executive.kpis.map((kpi) => {
      switch (kpi.label) {
        case 'Total Customers':
          return { ...kpi, value: toNumber(summary.total_customers, kpi.value) };
        case 'total clv':
        case 'Total Predicted CLV':
          return { ...kpi, value: toNumber(summary.total_predicted_clv, kpi.value) };
        case 'Average CLV':
          return { ...kpi, value: toNumber(summary.average_predicted_clv, kpi.value) };
        case 'High Value Customer %':
          return { ...kpi, value: toFraction(summary.high_value_percentage) };
        case 'Total Profit':
          return {
            ...kpi,
            value: totalPremium ? totalPremium - totalLoss : toNumber(summary.total_predicted_clv, kpi.value)
          };
        case 'Total Loss':
          return { ...kpi, value: totalLoss || kpi.value };
        default:
          return kpi;
      }
    });

    if (stateRows.length) {
      merged.executive.stateClvSnapshot = stateRows
        .map((row) => ({
          state: String(row.state),
          avgClv: Number((toNumber(row.total_premium) - toNumber(row.total_losses)).toFixed(2))
        }))
        .sort((a, b) => b.avgClv - a.avgClv);
    }

    merged.executive.takeaways = [
      `Live backend dataset loaded with ${toNumber(summary.total_customers).toLocaleString()} customers.`,
      `Average CLV from trained backend artifacts: ${toNumber(summary.average_predicted_clv).toFixed(2)}.`,
      `High-value share from production scoring output: ${toNumber(summary.high_value_percentage).toFixed(2)}%.`,
      stateRows.length
        ? `State-wise premium/loss/claims are pulled from backend EDA artifacts for manager review.`
        : `State-wise EDA rows were unavailable from backend in this run.`
    ];
  }

  if (live.edaSummary) {
    const profile = live.edaSummary.profile || {};
    const shape = profile.shape || {};
    const missingValues = profile.missing_values || {};
    const rows = toNumber(shape.rows, merged.eda.datasetSummary.rows);
    const columns = toNumber(shape.columns, merged.eda.datasetSummary.columns);

    const totalMissing = Object.values(missingValues).reduce((acc, value) => acc + toNumber(value), 0);
    const missingPct = rows > 0 && columns > 0 ? (totalMissing / (rows * columns)) * 100 : merged.eda.datasetSummary.missingPct;

    const missingOverview = Object.entries(missingValues)
      .map(([field, count]) => ({ field, missingPct: rows > 0 ? (toNumber(count) / rows) * 100 : 0 }))
      .sort((a, b) => b.missingPct - a.missingPct)
      .slice(0, 8);

    merged.eda.datasetSummary = {
      rows,
      columns,
      missingPct: Number(missingPct.toFixed(2)),
      categoricalFields: Array.isArray(live.edaSummary.eda_metrics?.categorical_columns)
        ? live.edaSummary.eda_metrics.categorical_columns.length
        : merged.eda.datasetSummary.categoricalFields,
      numericFields: Array.isArray(live.edaSummary.eda_metrics?.numeric_columns)
        ? live.edaSummary.eda_metrics.numeric_columns.length
        : merged.eda.datasetSummary.numericFields
    };

    if (missingOverview.length) {
      merged.eda.missingOverview = missingOverview.map((item) => ({
        field: item.field,
        missingPct: Number(item.missingPct.toFixed(2))
      }));
    }

    if (stateRows.length) {
      merged.eda.stateWisePremium = stateRows.map((row) => ({
        state: String(row.state),
        totalPremium: Number(toNumber(row.total_premium).toFixed(2))
      }));

      merged.eda.stateWiseLosses = stateRows.map((row) => ({
        state: String(row.state),
        totalLosses: Number(toNumber(row.total_losses).toFixed(2))
      }));

      merged.eda.stateWiseClaims = stateRows.map((row) => ({
        state: String(row.state),
        totalClaimCount: Number(toNumber(row.total_claim_count).toFixed(0))
      }));

      merged.eda.stateDistribution = stateRows.map((row) => ({
        name: String(row.state),
        customers: Number(toNumber(row.total_claim_count))
      }));
    }

    if (Array.isArray(live.edaSummary.key_findings) && live.edaSummary.key_findings.length) {
      merged.eda.interpretation = live.edaSummary.key_findings.map((item: unknown) => String(item));
    }
  }

  if (live.modelMetrics) {
    const regressionRows = (live.modelMetrics.regression || []) as Array<Record<string, any>>;
    const classificationRows = (live.modelMetrics.classification || []) as Array<Record<string, any>>;

    if (regressionRows.length) {
      merged.modelInsights.regressionModels = regressionRows.map((row) => ({
        model: prettifyModelName(String(row.model || 'Unknown')),
        r2: toNumber(row.r2),
        mae: toNumber(row.mae),
        rmse: toNumber(row.rmse)
      }));
    }

    if (classificationRows.length) {
      merged.modelInsights.classificationModels = classificationRows.map((row) => ({
        model: prettifyModelName(String(row.model || 'Unknown')),
        accuracy: toNumber(row.accuracy),
        precision: toNumber(row.precision),
        recall: toNumber(row.recall),
        f1: toNumber(row.f1),
        rocAuc: toNumber(row.roc_auc ?? row.rocAuc)
      }));
    }

    merged.modelInsights.selectedRegression = prettifyModelName(
      String(
        live.metadata?.regression_model_selected ||
          live.modelMetrics.selected_regression_model ||
          merged.modelInsights.selectedRegression
      )
    );

    merged.modelInsights.selectedClassification = prettifyModelName(
      String(
        live.metadata?.classification_model_selected ||
          live.modelMetrics.selected_classification_model ||
          merged.modelInsights.selectedClassification
      )
    );

    const selectedClassifier = pickSelectedClassifierRow(
      live.modelMetrics,
      String(
        live.metadata?.classification_model_selected ||
          live.modelMetrics.selected_classification_model ||
          ''
      )
    );

    const confusionMatrix = buildConfusionMatrix(selectedClassifier);
    if (confusionMatrix) {
      merged.modelInsights.confusionMatrix = confusionMatrix;
    }
  }

  if (live.featureSelection || live.metadata) {
    merged.modelInsights.featureImportance = buildFeatureImportance(live.metadata, live.featureSelection, fallback);

    const notes = (live.metadata?.notes || live.featureSelection?.summary?.selection_notes || []) as unknown[];
    if (notes.length) {
      merged.modelInsights.rationale = notes.slice(0, 3).map((note) => String(note));
    }
  }

  return merged;
};

export const useLiveDashboardData = (filters: FilterState): LiveDashboardResult => {
  const fallback = useDashboardData(filters);

  const [live, setLive] = useState<LivePayload>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      const responses = await Promise.allSettled([
        apiClient.get<Record<string, any>>('/business/summary'),
        apiClient.get<Record<string, any>>('/eda-summary'),
        apiClient.get<Record<string, any>>('/model-metrics'),
        apiClient.get<Record<string, any>>('/feature-selection-summary'),
        apiClient.get<Record<string, any>>('/metadata')
      ]);

      if (!mounted) return;

      const [business, eda, model, featureSelection, metadata] = responses;

      const next: LivePayload = {
        businessSummary: business.status === 'fulfilled' ? business.value : undefined,
        edaSummary: eda.status === 'fulfilled' ? eda.value : undefined,
        modelMetrics: model.status === 'fulfilled' ? model.value : undefined,
        featureSelection: featureSelection.status === 'fulfilled' ? featureSelection.value : undefined,
        metadata: metadata.status === 'fulfilled' ? metadata.value : undefined
      };

      setLive(next);

      const allFailed = responses.every((result) => result.status === 'rejected');
      if (allFailed) {
        setError('Backend API unavailable. Showing demo mock data.');
      }

      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const hasBackendData = useMemo(
    () => Boolean(live.businessSummary || live.edaSummary || live.modelMetrics || live.featureSelection || live.metadata),
    [live]
  );

  const data = useMemo(() => {
    if (!hasBackendData) return fallback;
    return mergeWithLiveData(fallback, live);
  }, [fallback, hasBackendData, live]);

  return {
    data,
    source: hasBackendData ? 'backend' : 'mock',
    loading,
    error
  };
};
