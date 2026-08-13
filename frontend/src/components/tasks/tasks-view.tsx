"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/states";
import { SearchInput } from "./search-input";
import { FieldsMenu } from "./fields-menu";
import { FilterMenu } from "./filter-menu";
import { TaskList } from "./task-list";
import { TaskBoard } from "./task-board";
import { AddTaskDialog } from "./add-task-dialog";
import { useViewPreferences } from "./view-preferences";
import { useTasks, type TaskFilters } from "@/lib/queries";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import type { Priority } from "@/lib/types";

/**
 * The complete Tasks screen (toolbar + list/board), reused by the main
 * Tasks page and the project detail page (which passes a projectId).
 */
export function TasksView({
  title = "Tasks",
  projectId,
}: {
  title?: string;
  projectId?: string;
}) {
  const { viewMode, setViewMode, fields, toggleField, hydrated } =
    useViewPreferences();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 250);
  const [priorityFilter, setPriorityFilter] = useState<Priority[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  const filters: TaskFilters = useMemo(
    () => ({
      ...(projectId ? { projectId } : {}),
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
    }),
    [projectId, debouncedSearch],
  );

  const { data: tasks, isPending, isError, error, refetch } = useTasks(filters);

  const visibleTasks = useMemo(() => {
    if (!tasks) return [];
    if (priorityFilter.length === 0) return tasks;
    return tasks.filter((task) => priorityFilter.includes(task.priority));
  }, [tasks, priorityFilter]);

  const searching = debouncedSearch.trim().length > 0 || priorityFilter.length > 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
          <SearchInput value={search} onChange={setSearch} />
          <FieldsMenu
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            fields={fields}
            onToggleField={toggleField}
          />
          <FilterMenu selected={priorityFilter} onChange={setPriorityFilter} />
          <Button onClick={() => setAddOpen(true)}>
            <Plus aria-hidden />
            Add Task
          </Button>
        </div>
      </div>

      {isPending || !hydrated ? (
        <div className="flex flex-col gap-7">
          <TableSkeleton />
          <TableSkeleton />
        </div>
      ) : isError ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : visibleTasks.length === 0 && searching ? (
        <EmptyState
          title="No matching tasks"
          description="Try a different search term or clear the filters."
        />
      ) : viewMode === "list" ? (
        <TaskList tasks={visibleTasks} fields={fields} projectId={projectId} />
      ) : (
        <TaskBoard
          tasks={visibleTasks}
          fields={fields}
          filters={filters}
          projectId={projectId}
        />
      )}

      <AddTaskDialog open={addOpen} onOpenChange={setAddOpen} projectId={projectId} />
    </div>
  );
}
