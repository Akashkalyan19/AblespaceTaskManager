import { Pyramid } from "lucide-react";
import { cn } from "@/lib/utils";

/** "Pyramid" logo: dark rounded square with a white pyramid glyph. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-6 items-center justify-center rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900",
        className,
      )}
    >
      <Pyramid className="size-4" aria-hidden />
    </span>
  );
}

export function BrandLogo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <BrandMark />
      <span className="text-sm font-semibold">Pyramid</span>
    </span>
  );
}
