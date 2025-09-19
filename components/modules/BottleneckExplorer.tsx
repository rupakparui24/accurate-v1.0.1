import { Alert, TurnaroundBenchmark } from "@/lib/types";
import { StatusPill } from "../ui/StatusPill";

interface BottleneckExplorerProps {
  benchmarks: TurnaroundBenchmark[];
  alerts: Alert[];
}

function badgeTone(severity: Alert["severity"]): "default" | "warning" | "danger" {
  if (severity === "critical") {
    return "danger";
  }
  if (severity === "warning") {
    return "warning";
  }
  return "default";
}

export function BottleneckExplorer({ benchmarks, alerts }: BottleneckExplorerProps) {
  return (
    <div className="card">
      <h2 style={{ marginBottom: "16px" }}>Bottleneck intelligence</h2>
      <div className="grid two" style={{ marginBottom: "20px" }}>
        <div>
          <div className="section-title">Average completion time</div>
          <div className="table-like">
            <div className="table-like-header">
              <div>Region</div>
              <div>Check type</div>
              <div>Average days</div>
              <div>Trend</div>
            </div>
            {benchmarks.map((item) => (
              <div className="table-like-row" key={`${item.region}-${item.checkType}`}>
                <div>{item.region}</div>
                <div>{item.checkType}</div>
                <div>{item.averageDays} days</div>
                <div style={{ color: item.trend === "up" ? "var(--warning)" : item.trend === "down" ? "var(--success)" : "var(--text-muted)" }}>
                  {item.trend === "up" ? "Rising" : item.trend === "down" ? "Improving" : "Flat"} {item.deltaPercentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="section-title">Active alerts</div>
          <div style={{ display: "grid", gap: "12px" }}>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(148, 163, 184, 0.12)",
                  padding: "14px",
                  background: "rgba(15, 23, 42, 0.55)",
                  display: "grid",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <strong>{alert.title}</strong>
                  <StatusPill tone={badgeTone(alert.severity)}>{alert.severity}</StatusPill>
                </div>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>{alert.detail}</p>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Raised {new Date(alert.raisedAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
