/** Date helpers for the "29 Jul" chips and "12 Sep 2026" table cells. */

export function formatShortDate(isoDate: string): string {
  return new Date(isoDate + "T00:00:00").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export function formatLongDate(isoDate: string): string {
  return new Date(isoDate + "T00:00:00").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function isOverdue(isoDate: string): boolean {
  const due = new Date(isoDate + "T23:59:59");
  return due.getTime() < Date.now();
}

/** "Casey Nguyen" -> "CN" for avatar fallbacks. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/** Relative timestamp for comments ("just now", "5m ago", ...). */
export function timeAgo(isoDateTime: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDateTime).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatLongDate(isoDateTime.slice(0, 10));
}
