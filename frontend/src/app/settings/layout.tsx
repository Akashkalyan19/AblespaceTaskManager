"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Palette, Search, Sun, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { isLoggedIn } from "@/lib/auth";

const SETTINGS_NAV = [
  { href: "/settings/profile", label: "Profile", icon: UserRound },
  { href: "/settings/theme", label: "Theme", icon: Sun },
  { href: "/settings/color", label: "Color", icon: Palette },
];

/**
 * Settings area with its own two-column layout per the design:
 * "Back to app", a search field that filters the nav, and the nav itself.
 */
export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  const visibleNav = SETTINGS_NAV.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="flex min-h-svh">
      <aside className="hidden w-64 shrink-0 flex-col gap-4 border-r bg-background p-4 sm:flex">
        <Link
          href="/tasks"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to app
        </Link>

        <div className="flex h-9 items-center gap-2 rounded-md border px-3 focus-within:ring-1 focus-within:ring-ring">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search"
            aria-label="Search settings"
            className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <nav className="flex flex-col gap-0.5" aria-label="Settings">
          {visibleNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-md px-2 text-sm transition-colors hover:bg-accent",
                  active && "bg-accent font-medium",
                )}
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
          {visibleNav.length === 0 && (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">No matches</p>
          )}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">
        {/* Mobile back link */}
        <div className="border-b p-4 sm:hidden">
          <Link href="/tasks" className="flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="size-4" aria-hidden />
            Back to app
          </Link>
        </div>
        <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-8 sm:py-16">
          {children}
        </div>
      </main>
    </div>
  );
}
