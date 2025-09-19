import { randomUUID } from "crypto";
import {
  Alert,
  Applicant,
  ApplicantStatus,
  CaseStatus,
  DashboardData,
  DelayInsight,
  HistoryEntry,
  ProgressStream,
  Recommendation,
  TurnaroundBenchmark,
  VerificationDay,
  WhatIfInput,
  WhatIfOutput
} from "./types";

const applicants: Applicant[] = [
  {
    id: "APP-1021",
    name: "Jane Doe",
    role: "Senior Data Analyst",
    region: "US-East",
    status: "in_progress",
    submittedAt: "2025-09-17T13:45:00Z",
    verifiedAt: undefined
  },
  {
    id: "APP-1020",
    name: "Luis Martínez",
    role: "Compliance Specialist",
    region: "US-West",
    status: "verified",
    submittedAt: "2025-09-12T09:12:00Z",
    verifiedAt: "2025-09-18T14:10:00Z"
  },
  {
    id: "APP-1019",
    name: "Priya Singh",
    role: "People Partner",
    region: "India-North",
    status: "flagged",
    submittedAt: "2025-09-11T16:22:00Z",
    verifiedAt: undefined
  },
  {
    id: "APP-1018",
    name: "Noah Johnson",
    role: "Sales Director",
    region: "US-South",
    status: "new",
    submittedAt: "2025-09-19T08:15:00Z",
    verifiedAt: undefined
  },
  {
    id: "APP-1017",
    name: "Aiko Yamamoto",
    role: "Finance Manager",
    region: "APAC",
    status: "verified",
    submittedAt: "2025-09-08T10:05:00Z",
    verifiedAt: "2025-09-15T17:32:00Z"
  }
];

const verificationSummary: VerificationDay[] = [
  { date: "2025-09-14", verified: 18, total: 24 },
  { date: "2025-09-15", verified: 22, total: 26 },
  { date: "2025-09-16", verified: 25, total: 28 },
  { date: "2025-09-17", verified: 21, total: 25 },
  { date: "2025-09-18", verified: 29, total: 31 },
  { date: "2025-09-19", verified: 34, total: 37 },
  { date: "2025-09-20", verified: 31, total: 33 }
];

const caseStatuses: CaseStatus[] = [
  {
    id: "CASE-8901",
    applicantId: "APP-1021",
    applicantName: "Jane Doe",
    position: "Senior Data Analyst",
    region: "US-East",
    overallStatus: "in_progress",
    estimatedCompletion: "2025-09-22T18:00:00Z",
    events: [
      {
        label: "Identity verification",
        timestamp: "2025-09-17T15:21:00Z",
        owner: "LexisNexis",
        status: "complete"
      },
      {
        label: "Criminal check",
        timestamp: "2025-09-18T10:12:00Z",
        owner: "Checkr",
        status: "complete"
      },
      {
        label: "Employment verification",
        timestamp: "2025-09-18T10:12:00Z",
        owner: "Company HR",
        status: "pending",
        notes: "Waiting on manager response"
      }
    ]
  },
  {
    id: "CASE-8898",
    applicantId: "APP-1019",
    applicantName: "Priya Singh",
    position: "People Partner",
    region: "India-North",
    overallStatus: "requires_attention",
    estimatedCompletion: "2025-09-24T16:00:00Z",
    events: [
      {
        label: "Identity verification",
        timestamp: "2025-09-12T11:00:00Z",
        owner: "Onfido",
        status: "complete"
      },
      {
        label: "Global sanctions",
        timestamp: "2025-09-14T18:00:00Z",
        owner: "Internal Risk",
        status: "flagged",
        notes: "Further review requested"
      }
    ]
  },
  {
    id: "CASE-8893",
    applicantId: "APP-1017",
    applicantName: "Aiko Yamamoto",
    position: "Finance Manager",
    region: "APAC",
    overallStatus: "complete",
    estimatedCompletion: "2025-09-16T12:00:00Z",
    events: [
      {
        label: "Identity verification",
        timestamp: "2025-09-09T07:40:00Z",
        owner: "GBG",
        status: "complete"
      },
      {
        label: "Criminal check",
        timestamp: "2025-09-11T13:45:00Z",
        owner: "First Advantage",
        status: "complete"
      },
      {
        label: "Employment history",
        timestamp: "2025-09-15T16:10:00Z",
        owner: "Regional Ops",
        status: "complete"
      }
    ]
  }
];

const alerts: Alert[] = [
  {
    id: "ALT-3001",
    severity: "warning",
    title: "NY criminal checks trending slower",
    detail: "Average completion time is up 20% week-over-week. Vendor SLA review recommended.",
    raisedAt: "2025-09-19T09:30:00Z"
  },
  {
    id: "ALT-3002",
    severity: "critical",
    title: "Employer verification backlog",
    detail: "15 cases pending > 72 hours due to auto-fax outage. Switch to manual outreach.",
    raisedAt: "2025-09-18T21:50:00Z"
  }
];

const benchmarks: TurnaroundBenchmark[] = [
  {
    region: "US-East",
    checkType: "Criminal",
    averageDays: 2.1,
    trend: "up",
    deltaPercentage: 12
  },
  {
    region: "US-West",
    checkType: "Employment",
    averageDays: 3.8,
    trend: "down",
    deltaPercentage: -8
  },
  {
    region: "India-North",
    checkType: "Education",
    averageDays: 5.2,
    trend: "flat",
    deltaPercentage: 1
  }
];

const progressStreams: ProgressStream[] = [
  {
    label: "Weekly",
    period: "weekly",
    points: [
      { period: "Week 31", value: 112 },
      { period: "Week 32", value: 124 },
      { period: "Week 33", value: 138 },
      { period: "Week 34", value: 150 },
      { period: "Week 35", value: 146 },
      { period: "Week 36", value: 158 }
    ]
  },
  {
    label: "Monthly",
    period: "monthly",
    points: [
      { period: "Apr", value: 410 },
      { period: "May", value: 452 },
      { period: "Jun", value: 475 },
      { period: "Jul", value: 498 },
      { period: "Aug", value: 520 },
      { period: "Sep", value: 548 }
    ]
  },
  {
    label: "Yearly",
    period: "yearly",
    points: [
      { period: "2021", value: 3200 },
      { period: "2022", value: 3580 },
      { period: "2023", value: 4025 },
      { period: "2024", value: 4380 },
      { period: "2025", value: 4615 }
    ]
  }
];

let history: HistoryEntry[] = [
  {
    historyId: "HIST-5001",
    userId: "hr-manager-1",
    searchQuery: "Show me cases delayed in New York",
    intent: "case_delay_summary",
    entities: { region: "US-East", city: "New York" },
    timestamp: "2025-09-18T14:25:00Z"
  },
  {
    historyId: "HIST-5002",
    userId: "hr-manager-1",
    searchQuery: "What is the status of Jane Doe's background check?",
    intent: "candidate_status",
    entities: { candidate: "Jane Doe" },
    timestamp: "2025-09-18T18:42:00Z"
  },
  {
    historyId: "HIST-5003",
    userId: "hr-manager-2",
    searchQuery: "Average turnaround for education verifications in California",
    intent: "benchmark_lookup",
    entities: { checkType: "Education", region: "California" },
    timestamp: "2025-09-19T07:15:00Z"
  }
];

const delayInsights: DelayInsight[] = [
  {
    id: "DELAY-9001",
    region: "Nepal",
    category: "regional",
    summary: "Local municipality records offline due to security audit.",
    impactDays: 4,
    contributingOrders: 18,
    recommendedAction: "Route verifications through Kathmandu backup vendor until services resume."
  },
  {
    id: "DELAY-9002",
    region: "US-East",
    category: "system",
    summary: "Database maintenance window caused 6-hour outage for automated employer outreach.",
    impactDays: 1,
    contributingOrders: 42,
    recommendedAction: "Enable SMS fallback within the outreach playbook for the next 72 hours."
  },
  {
    id: "DELAY-9003",
    region: "Philippines",
    category: "candidate",
    summary: "Candidates responding outside SLA; 32% requiring 2nd follow-up.",
    impactDays: 2,
    contributingOrders: 27,
    recommendedAction: "Launch WhatsApp reminders and extend follow-up hours to 9pm local."
  }
];

const globalRecommendedIntents: Recommendation[] = [
  {
    type: "global",
    title: "Adverse findings digest",
    description: "See all adverse findings across regions for the past 30 days.",
    suggestedQuery: "Show all adverse findings from the last 30 days"
  },
  {
    type: "global",
    title: "Vendor performance leaderboard",
    description: "Compare average SLA attainment for background check vendors.",
    suggestedQuery: "Which vendors are missing SLA this month?"
  }
];

const userRecommendations = new Map<string, Recommendation[]>();

function computePersonalRecommendations(userId: string): Recommendation[] {
  if (userRecommendations.has(userId)) {
    return userRecommendations.get(userId)!;
  }

  const personalHistory = history
    .filter((entry) => entry.userId === userId)
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));

  const uniqueIntents = Array.from(new Set(personalHistory.map((item) => item.intent)));

  const recs: Recommendation[] = uniqueIntents.slice(0, 3).map((intent) => {
    const sample = personalHistory.find((entry) => entry.intent === intent)!;
    return {
      type: "personal",
      title: `Revisit: ${sample.searchQuery}`,
      description: "Jump back into your recent workflow with a single tap.",
      suggestedQuery: sample.searchQuery
    };
  });

  userRecommendations.set(userId, recs);
  return recs;
}

export async function getDashboardSnapshot(userId = "hr-manager-1"): Promise<DashboardData> {
  return {
    applicants: [...applicants],
    verificationSummary: [...verificationSummary],
    caseStatuses: [...caseStatuses],
    alerts: [...alerts],
    benchmarks: [...benchmarks],
    history: history.filter((entry) => entry.userId === userId),
    recommendations: [
      ...computePersonalRecommendations(userId),
      ...globalRecommendedIntents
    ],
    progressStreams: [...progressStreams],
    delayInsights: [...delayInsights]
  };
}

export async function addApplicant(payload: {
  name: string;
  role: string;
  region: string;
  status?: ApplicantStatus;
}): Promise<Applicant> {
  const newApplicant: Applicant = {
    id: `APP-${Math.floor(Math.random() * 9000) + 1000}`,
    name: payload.name,
    role: payload.role,
    region: payload.region,
    status: payload.status ?? "new",
    submittedAt: new Date().toISOString()
  };

  applicants.unshift(newApplicant);
  userRecommendations.delete("hr-manager-1");
  return newApplicant;
}

export async function removeApplicant(id: string): Promise<boolean> {
  const index = applicants.findIndex((applicant) => applicant.id === id);
  if (index === -1) {
    return false;
  }

  applicants.splice(index, 1);
  return true;
}

export async function recordQuery(entry: Omit<HistoryEntry, "historyId" | "timestamp">): Promise<HistoryEntry> {
  const newEntry: HistoryEntry = {
    historyId: randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry
  };

  history.push(newEntry);
  userRecommendations.delete(entry.userId);
  return newEntry;
}

export async function generateWhatIfPrediction(input: WhatIfInput): Promise<WhatIfOutput> {
  const base = input.orderVolume / Math.max(input.submitsPerWeek, 1);
  const regionAdjustment = {
    "US-East": 1.8,
    "US-West": 2.2,
    "US-South": 2.0,
    "India-North": 2.6,
    APAC: 2.4,
    EMEA: 2.1
  } as Record<string, number>;

  const baseDays = regionAdjustment[input.region] ?? 2.3;
  const rushFactor = input.rush ? 0.8 : 1;
  const projectedDays = Math.round(baseDays * base * rushFactor * 10) / 10;

  const drivers: string[] = [];
  if (input.orderVolume > 300) {
    drivers.push("High volume: allocate additional verification specialists.");
  }
  if (regionAdjustment[input.region]) {
    drivers.push(`Historical SLA in ${input.region} averaging ${baseDays.toFixed(1)} days.`);
  } else {
    drivers.push("Region uses global SLA baseline of 2.3 days.");
  }
  if (input.rush) {
    drivers.push("Rush handling activated: leveraging premium vendor lanes.");
  }

  return {
    projectedDays,
    confidence: input.rush ? 0.6 : 0.75,
    drivers,
    narrative: `Expect ${projectedDays} days to close ${input.orderVolume} candidates in ${input.region}. Plan recruiter staffing in ${Math.ceil(projectedDays / 2)} shifts.`
  };
}

export async function getDelayInsights(): Promise<DelayInsight[]> {
  return [...delayInsights];
}

export async function getAlerts(): Promise<Alert[]> {
  return [...alerts];
}

export async function getBenchmarks(): Promise<TurnaroundBenchmark[]> {
  return [...benchmarks];
}

export async function getHistory(userId = "hr-manager-1"): Promise<HistoryEntry[]> {
  return history.filter((entry) => entry.userId === userId);
}

export async function getRecommendations(userId = "hr-manager-1"): Promise<Recommendation[]> {
  return [
    ...computePersonalRecommendations(userId),
    ...globalRecommendedIntents
  ];
}
export async function getApplicantsList(): Promise<Applicant[]> {
  return [...applicants];
}

export async function getVerificationSummary(): Promise<VerificationDay[]> {
  return [...verificationSummary];
}

export async function getCaseStatuses(): Promise<CaseStatus[]> {
  return [...caseStatuses];
}
