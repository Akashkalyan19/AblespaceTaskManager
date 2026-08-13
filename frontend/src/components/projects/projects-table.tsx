"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarDays,
  Ellipsis,
  Eye,
  Plus,
  SignalHigh,
  Trash2,
  Users,
} from "lucide-react";
import { formatLongDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { PriorityBadge, PriorityIcon } from "@/components/tasks/priority";
import { MemberPicker, toIsoDate } from "@/components/tasks/pickers";
import {
  useDeleteProject,
  useMembers,
  useUpdateProject,
} from "@/lib/queries";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  type Project,
} from "@/lib/types";

/** Projects table: Projects | Priority | Lead | Due Date | Actions. */
export function ProjectsTable({
  projects,
  onAdd,
}: {
  projects: Project[];
  onAdd: () => void;
}) {
  const router = useRouter();
  const updateProject = useUpdateProject();

  return (
    <>
      {/* Mobile: stacked cards instead of a horizontally scrolling table. */}
      <div className="flex flex-col gap-2 sm:hidden">
        {projects.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            No projects yet.
          </p>
        ) : (
          projects.map((project) => (
            <article
              key={project.id}
              onClick={() => router.push(`/projects/${project.id}`)}
              className="cursor-pointer rounded-lg border bg-card p-3 transition-colors hover:bg-accent/40"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-medium leading-snug">{project.name}</h3>
                <span onClick={(event) => event.stopPropagation()} className="-mr-1.5 -mt-1">
                  <ProjectActionsMenu project={project} />
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <PriorityBadge priority={project.priority} />
                {project.lead ? (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <UserAvatar user={project.lead} size={18} />
                    {project.lead.name}
                  </span>
                ) : null}
                {project.dueDate ? (
                  <span className="text-xs text-muted-foreground">
                    {formatLongDate(project.dueDate)}
                  </span>
                ) : null}
              </div>
            </article>
          ))
        )}
        <button
          type="button"
          onClick={onAdd}
          className="flex h-11 items-center gap-1.5 rounded-lg border border-dashed px-4 text-sm transition-colors hover:bg-accent/50"
        >
          <Plus className="size-4" aria-hidden />
          Add Projects
        </button>
      </div>

      <div className="hidden overflow-x-auto rounded-lg border sm:block">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="bg-muted/50 text-left">
            <th className="h-11 px-4 font-medium">Projects</th>
            <th className="h-11 w-32 px-2 font-medium">Priority</th>
            <th className="h-11 w-28 px-2 font-medium">Lead</th>
            <th className="h-11 w-36 px-2 font-medium">Due Date</th>
            <th className="h-11 w-20 px-4 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.length === 0 && (
            <tr>
              <td colSpan={5} className="border-t px-4 py-6 text-center text-muted-foreground">
                No projects yet.
              </td>
            </tr>
          )}
          {projects.map((project) => (
            <tr
              key={project.id}
              onClick={() => router.push(`/projects/${project.id}`)}
              className="cursor-pointer border-t transition-colors hover:bg-accent/40"
            >
              <td className="px-4 h-12 py-0 font-normal">{project.name}</td>
              <td className="px-2 h-12 py-0">
                <PriorityBadge priority={project.priority} />
              </td>
              <td className="px-2 h-12 py-0" onClick={(event) => event.stopPropagation()}>
                <MemberPicker
                  value={project.leadId}
                  onChange={(leadId) =>
                    updateProject.mutate({ id: project.id, input: { leadId } })
                  }
                >
                  <button
                    type="button"
                    aria-label={project.lead ? `Lead: ${project.lead.name}` : "Assign lead"}
                    className="flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {project.lead ? (
                      <UserAvatar user={project.lead} size={24} />
                    ) : (
                      <span className="flex size-6 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                        <Plus className="size-3.5" aria-hidden />
                      </span>
                    )}
                  </button>
                </MemberPicker>
              </td>
              <td className="px-2 h-12 py-0">
                {project.dueDate ? formatLongDate(project.dueDate) : ""}
              </td>
              <td className="px-4 h-12 py-0 text-right" onClick={(event) => event.stopPropagation()}>
                <ProjectActionsMenu project={project} />
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={5} className="border-t p-0">
              <button
                type="button"
                onClick={onAdd}
                className="flex h-12 w-full items-center gap-1.5 px-4 text-sm transition-colors hover:bg-accent/50"
              >
                <Plus className="size-4" aria-hidden />
                Add Projects
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </>
  );
}

function ProjectActionsMenu({ project }: { project: Project }) {
  const router = useRouter();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const { data: members = [] } = useMembers();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function update(input: Parameters<typeof updateProject.mutate>[0]["input"]) {
    updateProject.mutate(
      { id: project.id, input },
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
            aria-label={`Actions for ${project.name}`}
            className="text-muted-foreground data-[state=open]:bg-accent"
          >
            <Ellipsis aria-hidden />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onSelect={() => router.push(`/projects/${project.id}`)}>
            <Eye aria-hidden />
            Open project
          </DropdownMenuItem>
          <DropdownMenuSeparator />

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
                  checked={project.priority === priority}
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
              Lead
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="max-h-72 w-52 overflow-y-auto">
              <DropdownMenuLabel>Lead</DropdownMenuLabel>
              <DropdownMenuCheckItem
                checked={project.leadId === null}
                onSelect={() => update({ leadId: null })}
              >
                No lead
              </DropdownMenuCheckItem>
              {members.map((member) => (
                <DropdownMenuCheckItem
                  key={member.id}
                  checked={project.leadId === member.id}
                  onSelect={() => update({ leadId: member.id })}
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
                selected={project.dueDate ? new Date(project.dueDate + "T00:00:00") : undefined}
                defaultMonth={project.dueDate ? new Date(project.dueDate + "T00:00:00") : undefined}
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
        title="Delete project?"
        description={`"${project.name}" and all of its tasks will be permanently deleted.`}
        pending={deleteProject.isPending}
        onConfirm={() =>
          deleteProject.mutate(project.id, {
            onSuccess: () => {
              setConfirmOpen(false);
              toast.success("Project deleted");
            },
            onError: (error) => toast.error(error.message),
          })
        }
      />
    </>
  );
}
