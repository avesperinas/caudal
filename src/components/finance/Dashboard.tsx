"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { TrendingUp, TrendingDown, Minus, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { tx } from "@/lib/styles"

// ─── Periodos compartidos ────────────────────────────────────────────────────

export type Period = "6m" | "1a" | "3a" | "todo"

export const PERIODS: { value: Period; label: string }[] = [
  { value: "6m",   label: "6M" },
  { value: "1a",   label: "1A" },
  { value: "3a",   label: "3A" },
  { value: "todo", label: "Todo" },
]

export function PeriodTabs({
  value, onChange,
}: { value: Period; onChange: (v: Period) => void }) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      {PERIODS.map(({ value: v, label }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:px-2.5 sm:py-1",
            value === v
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── Chip filtro (toggle) ────────────────────────────────────────────────────

export function FilterChip({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs transition-colors sm:py-1",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-muted/40 text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  )
}

// ─── Multi-select filter ──────────────────────────────────────────────────────

export function MultiSelectFilter({
  placeholder, options, selected, onChange,
}: {
  placeholder: string
  options: { value: string; label: string }[]
  selected: Set<string>
  onChange: (v: Set<string>) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [])

  const noneSelected = selected.size === 0
  const label = noneSelected
    ? placeholder
    : selected.size === 1
    ? (options.find((o) => selected.has(o.value))?.label ?? placeholder)
    : `${selected.size} seleccionados`

  function toggle(v: string) {
    const next = new Set(selected)
    if (next.has(v)) next.delete(v)
    else next.add(v)
    onChange(next)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-ring sm:text-sm",
          noneSelected ? "border-input" : "border-primary bg-primary/5 text-primary",
        )}
      >
        <span className="max-w-[140px] truncate">{label}</span>
        <ChevronDown className="size-3 shrink-0 opacity-60" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 max-h-60 min-w-[180px] overflow-y-auto rounded-lg border border-border bg-popover py-1 shadow-md">
          <button
            type="button"
            onClick={() => onChange(new Set())}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/60",
              noneSelected && "font-medium",
            )}
          >
            <span className={cn(
              "flex size-3.5 shrink-0 items-center justify-center rounded border",
              noneSelected ? "border-primary bg-primary" : "border-border",
            )}>
              {noneSelected && <Check className="size-2.5 text-primary-foreground" />}
            </span>
            Todos
          </button>
          {options.map((o) => {
            const checked = selected.has(o.value)
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => toggle(o.value)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted/60"
              >
                <span className={cn(
                  "flex size-3.5 shrink-0 items-center justify-center rounded border",
                  checked ? "border-primary bg-primary" : "border-border",
                )}>
                  {checked && <Check className="size-2.5 text-primary-foreground" />}
                </span>
                <span className="truncate">{o.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── KPI Card ────────────────────────────────────────────────────────────────

type Trend = "up" | "down" | "flat"

export function KpiCard({
  label, value, sub, trend, accent,
}: {
  label: string
  value: string
  sub?: string
  trend?: Trend
  /** Color del valor principal */
  accent?: "default" | "positive" | "negative"
}) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className={tx.caption}>{label}</p>
      <p className={cn(
        "mt-1 truncate text-lg font-semibold tabular-nums tracking-tight",
        accent === "positive" && "text-emerald-600 dark:text-emerald-400",
        accent === "negative" && "text-rose-600 dark:text-rose-400",
      )}>
        {value}
      </p>
      {sub && (
        <div className={cn(
          "mt-0.5 flex items-center gap-1 text-xs tabular-nums",
          trend === "up"   && "text-emerald-600 dark:text-emerald-400",
          trend === "down" && "text-rose-600 dark:text-rose-400",
          (!trend || trend === "flat") && "text-muted-foreground",
        )}>
          {trend && <TrendIcon className="size-3" />}
          {sub}
        </div>
      )}
    </div>
  )
}

// ─── Bloque de dashboard (card con título y contenido) ──────────────────────

export function DashboardBlock({
  title, action, children, className,
}: {
  title?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4", className)}>
      {(title || action) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title && <p className={tx.label}>{title}</p>}
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

// ─── Tooltip estándar para charts ────────────────────────────────────────────

export function ChartTooltipBox({
  label, rows,
}: {
  label?: string
  rows: { label: string; value: string; color?: string; emphasis?: boolean }[]
}) {
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md text-xs">
      {label && <p className="mb-1 text-muted-foreground capitalize">{label}</p>}
      <div className="space-y-0.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            {r.color && <span className="size-2 rounded-full" style={{ backgroundColor: r.color }} />}
            <span className="text-muted-foreground">{r.label}:</span>
            <span className={cn("font-medium tabular-nums", r.emphasis && "font-semibold")}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Constantes de chart ─────────────────────────────────────────────────────

export const CHART_TICK = "#94a3b8"
export const CHART_GRID = "#e2e8f0"

export const CHART_COLORS = {
  income:    "#10b981",
  expense:   "#ef4444",
  savings:   "#6366f1",
  invested:  "#f59e0b",
  value:     "#6366f1",
  cost:      "#f59e0b",
  primary:   "#6366f1",
  secondary: "#94a3b8",
} as const

