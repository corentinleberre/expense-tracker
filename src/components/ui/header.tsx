"use client";

import { Icons } from "@/components/icons";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.dollarSign className="h-6 w-6" />
          <h1 className="font-semibold text-xl">Expense Tracker</h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
