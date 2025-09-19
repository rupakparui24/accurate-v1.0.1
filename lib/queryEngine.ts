import {
  Applicant,
  CaseStatus,
  DelayInsight,
  QueryResult,
  TurnaroundBenchmark,
  VerificationDay
} from "./types";

export interface QueryContext {
  applicants: Applicant[];
  caseStatuses: CaseStatus[];
  benchmarks: TurnaroundBenchmark[];
  verificationSummary: VerificationDay[];
  delayInsights: DelayInsight[];
}

export function executeConsoleQuery(query: string, context: QueryContext): QueryResult {
  const lowered = query.toLowerCase();

  if (lowered.includes("status of")) {
    const candidate = context.caseStatuses.find(({ applicantName }) =>
      lowered.includes(applicantName.toLowerCase())
    );

    if (candidate) {
      const pending = candidate.events.filter((event) => event.status !== "complete");
      return {
        intent: "candidate_status",
        summary: `${candidate.applicantName}'s check is ${candidate.overallStatus.replace("_", " ")}. Estimated completion ${new Date(
          candidate.estimatedCompletion
        ).toLocaleString()}.`,
        highlights: pending.length
          ? pending.map((item) => `${item.label} owned by ${item.owner} is ${item.status}.`)
          : ["All components completed."]
      };
    }
  }

  if (lowered.includes("average") && lowered.includes("time")) {
    const benchmark = context.benchmarks.find(({ region, checkType }) =>
      lowered.includes(region.toLowerCase()) || lowered.includes(checkType.toLowerCase())
    );

    if (benchmark) {
      const direction =
        benchmark.trend === "up"
          ? "Rising"
          : benchmark.trend === "down"
            ? "Improving"
            : "Stable";
      return {
        intent: "benchmark_lookup",
        summary: `${benchmark.checkType} checks in ${benchmark.region} average ${benchmark.averageDays} days. ${direction} by ${Math.abs(
          benchmark.deltaPercentage
        )}% week over week.`,
        recommendedActions: [
          benchmark.trend === "up"
            ? "Investigate vendor throughput and add surge capacity."
            : "Maintain current staffing, monitor weekly for deviations."
        ].filter(Boolean) as string[]
      };
    }
  }

  if (lowered.includes("how many") && lowered.includes("verified")) {
    const last = context.verificationSummary.at(-1);
    const prev = context.verificationSummary.at(-2);
    if (last && prev) {
      const delta = last.verified - prev.verified;
      return {
        intent: "verification_delta",
        summary: `${last.verified} profiles verified today. ${delta >= 0 ? "+" : ""}${delta} versus yesterday (${prev.verified}).`
      };
    }
  }

  if (lowered.includes("delay") || lowered.includes("why")) {
    const matched = context.delayInsights.find((item) =>
      lowered.includes(item.region.toLowerCase()) || lowered.includes(item.category)
    );

    if (matched) {
      return {
        intent: "delay_breakdown",
        summary: `${matched.region} delays add ~${matched.impactDays} days (${matched.contributingOrders} orders impacted).`,
        highlights: [matched.summary],
        recommendedActions: [matched.recommendedAction]
      };
    }
  }

  return {
    intent: "fallback",
    summary: "I can surface candidate statuses, verification progress, turnaround averages, or explain delays. Try asking for one of those insights."
  };
}
