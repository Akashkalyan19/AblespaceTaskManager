"use client";

import { Columns3, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ViewMode, VisibleFields } from "./view-preferences";

const FIELD_ROWS: { key: keyof VisibleFields; label: string }[] = [
  { key: "priority", label: "Priority" },
  { key: "members", label: "Members" },
  { key: "dueDate", label: "Due Date" },
  { key: "labels", label: "Labels" },
  { key: "status", label: "Status" },
  { key: "reporter", label: "Reporter" },
];

/**
 * "Fields" dropdown from the design: a List/Board switch at the top and
 * per-field visibility toggles below.
 */
export function FieldsMenu({
  viewMode,
  onViewModeChange,
  fields,
  onToggleField,
}: {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  fields: VisibleFields;
  onToggleField: (field: keyof VisibleFields) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Columns3 aria-hidden />
          Fields
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-3">
        <Tabs
          value={viewMode}
          onValueChange={(value) => onViewModeChange(value as ViewMode)}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">
              <List aria-hidden />
              List
            </TabsTrigger>
            <TabsTrigger value="board">
              <LayoutGrid aria-hidden />
              Board
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-3 flex flex-col">
          {FIELD_ROWS.map((row) => (
            <label
              key={row.key}
              className="flex cursor-pointer items-center justify-between rounded-md px-1 py-2 text-sm hover:bg-accent/50"
            >
              {row.label}
              <Checkbox
                checked={fields[row.key]}
                onCheckedChange={() => onToggleField(row.key)}
                aria-label={`Toggle ${row.label}`}
              />
            </label>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
