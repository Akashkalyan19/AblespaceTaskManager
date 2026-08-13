"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Plus,
  Settings2,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatShortDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StatusBadge } from "../status-badge";
import { PriorityIcon, PRIORITY_TEXT_CLASS } from "../priority";
import { LabelChip } from "../chips";
import { DatePicker, MemberPicker, PriorityPicker, StatusPicker } from "../pickers";
import { useMe, useUpdateTask } from "@/lib/queries";
import { PRIORITY_LABELS, type Task } from "@/lib/types";

/**
 * The "Details" card on the right of the task detail page. Every row is an
 * inline editor: status, priority, members, date range and labels.
 */
export function DetailsPanel({ task }: { task: Task }) {
  const updateTask = useUpdateTask();
  const { data: me } = useMe();
  const [collapsed, setCollapsed] = useState(false);
  const [labelsDraft, setLabelsDraft] = useState(task.labels.join(", "));
  const [labelsOpen, setLabelsOpen] = useState(false);

  function update(input: Parameters<typeof updateTask.mutate>[0]["input"]) {
    updateTask.mutate(
      { id: task.id, input },
      { onError: (error) => toast.error(error.message) },
    );
  }

  function saveLabels() {
    const labels = labelsDraft
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean)
      .slice(0, 10);
    update({ labels });
    setLabelsOpen(false);
  }

  const rowLabel = "w-20 shrink-0 text-sm text-muted-foreground";

  return (
    <section className="rounded-xl border bg-card p-4" aria-label="Details">
      <header className="flex items-center justify-between">
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
          Details
        </button>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Add field"
            onClick={() => toast.info("Custom fields are not part of this demo.")}
          >
            <Plus aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Details settings"
            onClick={() => toast.info("Panel settings are not part of this demo.")}
          >
            <Settings2 aria-hidden />
          </Button>
        </span>
      </header>

      {!collapsed && (
        <dl className="mt-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <dt className={rowLabel}>Status</dt>
            <dd>
              <StatusPicker value={task.status} onChange={(status) => update({ status })}>
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-md px-1 py-0.5 transition-colors hover:bg-accent"
                >
                  <StatusBadge status={task.status} />
                </button>
              </StatusPicker>
            </dd>
          </div>

          <div className="flex items-center gap-3">
            <dt className={rowLabel}>Priority</dt>
            <dd>
              <PriorityPicker
                value={task.priority}
                onChange={(priority) => update({ priority })}
              >
                <button
                  type="button"
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-1 py-0.5 text-sm transition-colors hover:bg-accent",
                    PRIORITY_TEXT_CLASS[task.priority],
                  )}
                >
                  <PriorityIcon priority={task.priority} />
                  {PRIORITY_LABELS[task.priority]}
                  <ChevronUp className="size-3.5 text-muted-foreground" aria-hidden />
                </button>
              </PriorityPicker>
            </dd>
          </div>

          <div className="flex items-center gap-3">
            <dt className={rowLabel}>Members</dt>
            <dd>
              <MemberPicker
                value={task.assigneeId}
                onChange={(assigneeId) => update({ assigneeId })}
              >
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-md px-1 py-0.5 text-sm transition-colors hover:bg-accent"
                >
                  {task.assignee ? (
                    <>
                      <UserAvatar user={task.assignee} size={20} />
                      {task.assignee.name}
                    </>
                  ) : (
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <UserPlus className="size-4" aria-hidden />
                      Add members
                    </span>
                  )}
                </button>
              </MemberPicker>
            </dd>
          </div>

          <div className="flex items-center gap-3">
            <dt className={rowLabel}>Dates</dt>
            <dd className="flex items-center gap-1.5">
              <DatePicker
                value={task.startDate}
                onChange={(startDate) => update({ startDate })}
              >
                <button type="button" className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs transition-colors hover:bg-accent">
                  <CalendarIcon className="size-3 text-muted-foreground" aria-hidden />
                  {task.startDate ? formatShortDate(task.startDate) : "Start"}
                </button>
              </DatePicker>
              <ArrowRight className="size-3.5 text-muted-foreground" aria-hidden />
              <DatePicker
                value={task.dueDate}
                onChange={(dueDate) => update({ dueDate })}
              >
                <button type="button" className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs transition-colors hover:bg-accent">
                  <CalendarIcon className="size-3 text-muted-foreground" aria-hidden />
                  {task.dueDate ? formatShortDate(task.dueDate) : "End"}
                </button>
              </DatePicker>
            </dd>
          </div>

          <div className="flex items-start gap-3">
            <dt className={cn(rowLabel, "pt-1")}>Labels</dt>
            <dd className="min-w-0">
              <Popover open={labelsOpen} onOpenChange={(open) => {
                setLabelsOpen(open);
                if (open) setLabelsDraft(task.labels.join(", "));
              }}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label="Edit labels"
                    className="flex flex-wrap gap-1.5 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-accent"
                  >
                    {task.labels.length > 0 ? (
                      task.labels.map((label, index) => (
                        <LabelChip key={`${label}-${index}`} label={label} />
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Add labels</span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-72 p-3">
                  <p className="mb-2 text-xs text-muted-foreground">
                    Comma-separated labels
                  </p>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      saveLabels();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={labelsDraft}
                      onChange={(event) => setLabelsDraft(event.target.value)}
                      placeholder="Design, Development"
                      aria-label="Labels"
                      autoFocus
                    />
                    <Button type="submit" size="sm" className="h-9">
                      Save
                    </Button>
                  </form>
                </PopoverContent>
              </Popover>
            </dd>
          </div>

          <div className="flex items-center gap-3">
            <dt className={rowLabel}>Reporter</dt>
            <dd>
              {me ? (
                <span className="flex items-center gap-1.5 text-sm">
                  <UserAvatar user={me} size={20} />
                  {me.name}
                </span>
              ) : null}
            </dd>
          </div>
        </dl>
      )}
    </section>
  );
}
