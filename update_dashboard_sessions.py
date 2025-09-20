from pathlib import Path
import re

path = Path("components/Dashboard.tsx")
text = path.read_text(encoding="utf-8")
text = text.replace("\r\n", "\n")

# Step 1: ensure ChatSession is imported
if "ChatSession" not in text:
  text = text.replace(
    "  ChatTurn,\n  DashboardData,",
    "  ChatTurn,\n  ChatSession,\n  DashboardData,",
    1,
  )

# Step 2: insert helper functions after pickChartSource
if "function createChatSession" not in text:
  match = re.search(r'(function pickChartSource[\s\S]+?return "verifications";\n\n}\n)', text)
  if not match:
    raise SystemExit("Failed to locate pickChartSource function")
  helpers = """
function deriveSessionTitle(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return \"New conversation\";
  }
  if (trimmed.length <= 60) {
    return trimmed;
  }
  return trimmed.slice(0, 57).concat(\"...\");
}

function createChatSession(title?: string, turns: ChatTurn[] = []): ChatSession {
  const timestamp = new Date().toISOString();
  return {
    id: \"session-\" + Date.now().toString(36) + \"-\" + Math.random().toString(36).slice(2, 6),
    title: title ?? \"New conversation\",
    createdAt: timestamp,
    updatedAt: timestamp,
    turns
  };
}

function sortSessionsByUpdatedAt(sessions: ChatSession[]): ChatSession[] {
  return sessions.slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}
""".strip("\n")
  text = text[:match.end()] + "\n\n" + helpers + "\n\n" + text[match.end():]

# Step 3: inject session state
if "chatSessions" not in text:
  marker = "  const [delayInsights] = useState(initialData.delayInsights);\n\n  const [isNavOpen, setIsNavOpen] = useState(true);"
  replacement = """
  const [delayInsights] = useState(initialData.delayInsights);

  const initialSessionRef = useRef<ChatSession | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    const session = createChatSession();
    initialSessionRef.current = session;
    return [session];
  });
  const [activeSessionId, setActiveSessionId] = useState<string>(() => initialSessionRef.current?.id ?? "");
  const [isNavOpen, setIsNavOpen] = useState(true);
""".strip("\n")
  if marker not in text:
    raise SystemExit("Failed to locate state marker for sessions")
  text = text.replace(marker, replacement, 1)

# Step 4: update handleConsoleSubmit
console_pattern = re.compile(r"  const handleConsoleSubmit = useCallback\([\s\S]+?\n  \);\n")
if "setChatSessions" not in text or "handleConsoleSubmit" in text:
  new_console = """
  const handleConsoleSubmit = useCallback(
    async ({ prompt, attachments, editingTurnId: existingTurnId }: { prompt: string; attachments: ChatAttachment[]; editingTurnId: string | null }) => {
      const sanitizedPrompt = prompt.trim();
      if (!sanitizedPrompt) {
        return;
      }

      const now = new Date().toISOString();
      const attachmentsCopy = attachments.map((item) => ({ ...item }));
      const turnId = existingTurnId ?? `turn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

      let updatedTurns: ChatTurn[] = [];
      setChatTurns((prev) => {
        if (existingTurnId) {
          updatedTurns = prev.map((turn) =>
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
          return updatedTurns;
        }

        const nextTurns = [
          ...prev,
          {
            id: turnId,
            prompt: sanitizedPrompt,
            attachments: attachmentsCopy,
            createdAt: now
          }
        ];
        updatedTurns = nextTurns;
        return nextTurns;
      });

      setChatSessions((prev) => {
        let found = false;
        const next = prev.map((session) => {
          if (session.id !== activeSessionId) {
            return session;
          }
          found = true;
          const isFirstTurn = session.turns.length === 0 || session.turns[0]?.id === (existingTurnId ?? turnId);
          const title = isFirstTurn ? deriveSessionTitle(sanitizedPrompt) : session.title;
          return {
            ...session,
            title,
            turns: updatedTurns,
            updatedAt: now
          };
        });
        if (!found) {
          const fallback = createChatSession(deriveSessionTitle(sanitizedPrompt), updatedTurns);
          setActiveSessionId(fallback.id);
          return sortSessionsByUpdatedAt([fallback, ...prev]);
        }
        return sortSessionsByUpdatedAt(next);
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

      let finalizedTurns: ChatTurn[] = [];
      setChatTurns((prev) => {
        const next = prev.map((turn) =>
          turn.id === turnId ? { ...turn, response: result, responseCreatedAt } : turn
        );
        finalizedTurns = next;
        return next;
      });

      setChatSessions((prev) =>
        sortSessionsByUpdatedAt(
          prev.map((session) =>
            session.id === (activeSessionId || prev[0]?.id)
              ? { ...session, turns: finalizedTurns, updatedAt: responseCreatedAt }
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
    [activeSessionId, applicants, benchmarks, caseStatuses, delayInsights, refreshHistoryAndRecommendations, verificationSummary]
  );
""".strip("\n")
  text, count = console_pattern.subn(new_console, text, count=1)
  if count != 1:
    raise SystemExit("Failed to replace handleConsoleSubmit")

# Step 5: add session handlers before handleAddApplicant
if "const handleCreateSession" not in text:
  insert_marker = "  const handleAddApplicant = useCallback("
  if insert_marker not in text:
    raise SystemExit("Failed to find handleAddApplicant marker")
  session_block = """
  const handleCreateSession = useCallback(() => {
    const session = createChatSession();
    setChatSessions((prev) => sortSessionsByUpdatedAt([session, ...prev]));
    setActiveSessionId(session.id);
    setChatTurns([]);
    setEditingTurnId(null);
    setDraft("");
    setDraftAttachments([]);
    setFocusSignal(Date.now());
  }, []);

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      if (sessionId === activeSessionId) {
        return;
      }
      const target = chatSessions.find((session) => session.id === sessionId);
      if (!target) {
        return;
      }
      setActiveSection("home");
      setActiveSessionId(sessionId);
      setChatTurns(target.turns);
      setEditingTurnId(null);
      setDraft("");
      setDraftAttachments([]);
      setFocusSignal(Date.now());
    },
    [activeSessionId, chatSessions]
  );

""".strip("\n")
  text = text.replace(insert_marker, session_block + "\n" + insert_marker, 1)

# Step 6: remove handleSelectHistoryTurn
history_pattern = re.compile(r"  const handleSelectHistoryTurn = useCallback\([\s\S]+?\n  \);\n")
if history_pattern.search(text):
  text = history_pattern.sub("", text, count=1)

# Step 7: update PromptSidebar usage
sidebar_pattern = re.compile(r"<PromptSidebar[\\s\\S]+?/>")
sidebar_new = """      <PromptSidebar
        sessions={chatSessions}
        activeSessionId={activeSessionId}
        savedPrompts={savedPrompts}
        onCreateSession={handleCreateSession}
        onSelectSession={handleSelectSession}
        onSelectSavedPrompt={handleSelectPrompt}
      />
""".strip("\n")
if not sidebar_pattern.search(text):
  raise SystemExit("Failed to locate PromptSidebar block")
text = sidebar_pattern.sub(sidebar_new, text, count=1)

# Step 8: ensure CommandConsole continues to receive active turns
# chatTurns already represent the active session, so no change required.

path.write_text(text.replace("\n", "\r\n"), encoding="utf-8")
