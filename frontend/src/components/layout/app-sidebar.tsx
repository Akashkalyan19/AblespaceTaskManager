"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, ChevronDown, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceMenu } from "./workspace-menu";
import { useSidebar } from "./sidebar-context";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/tasks", label: "Tasks", icon: LayoutGrid },
  { href: "/projects", label: "Projects", icon: Archive },
];

function SidebarNav() {
  const pathname = usePathname();
  const [workspaceOpen, setWorkspaceOpen] = useState(true);

  return (
    <div className="flex h-full flex-col gap-2 p-2">
      <WorkspaceMenu />

      <nav className="flex flex-col gap-0.5 px-1" aria-label="Workspace">
        <button
          type="button"
          onClick={() => setWorkspaceOpen((open) => !open)}
          className="flex items-center justify-between rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          aria-expanded={workspaceOpen}
        >
          Workspace
          <ChevronDown
            className={cn("size-4 transition-transform", !workspaceOpen && "-rotate-90")}
          />
        </button>

        {workspaceOpen &&
          NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-md px-2 text-sm transition-colors hover:bg-accent",
                  active
                    ? "bg-accent font-medium text-accent-foreground"
                    : "text-sidebar-foreground/80",
                )}
                aria-current={active ? "page" : undefined}
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
      </nav>
    </div>
  );
}

/**
 * Desktop: inline collapsible sidebar. Mobile (< md): slide-in sheet.
 */
export function AppSidebar() {
  const { open, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <>
      <aside
        className={cn(
          "hidden shrink-0 overflow-hidden border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:block",
          open ? "w-64" : "w-0 border-r-0",
        )}
      >
        <div className="w-64">
          <SidebarNav />
        </div>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="md:hidden" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav />
        </SheetContent>
      </Sheet>
    </>
  );
}
