import { ChatTurn, SavedPrompt } from "@/lib/types";

interface PromptSidebarProps {
  historyTurns: ChatTurn[];
  savedPrompts: SavedPrompt[];
  onSelectHistory: (turn: ChatTurn) => void;
  onSelectSavedPrompt: (prompt: SavedPrompt) => void;
}

export function PromptSidebar({ historyTurns, savedPrompts, onSelectHistory, onSelectSavedPrompt }: PromptSidebarProps) {
  return (
    <aside className="prompt-sidebar">
      <div className="prompt-sidebar-section">
        <div className="prompt-sidebar-title">Prompt history</div>
        {historyTurns.length === 0 ? (
          <p className="prompt-sidebar-empty">Start chatting to see your timeline.</p>
        ) : (
          <ul>
            {historyTurns.slice(0, 8).map((turn) => (
              <li key={turn.id}>
                <button type="button" onClick={() => onSelectHistory(turn)}>
                  <span className="prompt-sidebar-primary">{turn.prompt}</span>
                  <span className="prompt-sidebar-meta">{new Date(turn.createdAt).toLocaleTimeString()}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="prompt-sidebar-section">
        <div className="prompt-sidebar-title">Saved prompts</div>
        {savedPrompts.length === 0 ? (
          <p className="prompt-sidebar-empty">Pin prompts during a chat to reuse them here.</p>
        ) : (
          <ul>
            {savedPrompts.map((prompt) => (
              <li key={prompt.id}>
                <button type="button" onClick={() => onSelectSavedPrompt(prompt)}>
                  <span className="prompt-sidebar-primary">{prompt.label}</span>
                  <span className="prompt-sidebar-meta">{new Date(prompt.createdAt).toLocaleDateString()}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
