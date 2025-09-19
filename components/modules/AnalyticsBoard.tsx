import { Alert, DelayInsight, TurnaroundBenchmark, WhatIfInput, WhatIfOutput } from "@/lib/types";
import { BottleneckExplorer } from "./BottleneckExplorer";
import { WhatIfSimulator } from "./WhatIfSimulator";
import { DelayInsights } from "./DelayInsights";

interface AnalyticsBoardProps {
  benchmarks: TurnaroundBenchmark[];
  alerts: Alert[];
  delayInsights: DelayInsight[];
  onSimulate: (input: WhatIfInput) => Promise<WhatIfOutput>;
}

export function AnalyticsBoard({ benchmarks, alerts, delayInsights, onSimulate }: AnalyticsBoardProps) {
  return (
    <section className="analytics-grid">
      <div className="card analytics-card">
        <h2>Bottleneck intelligence</h2>
        <BottleneckExplorer benchmarks={benchmarks} alerts={alerts} />
      </div>
      <div className="card analytics-card">
        <h2>What-if ETA simulator</h2>
        <WhatIfSimulator onSimulate={onSimulate} />
      </div>
      <div className="card analytics-card">
        <h2>Delay breakdown</h2>
        <DelayInsights insights={delayInsights} />
      </div>
    </section>
  );
}

