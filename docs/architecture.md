# Architecture Overview

## Vision
- Natural-language driven HR operations dashboard for background checks and applicant management.
- Provide actionable analytics, recommendations, and predictive insights without traditional menus.

## Data Model (mocked)
- `Applicant`: `{ id, name, role, region, status, submittedAt, verifiedAt }`
- `VerificationSummary`: daily aggregates for verified/total counts.
- `CaseStatus`: status timeline for candidate checks.
- `TurnaroundBenchmark`: average completion time per region/check type.
- `Alert`: anomaly or delay notice with cause + severity.
- `UserQuery`: stored search history `{ historyId, userId, searchQuery, intent, entities, timestamp }`

## Key Experiences
1. **Natural Language Console** (`<CommandConsole />`)
   - Suggests prompts, parses mock intents, shows responses & quick links.
   - Persists history and feeds recommendations component.
2. **Applicant Manager** (`<ApplicantList />` + `<ApplicantModals />`)
   - CRUD-like add/remove with confirmation.
   - Summary chips for daily verification delta.
3. **Progress Intelligence** (`<ProgressPanel />`)
   - Yearly / Monthly / Weekly graphs (CSS-based sparklines) & KPI badges.
4. **Case Tracker** (`<CandidateLookup />`)
   - Instant status lookup, timeline of background check.
5. **Bottleneck Analytics** (`<BottleneckExplorer />`)
   - Average completion times, vendor/state filters, anomaly alerts.
6. **Recommendations Hub** (`<Recommendations />`)
   - Personal (recent/frequent queries) + global trending.
7. **Predictive What-If** (`<WhatIfSimulator />`)
   - ETA estimator based on region, volume, lead time; shows contributing factors.
8. **Delay Insights** (`<DelayReasons />`)
   - Breakdown by root cause (regional/system/candidate) with narrative.

## Pages & Routing
- `/` — Primary dashboard orchestrating all modules.
- `/api/*.ts` — Mock REST endpoints returning fixture data, used by SWR hooks.

## State & Hooks
- `lib/mockDb.ts` stores in-memory fixtures used both server & client side.
- Hooks under `lib/hooks/` provide typed SWR-like data access with optimistic updates for add/remove.
- Client components manage UI state; server components fetch initial data (Next.js App Router).

## Styling & UI
- Global CSS variables for spacing/colour tokens.
- Utility classes for cards, badges, grids; minimal dependency footprint to avoid extra installs.
- Reusable UI atoms: `<Card />`, `<Metric />`, `<StatusPill />`, `<TrendChart />`.

## Testing Strategy (follow-up)
- Recommend adding Playwright/RTL tests once package installation is available.
