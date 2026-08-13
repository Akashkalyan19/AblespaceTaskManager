"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Month calendar styled to match the Figma date picker:
 * "January 2026" header with chevrons, Su–Sa row, selected day as a solid
 * primary circle.
 */
function Calendar({
  className,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col",
        month: "space-y-3",
        month_caption: "flex justify-center items-center h-8 relative",
        caption_label: "text-sm font-semibold",
        nav: "absolute inset-x-3 top-3 z-10 flex items-center justify-between",
        button_previous:
          "size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
        button_next:
          "size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors",
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-foreground w-8 h-8 text-xs font-normal flex items-center justify-center",
        week: "flex mt-0.5",
        day: "size-8 p-0 text-center text-sm relative",
        day_button:
          "size-8 rounded-full inline-flex items-center justify-center font-normal hover:bg-accent transition-colors aria-selected:opacity-100",
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary",
        today: "[&>button]:font-semibold",
        outside: "text-muted-foreground/50",
        disabled: "text-muted-foreground/40",
        hidden: "invisible",
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };
