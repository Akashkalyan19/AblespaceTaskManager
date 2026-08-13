"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAccent, setAccent } from "@/lib/theme";
import { ACCENT_COLORS, type AccentColor } from "@/lib/types";

export default function ColorSettingsPage() {
  const [accent, setAccentState] = useState<AccentColor>("black");

  useEffect(() => {
    setAccentState(getAccent());
  }, []);

  function choose(color: AccentColor) {
    setAccent(color);
    setAccentState(color);
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">Color</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick an accent color for buttons and highlights. Works with both light
          and dark mode.
        </p>
      </header>

      <div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3"
        role="radiogroup"
        aria-label="Accent color"
      >
        {ACCENT_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            role="radio"
            aria-checked={accent === color.value}
            onClick={() => choose(color.value)}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-4 text-left transition-colors hover:bg-accent/50",
              accent === color.value && "border-ring ring-2 ring-ring/30",
            )}
          >
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-black/10 text-white"
              style={{ backgroundColor: color.swatch }}
              aria-hidden
            >
              {accent === color.value ? <Check className="size-4" /> : null}
            </span>
            <span className="text-sm font-medium">{color.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
