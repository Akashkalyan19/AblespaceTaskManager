"use client";

import { useEffect, useState } from "react";

/**
 * View preferences for the Tasks screens: list vs board, and which fields
 * are visible ("Fields" dropdown). Each view keeps its own field set, with
 * defaults matching the design (list shows priority/members/due date;
 * board cards show members/due date/labels). Persisted to localStorage.
 */

export type ViewMode = "list" | "board";

export interface VisibleFields {
  priority: boolean;
  members: boolean;
  dueDate: boolean;
  labels: boolean;
  status: boolean;
  reporter: boolean;
}

const DEFAULT_FIELDS: Record<ViewMode, VisibleFields> = {
  list: {
    priority: true,
    members: true,
    dueDate: true,
    labels: false,
    status: false,
    reporter: false,
  },
  board: {
    priority: false,
    members: true,
    dueDate: true,
    labels: true,
    status: false,
    reporter: false,
  },
};

const VIEW_KEY = "taskms_view_mode";
const FIELDS_KEY = "taskms_visible_fields";

type FieldsByView = Record<ViewMode, VisibleFields>;

export function useViewPreferences() {
  const [viewMode, setViewModeState] = useState<ViewMode>("list");
  const [fieldsByView, setFieldsByView] = useState<FieldsByView>(DEFAULT_FIELDS);
  // Avoid hydration mismatches: read storage only after mount.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedView = window.localStorage.getItem(VIEW_KEY);
    if (storedView === "list" || storedView === "board") {
      setViewModeState(storedView);
    }
    try {
      const stored = window.localStorage.getItem(FIELDS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<FieldsByView>;
        setFieldsByView({
          list: { ...DEFAULT_FIELDS.list, ...parsed.list },
          board: { ...DEFAULT_FIELDS.board, ...parsed.board },
        });
      }
    } catch {
      // corrupted storage — fall back to defaults
    }
    setHydrated(true);
  }, []);

  function setViewMode(mode: ViewMode) {
    setViewModeState(mode);
    window.localStorage.setItem(VIEW_KEY, mode);
  }

  function toggleField(field: keyof VisibleFields) {
    setFieldsByView((previous) => {
      const next: FieldsByView = {
        ...previous,
        [viewMode]: {
          ...previous[viewMode],
          [field]: !previous[viewMode][field],
        },
      };
      window.localStorage.setItem(FIELDS_KEY, JSON.stringify(next));
      return next;
    });
  }

  return {
    viewMode,
    setViewMode,
    fields: fieldsByView[viewMode],
    toggleField,
    hydrated,
  };
}
