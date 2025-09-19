interface MetricProps {
  label: string;
  value: string;
  delta?: string;
  tone?: "default" | "positive" | "warning";
}

export function MetricTile({ label, value, delta, tone = "default" }: MetricProps) {
  const toneColor =
    tone === "positive" ? "var(--success)" : tone === "warning" ? "var(--warning)" : "var(--text-muted)";

  return (
    <div className="metric">
      <span className="metric-value">{value}</span>
      <div>
        <div className="metric-label" style={{ color: toneColor }}>
          {label}
        </div>
        {delta ? <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{delta}</div> : null}
      </div>
    </div>
  );
}
