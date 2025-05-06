"use client";

import { Icons } from "@/components/icons";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  return (
    <header className="fixed w-full top-0 left-0 right-0 z-40 border-b bg-background safari-fixed-header">
      <div className="mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.dollarSign className="h-6 w-6" />
          <h1 className="font-semibold text-xl">Expense Tracker</h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
