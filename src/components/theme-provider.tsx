"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

function applyTheme(theme: Theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  try {
    localStorage.setItem("theme", theme);
  } catch {}
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") as Theme | null;
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
        applyTheme(stored);
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const resolved: Theme = prefersDark ? "dark" : "light";
        setTheme(resolved);
        applyTheme(resolved);
      }
    } catch {
      setTheme("dark");
      applyTheme("dark");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : "dark";

    if (!document.startViewTransition) {
      setTheme(next);
      applyTheme(next);
      return;
    }

    const transition = document.startViewTransition(() => {
      setTheme(next);
      applyTheme(next);
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: ["inset(0 0 100% 0)", "inset(0)"] },
        {
          pseudoElement: "::view-transition-new(root)",
          duration: 600,
          easing: "ease-in-out",
        },
      );
    });
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
