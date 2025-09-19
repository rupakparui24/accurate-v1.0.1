import { DelayInsight } from "@/lib/types";
import { StatusPill } from "../ui/StatusPill";

interface DelayInsightsProps {
  insights: DelayInsight[];
}

const CATEGORY_TONE: Record<DelayInsight["category"], "default" | "warning" | "danger"> = {
  regional: "warning",
  system: "danger",
  candidate: "warning"
};

export function DelayInsights({ insights }: DelayInsightsProps) {
  return (
    <div className="card">
      <h2 style={{ marginBottom: "16px" }}>Delay breakdown</h2>
      <div style={{ display: "grid", gap: "14px" }}>
        {insights.map((item) => (
          <div
            key={item.id}
            style={{
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgba(148, 163, 184, 0.12)",
              padding: "16px",
              background: "rgba(15, 23, 42, 0.55)",
              display: "grid",
              gap: "8px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{item.region}</strong>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {item.contributingOrders} orders affected
                </div>
              </div>
              <StatusPill tone={CATEGORY_TONE[item.category]}>{item.category}</StatusPill>
            </div>
            <div style={{ fontSize: "0.9rem" }}>{item.summary}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Adds ~{item.impactDays} days</div>
            <div style={{ fontSize: "0.8rem" }}>Recommendation: {item.recommendedAction}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
