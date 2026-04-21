import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';

import ShapDriverCard from '../../components/shap/ShapDriverCard';
import ChartCard from '../../components/charts/ChartCard';
import InsightCard from '../../components/cards/InsightCard';
import SectionHeader from '../../components/common/SectionHeader';
import type { DashboardDataBundle } from '../../types';

interface ShapExplainabilityProps {
  data: DashboardDataBundle;
}

const ShapExplainability = ({ data }: ShapExplainabilityProps) => {
  const featureOrder = Array.from(new Set(data.shap.shapSummaryScatter.map((item) => String(item.feature))));
  const highBand = data.shap.shapSummaryScatter.filter((item) => item.featureValueBand === 'High');
  const lowBand = data.shap.shapSummaryScatter.filter((item) => item.featureValueBand === 'Low');
  const maxEffect = Math.max(...data.shap.localContributions.map((item) => Math.abs(Number(item.effect))), 1);

  return (
    <section className="space-y-5">
      <SectionHeader
        title="SHAP Analysis"
        subtitle="Model Explainability"
        question="Why did the model predict a higher or lower CLV for a given customer?"
        takeaway="SHAP makes model behavior transparent so business teams can trust predictions and act with confidence."
      />

      <InsightCard title="What SHAP Means" points={data.shap.whatIsShap} />

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Global Feature Importance"
          subtitle="Which features influence CLV the most"
          helperText="This view ranks features by average contribution magnitude across all scored customers."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.shap.globalImportance} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="feature" width={140} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="importance" fill="#2563eb" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="SHAP Summary Scatter"
          subtitle="Positive vs negative impact"
          helperText="Positive SHAP values increase predicted CLV; negative SHAP values decrease predicted CLV."
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="shapValue" name="SHAP Value" />
              <YAxis
                type="number"
                dataKey="featureIndex"
                domain={[1, featureOrder.length]}
                tickFormatter={(value: number) => featureOrder[Math.max(Number(value) - 1, 0)] || ''}
                width={120}
              />
              <Tooltip />
              <Scatter data={highBand} fill="#2563eb" name="High Feature Value" />
              <Scatter data={lowBand} fill="#f59e0b" name="Low Feature Value" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Local Explanation for One Customer</h3>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          This waterfall-style view shows which factors pushed the prediction up and which pulled it down for a single customer profile.
        </p>

        <div className="mt-4 space-y-2">
          {data.shap.localContributions.map((row) => {
            const effect = Number(row.effect);
            const width = Math.max((Math.abs(effect) / maxEffect) * 100, 6);
            const positive = effect > 0;
            return (
              <div key={String(row.feature)} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{String(row.feature)}</span>
                  <span className={positive ? 'text-emerald-600' : 'text-rose-600'}>{positive ? '+' : ''}{effect.toFixed(0)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-2 rounded-full ${positive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </article>

      <div className="grid gap-4 xl:grid-cols-2">
        <ShapDriverCard title="Top Positive Drivers" tone="positive" rows={data.shap.positiveDrivers as any} />
        <ShapDriverCard title="Top Negative Drivers" tone="negative" rows={data.shap.negativeDrivers as any} />
      </div>

      <InsightCard title="Business Interpretation" points={data.shap.interpretation} />
    </section>
  );
};

export default ShapExplainability;
