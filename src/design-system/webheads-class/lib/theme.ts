import { useCallback, useEffect, useState } from "react";

/** Palette variants shipped with the design system. */
export const JC_THEMES = ["light", "dark", "contrast"] as const;

export type JcTheme = (typeof JC_THEMES)[number];

export const JC_THEME_LABELS: Record<JcTheme, string> = {
  light: "라이트",
  dark: "다크",
  contrast: "고대비",
};

const STORAGE_KEY = "jc-theme";

/** Writes the theme onto an element (defaults to <html>). "light" clears the attribute. */
export function applyTheme(theme: JcTheme, element?: HTMLElement | null) {
  const target = element ?? (typeof document === "undefined" ? null : document.documentElement);
  if (!target) return;
  if (theme === "light") target.removeAttribute("data-jc-theme");
  else target.setAttribute("data-jc-theme", theme);
}

function isTheme(value: unknown): value is JcTheme {
  return typeof value === "string" && (JC_THEMES as readonly string[]).includes(value);
}

/**
 * Theme state for the whole document, persisted to localStorage.
 * Starts on "light" during SSR/hydration and syncs after mount.
 */
export function useTheme(defaultTheme: JcTheme = "light") {
  const [theme, setThemeState] = useState<JcTheme>(defaultTheme);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    const initial = isTheme(stored) ? stored : defaultTheme;
    setThemeState(initial);
    applyTheme(initial);
  }, [defaultTheme]);

  const setTheme = useCallback((next: JcTheme) => {
    setThemeState(next);
    applyTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  }, []);

  return { theme, setTheme, themes: JC_THEMES } as const;
}
