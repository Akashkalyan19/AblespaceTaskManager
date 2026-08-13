"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Search control from the design: an icon button that expands into an input
 * with a ⌘F hint. Ctrl/Cmd+F focuses it (instead of the browser find bar).
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search tasks…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        setExpanded(true);
        // Wait for the input to render before focusing.
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!expanded && !value) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search"
        onClick={() => {
          setExpanded(true);
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
      >
        <Search aria-hidden />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "flex h-9 w-full max-w-96 items-center gap-2 rounded-md border bg-background px-3",
        "focus-within:ring-1 focus-within:ring-ring",
      )}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => {
          if (!value) setExpanded(false);
        }}
        placeholder={placeholder}
        aria-label="Search"
        className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      <kbd className="pointer-events-none hidden shrink-0 rounded border bg-muted px-1.5 font-sans text-[11px] text-muted-foreground sm:inline-block">
        ⌘F
      </kbd>
    </div>
  );
}
