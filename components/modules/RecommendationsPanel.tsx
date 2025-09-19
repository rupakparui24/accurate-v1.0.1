import { HistoryEntry, Recommendation } from "@/lib/types";
import { formatDate } from "@/lib/formatters";

interface RecommendationsPanelProps {
  history: HistoryEntry[];
  recommendations: Recommendation[];
}

export function RecommendationsPanel({ history, recommendations }: RecommendationsPanelProps) {
  const personal = recommendations.filter((item) => item.type === "personal");
  const global = recommendations.filter((item) => item.type === "global");

  return (
    <div className="card">
      <h2 style={{ marginBottom: "16px" }}>Recommendations</h2>
      <div className="grid two">
        <div>
          <div className="section-title">Your recent queries</div>
          {history.length ? (
            <div style={{ display: "grid", gap: "12px" }}>
              {history.map((item) => (
                <div
                  key={item.historyId}
                  style={{
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid rgba(148, 163, 184, 0.12)",
                    padding: "12px",
                    background: "rgba(15, 23, 42, 0.45)"
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>{item.searchQuery}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Intent {item.intent}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{formatDate(item.timestamp)}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No searches captured yet.</p>
          )}
        </div>
        <div>
          <div className="section-title">Suggested next actions</div>
          <div style={{ display: "grid", gap: "12px" }}>
            {personal.map((item) => (
              <div key={item.title} style={{
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                padding: "14px",
                background: "rgba(56, 189, 248, 0.12)"
              }}>
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>{item.title}</div>
                <p style={{ margin: 0, fontSize: "0.85rem" }}>{item.description}</p>
                <code style={{ fontSize: "0.7rem" }}>{item.suggestedQuery}</code>
              </div>
            ))}
            {global.map((item) => (
              <div key={item.title} style={{
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(168, 85, 247, 0.25)",
                padding: "14px",
                background: "rgba(168, 85, 247, 0.12)"
              }}>
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>{item.title}</div>
                <p style={{ margin: 0, fontSize: "0.85rem" }}>{item.description}</p>
                <code style={{ fontSize: "0.7rem" }}>{item.suggestedQuery}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
