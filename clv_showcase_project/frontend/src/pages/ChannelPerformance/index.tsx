import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import RecommendationCard from '../../components/cards/RecommendationCard';
import ChartCard from '../../components/charts/ChartCard';
import SectionHeader from '../../components/common/SectionHeader';
import type { DashboardDataBundle } from '../../types';
import { formatCurrency, formatPercent } from '../../utils/format';

interface ChannelPerformanceProps {
  data: DashboardDataBundle;
}

const ChannelPerformance = ({ data }: ChannelPerformanceProps) => {
  const states = Array.from(new Set(data.channelInsights.stateChannelMatrix.map((item) => String(item.state))));
  const channels = Array.from(new Set(data.channelInsights.stateChannelMatrix.map((item) => String(item.channel))));
  const maxClv = Math.max(...data.channelInsights.stateChannelMatrix.map((item) => Number(item.avgClv)));

  const getCellTone = (value: number) => {
    const intensity = value / Math.max(maxClv, 1);
    if (intensity > 0.85) return 'bg-emerald-600 text-white';
    if (intensity > 0.7) return 'bg-emerald-400 text-emerald-950';
    if (intensity > 0.55) return 'bg-emerald-200 text-emerald-900';
    if (intensity > 0.4) return 'bg-sky-200 text-sky-900';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
  };

  const getMatrixValue = (state: string, channel: string) => {
    const row = data.channelInsights.stateChannelMatrix.find((item) => item.state === state && item.channel === channel);
    return Number(row?.avgClv || 0);
  };

  return (
    <section className="space-y-5">
      <SectionHeader
        title="Channel Insights"
        subtitle="Acquisition and Distribution Quality"
        question="Which channels bring high-value customers and where should acquisition spend be concentrated?"
        takeaway="Channel-level CLV and profitability differences show where acquisition budget should scale and where efficiency corrections are needed."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Average CLV by Marketing Channel"
          subtitle="Acquisition quality"
          helperText="Not all channels produce equal value. Use this to prioritize spend toward stronger CLV sources."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.channelInsights.avgClvByMarketing}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
              <Bar dataKey="avgClv" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Average CLV by AGENT_CHANNEL"
          subtitle="Distribution partner quality"
          helperText="Agent channel quality helps align partner strategy with long-term value outcomes."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.channelInsights.avgClvByAgent}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
              <Bar dataKey="avgClv" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Renewal Rate by Marketing Channel"
          subtitle="Retention quality"
          helperText="Channels with stronger renewal rates typically sustain higher multi-year CLV realization."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.channelInsights.renewalByMarketing}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip formatter={(value: number) => formatPercent(Number(value), 1)} />
              <Bar dataKey="renewalRate" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Profitability by Channel"
          subtitle="Margin quality"
          helperText="Channel profitability identifies where customer acquisition cost and claims behavior are balanced well."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.channelInsights.profitabilityByChannel}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="channel" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
              <Bar dataKey="avgProfit" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard
          title="Agent Experience vs CLV"
          subtitle="Experience effect"
          helperText="Experienced agents tend to align better customers to coverage, improving value outcomes."
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="agentExperienceYears" />
              <YAxis dataKey="clv" />
              <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
              <Scatter data={data.channelInsights.agentExpVsClv} fill="#6366f1" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">State + Channel CLV Matrix</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            This matrix compares average CLV across states and acquisition channels to reveal where channel strategy should be localized.
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-left font-semibold text-slate-600 dark:text-slate-300">State</th>
                  {channels.map((channel) => (
                    <th key={channel} className="p-2 text-center font-semibold text-slate-600 dark:text-slate-300">
                      {channel}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {states.map((state) => (
                  <tr key={state}>
                    <td className="p-2 font-semibold text-slate-800 dark:text-slate-100">{state}</td>
                    {channels.map((channel) => {
                      const value = getMatrixValue(state, channel);
                      return (
                        <td key={`${state}-${channel}`} className="p-1">
                          <div className={`rounded-md px-2 py-1 text-center font-semibold ${getCellTone(value)}`}>
                            {formatCurrency(value)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </div>

      <RecommendationCard item={data.channelInsights.bestSource} />
    </section>
  );
};

export default ChannelPerformance;
