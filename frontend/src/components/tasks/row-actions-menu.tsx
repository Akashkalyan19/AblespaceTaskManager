"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarDays,
  Circle,
  Ellipsis,
  Eye,
  SignalHigh,
  Trash2,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { UserAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PriorityIcon } from "./priority";
import { StatusDot } from "./status-badge";
import { toIsoDate } from "./pickers";
import { useDeleteTask, useMembers, useUpdateTask } from "@/lib/queries";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_STATUSES,
  type Task,
} from "@/lib/types";

/**
 * The "⋯" menu on task rows and board cards: submenus to change status,
 * priority, assignee and due date (as in the design), plus open + delete.
 */
export function RowActionsMenu({ task }: { task: Task }) {
  const router = useRouter();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: members = [] } = useMembers();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function update(input: Parameters<typeof updateTask.mutate>[0]["input"]) {
    updateTask.mutate(
      { id: task.id, input },
      { onError: (error) => toast.error(error.message) },
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${task.title}`}
            className="text-muted-foreground data-[state=open]:bg-accent"
            onClick={(event) => event.stopPropagation()}
          >
            <Ellipsis aria-hidden />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-48"
          onClick={(event) => event.stopPropagation()}
        >
          <DropdownMenuItem onSelect={() => router.push(`/tasks/${task.id}`)}>
            <Eye aria-hidden />
            Open task
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Circle aria-hidden />
              Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-44">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              {TASK_STATUSES.map((status) => (
                <DropdownMenuCheckItem
                  key={status}
                  checked={task.status === status}
                  onSelect={() => update({ status })}
                >
                  <StatusDot status={status} />
                  {STATUS_LABELS[status]}
                </DropdownMenuCheckItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <SignalHigh aria-hidden />
              Priority
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-44">
              <DropdownMenuLabel>Priority</DropdownMenuLabel>
              {PRIORITIES.map((priority) => (
                <DropdownMenuCheckItem
                  key={priority}
                  checked={task.priority === priority}
                  onSelect={() => update({ priority })}
                >
                  <PriorityIcon priority={priority} />
                  {PRIORITY_LABELS[priority]}
                </DropdownMenuCheckItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Users aria-hidden />
              Members
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="max-h-72 w-52 overflow-y-auto">
              <DropdownMenuLabel>Assignee</DropdownMenuLabel>
              <DropdownMenuCheckItem
                checked={task.assigneeId === null}
                onSelect={() => update({ assigneeId: null })}
              >
                No assignee
              </DropdownMenuCheckItem>
              {members.map((member) => (
                <DropdownMenuCheckItem
                  key={member.id}
                  checked={task.assigneeId === member.id}
                  onSelect={() => update({ assigneeId: member.id })}
                >
                  <UserAvatar user={member} size={18} />
                  {member.name}
                </DropdownMenuCheckItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <CalendarDays aria-hidden />
              Due Date
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="p-0">
              <Calendar
                mode="single"
                selected={task.dueDate ? new Date(task.dueDate + "T00:00:00") : undefined}
                defaultMonth={task.dueDate ? new Date(task.dueDate + "T00:00:00") : undefined}
                onSelect={(day) => update({ dueDate: day ? toIsoDate(day) : null })}
              />
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
            onSelect={() => setConfirmOpen(true)}
          >
            <Trash2 aria-hidden />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete task?"
        description={`"${task.title}" and its subtasks will be permanently deleted.`}
        pending={deleteTask.isPending}
        onConfirm={() =>
          deleteTask.mutate(task.id, {
            onSuccess: () => {
              setConfirmOpen(false);
              toast.success("Task deleted");
            },
            onError: (error) => toast.error(error.message),
          })
        }
      />
    </>
  );
}
