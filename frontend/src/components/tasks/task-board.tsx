"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Ellipsis, GripVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DateChip, LabelChip } from "./chips";
import { PriorityIcon, PRIORITY_TEXT_CLASS } from "./priority";
import { RowActionsMenu } from "./row-actions-menu";
import { AddTaskDialog } from "./add-task-dialog";
import { useMoveTask, type TaskFilters } from "@/lib/queries";
import type { VisibleFields } from "./view-preferences";
import {
  STATUS_LABELS,
  type Task,
  type TaskStatus,
} from "@/lib/types";

/**
 * Board (kanban) view. Columns follow the design: To Do, Doing, Completed,
 * On Hold — plus Backlog when it has tasks. Cards move between columns with
 * native HTML5 drag & drop (optimistic status update).
 */
const BOARD_COLUMNS: TaskStatus[] = ["todo", "doing", "completed", "on_hold"];

export function TaskBoard({
  tasks,
  fields,
  filters,
  projectId,
}: {
  tasks: Task[];
  fields: VisibleFields;
  /** The active query filters, needed for optimistic cache updates. */
  filters: TaskFilters;
  projectId?: string;
}) {
  const columns = useMemo(() => {
    const list = [...BOARD_COLUMNS];
    if (tasks.some((task) => task.status === "backlog")) list.push("backlog");
    return list.map((status) => ({
      status,
      tasks: tasks.filter((task) => task.status === status),
    }));
  }, [tasks]);

  const moveTask = useMoveTask(filters);

  return (
    <div className="flex items-start gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <BoardColumn
          key={column.status}
          status={column.status}
          tasks={column.tasks}
          fields={fields}
          projectId={projectId}
          onDropTask={(taskId) =>
            moveTask.mutate({ id: taskId, status: column.status })
          }
        />
      ))}
    </div>
  );
}

function BoardColumn({
  status,
  tasks,
  fields,
  projectId,
  onDropTask,
}: {
  status: TaskStatus;
  tasks: Task[];
  fields: VisibleFields;
  projectId?: string;
  onDropTask: (taskId: string) => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  return (
    <section
      aria-label={`${STATUS_LABELS[status]} column`}
      className={cn(
        "flex w-72 shrink-0 flex-col gap-2 rounded-xl bg-muted/60 p-2 transition-colors",
        dragOver && "bg-accent ring-2 ring-ring/30",
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        const taskId = event.dataTransfer.getData("text/task-id");
        if (taskId) onDropTask(taskId);
      }}
    >
      <header className="flex items-center gap-1 px-1 py-0.5">
        <GripVertical className="size-4 text-muted-foreground/70" aria-hidden />
        <h3 className="flex-1 text-sm font-medium">{STATUS_LABELS[status]}</h3>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Add task to ${STATUS_LABELS[status]}`}
          className={cn(
            "text-muted-foreground",
            status === "completed" && "text-success hover:text-success",
          )}
          onClick={() => setAddOpen(true)}
        >
          <Plus aria-hidden />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`${STATUS_LABELS[status]} column options`}
          className="text-muted-foreground"
          onClick={() => setAddOpen(true)}
        >
          <Ellipsis aria-hidden />
        </Button>
      </header>

      <div className="flex flex-col gap-2">
        {tasks.length === 0 && (
          <p className="rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
            No tasks yet
          </p>
        )}
        {tasks.map((task) => (
          <BoardCard key={task.id} task={task} fields={fields} />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setAddOpen(true)}
        className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-sm text-foreground/80 transition-colors hover:bg-accent"
      >
        <Plus className="size-4" aria-hidden />
        Add Task
      </button>

      <AddTaskDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultStatus={status}
        projectId={projectId}
      />
    </section>
  );
}

function BoardCard({ task, fields }: { task: Task; fields: VisibleFields }) {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);

  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/task-id", task.id);
        event.dataTransfer.effectAllowed = "move";
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
      onClick={() => router.push(`/tasks/${task.id}`)}
      className={cn(
        "cursor-pointer rounded-lg border bg-card p-3 shadow-xs transition-shadow hover:shadow-md",
        dragging && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="flex min-w-0 items-center gap-1.5 text-sm font-medium leading-snug">
          {fields.priority && task.priority !== "none" ? (
            <PriorityIcon
              priority={task.priority}
              className={cn("shrink-0", PRIORITY_TEXT_CLASS[task.priority])}
            />
          ) : null}
          <span className="truncate">{task.title}</span>
        </h4>
        <span onClick={(event) => event.stopPropagation()} className="-mr-1.5 -mt-1">
          <RowActionsMenu task={task} />
        </span>
      </div>

      {(fields.members || fields.dueDate) && (
        <div className="mt-2.5 flex items-center justify-between gap-2">
          {fields.members && task.assignee ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <UserAvatar user={task.assignee} size={18} />
              <span className="truncate text-xs text-muted-foreground">
                {task.assignee.name}
              </span>
            </span>
          ) : (
            <span />
          )}
          {fields.dueDate && task.dueDate ? <DateChip date={task.dueDate} /> : null}
        </div>
      )}

      {fields.labels && task.labels.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {task.labels.slice(0, 2).map((label, index) => (
            <LabelChip key={`${label}-${index}`} label={label} />
          ))}
          {task.labels.length > 2 && (
            <span className="self-center text-[11px] text-muted-foreground">
              +{task.labels.length - 2}
            </span>
          )}
        </div>
      )}
    </article>
  );
}
