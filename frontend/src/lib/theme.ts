import type { AccentColor, ThemeMode } from "./types";

export const THEME_KEY = "taskms_theme";
export const ACCENT_KEY = "taskms_accent";

/**
 * Theme state lives on <html> (class "dark" + data-accent attribute) and is
 * persisted in localStorage. An inline script in the root layout applies the
 * stored values before first paint so there is no flash of the wrong theme.
 */

export function getTheme(): ThemeMode {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function setTheme(mode: ThemeMode): void {
  document.documentElement.classList.toggle("dark", mode === "dark");
  window.localStorage.setItem(THEME_KEY, mode);
}

export function getAccent(): AccentColor {
  if (typeof document === "undefined") return "black";
  return (document.documentElement.dataset.accent as AccentColor) || "black";
}

export function setAccent(accent: AccentColor): void {
  if (accent === "black") {
    delete document.documentElement.dataset.accent;
  } else {
    document.documentElement.dataset.accent = accent;
  }
  window.localStorage.setItem(ACCENT_KEY, accent);
}

/** Runs before hydration via <script dangerouslySetInnerHTML>. */
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var theme = localStorage.getItem("${THEME_KEY}");
    if (theme === "dark") document.documentElement.classList.add("dark");
    var accent = localStorage.getItem("${ACCENT_KEY}");
    if (accent && accent !== "black") document.documentElement.dataset.accent = accent;
  } catch (e) {}
})();
`;
