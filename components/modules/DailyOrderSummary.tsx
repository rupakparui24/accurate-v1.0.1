import { Applicant } from "@/lib/types";
import { formatDate } from "@/lib/formatters";

interface DailyOrderSummaryProps {
  applicants: Applicant[];
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function DailyOrderSummary({ applicants }: DailyOrderSummaryProps) {
  const now = new Date();
  const todayCompleted = applicants.filter((applicant) => {
    if (!applicant.verifiedAt) {
      return false;
    }
    const completedAt = new Date(applicant.verifiedAt);
    return isSameDay(now, completedAt);
  });

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayCompleted = applicants.filter((applicant) => {
    if (!applicant.verifiedAt) {
      return false;
    }
    return isSameDay(yesterday, new Date(applicant.verifiedAt));
  });

  return (
    <section className="card daily-orders">
      <div className="daily-orders-header">
        <div>
          <h2>Daily update</h2>
          <p className="daily-orders-subtitle">Orders marked complete today across the network.</p>
        </div>
        <div className="daily-orders-metric">
          <span className="daily-orders-count">{todayCompleted.length}</span>
          <span className="daily-orders-label">completed today</span>
        </div>
      </div>

      <div className="daily-orders-context">
        <span>Yesterday</span>
        <strong>{yesterdayCompleted.length}</strong>
      </div>

      <div className="daily-orders-list">
        {todayCompleted.length === 0 ? (
          <p className="daily-orders-empty">No orders closed so far today. Your next completions will land here automatically.</p>
        ) : (
          todayCompleted.map((applicant) => (
            <div key={applicant.id} className="daily-order-item">
              <div>
                <div className="daily-order-name">{applicant.name}</div>
                <div className="daily-order-meta">{applicant.role} &bull; {applicant.region}</div>
              </div>
              <div className="daily-order-time">{formatDate(applicant.verifiedAt ?? applicant.submittedAt)}</div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
