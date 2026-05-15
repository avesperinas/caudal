"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

const TABS = [
  { label: "Gastos compartidos", href: "/registro/gastos",   match: "/registro/gastos" },
  { label: "Personal",           href: "/registro/personal", match: "/registro/personal" },
]

export default function RegistroLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border bg-background px-4 md:px-6">
        <nav className="flex gap-1 overflow-x-auto">
          {TABS.map(tab => {
            const active = pathname.startsWith(tab.match)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
