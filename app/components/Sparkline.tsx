export function Sparkline({ values, height = 48 }: { values: number[]; height?: number }) {
  if (values.length < 2) return <div className="border-b border-dashed border-[var(--line)]" style={{ height }} />;
  const w = 200;
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${height - 3 - ((v - min) / span) * (height - 6)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }} aria-hidden>
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
