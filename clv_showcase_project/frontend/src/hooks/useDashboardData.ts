import { useMemo } from 'react';

import {
  YEARS,
  classificationModels,
  confusionMatrix,
  customerRecords,
  defaultRecommendations,
  featureImportance,
  regressionModels,
  shapGlobalImportance,
  shapLocalContributions,
  shapNarrative,
  shapSummaryScatter
} from '../data/mockData';
import type {
  ChartPoint,
  CustomerRecord,
  DashboardDataBundle,
  FilterState,
  KPIItem,
  RecommendationItem
} from '../types';

const groupSum = <T extends Record<string, unknown>>(rows: T[], key: keyof T, valueKey: keyof T) => {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    const id = String(row[key]);
    const next = (map.get(id) || 0) + Number(row[valueKey] || 0);
    map.set(id, next);
  });
  return Array.from(map.entries()).map(([id, value]) => ({ id, value }));
};

const groupAvg = <T extends Record<string, unknown>>(rows: T[], key: keyof T, valueKey: keyof T) => {
  const map = new Map<string, { sum: number; count: number }>();
  rows.forEach((row) => {
    const id = String(row[key]);
    const current = map.get(id) || { sum: 0, count: 0 };
    current.sum += Number(row[valueKey] || 0);
    current.count += 1;
    map.set(id, current);
  });
  return Array.from(map.entries()).map(([id, meta]) => ({ id, value: meta.sum / Math.max(meta.count, 1) }));
};

const distribution = <T extends Record<string, unknown>>(rows: T[], key: keyof T, label = 'count') => {
  const map = new Map<string, number>();
  rows.forEach((row) => {
    const id = String(row[key]);
    map.set(id, (map.get(id) || 0) + 1);
  });
  return Array.from(map.entries()).map(([name, count]) => ({ name, [label]: count }));
};

const buildHistogram = (values: number[], bins: number, prefix: string) => {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const width = Math.max((max - min) / bins, 1);
  const counts = Array.from({ length: bins }, () => 0);

  values.forEach((value) => {
    const idx = Math.min(Math.floor((value - min) / width), bins - 1);
    counts[idx] += 1;
  });

  return counts.map((count, idx) => ({
    bin: `${prefix} ${idx + 1}`,
    lower: Number((min + idx * width).toFixed(1)),
    upper: Number((min + (idx + 1) * width).toFixed(1)),
    count
  }));
};

const correlation = (a: number[], b: number[]) => {
  const n = Math.min(a.length, b.length);
  if (!n) return 0;
  const avgA = a.reduce((acc, val) => acc + val, 0) / n;
  const avgB = b.reduce((acc, val) => acc + val, 0) / n;
  let numerator = 0;
  let denomA = 0;
  let denomB = 0;
  for (let i = 0; i < n; i += 1) {
    const da = a[i] - avgA;
    const db = b[i] - avgB;
    numerator += da * db;
    denomA += da * da;
    denomB += db * db;
  }
  const denominator = Math.sqrt(denomA * denomB);
  return denominator === 0 ? 0 : numerator / denominator;
};

const buildCorrelationHeatmap = (rows: CustomerRecord[]) => {
  const featureMap: Record<string, number[]> = {
    Premium: rows.map((row) => row.earnedPremium),
    Losses: rows.map((row) => row.netLossPaid),
    Claims: rows.map((row) => row.claimCount),
    CLV: rows.map((row) => row.clv),
    Tenure: rows.map((row) => row.customerTenure),
    Satisfaction: rows.map((row) => row.customerSatisfaction),
    PaymentDelay: rows.map((row) => row.paymentDelayDays)
  };

  const keys = Object.keys(featureMap);
  const cells: ChartPoint[] = [];
  keys.forEach((x) => {
    keys.forEach((y) => {
      cells.push({
        x,
        y,
        value: Number(correlation(featureMap[x], featureMap[y]).toFixed(2))
      });
    });
  });
  return cells;
};

const compareWithPreviousYear = (rows: CustomerRecord[], metric: (r: CustomerRecord) => number) => {
  const latest = Math.max(...rows.map((row) => row.year));
  const previous = latest - 1;

  const latestRows = rows.filter((row) => row.year === latest);
  const previousRows = rows.filter((row) => row.year === previous);
  const latestValue = latestRows.reduce((acc, row) => acc + metric(row), 0);
  const previousValue = previousRows.reduce((acc, row) => acc + metric(row), 0);
  if (!previousValue) return 0;
  return (latestValue - previousValue) / Math.abs(previousValue);
};

const riskSummaryActions = (rows: CustomerRecord[]): RecommendationItem[] => {
  const highRiskHighValue = rows.filter(
    (row) => (row.segment === 'High Value, High Risk' || row.highValueFlag === 1) && row.riskLevel === 'High'
  ).length;
  const highValueLowRisk = rows.filter((row) => row.segment === 'High Value, Low Risk').length;
  const growthPotential = rows.filter((row) => row.segment === 'Growth Potential').length;

  return [
    {
      title: 'Retain Aggressively',
      detail: `${highRiskHighValue.toLocaleString()} customers are high-value but risky. Trigger urgent save workflows.`,
      priority: 'Critical'
    },
    {
      title: 'Upsell Premium Cohorts',
      detail: `${highValueLowRisk.toLocaleString()} customers are high-value and stable. Prioritize cross-sell and loyalty programs.`,
      priority: 'High'
    },
    {
      title: 'Nurture Emerging Segments',
      detail: `${growthPotential.toLocaleString()} customers show growth potential. Deploy nurture campaigns with guided offers.`,
      priority: 'Medium'
    }
  ];
};

export const useDashboardData = (filters: FilterState): DashboardDataBundle => {
  return useMemo(() => {
    const filteredRecords = customerRecords.filter(
      (row) => filters.states.includes(row.state) && filters.years.includes(row.year)
    );

    const records = filteredRecords.length ? filteredRecords : customerRecords;
    const totalCustomers = records.length;
    const totalPredictedClv = records.reduce((acc, row) => acc + row.clv, 0);
    const averageClv = totalPredictedClv / Math.max(totalCustomers, 1);
    const highValueCount = records.filter(
      (row) => row.segment === 'High Value, Low Risk' || row.segment === 'High Value, High Risk'
    ).length;
    const totalProfit = records.reduce((acc, row) => acc + row.profit, 0);
    const totalLoss = records.reduce((acc, row) => acc + row.netLossPaid, 0);

    const kpis: KPIItem[] = [
      {
        label: 'Total Customers',
        value: totalCustomers,
        delta: compareWithPreviousYear(records, () => 1),
        explanation: 'Total active policies in the selected portfolio filters.',
        format: 'number'
      },
      {
        label: 'total clv',
        value: totalPredictedClv,
        delta: compareWithPreviousYear(records, (row) => row.clv),
        explanation: 'Total expected lifetime value across filtered customers.',
        format: 'currency'
      },
      {
        label: 'Average CLV',
        value: averageClv,
        delta: compareWithPreviousYear(records, (row) => row.clv) * 0.45,
        explanation: 'Expected average lifetime profitability per customer.',
        format: 'currency'
      },
      {
        label: 'High Value Customer %',
        value: highValueCount / Math.max(totalCustomers, 1),
        delta: compareWithPreviousYear(records, (row) => (row.highValueFlag ? 1 : 0)),
        explanation: 'Share of customers currently classified as premium/high-value.',
        format: 'percent'
      },
      {
        label: 'Total Profit',
        value: totalProfit,
        delta: compareWithPreviousYear(records, (row) => row.profit),
        explanation: 'Portfolio profitability after claims and operating expenses.',
        format: 'currency'
      },
      {
        label: 'Total Loss',
        value: totalLoss,
        delta: compareWithPreviousYear(records, (row) => row.netLossPaid),
        explanation: 'Total loss paid across selected customers and policy years.',
        format: 'currency'
      }
    ];

    const clvTrend = groupSum(records, 'year', 'clv')
      .sort((a, b) => Number(a.id) - Number(b.id))
      .map((item) => ({ year: Number(item.id), clv: Number(item.value.toFixed(2)) }));

    const stateClvSnapshot = groupAvg(records, 'state', 'clv')
      .sort((a, b) => b.value - a.value)
      .map((item) => ({ state: item.id, avgClv: Number(item.value.toFixed(2)) }));

    const segmentDistribution = distribution(records, 'segment', 'customers')
      .sort((a, b) => Number(b.customers) - Number(a.customers));

    const premiumDistribution = buildHistogram(
      records.map((row) => row.earnedPremium),
      12,
      'P'
    );
    const lossDistribution = buildHistogram(
      records.map((row) => row.netLossPaid),
      12,
      'L'
    );
    const clvDistribution = buildHistogram(
      records.map((row) => row.clv),
      12,
      'C'
    );

    const claimsDistribution = distribution(records, 'claimCount', 'customers').map((item) => ({
      claims: Number(item.name),
      customers: item.customers
    }));

    const stateDistribution = distribution(records, 'state', 'customers').sort(
      (a, b) => Number(b.customers) - Number(a.customers)
    );

    const yearTrend = YEARS.filter((year) => filters.years.includes(year)).map((year) => {
      const subset = records.filter((row) => row.year === year);
      return {
        year,
        avgPremium: subset.reduce((acc, row) => acc + row.earnedPremium, 0) / Math.max(subset.length, 1),
        avgLoss: subset.reduce((acc, row) => acc + row.netLossPaid, 0) / Math.max(subset.length, 1),
        avgClv: subset.reduce((acc, row) => acc + row.clv, 0) / Math.max(subset.length, 1)
      };
    });

    const categoryMix = {
      agentChannel: distribution(records, 'agentChannel', 'customers'),
      marketingChannel: distribution(records, 'marketingChannel', 'customers'),
      paymentMethod: distribution(records, 'paymentMethod', 'customers'),
      incomeBracket: distribution(records, 'incomeBracket', 'customers')
    };

    const stateWisePremium = groupSum(records, 'state', 'earnedPremium').map((item) => ({
      state: item.id,
      totalPremium: Number(item.value.toFixed(2))
    }));

    const stateWiseLosses = groupSum(records, 'state', 'netLossPaid').map((item) => ({
      state: item.id,
      totalLosses: Number(item.value.toFixed(2))
    }));

    const stateWiseClaims = groupSum(records, 'state', 'claimCount').map((item) => ({
      state: item.id,
      totalClaimCount: Number(item.value.toFixed(0))
    }));

    const segmentProfit = groupAvg(records, 'segment', 'profit').map((item) => ({
      segment: item.id,
      avgProfit: Number(item.value.toFixed(2))
    }));

    const segmentRenewal = groupAvg(records, 'segment', 'renewalProbability').map((item) => ({
      segment: item.id,
      renewalRate: Number(item.value.toFixed(3))
    }));

    const topCustomers = [...records].sort((a, b) => b.clv - a.clv).slice(0, 12);
    const highRiskHighValue = [...records]
      .filter((row) => (row.highValueFlag || row.segment.includes('High Value')) && row.riskLevel === 'High')
      .sort((a, b) => b.clv - a.clv)
      .slice(0, 12);

    const lossRatioByState = groupAvg(records, 'state', 'lossRatio').map((item) => ({
      state: item.id,
      lossRatio: Number(item.value.toFixed(3))
    }));

    const lossRatioBySegment = groupAvg(records, 'segment', 'lossRatio').map((item) => ({
      segment: item.id,
      lossRatio: Number(item.value.toFixed(3))
    }));

    const paymentDelayVsClv = records.slice(0, 350).map((row) => ({
      paymentDelayDays: row.paymentDelayDays,
      clv: row.clv,
      riskLevel: row.riskLevel
    }));

    const delinquencyVsRenewal = [0, 1].map((flag) => {
      const subset = records.filter((row) => row.delinquencyFlag === flag);
      return {
        delinquency: flag === 1 ? 'Delinquent' : 'Not Delinquent',
        renewalRate: subset.reduce((acc, row) => acc + row.renewalProbability, 0) / Math.max(subset.length, 1)
      };
    });

    const claimCountVsProfit = Array.from({ length: 6 }, (_, claimCount) => {
      const subset = records.filter((row) => row.claimCount === claimCount);
      return {
        claimCount,
        avgProfit: subset.reduce((acc, row) => acc + row.profit, 0) / Math.max(subset.length, 1)
      };
    });

    const complaintVsClv = Array.from({ length: 5 }, (_, complaintCount) => {
      const subset = records.filter((row) => row.complaintCount === complaintCount);
      return {
        complaintCount,
        avgClv: subset.reduce((acc, row) => acc + row.clv, 0) / Math.max(subset.length, 1)
      };
    });

    const hazardImpact = ['Low', 'Medium', 'High'].map((bucket) => {
      const subset = records.filter((row) => {
        if (bucket === 'Low') return row.hazardScore < 40;
        if (bucket === 'Medium') return row.hazardScore >= 40 && row.hazardScore < 52;
        return row.hazardScore >= 52;
      });
      return {
        hazardBand: bucket,
        avgLossRatio: subset.reduce((acc, row) => acc + row.lossRatio, 0) / Math.max(subset.length, 1)
      };
    });

    const avgClvByMarketing = groupAvg(records, 'marketingChannel', 'clv').map((item) => ({
      channel: item.id,
      avgClv: Number(item.value.toFixed(2))
    }));

    const avgClvByAgent = groupAvg(records, 'agentChannel', 'clv').map((item) => ({
      channel: item.id,
      avgClv: Number(item.value.toFixed(2))
    }));

    const renewalByMarketing = groupAvg(records, 'marketingChannel', 'renewalProbability').map((item) => ({
      channel: item.id,
      renewalRate: Number(item.value.toFixed(3))
    }));

    const profitabilityByChannel = groupAvg(records, 'marketingChannel', 'profit').map((item) => ({
      channel: item.id,
      avgProfit: Number(item.value.toFixed(2))
    }));

    const agentExpVsClv = records.slice(0, 320).map((row) => ({
      agentExperienceYears: row.agentExperienceYears,
      clv: row.clv,
      state: row.state
    }));

    const stateChannelMatrix = [] as ChartPoint[];
    const channels = Array.from(new Set(records.map((row) => row.marketingChannel)));
    const states = Array.from(new Set(records.map((row) => row.state)));

    states.forEach((state) => {
      channels.forEach((channel) => {
        const subset = records.filter((row) => row.state === state && row.marketingChannel === channel);
        stateChannelMatrix.push({
          state,
          channel,
          avgClv: subset.reduce((acc, row) => acc + row.clv, 0) / Math.max(subset.length, 1)
        });
      });
    });

    const bestSource = [...avgClvByMarketing].sort((a, b) => Number(b.avgClv) - Number(a.avgClv))[0];

    const positiveDrivers = shapLocalContributions.filter((row) => Number(row.effect) > 0);
    const negativeDrivers = shapLocalContributions.filter((row) => Number(row.effect) < 0);

    const modelInsights = {
      regressionModels,
      classificationModels,
      selectedRegression: 'XGBoost Regressor',
      selectedClassification: 'XGBoost Classifier',
      featureImportance,
      confusionMatrix,
      rationale: [
        'Tree-based models captured non-linear relationships between premium, losses, behavior, and retention signals.',
        'XGBoost delivered the strongest balance between prediction accuracy and robustness across holdout data.',
        'Chosen models support both reliable ranking of customer value and practical action prioritization.'
      ]
    };

    return {
      records,
      executive: {
        kpis,
        clvTrend,
        stateClvSnapshot,
        segmentDistribution,
        topRecommendations: defaultRecommendations,
        takeaways: [
          'High-value customers represent a minority of volume but contribute most of expected portfolio value.',
          'Loss intensity and payment delays are the strongest early warning signals for value leakage.',
          'State and channel mix materially changes profitability quality, not just policy count.',
          'Growth Potential customers are a scalable source for medium-term CLV uplift when nurtured correctly.'
        ]
      },
      eda: {
        datasetSummary: {
          rows: records.length,
          columns: 28,
          missingPct: 1.9,
          categoricalFields: 7,
          numericFields: 21
        },
        missingOverview: [
          { field: 'CreditScore', missingPct: 2.8 },
          { field: 'CustomerSatisfaction', missingPct: 2.2 },
          { field: 'PaymentDelayDays', missingPct: 1.9 },
          { field: 'AgentExperienceYears', missingPct: 1.4 },
          { field: 'IncomeBracket', missingPct: 1.2 }
        ],
        premiumDistribution,
        lossDistribution,
        clvDistribution,
        claimsDistribution,
        stateDistribution,
        yearTrend,
        categoryMix,
        correlationHeatmap: buildCorrelationHeatmap(records),
        stateWisePremium,
        stateWiseLosses,
        stateWiseClaims,
        interpretation: [
          'Customer value is right-skewed: a smaller policy cohort drives disproportionate expected value.',
          'Loss concentration is uneven by state, indicating location-specific underwriting and servicing opportunities.',
          'Channel quality differs materially; source volume does not always align with value quality.',
          'Claim frequency and payment behavior should be monitored as leading indicators of future CLV shift.'
        ]
      },
      segmentation: {
        segmentDistribution,
        clvRiskScatter: records.slice(0, 350).map((row) => ({
          clv: row.clv,
          riskScore: row.riskScore,
          segment: row.segment
        })),
        segmentProfit,
        segmentRenewal,
        topCustomers,
        highRiskHighValue,
        actionSummary: riskSummaryActions(records)
      },
      riskProfitability: {
        lossRatioByState,
        lossRatioBySegment,
        paymentDelayVsClv,
        delinquencyVsRenewal,
        claimCountVsProfit,
        complaintVsClv,
        hazardImpact
      },
      channelInsights: {
        avgClvByMarketing,
        avgClvByAgent,
        renewalByMarketing,
        profitabilityByChannel,
        agentExpVsClv,
        stateChannelMatrix,
        bestSource: {
          title: `Best Acquisition Source: ${String(bestSource?.channel || 'n/a')}`,
          detail: `This channel currently shows the highest average CLV (${Number(bestSource?.avgClv || 0).toFixed(
            0
          )}) under selected filters.`,
          priority: 'High'
        }
      },
      modelInsights,
      shap: {
        whatIsShap: shapNarrative.whatIsShap,
        globalImportance: shapGlobalImportance,
        shapSummaryScatter,
        localContributions: shapLocalContributions,
        positiveDrivers,
        negativeDrivers,
        interpretation: shapNarrative.interpretation
      }
    } as DashboardDataBundle;
  }, [filters.states, filters.years]);
};
