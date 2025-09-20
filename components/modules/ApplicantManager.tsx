"use client";

import { useMemo, useState } from "react";
import { Applicant } from "@/lib/types";
import { formatDate } from "@/lib/formatters";
import { StatusPill } from "../ui/StatusPill";

interface ApplicantManagerProps {
  applicants: Applicant[];
  onAddApplicant: (payload: { name: string; role: string; region: string }) => Promise<void> | void;
  onRemoveApplicant: (applicant: Applicant) => Promise<void> | void;
  onPauseApplicant?: (applicant: Applicant) => void;
  pausedApplicantIds?: Set<string>;
  onNotify?: (message: string) => void;
}

const STATUS_TONE: Record<Applicant["status"], "default" | "success" | "warning" | "danger"> = {
  new: "default",
  in_progress: "warning",
  verified: "success",
  flagged: "danger"
};

const STATUS_PROGRESS_PRESETS: Record<Applicant["status"], { percent: number; label: string }> = {
  new: { percent: 18, label: "Intake queued" },
  in_progress: { percent: 52, label: "Checks running" },
  verified: { percent: 100, label: "Completed" },
  flagged: { percent: 34, label: "Action required" }
};

function normalizePercent(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function ApplicantManager({
  applicants,
  onAddApplicant,
  onRemoveApplicant,
  onPauseApplicant,
  pausedApplicantIds,
  onNotify
}: ApplicantManagerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [formState, setFormState] = useState({ name: "", role: "", region: "" });

  const stats = useMemo(() => {
    const verified = applicants.filter((applicant) => applicant.status === "verified").length;
    const flagged = applicants.filter((applicant) => applicant.status === "flagged").length;
    return { total: applicants.length, verified, flagged };
  }, [applicants]);

  const listSummary = useMemo(() => {
    if (applicants.length === 0) {
      return { start: 0, end: 0, total: 0 };
    }
    return { start: 1, end: applicants.length, total: applicants.length };
  }, [applicants.length]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.name.trim() || !formState.role.trim() || !formState.region.trim()) {
      return;
    }

    await onAddApplicant({ ...formState });
    setFormState({ name: "", role: "", region: "" });
    setIsAdding(false);
  };

  const renderOrderDate = (value: string) => {
    const asDate = new Date(value);
    if (Number.isNaN(asDate.getTime())) {
      return value;
    }
    return asDate.toLocaleDateString(undefined, {
      month: "2-digit",
      day: "2-digit",
      year: "numeric"
    });
  };

  const computeProgressMeta = (applicant: Applicant, isPaused: boolean) => {
    if (isPaused) {
      return { percent: 4, label: "Paused" };
    }
    const percent = normalizePercent(applicant.progressPercent ?? STATUS_PROGRESS_PRESETS[applicant.status].percent);
    const label = applicant.etaLabel ?? STATUS_PROGRESS_PRESETS[applicant.status].label;
    return { percent, label };
  };

  return (
    <section className="card applicant-manager" aria-label="Applicant runway">
      <div className="applicant-manager-header">
        <h2>Applicant runway</h2>
        <button type="button" className="primary" onClick={() => setIsAdding((prev) => !prev)}>
          {isAdding ? "Close" : "Add applicant"}
        </button>
      </div>

      <div className="applicant-manager-stats">
        <div>
          <div className="metric-value">{stats.total}</div>
          <div className="metric-label">in pipeline</div>
        </div>
        <div>
          <div className="metric-value" style={{ color: "var(--success)" }}>{stats.verified}</div>
          <div className="metric-label">verified</div>
        </div>
        <div>
          <div className="metric-value" style={{ color: "var(--danger)" }}>{stats.flagged}</div>
          <div className="metric-label">flagged</div>
        </div>
      </div>

      {isAdding ? (
        <form onSubmit={handleSubmit} className="applicant-manager-form">
          <div className="applicant-manager-form-grid">
            <input
              required
              placeholder="Full name"
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            />
            <input
              required
              placeholder="Role"
              value={formState.role}
              onChange={(event) => setFormState((prev) => ({ ...prev, role: event.target.value }))}
            />
            <input
              required
              placeholder="Region"
              value={formState.region}
              onChange={(event) => setFormState((prev) => ({ ...prev, region: event.target.value }))}
            />
          </div>
          <div className="applicant-manager-form-actions">
            <button type="button" className="ghost" onClick={() => setIsAdding(false)}>
              Cancel
            </button>
            <button type="submit" className="primary">
              Save
            </button>
          </div>
        </form>
      ) : null}

      {applicants.length === 0 ? (
        <p className="applicant-empty">No applicants in the runway yet. Add a candidate to begin tracking.</p>
      ) : (
        <div className="applicant-runway-table" role="table" aria-label="Applicants">
          <div className="applicant-runway-head" role="row">
            <span role="columnheader">Name</span>
            <span role="columnheader">Search ID</span>
            <span role="columnheader">Requestor</span>
            <span role="columnheader">Package name</span>
            <span role="columnheader">Order date</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">Progress &amp; ETA</span>
            <span role="columnheader" className="applicant-actions-header">Actions</span>
          </div>
          <div className="applicant-runway-body" role="rowgroup">
            {applicants.map((applicant) => {
              const isPaused = pausedApplicantIds?.has(applicant.id) ?? false;
              const progress = computeProgressMeta(applicant, isPaused);
              return (
                <div className="applicant-runway-row" role="row" key={applicant.id}>
                  <div className="applicant-cell applicant-name-cell" role="cell">
                    <div className="applicant-name">{applicant.name}</div>
                    <div className="applicant-role">{applicant.role}</div>
                  </div>
                  <div className="applicant-cell applicant-id-cell" role="cell">
                    <span>{applicant.searchId}</span>
                  </div>
                  <div className="applicant-cell applicant-requestor-cell" role="cell">
                    <span>{applicant.requestor}</span>
                  </div>
                  <div className="applicant-cell applicant-package-cell" role="cell">
                    <span>{applicant.packageName}</span>
                  </div>
                  <div className="applicant-cell applicant-date-cell" role="cell">
                    <span>{renderOrderDate(applicant.orderDate)}</span>
                  </div>
                  <div className="applicant-cell applicant-status-cell" role="cell">
                    <StatusPill tone={STATUS_TONE[applicant.status]}>
                      {applicant.status.replace("_", " ")}
                    </StatusPill>
                    {isPaused ? <StatusPill tone="warning">paused</StatusPill> : null}
                  </div>
                  <div className={`applicant-cell applicant-progress-cell${isPaused ? " paused" : ""}`} role="cell">
                    <div className="applicant-progress-bar" aria-hidden="true">
                      <div className="applicant-progress-fill" style={{ width: `${progress.percent}%` }} />
                    </div>
                    <div className="applicant-progress-meta">
                      <span>{progress.label}</span>
                      <strong>{progress.percent}%</strong>
                    </div>
                  </div>
                  <div className="applicant-cell applicant-actions-cell" role="cell">
                    {onPauseApplicant ? (
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => {
                          onPauseApplicant(applicant);
                          onNotify?.(isPaused ? `${applicant.name} resumed` : `${applicant.name} paused`);
                        }}
                      >
                        {isPaused ? "Resume" : "Pause"}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="danger"
                      onClick={async () => {
                        const confirmation = window
                          .prompt(`Type "delete the order" to remove ${applicant.name} from the pipeline.`)
                          ?.trim()
                          .toLowerCase();
                        if (confirmation !== "delete the order") {
                          onNotify?.("Removal cancelled");
                          return;
                        }
                        await onRemoveApplicant(applicant);
                        onNotify?.(`${applicant.name} removed from pipeline`);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="applicant-runway-footer" role="contentinfo">
            <div>
              Showing {listSummary.start}-{listSummary.end} of {listSummary.total}
            </div>
            <div className="applicant-runway-pagination" aria-label="Pagination controls">
              <button type="button" className="ghost" disabled>
                ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¹
              </button>
              <button type="button" className="ghost active">1</button>
              <button type="button" className="ghost" disabled>
                2
              </button>
              <span className="applicant-runway-footnote">Auto-refresh every 60s</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
