"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { executeConsoleQuery } from "@/lib/queryEngine";
import {
  Applicant,
  ChatAttachment,
  ChatTurn,
  ChatSession,
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
import { ChatHistorySidebar } from "./modules/ChatHistorySidebar";
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


function deriveSessionTitle(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return "New conversation";
  }
  if (trimmed.length <= 60) {
    return trimmed;
  }
  return trimmed.slice(0, 57).concat("...");
}

function createChatSession(seedTitle?: string): ChatSession {
  const baseTitle = seedTitle ? deriveSessionTitle(seedTitle) : "New conversation";
  const timestamp = new Date().toISOString();
  return {
    id: "session-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6),
    title: baseTitle,
    createdAt: timestamp,
    updatedAt: timestamp,
    turns: []
  };
}

function sortSessionsByUpdatedAt(sessions: ChatSession[]): ChatSession[] {
  return sessions.slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
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

  const initialSessionRef = useRef<ChatSession | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const session = createChatSession();
    initialSessionRef.current = session;
    return [session];
  });
  const [activeSessionId, setActiveSessionId] = useState<string>(() => initialSessionRef.current?.id ?? "");
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<DashboardSection>("home");
  const [selectedSavedReportId, setSelectedSavedReportId] = useState<string | null>(null);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [draft, setDraft] = useState("");
  const [draftAttachments, setDraftAttachments] = useState<ChatAttachment[]>([]);
  const [editingTurnId, setEditingTurnId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [focusSignal, setFocusSignal] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pausedApplicantIds, setPausedApplicantIds] = useState<Set<string>>(new Set());
  const [saveDialog, setSaveDialog] = useState<SaveDialogState | null>(null);
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

  const activeSession = useMemo(() => {
    if (!chatSessions.length) {
      return null;
    }
    return chatSessions.find((session) => session.id === activeSessionId) ?? chatSessions[0];
  }, [chatSessions, activeSessionId]);

  const activeTurns = activeSession ? activeSession.turns : [];
  const chatTurns = activeTurns;

  const findTurnById = useCallback(
    (turnId: string) => {
      for (const session of chatSessions) {
        const turn = session.turns.find((item) => item.id === turnId);
        if (turn) {
          return { session, turn };
        }
      }
      return null;
    },
    [chatSessions]
  );


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
      const requestedSessionId = existingTurnId ? editingSessionId ?? activeSessionId : activeSessionId;
      let resolvedSessionId = requestedSessionId;
      const turnId = existingTurnId ?? `turn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

      setChatSessions((prev) => {
        let sessions = prev;
        if (!sessions.length) {
          const session = createChatSession();
          sessions = [session];
          resolvedSessionId = session.id;
        }

        if (!resolvedSessionId || !sessions.some((session) => session.id === resolvedSessionId)) {
          const newSession = createChatSession(sanitizedPrompt);
          resolvedSessionId = newSession.id;
          sessions = [newSession, ...sessions];
        } else {
          sessions = sessions.slice();
        }

        const nextSessions = sessions.map((session) => {
          if (session.id !== resolvedSessionId) {
            return session;
          }

          if (existingTurnId) {
            const updatedTurns = session.turns.map((turn) =>
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
            const isFirstTurn = session.turns[0]?.id === existingTurnId;
            return {
              ...session,
              title: isFirstTurn ? deriveSessionTitle(sanitizedPrompt) : session.title,
              turns: updatedTurns,
              updatedAt: now
            };
          }

          const newTurn: ChatTurn = {
            id: turnId,
            prompt: sanitizedPrompt,
            attachments: attachmentsCopy,
            createdAt: now
          };

          return {
            ...session,
            title: session.turns.length === 0 ? deriveSessionTitle(sanitizedPrompt) : session.title,
            turns: [...session.turns, newTurn],
            updatedAt: now
          };
        });

        return sortSessionsByUpdatedAt(nextSessions);
      });

      if (!resolvedSessionId) {
        return;
      }

      setActiveSessionId(resolvedSessionId);
      setDraft("");
      setDraftAttachments([]);
      setEditingTurnId(null);
      setEditingSessionId(null);

      const result = executeConsoleQuery(sanitizedPrompt, {
        applicants,
        caseStatuses,
        benchmarks,
        verificationSummary,
        delayInsights
      });

      const responseCreatedAt = new Date().toISOString();

      setChatSessions((prev) =>
        sortSessionsByUpdatedAt(
          prev.map((session) =>
            session.id === resolvedSessionId
              ? {
                  ...session,
                  turns: session.turns.map((turn) =>
                    turn.id === turnId ? { ...turn, response: result, responseCreatedAt } : turn
                  ),
                  updatedAt: responseCreatedAt
                }
              : session
          )
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
    [activeSessionId, applicants, benchmarks, caseStatuses, delayInsights, editingSessionId, refreshHistoryAndRecommendations, verificationSummary]
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

  const handleCreateSession = useCallback(() => {
    const session = createChatSession();
    setChatSessions((prev) => sortSessionsByUpdatedAt([session, ...prev]));
    setActiveSection("home");
    setActiveSessionId(session.id);
    setDraft("");
    setDraftAttachments([]);
    setEditingTurnId(null);
    setEditingSessionId(null);
    setFocusSignal(Date.now());
  }, []);

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      if (!sessionId) {
        return;
      }
      if (!chatSessions.some((session) => session.id === sessionId)) {
        return;
      }
      setActiveSection("home");
      setActiveSessionId(sessionId);
      setEditingTurnId(null);
      setEditingSessionId(null);
      setDraft("");
      setDraftAttachments([]);
      setFocusSignal(Date.now());
    },
    [chatSessions]
  );

  const homeView = (
    <div className="home-grid">
      <ChatHistorySidebar
        sessions={chatSessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onCreateSession={handleCreateSession}
        savedPrompts={savedPrompts}
        onSelectSavedPrompt={handleSelectPrompt}
      />

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



