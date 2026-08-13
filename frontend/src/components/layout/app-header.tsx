"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ChevronRight, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "./sidebar-context";
import { useProject } from "@/lib/queries";

/**
 * Top bar: sidebar trigger + separator, plus a breadcrumb on the project
 * detail page ("Projects › Design Homepage") as in the design.
 */
export function AppHeader() {
  const { open, setOpen, setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const params = useParams<{ projectId?: string }>();

  const projectId =
    pathname.startsWith("/projects/") && params.projectId ? params.projectId : null;

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 px-4">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Toggle sidebar"
        className="hidden text-foreground md:inline-flex"
        onClick={() => setOpen(!open)}
      >
        <PanelLeft aria-hidden />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Open menu"
        className="text-foreground md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <PanelLeft aria-hidden />
      </Button>
      <Separator orientation="vertical" className="h-4" />

      {projectId ? <ProjectBreadcrumb projectId={projectId} /> : null}
    </header>
  );
}

function ProjectBreadcrumb({ projectId }: { projectId: string }) {
  const { data: project } = useProject(projectId);

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
      <Link
        href="/projects"
        className="text-muted-foreground transition-colors hover:text-foreground"
      >
        Projects
      </Link>
      <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
      <span className="font-normal text-foreground">
        {project?.name ?? "…"}
      </span>
    </nav>
  );
}
