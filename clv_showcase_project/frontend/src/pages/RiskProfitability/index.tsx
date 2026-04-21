import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import InsightCard from '../../components/cards/InsightCard';
import ChartCard from '../../components/charts/ChartCard';
import SectionHeader from '../../components/common/SectionHeader';
import type { DashboardDataBundle } from '../../types';
import { formatCurrency, formatPercent } from '../../utils/format';

interface RiskProfitabilityProps {
  data: DashboardDataBundle;
}

const RiskProfitability = ({ data }: RiskProfitabilityProps) => {
  return (
    <section className="space-y-5">
      <SectionHeader
        title="Risk & Profitability"
        subtitle="Value Leakage Diagnostics"
        question="How is risk behavior reducing lifetime value and where should the business intervene first?"
        takeaway="Combining loss ratio, payment behavior, and claim intensity reveals where profitability leaks happen and where targeted remediation pays off."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Loss Ratio by State"
          subtitle="Geographic risk concentration"
          helperText="States with persistently high loss ratio should be prioritized for underwriting and claim-control reviews."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.riskProfitability.lossRatioByState}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="state" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatPercent(Number(value), 1)} />
              <Bar dataKey="lossRatio" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Loss Ratio by Segment"
          subtitle="Segment-level risk burden"
          helperText="Loss burden by segment shows whether high-value cohorts are also carrying disproportionate risk."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.riskProfitability.lossRatioBySegment}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="segment" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip formatter={(value: number) => formatPercent(Number(value), 1)} />
              <Bar dataKey="lossRatio" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Payment Delay vs CLV"
          subtitle="Collections behavior impact"
          helperText="Delayed payments are associated with lower predicted value and elevated risk."
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="paymentDelayDays" name="Payment Delay" />
              <YAxis dataKey="clv" name="CLV" />
              <Tooltip formatter={(value: number) => [formatCurrency(Number(value)), 'CLV']} />
              <Scatter data={data.riskProfitability.paymentDelayVsClv} fill="#2563eb" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Delinquency vs Renewal"
          subtitle="Retention impact"
          helperText="Delinquent behavior lowers renewal probability and weakens long-term customer value."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.riskProfitability.delinquencyVsRenewal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="delinquency" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatPercent(Number(value), 1)} />
              <Bar dataKey="renewalRate" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Claim Count vs Profitability"
          subtitle="Claims pressure"
          helperText="Each additional claim generally compresses profitability and expected value headroom."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.riskProfitability.claimCountVsProfit}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="claimCount" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
              <Line type="monotone" dataKey="avgProfit" stroke="#10b981" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Complaint Count vs CLV"
          subtitle="Service quality and value"
          helperText="Rising complaints are an early signal for CLV deterioration and churn risk escalation."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.riskProfitability.complaintVsClv}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="complaintCount" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
              <Line type="monotone" dataKey="avgClv" stroke="#6366f1" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Hazard Score Impact"
          subtitle="Property risk factors breakdown"
          helperText="Higher hazard bands consistently increase loss ratio and reduce portfolio quality."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.riskProfitability.hazardImpact}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hazardBand" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatPercent(Number(value), 1)} />
              <Bar dataKey="avgLossRatio" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <InsightCard
          title="What Drives Loss?"
          points={[
            'Higher claim counts and higher hazard scores are the strongest direct drivers of rising loss ratios.',
            'States with elevated loss ratios need targeted underwriting controls and regional risk adjustment.',
            'Delinquency and payment delays correlate with weaker renewal behavior and lower CLV stability.'
          ]}
        />
        <InsightCard
          title="Where Profitability Leaks Happen"
          points={[
            'High-value customers with deteriorating payment behavior can quickly migrate to high-risk segments.',
            'Complaint-heavy cohorts show persistent CLV decline and should trigger service-recovery programs.',
            'Claims-heavy segments should receive proactive risk mitigation and pricing adequacy reviews.'
          ]}
        />
      </div>
    </section>
  );
};

export default RiskProfitability;
