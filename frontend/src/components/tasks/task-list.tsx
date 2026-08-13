"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatLongDate } from "@/lib/format";
import { UserAvatar } from "@/components/ui/avatar";
import { PriorityBadge } from "./priority";
import { StatusBadge } from "./status-badge";
import { DateChip, LabelChip } from "./chips";
import { RowActionsMenu } from "./row-actions-menu";
import { AddTaskDialog } from "./add-task-dialog";
import { MemberPicker } from "./pickers";
import { useMe, useUpdateTask } from "@/lib/queries";
import type { VisibleFields } from "./view-preferences";
import {
  STATUS_LABELS,
  TASK_STATUSES,
  type Task,
  type TaskStatus,
} from "@/lib/types";

/**
 * List view: one collapsible group per status, each rendered as the bordered
 * table from the design (Task | Priority | Members | Due Date | Actions).
 * The first three groups are always visible; On Hold/Backlog appear only
 * when they contain tasks (the mock shows To Do/Doing/Completed).
 */
const ALWAYS_VISIBLE: TaskStatus[] = ["todo", "doing", "completed"];

export function TaskList({
  tasks,
  fields,
  projectId,
}: {
  tasks: Task[];
  fields: VisibleFields;
  projectId?: string;
}) {
  const groups = useMemo(() => {
    return TASK_STATUSES.filter(
      (status) =>
        ALWAYS_VISIBLE.includes(status) ||
        tasks.some((task) => task.status === status),
    ).map((status) => ({
      status,
      tasks: tasks.filter((task) => task.status === status),
    }));
  }, [tasks]);

  return (
    <div className="flex flex-col gap-7">
      {groups.map((group) => (
        <TaskGroup
          key={group.status}
          status={group.status}
          tasks={group.tasks}
          fields={fields}
          projectId={projectId}
        />
      ))}
    </div>
  );
}

function TaskGroup({
  status,
  tasks,
  fields,
  projectId,
}: {
  status: TaskStatus;
  tasks: Task[];
  fields: VisibleFields;
  projectId?: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const columnCount =
    1 +
    Number(fields.priority) +
    Number(fields.members) +
    Number(fields.dueDate) +
    Number(fields.labels) +
    Number(fields.status) +
    Number(fields.reporter) +
    1;

  return (
    <section aria-label={STATUS_LABELS[status]}>
      <h2 className="mb-3">
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-expanded={!collapsed}
          className="flex items-center gap-1.5 text-sm font-medium"
        >
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              collapsed && "-rotate-90",
            )}
            aria-hidden
          />
          {STATUS_LABELS[status]}
        </button>
      </h2>

      {/* Mobile: stacked cards. The desktop table would need horizontal
          scrolling to stay readable at 375px. */}
      {!collapsed && (
        <div className="flex flex-col gap-2 sm:hidden">
          {tasks.length === 0 ? (
            <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
              No tasks in {STATUS_LABELS[status]}.
            </p>
          ) : (
            tasks.map((task) => (
              <TaskCardRow key={task.id} task={task} fields={fields} />
            ))
          )}
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex h-11 items-center gap-1.5 rounded-lg border border-dashed px-4 text-sm transition-colors hover:bg-accent/50"
          >
            <Plus className="size-4" aria-hidden />
            Add Task
          </button>
        </div>
      )}

      {!collapsed && (
        <div className="hidden overflow-x-auto rounded-lg border sm:block">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="bg-muted/50 text-left">
                <th className="h-11 px-4 font-medium">Task</th>
                {fields.priority && <th className="h-11 w-32 px-2 font-medium">Priority</th>}
                {fields.members && <th className="h-11 w-28 px-2 font-medium">Members</th>}
                {fields.dueDate && <th className="h-11 w-36 px-2 font-medium">Due Date</th>}
                {fields.labels && <th className="h-11 w-44 px-2 font-medium">Labels</th>}
                {fields.status && <th className="h-11 w-32 px-2 font-medium">Status</th>}
                {fields.reporter && <th className="h-11 w-28 px-2 font-medium">Reporter</th>}
                <th className="h-11 w-20 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={columnCount}
                    className="border-t px-4 py-6 text-center text-muted-foreground"
                  >
                    No tasks in {STATUS_LABELS[status]}.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <TaskRow key={task.id} task={task} fields={fields} />
                ))
              )}
              <tr>
                <td colSpan={columnCount} className="border-t p-0">
                  <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className="flex h-12 w-full items-center gap-1.5 px-4 text-sm transition-colors hover:bg-accent/50"
                  >
                    <Plus className="size-4" aria-hidden />
                    Add Task
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
        defaultStatus={status}
        projectId={projectId}
      />
    </section>
  );
}

/** Mobile presentation of a task row: title, priority, assignee, due date. */
function TaskCardRow({ task, fields }: { task: Task; fields: VisibleFields }) {
  const router = useRouter();

  return (
    <article
      onClick={() => router.push(`/tasks/${task.id}`)}
      className="cursor-pointer rounded-lg border bg-card p-3 transition-colors hover:bg-accent/40"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium leading-snug">{task.title}</h3>
        <span onClick={(event) => event.stopPropagation()} className="-mr-1.5 -mt-1">
          <RowActionsMenu task={task} />
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {fields.priority && <PriorityBadge priority={task.priority} />}
        {fields.status && <StatusBadge status={task.status} />}
        {fields.members && task.assignee ? (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <UserAvatar user={task.assignee} size={18} />
            {task.assignee.name}
          </span>
        ) : null}
        {fields.dueDate && task.dueDate ? <DateChip date={task.dueDate} /> : null}
      </div>

      {fields.labels && task.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {task.labels.map((label, index) => (
            <LabelChip key={`${label}-${index}`} label={label} />
          ))}
        </div>
      )}
    </article>
  );
}

function TaskRow({ task, fields }: { task: Task; fields: VisibleFields }) {
  const router = useRouter();
  const updateTask = useUpdateTask();
  const { data: me } = useMe();

  return (
    <tr
      onClick={() => router.push(`/tasks/${task.id}`)}
      className="group cursor-pointer border-t transition-colors hover:bg-accent/40"
    >
      <td className="px-4 h-12 py-0 font-normal">{task.title}</td>

      {fields.priority && (
        <td className="px-2 h-12 py-0">
          <PriorityBadge priority={task.priority} />
        </td>
      )}

      {fields.members && (
        <td className="px-2 h-12 py-0" onClick={(event) => event.stopPropagation()}>
          <MemberPicker
            value={task.assigneeId}
            onChange={(assigneeId) =>
              updateTask.mutate({ id: task.id, input: { assigneeId } })
            }
          >
            <button
              type="button"
              aria-label={
                task.assignee ? `Assignee: ${task.assignee.name}` : "Assign member"
              }
              className="flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {task.assignee ? (
                <UserAvatar user={task.assignee} size={24} />
              ) : (
                <span className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                  <Plus className="size-3.5" aria-hidden />
                </span>
              )}
            </button>
          </MemberPicker>
        </td>
      )}

      {fields.dueDate && (
        <td className="px-2 h-12 py-0">
          {task.dueDate ? formatLongDate(task.dueDate) : ""}
        </td>
      )}

      {fields.labels && (
        <td className="px-2 h-12 py-0">
          <span className="flex flex-wrap gap-1">
            {task.labels.map((label, index) => (
              <LabelChip key={`${label}-${index}`} label={label} />
            ))}
          </span>
        </td>
      )}

      {fields.status && (
        <td className="px-2 h-12 py-0">
          <StatusBadge status={task.status} colored={false} />
        </td>
      )}

      {fields.reporter && (
        <td className="px-2 h-12 py-0">
          {me ? <UserAvatar user={me} size={24} /> : null}
        </td>
      )}

      <td className="px-4 h-12 py-0 text-right" onClick={(event) => event.stopPropagation()}>
        <RowActionsMenu task={task} />
      </td>
    </tr>
  );
}
