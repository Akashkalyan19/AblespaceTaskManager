"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DatePicker,
  MemberPicker,
  PriorityPicker,
  ProjectPicker,
  StatusPicker,
} from "./pickers";
import { useCreateTask } from "@/lib/queries";
import type { Priority, TaskStatus } from "@/lib/types";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Preset status, e.g. when adding from a board column. */
  defaultStatus?: TaskStatus;
  /** Locked project when adding from a project detail page. */
  projectId?: string;
  /** Creates a subtask when set. */
  parentId?: string;
}

export function AddTaskDialog({
  open,
  onOpenChange,
  defaultStatus = "todo",
  projectId,
  parentId,
}: AddTaskDialogProps) {
  const createTask = useCreateTask();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<Priority>("none");
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [labelsText, setLabelsText] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projectId ?? null,
  );
  const [titleError, setTitleError] = useState<string | null>(null);

  const isSubtask = Boolean(parentId);

  function reset() {
    setTitle("");
    setDescription("");
    setStatus(defaultStatus);
    setPriority("none");
    setAssigneeId(null);
    setDueDate(null);
    setLabelsText("");
    setSelectedProjectId(projectId ?? null);
    setTitleError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = title.trim();
    if (!trimmed) {
      setTitleError("Please enter a title.");
      return;
    }

    const labels = labelsText
      .split(",")
      .map((label) => label.trim())
      .filter(Boolean)
      .slice(0, 10);

    createTask.mutate(
      {
        title: trimmed,
        description: description.trim() || undefined,
        status,
        priority,
        assigneeId: assigneeId ?? undefined,
        dueDate: dueDate ?? undefined,
        labels: labels.length > 0 ? labels : undefined,
        projectId: selectedProjectId ?? undefined,
        parentId,
      },
      {
        onSuccess: () => {
          toast.success(isSubtask ? "Subtask added" : "Task created");
          reset();
          onOpenChange(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isSubtask ? "Add Subtask" : "Add Task"}</DialogTitle>
          <DialogDescription>
            {isSubtask
              ? "Create a subtask under this task."
              : "Create a new task in your workspace."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="task-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                if (titleError) setTitleError(null);
              }}
              placeholder="e.g. Write API documentation"
              maxLength={200}
              aria-invalid={Boolean(titleError)}
              autoFocus
            />
            {titleError ? (
              <p role="alert" className="text-xs text-destructive">
                {titleError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-description" className="text-sm font-medium">
              Description <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add more details…"
              maxLength={5000}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Status</span>
              <StatusPicker value={status} onChange={setStatus} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Priority</span>
              <PriorityPicker value={priority} onChange={setPriority} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Assignee</span>
              <MemberPicker value={assigneeId} onChange={setAssigneeId} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Due date</span>
              <DatePicker value={dueDate} onChange={setDueDate} />
            </div>
          </div>

          {!isSubtask && !projectId ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Project</span>
              <ProjectPicker value={selectedProjectId} onChange={setSelectedProjectId} />
            </div>
          ) : null}

          {!isSubtask ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="task-labels" className="text-sm font-medium">
                Labels{" "}
                <span className="font-normal text-muted-foreground">
                  (comma separated)
                </span>
              </label>
              <Input
                id="task-labels"
                value={labelsText}
                onChange={(event) => setLabelsText(event.target.value)}
                placeholder="e.g. Design, Development"
              />
            </div>
          ) : null}

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createTask.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createTask.isPending}>
              {createTask.isPending
                ? "Creating…"
                : isSubtask
                  ? "Add Subtask"
                  : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
