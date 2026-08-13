"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLongDate } from "@/lib/format";
import { UserAvatar } from "@/components/ui/avatar";
import { PriorityBadge } from "../priority";
import { RowActionsMenu } from "../row-actions-menu";
import { AddTaskDialog } from "../add-task-dialog";
import { MemberPicker } from "../pickers";
import { useUpdateTask } from "@/lib/queries";
import type { Task } from "@/lib/types";

/** "Subtasks" section on the task detail page — same table anatomy as lists. */
export function SubtasksSection({ task }: { task: Task }) {
  const [collapsed, setCollapsed] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const updateTask = useUpdateTask();
  const subtasks = task.subtasks ?? [];

  return (
    <section className="mt-8" aria-label="Subtasks">
      <h2 className="mb-3">
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
          className="flex items-center gap-1.5 text-sm font-semibold"
        >
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              collapsed && "-rotate-90",
            )}
            aria-hidden
          />
          Subtasks
        </button>
      </h2>

      {/* Mobile: stacked cards instead of a horizontally scrolling table. */}
      {!collapsed && (
        <div className="flex flex-col gap-2 sm:hidden">
          {subtasks.length === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              No subtasks yet.
            </p>
          ) : (
            subtasks.map((subtask) => (
              <article key={subtask.id} className="rounded-lg border bg-card p-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium">{subtask.title}</h3>
                  <span className="-mr-1.5 -mt-1">
                    <RowActionsMenu task={subtask} />
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <PriorityBadge priority={subtask.priority} />
                  {subtask.assignee ? (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UserAvatar user={subtask.assignee} size={18} />
                      {subtask.assignee.name}
                    </span>
                  ) : null}
                  {subtask.dueDate ? (
                    <span className="text-xs text-muted-foreground">
                      {formatLongDate(subtask.dueDate)}
                    </span>
                  ) : null}
                </div>
              </article>
            ))
          )}
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex h-11 items-center gap-1.5 rounded-lg border border-dashed px-4 text-sm transition-colors hover:bg-accent/50"
          >
            <Plus className="size-4" aria-hidden />
            Add Subtasks
          </button>
        </div>
      )}

      {!collapsed && (
        <div className="hidden overflow-x-auto rounded-lg border sm:block">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="bg-muted/50 text-left">
                <th className="h-11 px-4 font-medium">Task</th>
                <th className="h-11 w-32 px-2 font-medium">Priority</th>
                <th className="h-11 w-28 px-2 font-medium">Members</th>
                <th className="h-11 w-36 px-2 font-medium">Due Date</th>
                <th className="h-11 w-20 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subtasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="border-t px-4 py-6 text-center text-muted-foreground">
                    No subtasks yet.
                  </td>
                </tr>
              )}
              {subtasks.map((subtask) => (
                <tr key={subtask.id} className="border-t">
                  <td className="px-4 py-3.5">{subtask.title}</td>
                  <td className="px-2 py-3.5">
                    <PriorityBadge priority={subtask.priority} />
                  </td>
                  <td className="px-2 py-3.5">
                    <MemberPicker
                      value={subtask.assigneeId}
                      onChange={(assigneeId) =>
                        updateTask.mutate({ id: subtask.id, input: { assigneeId } })
                      }
                    >
                      <button
                        type="button"
                        aria-label={
                          subtask.assignee
                            ? `Assignee: ${subtask.assignee.name}`
                            : "Assign member"
                        }
                        className="flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {subtask.assignee ? (
                          <UserAvatar user={subtask.assignee} size={24} />
                        ) : (
                          <span className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                            <Plus className="size-3.5" aria-hidden />
                          </span>
                        )}
                      </button>
                    </MemberPicker>
                  </td>
                  <td className="px-2 py-3.5">
                    {subtask.dueDate ? formatLongDate(subtask.dueDate) : ""}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <RowActionsMenu task={subtask} />
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={5} className="border-t p-0">
                  <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className="flex h-12 w-full items-center gap-1.5 px-4 text-sm transition-colors hover:bg-accent/50"
                  >
                    <Plus className="size-4" aria-hidden />
                    Add Subtasks
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <AddTaskDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultStatus={task.status}
        parentId={task.id}
      />
    </section>
  );
}
