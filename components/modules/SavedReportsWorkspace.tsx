import { SavedReport, SavedReportChartSource, ProgressStream, VerificationDay } from "@/lib/types";
import { TrendSparkline } from "../ui/TrendSparkline";

interface SavedReportsWorkspaceProps {
  reports: SavedReport[];
  selectedReportId: string | null;
  onSelectReport: (reportId: string) => void;
  progressStreams: ProgressStream[];
  verificationSummary: VerificationDay[];
}

function pickSeries(
  chartSource: SavedReportChartSource | undefined,
  streams: ProgressStream[],
  verificationSummary: VerificationDay[]
) {
  if (!chartSource) {
    return null;
  }
  if (chartSource === "verifications") {
    return verificationSummary.map((day) => ({ period: day.date, value: day.verified }));
  }
  const stream = streams.find((item) => item.period === chartSource);
  return stream?.points ?? null;
}

export function SavedReportsWorkspace({
  reports,
  selectedReportId,
  onSelectReport,
  progressStreams,
  verificationSummary
}: SavedReportsWorkspaceProps) {
  if (reports.length === 0) {
    return (
      <section className="card saved-reports-empty">
        <h2>Saved reports</h2>
        <p>Capture a chat response as a report to track it here with live metrics.</p>
      </section>
    );
  }

  const activeReport = reports.find((report) => report.id === selectedReportId) ?? reports[0];
  const series = pickSeries(activeReport.chartSource, progressStreams, verificationSummary);

  return (
    <section className="saved-reports-view">
      <aside className="saved-reports-list" aria-label="Saved reports">
        <ul>
          {reports.map((report) => (
            <li key={report.id}>
              <button
                type="button"
                className={`saved-report-link ${report.id === activeReport.id ? "active" : ""}`.trim()}
                onClick={() => onSelectReport(report.id)}
              >
                <span className="saved-report-title">{report.title}</span>
                <span className="saved-report-meta">{new Date(report.createdAt).toLocaleString()}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="saved-report-detail card">
        <header className="saved-report-header">
          <div>
            <h2>{activeReport.title}</h2>
            <p className="saved-report-subtitle">Prompt: {activeReport.prompt}</p>
          </div>
          <span className="saved-report-timestamp">Captured {new Date(activeReport.createdAt).toLocaleString()}</span>
        </header>

        {series ? (
          <div className="saved-report-chart">
            <TrendSparkline points={series} />
          </div>
        ) : (
          <div className="saved-report-chart saved-report-chart--empty">No chart data yet for this insight.</div>
        )}

        <div className="saved-report-content">
          <div>
            <div className="saved-report-section-title">Summary</div>
            <p>{activeReport.summary}</p>
          </div>
          {activeReport.highlights.length ? (
            <div>
              <div className="saved-report-section-title">Highlights</div>
              <ul>
                {activeReport.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {activeReport.recommendedActions.length ? (
            <div>
              <div className="saved-report-section-title">Recommended actions</div>
              <ul>
                {activeReport.recommendedActions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
