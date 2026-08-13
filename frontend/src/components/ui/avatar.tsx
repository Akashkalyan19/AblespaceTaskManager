import * as React from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import type { User } from "@/lib/types";

/**
 * Initials avatar tinted with the user's stored color. The design uses
 * photographic avatars; generated initials keep the app self-contained
 * (documented as an intentional deviation).
 */
function UserAvatar({
  user,
  size = 24,
  className,
}: {
  user: Pick<User, "name" | "avatarColor">;
  size?: number;
  className?: string;
}) {
  const showSingleLetter = size < 22;
  return (
    <span
      role="img"
      aria-label={user.name}
      title={user.name}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-medium text-white",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(9, Math.round(size * 0.42)),
        background: `linear-gradient(135deg, ${user.avatarColor}, color-mix(in oklab, ${user.avatarColor} 60%, #000))`,
      }}
    >
      {showSingleLetter ? initials(user.name).slice(0, 1) : initials(user.name)}
    </span>
  );
}

export { UserAvatar };
