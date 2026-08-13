import { cn } from "@/lib/utils";
import { PRIORITY_LABELS, type Priority } from "@/lib/types";

/**
 * Signal-bar icon from the design: three ascending bars, filled according
 * to priority level (urgent/high fill all, medium two, low one).
 */
const FILLED_BARS: Record<Priority, number> = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
  urgent: 3,
};

export const PRIORITY_TEXT_CLASS: Record<Priority, string> = {
  none: "text-muted-foreground",
  urgent: "text-priority-urgent",
  high: "text-priority-high",
  medium: "text-priority-medium",
  low: "text-priority-low",
};

export function PriorityIcon({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  const filled = FILLED_BARS[priority];

  if (priority === "none") {
    return (
      <svg viewBox="0 0 12 12" className={cn("size-3", className)} aria-hidden>
        <rect x="1" y="9" width="10" height="2" rx="1" className="fill-current opacity-40" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 12 12" className={cn("size-3", className)} aria-hidden>
      {/* bars: heights 4 / 7 / 10 from left to right */}
      <rect x="0.5" y="7" width="2.6" height="4.5" rx="1"
        className={cn("fill-current", filled < 1 && "opacity-25")} />
      <rect x="4.7" y="4" width="2.6" height="7.5" rx="1"
        className={cn("fill-current", filled < 2 && "opacity-25")} />
      <rect x="8.9" y="0.5" width="2.6" height="11" rx="1"
        className={cn("fill-current", filled < 3 && "opacity-25")} />
    </svg>
  );
}

/** Icon + colored label, e.g. ".ıl High" in red. */
export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm",
        PRIORITY_TEXT_CLASS[priority],
        className,
      )}
    >
      <PriorityIcon priority={priority} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
