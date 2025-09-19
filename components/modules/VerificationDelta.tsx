import { VerificationDay } from "@/lib/types";

interface VerificationDeltaProps {
  summary: VerificationDay[];
}

export function VerificationDelta({ summary }: VerificationDeltaProps) {
  if (!summary.length) {
    return null;
  }

  const latest = summary.at(-1)!;
  const previous = summary.at(-2);
  const delta = previous ? latest.verified - previous.verified : latest.verified;
  const totalDelta = latest.total - (previous?.total ?? 0);
  const label = delta >= 0 ? "Up" : "Down";

  return (
    <div className="card">
      <h2 style={{ marginBottom: "14px" }}>Daily verification momentum</h2>
      <div className="metric" style={{ marginBottom: "18px" }}>
        <span className="metric-value">{latest.verified}</span>
        <div>
          <div className="metric-label">profiles verified today</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {label} {Math.abs(delta)} vs last checkpoint
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <span className="badge success">Verified delta {delta >= 0 ? "+" : ""}{delta}</span>
        <span className="badge">Total submissions {latest.total}</span>
        <span className="badge warning">Inflow change {totalDelta >= 0 ? "+" : ""}{totalDelta}</span>
      </div>
    </div>
  );
}
