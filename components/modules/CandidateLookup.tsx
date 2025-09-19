"use client";

import { useMemo, useState } from "react";
import { CaseStatus } from "@/lib/types";
import { formatDate } from "@/lib/formatters";
import { StatusPill } from "../ui/StatusPill";

interface CandidateLookupProps {
  cases: CaseStatus[];
}

const CASE_TONE: Record<CaseStatus["overallStatus"], "default" | "success" | "warning" | "danger"> = {
  in_progress: "warning",
  complete: "success",
  delayed: "danger",
  requires_attention: "danger"
};

export function CandidateLookup({ cases }: CandidateLookupProps) {
  const [term, setTerm] = useState("");

  const filtered = useMemo(() => {
    if (!term.trim()) {
      return cases.slice(0, 3);
    }
    const lowered = term.toLowerCase();
    return cases.filter((item) => item.applicantName.toLowerCase().includes(lowered));
  }, [cases, term]);

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2>Candidate status lookup</h2>
      </div>
      <input
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Type a candidate name"
        style={{ marginBottom: "16px" }}
      />

      <div style={{ display: "grid", gap: "16px" }}>
        {filtered.map((item) => (
          <div
            key={item.id}
            style={{
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgba(148, 163, 184, 0.12)",
              padding: "14px",
              background: "rgba(15, 23, 42, 0.55)",
              display: "grid",
              gap: "10px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{item.applicantName}</strong>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.position}</div>
              </div>
              <StatusPill tone={CASE_TONE[item.overallStatus]}>
                {item.overallStatus.replace("_", " ")}
              </StatusPill>
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              ETA {formatDate(item.estimatedCompletion)}
            </div>
            <div style={{ borderTop: "1px solid rgba(148, 163, 184, 0.08)", paddingTop: "10px", display: "grid", gap: "8px" }}>
              {item.events.map((event) => (
                <div key={event.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                  <div>
                    <div>{event.label}</div>
                    <div style={{ color: "var(--text-muted)" }}>Owner {event.owner}</div>
                  </div>
                  <div style={{ textAlign: "right", color: "var(--text-muted)" }}>
                    <div>{event.status}</div>
                    <div>{formatDate(event.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
