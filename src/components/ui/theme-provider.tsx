"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Initialize theme on client-side
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined") {
      // Access localStorage only in browser environment
      const savedTheme = localStorage.getItem(storageKey) as Theme;
      const preferredTheme = savedTheme || defaultTheme;
      setTheme(preferredTheme);
      setMounted(true);
    }
  }, [defaultTheme, storageKey]);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;

    if (disableTransitionOnChange) {
      root.classList.add("no-transitions");

      // Force a reflow
      window.getComputedStyle(root).getPropertyValue("opacity");
    }

    root.classList.remove("light", "dark");

    if (theme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    if (disableTransitionOnChange) {
      // Remove the class in the next frame
      setTimeout(() => {
        root.classList.remove("no-transitions");
      }, 0);
    }
  }, [theme, enableSystem, disableTransitionOnChange, mounted]);

  // Handle system theme changes
  useEffect(() => {
    if (!mounted || !enableSystem) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const onSystemThemeChange = () => {
      if (theme === "system") {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(mediaQuery.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", onSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", onSystemThemeChange);
    };
  }, [theme, enableSystem, mounted]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      // Only access localStorage in browser environment
      if (typeof window !== "undefined") {
        localStorage.setItem(storageKey, theme);
      }
      setTheme(theme);
    },
  };

  // Prevents theme flashing on first load
  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
