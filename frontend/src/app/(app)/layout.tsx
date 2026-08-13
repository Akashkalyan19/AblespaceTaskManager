"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { isLoggedIn } from "@/lib/auth";

/**
 * Authenticated shell: sidebar + header + page content.
 * Auth is checked on the client (token in localStorage); until then render
 * nothing to avoid a flash of protected UI.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-svh">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="min-w-0 flex-1 px-4 pb-10 md:px-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
