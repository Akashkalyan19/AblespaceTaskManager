"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTheme, setTheme } from "@/lib/theme";
import type { ThemeMode } from "@/lib/types";

const OPTIONS: { value: ThemeMode; label: string; description: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", description: "Bright background with dark text.", icon: Sun },
  { value: "dark", label: "Dark", description: "Dimmed background, easy on the eyes.", icon: Moon },
];

export default function ThemeSettingsPage() {
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    setThemeState(getTheme());
  }, []);

  function choose(mode: ThemeMode) {
    setTheme(mode);
    setThemeState(mode);
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">Theme</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose between light and dark mode. Your choice is saved on this device.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Theme">
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={theme === option.value}
            onClick={() => choose(option.value)}
            className={cn(
              "flex flex-col gap-3 rounded-xl border p-5 text-left transition-colors hover:bg-accent/50",
              theme === option.value && "border-ring ring-2 ring-ring/30",
            )}
          >
            <option.icon className="size-5" aria-hidden />
            <span>
              <span className="block text-sm font-semibold">{option.label}</span>
              <span className="block text-sm text-muted-foreground">
                {option.description}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
