interface ShapDriverCardProps {
  title: string;
  tone: 'positive' | 'negative';
  rows: Array<{ feature: string; value: string | number; effect: number }>;
}

const ShapDriverCard = ({ title, tone, rows }: ShapDriverCardProps) => {
  const toneClasses =
    tone === 'positive'
      ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900'
      : 'bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:border-rose-900';

  return (
    <article className={`rounded-2xl border p-4 ${toneClasses}`}>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={row.feature} className="flex items-center justify-between text-sm">
            <span>{row.feature}</span>
            <span className="font-semibold">{Number(row.effect).toFixed(0)}</span>
          </div>
        ))}
      </div>
    </article>
  );
};

export default ShapDriverCard;
