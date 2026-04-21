import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import ChartCard from '../../components/charts/ChartCard';
import CorrelationHeatmap from '../../components/charts/CorrelationHeatmap';
import InsightCard from '../../components/cards/InsightCard';
import SectionHeader from '../../components/common/SectionHeader';
import type { DashboardDataBundle } from '../../types';

interface EDAOverviewProps {
  data: DashboardDataBundle;
}

const piePalette = ['#2563eb', '#0ea5e9', '#06b6d4', '#22c55e', '#f59e0b', '#f97316'];

const EDAOverview = ({ data }: EDAOverviewProps) => {
  const { datasetSummary } = data.eda;

  return (
    <section className="space-y-5">
      <SectionHeader
        title="EDA Overview"
        subtitle="Base Data Readiness"
        question="What does the base data reveal about quality, distribution, and target readiness before modeling?"
        takeaway="EDA confirms where value concentration, risk behavior, and data quality constraints require business attention."
      />

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Base Data</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Profile customer data quality, coverage, and target readiness before modeling. This section validates whether
          premium, losses, claims, and CLV behavior are stable enough for downstream feature engineering and predictive scoring.
        </p>
      </article>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-500">Rows</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{datasetSummary.rows.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-500">Columns</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{datasetSummary.columns.toLocaleString()}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-500">Missing %</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{datasetSummary.missingPct}%</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-500">Categorical Fields</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{datasetSummary.categoricalFields}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-500">Numeric Fields</p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{datasetSummary.numericFields}</p>
        </article>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Missing Value Overview"
          subtitle="Data completeness by field"
          helperText="Highlights which fields need cleansing or fallback handling before production scoring."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.eda.missingOverview}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="field" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="missingPct" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="State Distribution"
          subtitle="Where policies are concentrated"
          helperText="State volume helps interpret whether value and risk shifts are exposure-driven or behavior-driven."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.eda.stateDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="customers" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="State-wise Premium"
          subtitle="Premium by state"
          helperText="Compares total earned premium contribution across states for portfolio exposure context."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.eda.stateWisePremium}>
              <XAxis dataKey="state" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalPremium" fill="#0284c7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="State-wise Losses"
          subtitle="Losses by state"
          helperText="Highlights where claims cost is concentrated and where loss pressure may require underwriting review."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.eda.stateWiseLosses}>
              <XAxis dataKey="state" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalLosses" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="State-wise Claim Count"
          subtitle="Claims by state"
          helperText="Tracks claim frequency by geography to support risk-focused servicing and pricing strategy."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.eda.stateWiseClaims}>
              <XAxis dataKey="state" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalClaimCount" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Premium Distribution"
          subtitle="How premiums are distributed"
          helperText="Shows concentration of premium bands and potential exposure mix."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.eda.premiumDistribution}>
              <XAxis dataKey="bin" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Loss Distribution"
          subtitle="How losses are distributed"
          helperText="Loss band concentration indicates where underwriting pressure may be building."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.eda.lossDistribution}>
              <XAxis dataKey="bin" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="CLV Distribution"
          subtitle="How customer value is distributed"
          helperText="A skewed CLV distribution means a small group may drive disproportionate long-term value."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.eda.clvDistribution}>
              <XAxis dataKey="bin" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Year Trend"
          subtitle="Premium, loss, and CLV over time"
          helperText="Compares how value and cost structure changed by policy year."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.eda.yearTrend}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avgPremium" stroke="#2563eb" strokeWidth={2} />
              <Line type="monotone" dataKey="avgLoss" stroke="#f97316" strokeWidth={2} />
              <Line type="monotone" dataKey="avgClv" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Claims Count Distribution"
          subtitle="How claim frequency is spread"
          helperText="Higher claim count cohorts typically map to lower profitability and higher CLV volatility."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.eda.claimsDistribution}>
              <XAxis dataKey="claims" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="customers" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard
        title="Correlation Heatmap"
        subtitle="How key variables move together"
        helperText="Correlation is directional insight, not causation. Use this for hypothesis generation and feature framing."
      >
        <CorrelationHeatmap data={data.eda.correlationHeatmap as Array<{ x: string; y: string; value: number }>} />
      </ChartCard>

      <div className="grid gap-4 xl:grid-cols-4">
        <ChartCard title="AGENT_CHANNEL Mix" subtitle="Distribution" helperText="Shows portfolio contribution by agent channel.">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.eda.categoryMix.agentChannel} dataKey="customers" nameKey="name" outerRadius={90}>
                {data.eda.categoryMix.agentChannel.map((_, index) => (
                  <Cell key={index} fill={piePalette[index % piePalette.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="MarketingChannel Mix"
          subtitle="Distribution"
          helperText="Compares acquisition source share in the filtered view."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.eda.categoryMix.marketingChannel}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="customers" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="PaymentMethod Mix"
          subtitle="Distribution"
          helperText="Payment method behavior can influence delinquency and retention outcomes."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.eda.categoryMix.paymentMethod}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="customers" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="IncomeBracket Mix"
          subtitle="Distribution"
          helperText="Income mix helps contextualize expected spend and risk tolerance."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.eda.categoryMix.incomeBracket}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="customers" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <InsightCard title="What This EDA Tells Us" points={data.eda.interpretation} />
    </section>
  );
};

export default EDAOverview;
