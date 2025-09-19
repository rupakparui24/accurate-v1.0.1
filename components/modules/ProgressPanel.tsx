import { ProgressStream } from "@/lib/types";
import { TrendSparkline } from "../ui/TrendSparkline";

interface ProgressPanelProps {
  streams: ProgressStream[];
}

export function ProgressPanel({ streams }: ProgressPanelProps) {
  return (
    <div className="card">
      <h2 style={{ marginBottom: "16px" }}>Progress intelligence</h2>
      <div className="grid three">
        {streams.map((stream) => {
          const latest = stream.points.at(-1);
          const previous = stream.points.at(-2);
          const delta = latest && previous ? latest.value - previous.value : 0;
          return (
            <div
              key={stream.label}
              style={{
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(148, 163, 184, 0.12)",
                padding: "14px",
                background: "rgba(15, 23, 42, 0.55)",
                display: "grid",
                gap: "12px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{stream.period.toUpperCase()}</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 600 }}>{latest?.value ?? "--"}</div>
                </div>
                <div className={`badge ${delta >= 0 ? "success" : "warning"}`}>
                  {delta >= 0 ? "+" : ""}
                  {delta}
                </div>
              </div>
              <TrendSparkline points={stream.points} />
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Last checkpoint: {latest?.period ?? "Unknown"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
