"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Only show the toggle after mounting to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-[70px] h-[36px]" aria-hidden="true" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`
        relative inline-flex h-[36px] w-[70px] shrink-0 cursor-pointer rounded-full border-2 
        transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
        ${
          isDark
            ? "border-slate-700 bg-slate-800"
            : "border-slate-300 bg-slate-200"
        }
      `}
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>

      {/* Track icons */}
      <span className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Sun
          className={`h-5 w-5 text-amber-500 transition-opacity ${
            isDark ? "opacity-40" : "opacity-100"
          }`}
        />
        <Moon
          className={`h-5 w-5 text-blue-300 transition-opacity ${
            isDark ? "opacity-100" : "opacity-40"
          }`}
        />
      </span>

      {/* Toggle knob */}
      <span
        className={`
          pointer-events-none absolute top-[2px] left-[2px] flex h-[28px] w-[28px] items-center justify-center rounded-full 
          shadow-lg ring-0 transition-transform duration-300 ease-in-out
          ${
            isDark
              ? "translate-x-[34px] bg-slate-900 border border-slate-700"
              : "translate-x-0 bg-white border border-slate-200"
          }
        `}
      >
        {/* Small icon in the toggle button */}
        <span
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
            isDark ? "opacity-0" : "opacity-100"
          }`}
        >
          <Sun className="h-3.5 w-3.5 text-amber-500" />
        </span>
        <span
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
            isDark ? "opacity-100" : "opacity-0"
          }`}
        >
          <Moon className="h-3.5 w-3.5 text-blue-300" />
        </span>
      </span>
    </button>
  );
}
