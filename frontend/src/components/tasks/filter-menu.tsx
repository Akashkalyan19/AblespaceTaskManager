"use client";

import { Funnel } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PriorityIcon } from "./priority";
import { cn } from "@/lib/utils";
import { PRIORITIES, PRIORITY_LABELS, type Priority } from "@/lib/types";

/** Filter button: narrows the visible tasks by priority (client-side). */
export function FilterMenu({
  selected,
  onChange,
}: {
  selected: Priority[];
  onChange: (priorities: Priority[]) => void;
}) {
  function toggle(priority: Priority) {
    onChange(
      selected.includes(priority)
        ? selected.filter((p) => p !== priority)
        : [...selected, priority],
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Filter by priority"
          className={cn(selected.length > 0 && "border-ring text-primary")}
        >
          <Funnel aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Filter by priority</DropdownMenuLabel>
        {PRIORITIES.map((priority) => (
          <DropdownMenuCheckItem
            key={priority}
            checked={selected.includes(priority)}
            onSelect={(event) => {
              event.preventDefault(); // keep the menu open while toggling
              toggle(priority);
            }}
          >
            <PriorityIcon priority={priority} />
            {PRIORITY_LABELS[priority]}
          </DropdownMenuCheckItem>
        ))}
        {selected.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onChange([])}>
              Clear filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
