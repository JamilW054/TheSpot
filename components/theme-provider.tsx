"use client";

import { createContext, useContext, useMemo } from "react";

export type Theme = "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (value: Theme) => void;
  resolvedDark: true;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const value = useMemo<ThemeContextValue>(
    () => ({ theme: "dark", setTheme: () => {}, resolvedDark: true }),
    [],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
