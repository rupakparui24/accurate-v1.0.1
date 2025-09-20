import { ChatSession, SavedPrompt } from "@/lib/types";
import { formatShortDate } from "@/lib/formatters";

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
  savedPrompts: SavedPrompt[];
  onSelectSavedPrompt: (prompt: SavedPrompt) => void;
}

function formatTimeAgo(value: string) {
  const target = new Date(value);
  const diffMs = Date.now() - target.getTime();
  if (Number.isNaN(diffMs)) {
    return formatShortDate(value);
  }
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diffMs < minute) {
    return "just now";
  }
  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return `${minutes} min ago`;
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours} hr ago`;
  }
  return formatShortDate(value);
}

function extractPreview(session: ChatSession): string {
  if (!session.turns.length) {
    return "No prompts yet";
  }
  const lastTurn = session.turns[session.turns.length - 1];
  if (lastTurn.response?.summary) {
    return lastTurn.response.summary;
  }
  return lastTurn.prompt;
}

export function ChatHistorySidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
  savedPrompts,
  onSelectSavedPrompt
}: ChatHistorySidebarProps) {
  const orderedSessions = sessions.slice().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  return (
    <aside className="chat-history">
      <div className="chat-history-header">
        <div>
          <h3>Chat history</h3>
          <p>Switch between recent sessions or start a fresh conversation.</p>
        </div>
        <button type="button" className="ghost" onClick={onCreateSession}>
          + New chat
        </button>
      </div>

      <div className="chat-history-list">
        {orderedSessions.length === 0 ? (
          <p className="chat-history-empty">Ask your first question to create a session.</p>
        ) : (
          <ul>
            {orderedSessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const preview = extractPreview(session);
              return (
                <li key={session.id}>
                  <button
                    type="button"
                    className={`chat-history-item${isActive ? " active" : ""}`.trim()}
                    onClick={() => onSelectSession(session.id)}
                  >
                    <span className="chat-history-title">{session.title}</span>
                    <span className="chat-history-preview">{preview}</span>
                    <span className="chat-history-meta">{formatTimeAgo(session.updatedAt)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="chat-history-divider" aria-hidden="true" />

      <div className="chat-history-saved">
        <div className="chat-history-subtitle">Saved prompts</div>
        {savedPrompts.length === 0 ? (
          <p className="chat-history-empty">Pin prompts during a chat to reuse them here.</p>
        ) : (
          <ul>
            {savedPrompts.map((prompt) => (
              <li key={prompt.id}>
                <button type="button" onClick={() => onSelectSavedPrompt(prompt)}>
                  <span className="chat-history-prompt">{prompt.label}</span>
                  <span className="chat-history-meta">{formatShortDate(prompt.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
