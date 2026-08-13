"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, Link2, Lock, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/states";
import { UserAvatar } from "@/components/ui/avatar";
import { DateChip, LabelChip } from "../chips";
import { RowActionsMenu } from "../row-actions-menu";
import { SubtasksSection } from "./subtasks-section";
import { CommentsSection } from "./comments-section";
import { DetailsPanel } from "./details-panel";
import { UpdatesCard } from "./updates-card";
import { EditableText } from "./editable-text";
import { useTask, useUpdateTask } from "@/lib/queries";
import { Paperclip } from "lucide-react";

/** Full task detail page: main column + right "Details"/"Updates" panel. */
export function TaskDetail({ taskId }: { taskId: string }) {
  const { data: task, isPending, isError, error, refetch } = useTask(taskId);
  const updateTask = useUpdateTask();
  const [panelOpen, setPanelOpen] = useState(true);

  if (isPending) {
    return (
      <div className="flex flex-col gap-6 pt-2">
        <Skeleton className="h-9 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-full max-w-lg" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  function copyLink() {
    void navigator.clipboard
      .writeText(window.location.href)
      .then(() => toast.success("Link copied to clipboard"));
  }

  return (
    <div className="flex flex-col gap-8 xl:flex-row">
      {/* Main column */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <EditableText
            value={task.title}
            onSave={(title) => updateTask.mutate({ id: task.id, input: { title } })}
            className="text-2xl font-bold tracking-tight md:text-3xl"
            label="Task title"
          />
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Private task"
              onClick={() => toast.info("This task is private to your workspace.")}
            >
              <Lock aria-hidden />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              className="w-auto gap-1 px-2 text-sm"
              aria-label="Watchers"
              onClick={() => toast.info("You are watching this task.")}
            >
              <Eye aria-hidden />
              1
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="Copy link" onClick={copyLink}>
              <Link2 aria-hidden />
            </Button>
            <RowActionsMenu task={task} />
            <Button
              variant="outline"
              size="icon-sm"
              aria-label={panelOpen ? "Hide details panel" : "Show details panel"}
              aria-pressed={panelOpen}
              className="hidden xl:inline-flex"
              onClick={() => setPanelOpen((open) => !open)}
            >
              <PanelRight aria-hidden />
            </Button>
          </div>
        </div>

        <EditableText
          value={task.description ?? ""}
          placeholder="Add a description…"
          onSave={(description) =>
            updateTask.mutate({ id: task.id, input: { description: description || null } })
          }
          className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted-foreground"
          label="Task description"
          multiline
        />

        {/* Properties / Labels / Resources rows */}
        <dl className="mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-6">
            <dt className="w-24 shrink-0 text-sm font-medium">Properties</dt>
            <dd className="flex flex-wrap items-center gap-2">
              {task.assignee ? (
                <span className="inline-flex items-center gap-1.5 text-sm">
                  <UserAvatar user={task.assignee} size={20} />
                  <span className="font-medium">{task.assignee.name}</span>
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Unassigned</span>
              )}
              {task.dueDate ? <DateChip date={task.dueDate} /> : null}
            </dd>
          </div>

          <div className="flex items-start gap-6">
            <dt className="w-24 shrink-0 pt-0.5 text-sm font-medium">Labels</dt>
            <dd className="flex flex-wrap gap-1.5">
              {task.labels.length > 0 ? (
                task.labels.map((label, index) => (
                  <LabelChip key={`${label}-${index}`} label={label} />
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No labels</span>
              )}
            </dd>
          </div>

          <div className="flex items-center gap-6">
            <dt className="w-24 shrink-0 text-sm font-medium">Resources</dt>
            <dd>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => toast.info("Attachments are not part of this demo.")}
              >
                <Paperclip className="size-4" aria-hidden />
                Add document or link…
              </button>
            </dd>
          </div>
        </dl>

        <SubtasksSection task={task} />
        <CommentsSection taskId={task.id} />
      </div>

      {/* Right panel */}
      {panelOpen && (
        <aside className="flex w-full shrink-0 flex-col gap-4 xl:w-80">
          <DetailsPanel task={task} />
          <UpdatesCard taskId={task.id} />
        </aside>
      )}
    </div>
  );
}
