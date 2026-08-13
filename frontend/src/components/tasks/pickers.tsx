"use client";

import { useState } from "react";
import { CalendarIcon, CircleDashed, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { UserAvatar } from "@/components/ui/avatar";
import { PriorityIcon } from "./priority";
import { StatusDot } from "./status-badge";
import { useMembers, useProjects } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { formatLongDate } from "@/lib/format";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_STATUSES,
  type Priority,
  type TaskStatus,
} from "@/lib/types";

/**
 * Small "picker" dropdowns reused by the add-task dialog, the task detail
 * panel and the row context menus. Each renders its own trigger button
 * unless children are provided.
 */

const triggerClass =
  "inline-flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function StatusPicker({
  value,
  onChange,
  children,
}: {
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
  children?: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children ?? (
          <button type="button" className={triggerClass}>
            <StatusDot status={value} />
            {STATUS_LABELS[value]}
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        {TASK_STATUSES.map((status) => (
          <DropdownMenuCheckItem
            key={status}
            checked={status === value}
            onSelect={() => onChange(status)}
          >
            <StatusDot status={status} />
            {STATUS_LABELS[status]}
          </DropdownMenuCheckItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const PRIORITY_ITEM_CLASS: Record<Priority, string> = {
  none: "",
  urgent: "text-priority-urgent focus:text-priority-urgent",
  high: "text-priority-high focus:text-priority-high",
  medium: "text-priority-medium focus:text-priority-medium",
  low: "text-priority-low focus:text-priority-low",
};

export function PriorityPicker({
  value,
  onChange,
  children,
}: {
  value: Priority;
  onChange: (priority: Priority) => void;
  children?: React.ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children ?? (
          <button type="button" className={triggerClass}>
            <PriorityIcon
              priority={value}
              className={cn(value !== "none" && PRIORITY_ITEM_CLASS[value])}
            />
            {PRIORITY_LABELS[value]}
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        <DropdownMenuLabel>Priority</DropdownMenuLabel>
        {PRIORITIES.map((priority) => (
          <DropdownMenuCheckItem
            key={priority}
            checked={priority === value}
            onSelect={() => onChange(priority)}
            className={PRIORITY_ITEM_CLASS[priority]}
          >
            <PriorityIcon priority={priority} />
            {PRIORITY_LABELS[priority]}
          </DropdownMenuCheckItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MemberPicker({
  value,
  onChange,
  children,
}: {
  value: string | null;
  onChange: (memberId: string | null) => void;
  children?: React.ReactNode;
}) {
  const { data: members = [] } = useMembers();
  const selected = members.find((m) => m.id === value) ?? null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children ?? (
          <button type="button" className={triggerClass}>
            {selected ? (
              <>
                <UserAvatar user={selected} size={18} />
                {selected.name}
              </>
            ) : (
              <>
                <UserPlus className="size-4 text-muted-foreground" aria-hidden />
                <span className="text-muted-foreground">Add members</span>
              </>
            )}
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 w-52 overflow-y-auto">
        <DropdownMenuLabel>Assignee</DropdownMenuLabel>
        <DropdownMenuCheckItem checked={value === null} onSelect={() => onChange(null)}>
          <CircleDashed className="size-4 text-muted-foreground" aria-hidden />
          No assignee
        </DropdownMenuCheckItem>
        {members.map((member) => (
          <DropdownMenuCheckItem
            key={member.id}
            checked={member.id === value}
            onSelect={() => onChange(member.id)}
          >
            <UserAvatar user={member} size={18} />
            {member.name}
          </DropdownMenuCheckItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ProjectPicker({
  value,
  onChange,
  children,
}: {
  value: string | null;
  onChange: (projectId: string | null) => void;
  children?: React.ReactNode;
}) {
  const { data: projects = [] } = useProjects();
  const selected = projects.find((p) => p.id === value) ?? null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children ?? (
          <button type="button" className={triggerClass}>
            <span className={cn(!selected && "text-muted-foreground")}>
              {selected ? selected.name : "No project"}
            </span>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-72 w-56 overflow-y-auto">
        <DropdownMenuLabel>Project</DropdownMenuLabel>
        <DropdownMenuCheckItem checked={value === null} onSelect={() => onChange(null)}>
          No project
        </DropdownMenuCheckItem>
        {projects.map((project) => (
          <DropdownMenuCheckItem
            key={project.id}
            checked={project.id === value}
            onSelect={() => onChange(project.id)}
          >
            {project.name}
          </DropdownMenuCheckItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  children,
}: {
  value: string | null;
  onChange: (isoDate: string | null) => void;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children ?? (
          <button type="button" className={triggerClass}>
            <CalendarIcon className="size-4 text-muted-foreground" aria-hidden />
            <span className={cn(!value && "text-muted-foreground")}>
              {value ? formatLongDate(value) : placeholder}
            </span>
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? new Date(value + "T00:00:00") : undefined}
          defaultMonth={value ? new Date(value + "T00:00:00") : undefined}
          onSelect={(day) => {
            onChange(day ? toIsoDate(day) : null);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
