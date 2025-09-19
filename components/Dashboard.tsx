"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { executeConsoleQuery } from "@/lib/queryEngine";
import {
  Applicant,
  ChatAttachment,
  ChatTurn,
  DashboardData,
  HistoryEntry,
  Recommendation,
  SavedPrompt,
  SavedReport,
  SavedReportChartSource,
  WhatIfInput,
  WhatIfOutput
} from "@/lib/types";
import { MainShell } from "./layout/MainShell";
import { NavigationPanel, DashboardSection } from "./layout/NavigationPanel";
import { PageHeader } from "./layout/PageHeader";
import { CommandConsole } from "./modules/CommandConsole";
import { ApplicantManager } from "./modules/ApplicantManager";
import { HomeTrends } from "./modules/HomeTrends";
import { PromptSidebar } from "./modules/PromptSidebar";
import { DailyOrderSummary } from "./modules/DailyOrderSummary";
import { AnalyticsBoard } from "./modules/AnalyticsBoard";
import { SavedReportsWorkspace } from "./modules/SavedReportsWorkspace";

interface DashboardProps {
  initialData: DashboardData;
}

const USER_ID = "hr-manager-1";

const SECTION_META: Record<DashboardSection, { title: string; tagline: string }> = {
  home: {
    title: "Aurora CheckOps Console",
    tagline: "Ask, analyse, and act on background check operations without sifting through menus."
  },
  candidateOverview: {
    title: "Candidate overview",
    tagline: "Track today\'s completions and keep the runway healthy."
  },
  analytics: {
    title: "Analytics",
    tagline: "Diagnose bottlenecks, simulate scenarios, and monitor delays."
  },
  savedReports: {
    title: "Saved reports",
    tagline: "Revisit curated insights with live, auto-updating charts."
  }
};

function pickChartSource(intent: string): SavedReportChartSource {
  if (intent.includes("verification")) {
    return "verifications";
  }
  if (intent.includes("candidate") || intent.includes("status")) {
    return "weekly";
  }
  if (intent.includes("benchmark")) {
    return "monthly";
  }
  if (intent.includes("delay")) {
    return "yearly";
  }
  return "verifications";
}

export function Dashboard({ initialData }: DashboardProps) {
  const [applicants, setApplicants] = useState(initialData.applicants);
  const [, setHistory] = useState(initialData.history);
  const [recommendations, setRecommendations] = useState(initialData.recommendations);
  const [caseStatuses] = useState(initialData.caseStatuses);
  const [verificationSummary] = useState(initialData.verificationSummary);
  const [alerts] = useState(initialData.alerts);
  const [benchmarks] = useState(initialData.benchmarks);
  const [progressStreams] = useState(initialData.progressStreams);
  const [delayInsights] = useState(initialData.delayInsights);

  const [isNavOpen, setIsNavOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<DashboardSection>("home");
  const [selectedSavedReportId, setSelectedSavedReportId] = useState<string | null>(null);
  const [chatTurns, setChatTurns] = useState<ChatTurn[]>([]);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [draft, setDraft] = useState("");
  const [draftAttachments, setDraftAttachments] = useState<ChatAttachment[]>([]);
  const [editingTurnId, setEditingTurnId] = useState<string | null>(null);
  const [focusSignal, setFocusSignal] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pausedApplicantIds, setPausedApplicantIds] = useState<Set<string>>(new Set());
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2400);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const refreshHistoryAndRecommendations = useCallback(async () => {
    try {
      const [historyResponse, recommendationsResponse] = await Promise.all([
        fetch("/api/history"),
        fetch("/api/recommendations")
      ]);
      if (historyResponse.ok) {
        const freshHistory: HistoryEntry[] = await historyResponse.json();
        setHistory(freshHistory);
      }
      if (recommendationsResponse.ok) {
        const freshRecommendations: Recommendation[] = await recommendationsResponse.json();
        setRecommendations(freshRecommendations);
      }
    } catch (error) {
      console.error("Failed to refresh recommendations", error);
    }
  }, []);

  const handleConsoleSubmit = useCallback(
    async ({ prompt, attachments, editingTurnId: existingTurnId }: { prompt: string; attachments: ChatAttachment[]; editingTurnId: string | null }) => {
      const sanitizedPrompt = prompt.trim();
      if (!sanitizedPrompt) {
        return;
      }

      const now = new Date().toISOString();
      const attachmentsCopy = attachments.map((item) => ({ ...item }));
      const turnId = existingTurnId ?? `turn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

      setChatTurns((prev) => {
        if (existingTurnId) {
          return prev.map((turn) =>
            turn.id === existingTurnId
              ? {
                  ...turn,
                  prompt: sanitizedPrompt,
                  attachments: attachmentsCopy,
                  createdAt: now,
                  response: undefined,
                  responseCreatedAt: undefined
                }
              : turn
          );
        }
        return [
          ...prev,
          {
            id: turnId,
            prompt: sanitizedPrompt,
            attachments: attachmentsCopy,
            createdAt: now
          }
        ];
      });

      setDraft("");
      setDraftAttachments([]);
      setEditingTurnId(null);

      const result = executeConsoleQuery(sanitizedPrompt, {
        applicants,
        caseStatuses,
        benchmarks,
        verificationSummary,
        delayInsights
      });

      const responseCreatedAt = new Date().toISOString();

      setChatTurns((prev) =>
        prev.map((turn) =>
          turn.id === (existingTurnId ?? turnId)
            ? { ...turn, response: result, responseCreatedAt }
            : turn
        )
      );

      const optimistic: HistoryEntry = {
        historyId: `local-${Date.now()}`,
        userId: USER_ID,
        searchQuery: sanitizedPrompt,
        intent: result.intent,
        entities: {},
        timestamp: responseCreatedAt
      };
      setHistory((prev) => [optimistic, ...prev].slice(0, 20));

      try {
        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: USER_ID,
            searchQuery: sanitizedPrompt,
            intent: result.intent,
            entities: {}
          })
        });
        await refreshHistoryAndRecommendations();
      } catch (error) {
        console.error("Failed to persist history", error);
      }
    },
    [applicants, benchmarks, caseStatuses, delayInsights, refreshHistoryAndRecommendations, verificationSummary]
  );

  const handleAddApplicant = useCallback(
    async (payload: { name: string; role: string; region: string }) => {
      const response = await fetch("/api/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        throw new Error("Failed to add applicant");
      }
      const newApplicant: Applicant = await response.json();
      setApplicants((prev) => [newApplicant, ...prev]);
      await refreshHistoryAndRecommendations();
      showToast(`${newApplicant.name} added to runway`);
    },
    [refreshHistoryAndRecommendations, showToast]
  );

  const handleRemoveApplicant = useCallback(async (applicant: Applicant) => {
    const response = await fetch(`/api/applicants/${applicant.id}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      throw new Error("Failed to remove");
    }
    setApplicants((prev) => prev.filter((item) => item.id !== applicant.id));
    setPausedApplicantIds((prev) => {
      if (!prev.size) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(applicant.id);
      return next;
    });
  }, []);

  const handleTogglePauseApplicant = useCallback((applicant: Applicant) => {
    setPausedApplicantIds((prev) => {
      const next = new Set(prev);
      if (next.has(applicant.id)) {
        next.delete(applicant.id);
      } else {
        next.add(applicant.id);
      }
      return next;
    });
  }, []);

  const handleSimulate = useCallback(async (input: WhatIfInput): Promise<WhatIfOutput> => {
    const response = await fetch("/api/what-if", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!response.ok) {
      throw new Error("Prediction failed");
    }
    return response.json();
  }, []);

  const handleUploadFiles = useCallback(
    async (files: FileList) => {
      try {
        const uploaded = await Promise.all(
          Array.from(files).map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/uploads", {
              method: "POST",
              body: formData
            });

            if (!response.ok) {
              throw new Error(`Upload failed for ${file.name}`);
            }

            const data = await response.json();

            const id = data.publicId ?? `cloudinary-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
            return {
              id,
              name: data.originalFilename ?? file.name,
              url: data.url,
              bytes: data.bytes ?? file.size,
              contentType: data.resourceType ?? file.type
            } as ChatAttachment;
          })
        );
        setDraftAttachments((prev) => [...prev, ...uploaded]);
        showToast("Upload complete");
      } catch (error) {
        console.error(error);
        showToast("Upload failed. Check Cloudinary setup.");
      }
    },
    [showToast]
  );

  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    setDraftAttachments((prev) => prev.filter((item) => item.id !== attachmentId));
  }, []);

  const handleEditTurn = useCallback(
    (turnId: string) => {
      const target = chatTurns.find((turn) => turn.id === turnId);
      if (!target) {
        return;
      }
      setActiveSection("home");
      setEditingTurnId(turnId);
      setDraft(target.prompt);
      setDraftAttachments(target.attachments.map((item) => ({ ...item })));
      setFocusSignal(Date.now());
    },
    [chatTurns]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingTurnId(null);
    setDraft("");
    setDraftAttachments([]);
  }, []);

  const handleSavePrompt = useCallback(
    (turnId: string) => {
      const target = chatTurns.find((turn) => turn.id === turnId);
      if (!target) {
        return;
      }
      const label = target.prompt.length > 42 ? `${target.prompt.slice(0, 39)}...` : target.prompt;
      const entry: SavedPrompt = {
        id: `prompt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        label,
        prompt: target.prompt,
        createdAt: new Date().toISOString()
      };
      setSavedPrompts((prev) => [entry, ...prev.filter((item) => item.prompt !== target.prompt)]);
      showToast("Prompt saved to library");
    },
    [chatTurns, showToast]
  );

  const handleSaveReport = useCallback(
    (turnId: string) => {
      const target = chatTurns.find((turn) => turn.id === turnId);
      if (!target || !target.response) {
        return;
      }
      const titleBase = target.response.summary || "Saved insight";
      const title = titleBase.length > 48 ? `${titleBase.slice(0, 45)}...` : titleBase;
      const entry: SavedReport = {
        id: `report-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        prompt: target.prompt,
        summary: target.response.summary,
        highlights: target.response.highlights ?? [],
        recommendedActions: target.response.recommendedActions ?? [],
        createdAt: new Date().toISOString(),
        chartSource: pickChartSource(target.response.intent)
      };
      setSavedReports((prev) => [entry, ...prev]);
      setSelectedSavedReportId(entry.id);
      setActiveSection("savedReports");
      showToast("Report pinned to saved library");
    },
    [chatTurns, showToast]
  );

  const handleSelectPrompt = useCallback((prompt: SavedPrompt) => {
    setActiveSection("home");
    setDraft(prompt.prompt);
    setDraftAttachments([]);
    setEditingTurnId(null);
    setFocusSignal(Date.now());
    showToast("Prompt loaded");
  }, [showToast]);

  const handleSelectHistoryTurn = useCallback((turn: ChatTurn) => {
    setActiveSection("home");
    setEditingTurnId(turn.id);
    setDraft(turn.prompt);
    setDraftAttachments(turn.attachments.map((item) => ({ ...item })));
    setFocusSignal(Date.now());
  }, []);

  const handleSelectSection = useCallback((section: DashboardSection) => {
    setActiveSection(section);
    if (section !== "savedReports") {
      setSelectedSavedReportId(null);
    }
  }, []);

  const handleSelectSavedReport = useCallback((reportId: string) => {
    setSelectedSavedReportId(reportId);
    setActiveSection("savedReports");
  }, []);

  const consoleRecommendations = useMemo(() => recommendations.slice(0, 4), [recommendations]);

  const homeView = (
    <div className="home-grid">
      <div className="home-primary">
        <CommandConsole
          turns={chatTurns}
          recommendations={consoleRecommendations}
          draft={draft}
          attachments={draftAttachments}
          editingTurnId={editingTurnId}
          focusSignal={focusSignal}
          onDraftChange={setDraft}
          onSubmit={handleConsoleSubmit}
          onUploadFiles={handleUploadFiles}
          onRemoveAttachment={handleRemoveAttachment}
          onEdit={handleEditTurn}
          onCancelEdit={handleCancelEdit}
          onSavePrompt={handleSavePrompt}
          onSaveReport={handleSaveReport}
        />
        <HomeTrends streams={progressStreams} />
      </div>
      <PromptSidebar
        historyTurns={chatTurns.slice().reverse()}
        savedPrompts={savedPrompts}
        onSelectHistory={handleSelectHistoryTurn}
        onSelectSavedPrompt={handleSelectPrompt}
      />
    </div>
  );

  const candidateView = (
    <div className="candidate-layout">
      <DailyOrderSummary applicants={applicants} />
      <ApplicantManager
        applicants={applicants}
        onAddApplicant={handleAddApplicant}
        onRemoveApplicant={handleRemoveApplicant}
        onPauseApplicant={handleTogglePauseApplicant}
        pausedApplicantIds={pausedApplicantIds}
        onNotify={showToast}
      />
    </div>
  );

  const analyticsView = (
    <AnalyticsBoard
      benchmarks={benchmarks}
      alerts={alerts}
      delayInsights={delayInsights}
      onSimulate={handleSimulate}
    />
  );

  const savedReportsView = (
    <SavedReportsWorkspace
      reports={savedReports}
      selectedReportId={selectedSavedReportId}
      onSelectReport={handleSelectSavedReport}
      progressStreams={progressStreams}
      verificationSummary={verificationSummary}
    />
  );

  let activeView = homeView;
  if (activeSection === "candidateOverview") {
    activeView = candidateView;
  } else if (activeSection === "analytics") {
    activeView = analyticsView;
  } else if (activeSection === "savedReports") {
    activeView = savedReportsView;
  }

  const { title, tagline } = SECTION_META[activeSection];

  return (
    <MainShell
      navigation={
        <NavigationPanel
          activeSection={activeSection}
          onSelectSection={handleSelectSection}
          savedReports={savedReports}
          selectedSavedReportId={selectedSavedReportId}
          onSelectSavedReport={handleSelectSavedReport}
        />
      }
      isNavOpen={isNavOpen}
      onToggleNav={() => setIsNavOpen((prev) => !prev)}
    >
      <PageHeader title={title} tagline={tagline} />
      <div className="dashboard-view">{activeView}</div>
      {toastMessage ? <div className="center-toast">{toastMessage}</div> : null}
    </MainShell>
  );
}


