import { ProgressStream } from "@/lib/types";
import { TrendSparkline } from "../ui/TrendSparkline";

interface HomeTrendsProps {
  streams: ProgressStream[];
}

const LABEL_MAP: Record<string, string> = {
  weekly: "Weekly completions",
  monthly: "Monthly throughput",
  yearly: "Yearly coverage"
};

export function HomeTrends({ streams }: HomeTrendsProps) {
  const grouped = streams.reduce<Record<string, ProgressStream | undefined>>((acc, stream) => {
    acc[stream.period] = stream;
    return acc;
  }, {});

  return (
    <section className="home-trends">
      {(["weekly", "monthly", "yearly"] as const).map((key) => {
        const stream = grouped[key];
        if (!stream) {
          return (
            <div key={key} className="card home-trend-card">
              <h3>{LABEL_MAP[key]}</h3>
              <p className="home-trend-empty">Data will appear when this stream is populated.</p>
            </div>
          );
        }
        const latest = stream.points.at(-1)?.value ?? 0;
        const previous = stream.points.at(-2)?.value ?? latest;
        const delta = latest - previous;
        const deltaLabel = delta === 0 ? "No change" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}`;

        return (
          <div key={key} className="card home-trend-card">
            <div className="home-trend-header">
              <h3>{LABEL_MAP[key]}</h3>
              <span className={`home-trend-delta ${delta > 0 ? "up" : delta < 0 ? "down" : "flat"}`.trim()}>
                {deltaLabel}
              </span>
            </div>
            <TrendSparkline points={stream.points} />
            <div className="home-trend-footer">Latest value {latest.toFixed(1)}</div>
          </div>
        );
      })}
    </section>
  );
}
