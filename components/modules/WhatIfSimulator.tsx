"use client";

import { useState } from "react";
import { WhatIfInput, WhatIfOutput } from "@/lib/types";

interface WhatIfSimulatorProps {
  onSimulate: (input: WhatIfInput) => Promise<WhatIfOutput> | WhatIfOutput;
}

const REGIONS = ["US-East", "US-West", "US-South", "India-North", "APAC", "EMEA"];

export function WhatIfSimulator({ onSimulate }: WhatIfSimulatorProps) {
  const [formState, setFormState] = useState<WhatIfInput>({
    region: REGIONS[0],
    orderVolume: 200,
    submitsPerWeek: 50,
    rush: false
  });
  const [result, setResult] = useState<WhatIfOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const prediction = await onSimulate(formState);
      setResult(prediction);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <h2>What-if ETA simulator</h2>
      </div>
      <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "16px" }}>
        Model turnaround time when you drop a new order batch by region and staffing pace.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px", marginBottom: "18px" }}>
        <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          <select
            value={formState.region}
            onChange={(event) => setFormState((prev) => ({ ...prev, region: event.target.value }))}
          >
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={formState.orderVolume}
            onChange={(event) => setFormState((prev) => ({ ...prev, orderVolume: Number(event.target.value) }))}
            placeholder="Order volume"
          />
          <input
            type="number"
            min={1}
            value={formState.submitsPerWeek}
            onChange={(event) => setFormState((prev) => ({ ...prev, submitsPerWeek: Number(event.target.value) }))}
            placeholder="Submits per week"
          />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
          <input
            type="checkbox"
            checked={formState.rush}
            onChange={(event) => setFormState((prev) => ({ ...prev, rush: event.target.checked }))}
          />
          Expedite via rush lane vendors
        </label>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="primary" disabled={loading}>
            {loading ? "Calculating..." : "Predict"}
          </button>
        </div>
      </form>

      {result ? (
        <div style={{
          borderRadius: "var(--radius-sm)",
          border: "1px solid rgba(56, 189, 248, 0.25)",
          padding: "16px",
          background: "rgba(56, 189, 248, 0.08)",
          display: "grid",
          gap: "10px"
        }}>
          <div style={{ fontSize: "1.4rem", fontWeight: 600 }}>~{result.projectedDays} days</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Confidence {Math.round(result.confidence * 100)}%
          </div>
          <div style={{ fontSize: "0.85rem" }}>{result.narrative}</div>
          <ul style={{ margin: "0 0 0 18px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {result.drivers.map((driver) => (
              <li key={driver}>{driver}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
