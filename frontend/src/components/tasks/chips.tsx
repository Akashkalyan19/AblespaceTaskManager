import { CalendarDays, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatShortDate, isOverdue } from "@/lib/format";

/** Bordered label chip with a tag icon ("Deployment", "Design", ...). */
export function LabelChip({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border bg-background px-1.5 py-0.5 text-xs text-foreground/80",
        className,
      )}
    >
      <Tag className="size-3 text-muted-foreground" aria-hidden />
      {label}
    </span>
  );
}

/**
 * Due-date chip ("29 Jul"). Red tint when the date is in the past, matching
 * the overdue cards in the design; neutral otherwise.
 */
export function DateChip({ date, className }: { date: string; className?: string }) {
  const overdue = isOverdue(date);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium",
        overdue ? "bg-overdue-bg text-overdue" : "bg-muted text-muted-foreground",
        className,
      )}
    >
      <CalendarDays className="size-3" aria-hidden />
      {formatShortDate(date)}
    </span>
  );
}
