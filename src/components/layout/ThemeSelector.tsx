"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"
import { tx } from "@/lib/styles"

const options = [
  { value: "light",  label: "Claro",   icon: Sun },
  { value: "system", label: "Sistema", icon: Monitor },
  { value: "dark",   label: "Oscuro",  icon: Moon },
] as const

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-2">
      <p className={tx.label}>Tema</p>
      <div className="flex gap-2">
        {options.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex flex-1 flex-col items-center gap-2 rounded-lg border px-4 py-3 text-sm transition-colors",
              theme === value
                ? "border-primary bg-primary/5 text-primary font-medium"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
