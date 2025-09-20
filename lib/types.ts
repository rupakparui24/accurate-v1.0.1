export type ApplicantStatus = "new" | "in_progress" | "verified" | "flagged";

export interface Applicant {
  id: string;
  name: string;
  role: string;
  region: string;
  status: ApplicantStatus;
  submittedAt: string;
  verifiedAt?: string;
  searchId: string;
  requestor: string;
  packageName: string;
  orderDate: string;
  progressPercent?: number;
  etaLabel?: string;
}

export interface VerificationDay {
  date: string;
  verified: number;
  total: number;
}

export interface CaseEvent {
  label: string;
  timestamp: string;
  owner: string;
  status: "pending" | "complete" | "flagged";
  notes?: string;
}

export interface CaseStatus {
  id: string;
  applicantId: string;
  applicantName: string;
  position: string;
  region: string;
  overallStatus: "in_progress" | "complete" | "delayed" | "requires_attention";
  estimatedCompletion: string;
  events: CaseEvent[];
}

export interface TurnaroundBenchmark {
  region: string;
  checkType: string;
  averageDays: number;
  trend: "up" | "down" | "flat";
  deltaPercentage: number;
}

export interface Alert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
  raisedAt: string;
}

export interface HistoryEntry {
  historyId: string;
  userId: string;
  searchQuery: string;
  intent: string;
  entities: Record<string, unknown>;
  timestamp: string;
}

export interface Recommendation {
  type: "personal" | "global";
  title: string;
  description: string;
  suggestedQuery: string;
}

export interface TrendPoint {
  period: string;
  value: number;
}

export interface ProgressStream {
  label: string;
  period: "weekly" | "monthly" | "yearly";
  points: TrendPoint[];
}

export interface DelayInsight {
  id: string;
  region: string;
  category: "regional" | "system" | "candidate";
  summary: string;
  impactDays: number;
  contributingOrders: number;
  recommendedAction: string;
}

export interface WhatIfInput {
  region: string;
  orderVolume: number;
  submitsPerWeek: number;
  rush?: boolean;
}

export interface WhatIfOutput {
  projectedDays: number;
  confidence: number;
  drivers: string[];
  narrative: string;
}

export interface QueryResult {
  intent: string;
  summary: string;
  highlights?: string[];
  recommendedActions?: string[];
}

export interface ConsoleResponse {
  query: string;
  result: QueryResult;
  createdAt: string;
}

export interface DashboardData {
  applicants: Applicant[];
  verificationSummary: VerificationDay[];
  caseStatuses: CaseStatus[];
  alerts: Alert[];
  benchmarks: TurnaroundBenchmark[];
  history: HistoryEntry[];
  recommendations: Recommendation[];
  progressStreams: ProgressStream[];
  delayInsights: DelayInsight[];
}

export interface ChatAttachment {
  id: string;
  name: string;
  url: string;
  bytes: number;
  contentType?: string;
}

export interface ChatTurn {
  id: string;
  prompt: string;
  attachments: ChatAttachment[];
  createdAt: string;
  response?: QueryResult;
  responseCreatedAt?: string;
}

export interface SavedPrompt {
  id: string;
  label: string;
  prompt: string;
  createdAt: string;
}

export type SavedReportChartSource = "weekly" | "monthly" | "yearly" | "verifications";

export interface SavedReport {
  id: string;
  title: string;
  prompt: string;
  summary: string;
  highlights: string[];
  recommendedActions: string[];
  createdAt: string;
  chartSource?: SavedReportChartSource;
}




