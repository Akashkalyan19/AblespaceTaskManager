"use client";

import { use } from "react";
import { TasksView } from "@/components/tasks/tasks-view";

/**
 * Project detail: the same Tasks screen scoped to one project.
 * The header shows the "Projects › name" breadcrumb.
 */
export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  return <TasksView projectId={projectId} />;
}
