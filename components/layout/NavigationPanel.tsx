import { SavedReport } from "@/lib/types";

export type DashboardSection = "home" | "candidateOverview" | "analytics" | "savedReports";

interface NavigationPanelProps {
  activeSection: DashboardSection;
  onSelectSection: (section: DashboardSection) => void;
  savedReports: SavedReport[];
  selectedSavedReportId: string | null;
  onSelectSavedReport: (reportId: string) => void;
}

const NAV_ITEMS: Array<{ key: DashboardSection; label: string; description: string }> = [
  { key: "home", label: "Home", description: "Chat & dashboards" },
  { key: "candidateOverview", label: "Candidate Overview", description: "Daily completions" },
  { key: "analytics", label: "Analytics", description: "Insights & simulators" },
  { key: "savedReports", label: "Saved Reports", description: "Pinned charts" }
];

export function NavigationPanel({
  activeSection,
  onSelectSection,
  savedReports,
  selectedSavedReportId,
  onSelectSavedReport
}: NavigationPanelProps) {
  return (
    <div className="nav-content">
      <div className="nav-brand">
        <div className="nav-mark" aria-hidden="true" />
        <div>
          <div className="nav-title">Aurora Console</div>
          <div className="nav-subtitle">Operations cockpit</div>
        </div>
      </div>

      <nav className="nav-menu" aria-label="Primary">
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                className={`nav-link ${activeSection === item.key ? "active" : ""}`.trim()}
                onClick={() => onSelectSection(item.key)}
              >
                <span className="nav-link-label">{item.label}</span>
                <span className="nav-link-description">{item.description}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="nav-section">
        <div className="nav-section-title">Saved report library</div>
        {savedReports.length === 0 ? (
          <p className="nav-empty">Saved reports will appear here once you capture a chat result.</p>
        ) : (
          <ul className="nav-list nav-saved">
            {savedReports.map((report) => (
              <li key={report.id}>
                <button
                  type="button"
                  className={`nav-saved-button ${selectedSavedReportId === report.id ? "active" : ""}`.trim()}
                  onClick={() => {
                    onSelectSection("savedReports");
                    onSelectSavedReport(report.id);
                  }}
                >
                  <span className="nav-item-title">{report.title}</span>
                  <span className="nav-item-meta">{new Date(report.createdAt).toLocaleDateString()}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

