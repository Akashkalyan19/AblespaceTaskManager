"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/avatar";
import { timeAgo } from "@/lib/format";
import { useActivity, useMe } from "@/lib/queries";

/** "Updates" card: the task's activity feed (newest first). */
export function UpdatesCard({ taskId }: { taskId: string }) {
  const { data: activities, isPending } = useActivity(taskId);
  const { data: me } = useMe();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="rounded-xl border bg-card p-4" aria-label="Updates">
      <button
        type="button"
        onClick={() => setCollapsed((value) => !value)}
        aria-expanded={!collapsed}
        className="flex items-center gap-1.5 text-sm font-semibold"
      >
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            collapsed && "-rotate-90",
          )}
          aria-hidden
        />
        Updates
      </button>

      {!collapsed && (
        <ul className="mt-3 flex flex-col gap-3">
          {isPending && (
            <>
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </>
          )}
          {(activities ?? []).map((activity) => {
            const isMe = activity.actorId === me?.id;
            return (
              <li key={activity.id} className="flex items-start gap-2.5">
                {activity.actor ? (
                  <UserAvatar user={activity.actor} size={24} />
                ) : (
                  <span className="size-6 rounded-full bg-muted" aria-hidden />
                )}
                <div className="min-w-0 text-sm leading-snug">
                  <span className="font-semibold">
                    {isMe ? "You" : (activity.actor?.name ?? "Someone")}
                  </span>{" "}
                  <span className="text-muted-foreground">
                    {activity.message} · {timeAgo(activity.createdAt)}
                  </span>
                </div>
              </li>
            );
          })}
          {!isPending && (activities ?? []).length === 0 && (
            <li className="text-sm text-muted-foreground">No updates yet.</li>
          )}
        </ul>
      )}
    </section>
  );
}
