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
} from "@/components/tasks/pickers";
import { useCreateProject } from "@/lib/queries";
import type { Priority } from "@/lib/types";

export function AddProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createProject = useCreateProject();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("none");
  const [leadId, setLeadId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  function reset() {
    setName("");
    setDescription("");
    setPriority("none");
    setLeadId(null);
    setDueDate(null);
    setNameError(null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Please enter a project name.");
      return;
    }

    createProject.mutate(
      {
        name: trimmed,
        description: description.trim() || undefined,
        priority,
        leadId: leadId ?? undefined,
        dueDate: dueDate ?? undefined,
      },
      {
        onSuccess: () => {
          toast.success("Project created");
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
          <DialogTitle>Add Project</DialogTitle>
          <DialogDescription>
            Create a project to group related tasks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="project-name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="project-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (nameError) setNameError(null);
              }}
              placeholder="e.g. Design Homepage"
              maxLength={200}
              aria-invalid={Boolean(nameError)}
              autoFocus
            />
            {nameError ? (
              <p role="alert" className="text-xs text-destructive">
                {nameError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="project-description" className="text-sm font-medium">
              Description <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <Textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this project about?"
              maxLength={5000}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Priority</span>
              <PriorityPicker value={priority} onChange={setPriority} />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">Lead</span>
              <MemberPicker value={leadId} onChange={setLeadId} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Due date</span>
            <DatePicker value={dueDate} onChange={setDueDate} />
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createProject.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createProject.isPending}>
              {createProject.isPending ? "Creating…" : "Add Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
