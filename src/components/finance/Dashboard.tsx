"use client"

import { useMemo } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { ProductType } from "@prisma/client"
import { cn } from "@/lib/utils"
import { tx } from "@/lib/styles"
import { PRODUCT_TYPE_LABELS } from "@/lib/products"

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

// ─── Filtro Producto / Categoría ─────────────────────────────────────────────

export type ProductFilter = "__all__" | `cat:${string}` | `prod:${string}`

type FilterableProduct = {
  id: string
  name: string
  type: string
  entity: { name: string }
}

export function ProductCategoryFilter<P extends FilterableProduct>({
  value, onChange, products,
}: {
  value: ProductFilter
  onChange: (v: ProductFilter) => void
  products: P[]
}) {
  const types = useMemo(() => {
    const set = new Set<string>()
    for (const p of products) set.add(p.type)
    return Array.from(set).sort((a, b) => {
      const la = PRODUCT_TYPE_LABELS[a as ProductType] ?? a
      const lb = PRODUCT_TYPE_LABELS[b as ProductType] ?? b
      return la.localeCompare(lb)
    })
  }, [products])

  const sortedProducts = useMemo(() => [...products].sort((a, b) =>
    a.entity.name.localeCompare(b.entity.name) || a.name.localeCompare(b.name),
  ), [products])

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ProductFilter)}
      className="min-w-0 max-w-full truncate rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-ring sm:text-sm"
      aria-label="Filtrar por producto o categoría"
    >
      <option value="__all__">Todos los productos</option>
      {types.length > 0 && (
        <optgroup label="Categorías">
          {types.map((t) => (
            <option key={`cat:${t}`} value={`cat:${t}`}>
              {PRODUCT_TYPE_LABELS[t as ProductType] ?? t}
            </option>
          ))}
        </optgroup>
      )}
      {sortedProducts.length > 0 && (
        <optgroup label="Productos">
          {sortedProducts.map((p) => (
            <option key={`prod:${p.id}`} value={`prod:${p.id}`}>
              {p.entity.name} · {p.name}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  )
}

export function applyProductFilter<P extends { id: string; type: string }>(
  items: P[],
  filter: ProductFilter,
): P[] {
  if (filter === "__all__") return items
  if (filter.startsWith("cat:")) {
    const t = filter.slice(4)
    return items.filter((p) => p.type === t)
  }
  if (filter.startsWith("prod:")) {
    const id = filter.slice(5)
    return items.filter((p) => p.id === id)
  }
  return items
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
