"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2",
        "text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
        "transition-colors"
      )}
      aria-label="Cambiar tema"
    >
      <Sun className="size-4 shrink-0 dark:hidden" />
      <Moon className="size-4 shrink-0 hidden dark:block" />
      <span className="dark:hidden">Modo oscuro</span>
      <span className="hidden dark:block">Modo claro</span>
    </button>
  )
}
