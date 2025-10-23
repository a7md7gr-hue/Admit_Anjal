export default function ProgressBar({ value = 0, label }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="grid gap-1">
      {label && <div className="text-sm text-ink-500">{label}</div>}
      <div className="progress">
        <span style={{ width: `${v}%` }} />
      </div>
      <div className="text-xs text-ink-500">{v}%</div>
    </div>
  );
}
