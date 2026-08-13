"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Click-to-edit text used for the task title and description.
 * Saves on blur or Enter, cancels on Escape.
 */
export function EditableText({
  value,
  onSave,
  className,
  label,
  placeholder = "Empty",
  multiline = false,
}: {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== value.trim()) {
      onSave(trimmed);
    }
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (!editing) {
    return (
      <button
        type="button"
        aria-label={`Edit ${label}`}
        onClick={() => setEditing(true)}
        className={cn(
          "-mx-1 rounded-md px-1 text-left transition-colors hover:bg-accent/50",
          !value && "text-muted-foreground/70 italic",
          className,
        )}
      >
        {value || placeholder}
      </button>
    );
  }

  const shared = {
    value: draft,
    onBlur: commit,
    "aria-label": label,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setDraft(event.target.value),
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === "Escape") cancel();
      if (event.key === "Enter" && (!multiline || event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        commit();
      }
    },
    className: cn(
      "-mx-1 w-full rounded-md border border-ring bg-background px-1 outline-none",
      className,
    ),
  };

  return multiline ? (
    <textarea
      {...shared}
      ref={inputRef as React.RefObject<HTMLTextAreaElement>}
      rows={3}
    />
  ) : (
    <input {...shared} ref={inputRef as React.RefObject<HTMLInputElement>} />
  );
}
