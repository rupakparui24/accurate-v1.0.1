"use client";

import { ChangeEvent, FormEvent, useEffect, useRef } from "react";
import { ChatAttachment, ChatTurn, Recommendation } from "@/lib/types";

interface CommandConsoleProps {
  turns: ChatTurn[];
  recommendations: Recommendation[];
  draft: string;
  attachments: ChatAttachment[];
  editingTurnId: string | null;
  focusSignal: number;
  onDraftChange: (value: string) => void;
  onSubmit: (payload: { prompt: string; attachments: ChatAttachment[]; editingTurnId: string | null }) => void;
  onUploadFiles: (files: FileList) => Promise<void>;
  onRemoveAttachment: (attachmentId: string) => void;
  onEdit: (turnId: string) => void;
  onCancelEdit: () => void;
  onSavePrompt: (turnId: string) => void;
  onSaveReport: (turnId: string) => void;
}

export function CommandConsole({
  turns,
  recommendations,
  draft,
  attachments,
  editingTurnId,
  focusSignal,
  onDraftChange,
  onSubmit,
  onUploadFiles,
  onRemoveAttachment,
  onEdit,
  onCancelEdit,
  onSavePrompt,
  onSaveReport
}: CommandConsoleProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current.style.height = "auto";
    const nextHeight = Math.min(Math.max(editorRef.current.scrollHeight, 120), 240);
    editorRef.current.style.height = `${nextHeight}px`;
  }, [draft]);

  useEffect(() => {
    if (!focusSignal || !editorRef.current) {
      return;
    }
    editorRef.current.focus();
    editorRef.current.setSelectionRange(editorRef.current.value.length, editorRef.current.value.length);
  }, [focusSignal]);

  useEffect(() => {
    if (!editingTurnId || !editorRef.current) {
      return;
    }
    editorRef.current.focus();
  }, [editingTurnId]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }
    onSubmit({ prompt: trimmed, attachments, editingTurnId });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files || files.length === 0) {
      return;
    }
    await onUploadFiles(files);
    event.target.value = "";
  };

  const handleQuickPrompt = (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return;
    }
    if (editingTurnId) {
      onCancelEdit();
    }
    onDraftChange(trimmed);
    onSubmit({ prompt: trimmed, attachments: [], editingTurnId: null });
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="card command-console">
      <div className="console-header">
        <div>
          <h2>Ask Aurora</h2>
          <p className="console-subtitle">Chat with the console, attach context, and keep the conversation for later.</p>
        </div>
      </div>

      {recommendations.length ? (
        <div className="quick-prompts">
          {recommendations.map((suggestion) => (
            <button key={suggestion.title} type="button" onClick={() => handleQuickPrompt(suggestion.suggestedQuery)}>
              {suggestion.title}
            </button>
          ))}
        </div>
      ) : null}

      <div className="chat-window" aria-live="polite">
        {turns.length === 0 ? (
          <div className="chat-empty">Start a conversation with Aurora to get tailored ops guidance.</div>
        ) : (
          turns.map((turn) => (
            <div key={turn.id} className="chat-turn">
              <div className="chat-bubble user">
                <div className="chat-meta">You &bull; {new Date(turn.createdAt).toLocaleTimeString()}</div>
                <p>{turn.prompt}</p>
                {turn.attachments.length ? (
                  <div className="chat-attachments">
                    {turn.attachments.map((attachment) => (
                      <a key={attachment.id} href={attachment.url} target="_blank" rel="noreferrer">
                        {attachment.name}
                      </a>
                    ))}
                  </div>
                ) : null}
                <div className="chat-actions">
                  <button type="button" onClick={() => onEdit(turn.id)}>Edit prompt</button>
                  <button type="button" onClick={() => onSavePrompt(turn.id)}>Save prompt</button>
                </div>
              </div>

              <div className={`chat-bubble assistant ${turn.response ? "" : "pending"}`}>
                <div className="chat-meta">Aurora &bull; {turn.responseCreatedAt ? new Date(turn.responseCreatedAt).toLocaleTimeString() : "processing"}</div>
                {turn.response ? (
                  <>
                    <p>{turn.response.summary}</p>
                    {turn.response.highlights?.length ? (
                      <ul>
                        {turn.response.highlights.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                    {turn.response.recommendedActions?.length ? (
                      <div className="assistant-actions">
                        <div className="assistant-actions-title">Suggested next steps</div>
                        <ul>
                          {turn.response.recommendedActions.map((action) => (
                            <li key={action}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <div className="chat-actions">
                      <button type="button" onClick={() => onSaveReport(turn.id)}>Save report</button>
                    </div>
                  </>
                ) : (
                  <div className="chat-typing">Generating insight...</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <form className="composer" onSubmit={handleSubmit}>
        {editingTurnId ? (
          <div className="composer-editing-banner">
            Editing a previous prompt
            <button type="button" onClick={onCancelEdit}>
              Cancel
            </button>
          </div>
        ) : null}

        {attachments.length ? (
          <div className="composer-attachments">
            {attachments.map((file) => (
              <span key={file.id} className="composer-attachment">
                {file.name}
                <button type="button" aria-label={`Remove ${file.name}`} onClick={() => onRemoveAttachment(file.id)}>
                  &times;
                </button>
              </span>
            ))}
          </div>
        ) : null}

        <div className="composer-input">
          <textarea
            ref={editorRef}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Ask about candidate status, turnaround, or bottlenecks..."
            aria-label="Write a prompt for Aurora"
          />
          <div className="composer-actions">
            <input ref={fileInputRef} type="file" hidden multiple onChange={handleFileChange} />
            <button type="button" className="ghost" onClick={openFilePicker}>
              Upload file
            </button>
            <button type="submit" className="primary" disabled={!draft.trim()}>
              {editingTurnId ? "Update" : "Send"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}



