import { cn } from "@/lib/utils";
import { STATUS_LABELS, type TaskStatus } from "@/lib/types";

const STATUS_DOT_CLASS: Record<TaskStatus, string> = {
  backlog: "bg-status-backlog",
  todo: "bg-status-todo",
  doing: "bg-status-doing",
  completed: "bg-status-completed",
  on_hold: "bg-status-on-hold",
};

const STATUS_TEXT_CLASS: Record<TaskStatus, string> = {
  backlog: "text-status-backlog",
  todo: "text-foreground",
  doing: "text-status-doing",
  completed: "text-status-completed",
  on_hold: "text-status-on-hold",
};

/** Colored dot + label, e.g. "● Backlog" in orange (task detail panel). */
export function StatusBadge({
  status,
  colored = true,
  className,
}: {
  status: TaskStatus;
  colored?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-sm",
        colored ? STATUS_TEXT_CLASS[status] : "text-foreground",
        className,
      )}
    >
      <span
        className={cn("size-2 shrink-0 rounded-full", STATUS_DOT_CLASS[status])}
        aria-hidden
      />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function StatusDot({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <span
      className={cn("size-2 shrink-0 rounded-full", STATUS_DOT_CLASS[status], className)}
      aria-hidden
    />
  );
}
