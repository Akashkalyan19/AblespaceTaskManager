"use client";

import { useRouter } from "next/navigation";
import { ChevronsUpDown, Moon, Settings, Sun } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/lib/queries";
import { getAccent, getTheme, setAccent, setTheme } from "@/lib/theme";
import { ACCENT_COLORS, type AccentColor, type ThemeMode } from "@/lib/types";
import { useEffect, useState } from "react";

/**
 * The workspace switcher at the top of the sidebar. Opens the menu from the
 * design: user card, "Change Theme" (light/dark), "Color Mode" (accent) and
 * Settings.
 */
export function WorkspaceMenu() {
  const { data: me, isPending } = useMe();
  const router = useRouter();

  // Theme state lives on <html>; mirror it in state so checkmarks update.
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [accent, setAccentState] = useState<AccentColor>("black");
  useEffect(() => {
    setThemeState(getTheme());
    setAccentState(getAccent());
  }, []);

  function changeTheme(mode: ThemeMode) {
    setTheme(mode);
    setThemeState(mode);
  }

  function changeAccent(color: AccentColor) {
    setAccent(color);
    setAccentState(color);
  }

  if (isPending || !me) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5">
        <Skeleton className="size-8 rounded-lg" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  const accentSwatch =
    ACCENT_COLORS.find((c) => c.value === accent)?.swatch ?? "#18181b";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Workspace menu"
      >
        <UserAvatar user={me} size={32} className="rounded-lg" />
        <span className="flex-1 truncate text-sm font-semibold">{me.name}</span>
        <ChevronsUpDown className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-60">
        <div className="flex flex-col items-center gap-1 px-2 py-4 text-center">
          <UserAvatar user={me} size={48} className="rounded-full" />
          <div className="mt-1 text-sm font-medium">{me.name}</div>
          <div className="text-xs text-muted-foreground">
            {me.email ?? "Guest workspace"}
          </div>
        </div>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Sun aria-hidden />
            Change Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-40">
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuCheckItem
              checked={theme === "light"}
              onSelect={() => changeTheme("light")}
            >
              <Sun aria-hidden />
              Light
            </DropdownMenuCheckItem>
            <DropdownMenuCheckItem
              checked={theme === "dark"}
              onSelect={() => changeTheme("dark")}
            >
              <Moon aria-hidden />
              Dark
            </DropdownMenuCheckItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <span
              className="ml-0.5 size-3.5 shrink-0 rounded-[4px]"
              style={{ backgroundColor: accentSwatch }}
              aria-hidden
            />
            <span className="ml-0.5">Color Mode</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-40">
            <DropdownMenuLabel>Color Mode</DropdownMenuLabel>
            {ACCENT_COLORS.map((color) => (
              <DropdownMenuCheckItem
                key={color.value}
                checked={accent === color.value}
                onSelect={() => changeAccent(color.value)}
              >
                <span
                  className="size-3.5 rounded-[4px] border border-black/10"
                  style={{ backgroundColor: color.swatch }}
                  aria-hidden
                />
                {color.label}
              </DropdownMenuCheckItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuItem onSelect={() => router.push("/settings/profile")}>
          <Settings aria-hidden />
          Settings
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
