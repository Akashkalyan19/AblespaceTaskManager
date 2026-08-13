"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/states";
import { SearchInput } from "@/components/tasks/search-input";
import { FilterMenu } from "@/components/tasks/filter-menu";
import { ProjectsTable } from "@/components/projects/projects-table";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";
import { useProjects } from "@/lib/queries";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import type { Priority } from "@/lib/types";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  const { data: projects, isPending, isError, error, refetch } = useProjects(
    debouncedSearch.trim() || undefined,
  );

  const visibleProjects = useMemo(() => {
    if (!projects) return [];
    if (priorityFilter.length === 0) return projects;
    return projects.filter((project) => priorityFilter.includes(project.priority));
  }, [projects, priorityFilter]);

  const filtering = debouncedSearch.trim().length > 0 || priorityFilter.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Search projects…" />
          <FilterMenu selected={priorityFilter} onChange={setPriorityFilter} />
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden />
            Add Project
          </Button>
        </div>
      </div>

      {isPending ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : visibleProjects.length === 0 && filtering ? (
        <EmptyState
          title="No matching projects"
          description="Try a different search term or clear the filters."
        />
      ) : (
        <ProjectsTable projects={visibleProjects} onAdd={() => setAddOpen(true)} />
      )}

      <AddProjectDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
