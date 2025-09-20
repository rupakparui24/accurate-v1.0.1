"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

interface SaveEntryModalProps {
  open: boolean;
  title: string;
  description: string;
  initialName: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: (name: string) => void;
}

export function SaveEntryModal({
  open,
  title,
  description,
  initialName,
  confirmLabel = "Save",
  onCancel,
  onConfirm
}: SaveEntryModalProps) {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    setName(initialName);
  }, [initialName, open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    inputRef.current?.focus();
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener("keydown", listener, { capture: true });
    return () => window.removeEventListener("keydown", listener, { capture: true });
  }, [onCancel, open]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onConfirm(name.trim() || initialName.trim() || "Untitled");
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title} onClick={onCancel}>
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="modal-title">{title}</h2>
        <p className="modal-description">{description}</p>
        <form onSubmit={handleSubmit} className="modal-form">
          <input
            ref={inputRef}
            className="modal-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Name"
            aria-label="Name"
          />
          <div className="modal-actions">
            <button type="button" className="ghost" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="primary">
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
