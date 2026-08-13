"use client";

import { use } from "react";
import { TaskDetail } from "@/components/tasks/detail/task-detail";

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = use(params);
  return <TaskDetail taskId={taskId} />;
}
