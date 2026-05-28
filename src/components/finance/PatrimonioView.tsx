"use client"

import { useMemo, useState, useTransition } from "react"
import {
  Pencil, Trash2, TrendingUp, Loader2, Table2,
} from "lucide-react"
import Link from "next/link"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts"

type TooltipPayloadItem = { value: number; name?: string; dataKey?: string; color?: string }
type TooltipBoxProps = { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }
import { ProductType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EntityIcon } from "@/components/finance/EntityIcon"
import {
  KpiCard, PeriodTabs, Period, DashboardBlock,
  ChartTooltipBox, CHART_TICK, CHART_GRID, CHART_COLORS,
  MultiSelectFilter,
} from "@/components/finance/Dashboard"
import { deleteSnapshotDate } from "@/app/(dashboard)/patrimonio/actions"
import { toDateInput, PRODUCT_TYPE_LABELS } from "@/lib/products"
import { tx } from "@/lib/styles"
import { cn } from "@/lib/utils"
import { formatAmountAbs, formatAmount, formatPct, formatPctSigned, formatNumber } from "@/lib/format"

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Product = {
  id: string
  name: string
  type: ProductType
  ownership: number
  entity: { id: string; name: string; color: string; icon: string | null }
}

type SnapshotRow = {
  productId: string
  value: number
  date: Date
  product: {
    id: string
    name: string
    ownership: number
    entity: { name: string; color: string; icon: string | null }
  }
}

type MonthPoint = {
  label: string
  date: string
  total: number
  byProduct: Record<string, number>
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const TYPE_COLORS: Partial<Record<ProductType, string>> = {
  CHECKING:    "#64748b",
  SAVINGS:     "#22c55e",
  FUND:        "#6366f1",
  PENSION:     "#8b5cf6",
  ETF:         "#3b82f6",
  REAL_ESTATE: "#f59e0b",
  CRYPTO:      "#f97316",
  OTHER:       "#94a3b8",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildTimeline(snapshots: SnapshotRow[], products: Product[]): MonthPoint[] {
  const byDate: Record<string, Record<string, number>> = {}
  for (const s of snapshots) {
    const key = toDateInput(new Date(s.date))
    if (!byDate[key]) byDate[key] = {}
    byDate[key][s.productId] = s.value
  }

  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateStr, byProduct]) => {
      const total = products.reduce((acc, p) => {
        const v = byProduct[p.id] ?? 0
        return acc + v * (p.ownership / 100)
      }, 0)
      const label = new Date(dateStr).toLocaleDateString("es-ES", {
        month: "short", year: "numeric", timeZone: "UTC",
      })
      return { label, date: dateStr, total, byProduct }
    })
}

function filterByPeriod(timeline: MonthPoint[], period: Period): MonthPoint[] {
  if (period === "todo") return timeline
  const n = period === "6m" ? 6 : period === "1a" ? 12 : 36
  return timeline.slice(-n)
}

function findYearAgo(timeline: MonthPoint[], last: MonthPoint): MonthPoint | null {
  const lastMs = new Date(last.date).getTime()
  const targetMs = lastMs - 365 * 24 * 60 * 60 * 1000

  const candidates = timeline.filter((p) => p.date !== last.date)
  if (!candidates.length) return null

  const closest = candidates.reduce((best, p) => {
    const d = Math.abs(new Date(p.date).getTime() - targetMs)
    const bd = Math.abs(new Date(best.date).getTime() - targetMs)
    return d < bd ? p : best
  })

  const monthsAgo = (lastMs - new Date(closest.date).getTime()) / (1000 * 60 * 60 * 24 * 30)
  return monthsAgo >= 10 ? closest : null
}

const formatEur = formatAmountAbs
const signedEur = formatAmount
const signedPct = (v: number) => formatPctSigned(v, 1)

// ─── Distribución ─────────────────────────────────────────────────────────────

type DistItem = {
  key: string
  label: string
  color: string
  icon?: string | null
  total: number
  pct: number
}

function buildEntityDist(point: MonthPoint, products: Product[]): DistItem[] {
  const map = new Map<string, DistItem>()
  for (const p of products) {
    const val = point.byProduct[p.id]
    if (val === undefined) continue
    const prorated = val * (p.ownership / 100)
    if (!map.has(p.entity.name)) {
      map.set(p.entity.name, {
        key: p.entity.name, label: p.entity.name,
        color: p.entity.color, icon: p.entity.icon, total: 0, pct: 0,
      })
    }
    map.get(p.entity.name)!.total += prorated
  }
  const items = Array.from(map.values()).sort((a, b) => b.total - a.total)
  const sum = items.reduce((s, i) => s + i.total, 0)
  return items.map((i) => ({ ...i, pct: sum > 0 ? (i.total / sum) * 100 : 0 }))
}

function buildTypeDist(point: MonthPoint, products: Product[]): DistItem[] {
  const map = new Map<string, DistItem>()
  for (const p of products) {
    const val = point.byProduct[p.id]
    if (val === undefined) continue
    const prorated = val * (p.ownership / 100)
    if (!map.has(p.type)) {
      map.set(p.type, {
        key: p.type,
        label: PRODUCT_TYPE_LABELS[p.type],
        color: TYPE_COLORS[p.type] ?? "#94a3b8",
        total: 0, pct: 0,
      })
    }
    map.get(p.type)!.total += prorated
  }
  const items = Array.from(map.values()).sort((a, b) => b.total - a.total)
  const sum = items.reduce((s, i) => s + i.total, 0)
  return items.map((i) => ({ ...i, pct: sum > 0 ? (i.total / sum) * 100 : 0 }))
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function PatrimonioTooltip({ active, payload, label }: TooltipBoxProps) {
  if (!active || !payload?.length) return null
  return (
    <ChartTooltipBox
      label={label}
      rows={[{ label: "Patrimonio", value: formatEur(Number(payload[0].value)), emphasis: true }]}
    />
  )
}

function DistributionBlock({
  lastPoint, products,
}: {
  lastPoint: MonthPoint
  products: Product[]
}) {
  const [view, setView] = useState<"entity" | "type">("type")
  const items = view === "entity" ? buildEntityDist(lastPoint, products) : buildTypeDist(lastPoint, products)

  return (
    <DashboardBlock
      title="Distribución actual"
      action={
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(["type", "entity"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:px-2.5 sm:py-1",
                view === v ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}>
              {v === "entity" ? "Entidad" : "Tipo"}
            </button>
          ))}
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex shrink-0 items-center justify-center sm:w-36">
          <PieChart width={120} height={120}>
            <Pie data={items} cx={60} cy={60} innerRadius={36} outerRadius={56} dataKey="total" strokeWidth={0}>
              {items.map((it, i) => <Cell key={i} fill={it.color} />)}
            </Pie>
          </PieChart>
        </div>

        <div className="flex-1 space-y-3">
          {items.map((it) => (
            <div key={it.key}>
              <div className="mb-1 flex items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: it.color }} />
                <span className="min-w-0 flex-1 truncate text-sm">{it.label}</span>
                <span className={cn(tx.caption, "shrink-0")}>{formatPct(it.pct)}</span>
                <span className="shrink-0 text-sm font-medium tabular-nums">{formatEur(it.total)}</span>
              </div>
              <div className="ml-[18px] h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full" style={{ width: `${it.pct}%`, backgroundColor: it.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardBlock>
  )
}

function HistoryDialog({
  timeline, products, isPending, deletingDate, onDelete,
}: {
  timeline: MonthPoint[]
  products: Product[]
  isPending: boolean
  deletingDate: string | null
  onDelete: (date: string) => void
}) {
  const [open, setOpen] = useState(false)
  const rows = [...timeline].reverse()

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Table2 className="size-3.5" />
        Ver historial
      </Button>
      <Dialog open={open} onOpenChange={(o) => { if (!o) setOpen(false) }}>
        <DialogContent className="max-w-3xl w-full p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b border-border px-4 py-3">
            <DialogTitle>Historial ({timeline.length})</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto divide-y divide-border">
            {rows.map((point) => {
              const isDeleting = isPending && deletingDate === point.date
              const activeProducts = products.filter((p) => point.byProduct[p.id] !== undefined)
              return (
                <div key={point.date} className="group flex items-start gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium capitalize">{point.label}</p>
                      <p className="text-sm font-semibold tabular-nums">{formatEur(point.total)}</p>
                    </div>
                    <div className="mt-2 space-y-1">
                      {activeProducts.map((p) => {
                        const raw = point.byProduct[p.id]
                        const prorated = raw * (p.ownership / 100)
                        return (
                          <div key={p.id} className="flex items-center gap-2">
                            <EntityIcon iconName={p.entity.icon} color={p.entity.color} size="sm"
                              className="!size-5 !rounded-md" />
                            <span className="flex-1 truncate text-xs text-muted-foreground">{p.name}</span>
                            <span className="text-xs tabular-nums text-muted-foreground">
                              {formatEur(raw)}
                              {p.ownership < 100 && <span className="ml-1 opacity-60">→ {formatEur(prorated)}</span>}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 transition-opacity sm:opacity-60 sm:group-hover:opacity-100">
                    <Link href={`/snapshots?date=${point.date}`}>
                      <Button size="icon" variant="ghost" className="size-9 sm:size-7">
                        <Pencil className="size-4 sm:size-3.5" />
                      </Button>
                    </Link>
                    <Button size="icon" variant="ghost"
                      className="size-9 text-destructive hover:text-destructive sm:size-7"
                      onClick={() => onDelete(point.date)} disabled={isDeleting}>
                      {isDeleting ? <Loader2 className="size-4 animate-spin sm:size-3.5" /> : <Trash2 className="size-4 sm:size-3.5" />}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

type Props = {
  products: Product[]
  snapshots: SnapshotRow[]
}

export function PatrimonioView({ products, snapshots }: Props) {
  const [isPending, startTransition] = useTransition()
  const [deletingDate, setDeletingDate] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>("todo")
  const [selEntities, setSelEntities] = useState(new Set<string>())
  const [selTipos, setSelTipos]       = useState(new Set<string>())
  const [selProducts, setSelProducts] = useState(new Set<string>())

  // Cascaded filtering
  const afterEntity = useMemo(
    () => selEntities.size === 0 ? products : products.filter(p => selEntities.has(p.entity.id)),
    [products, selEntities],
  )
  const afterTipo = useMemo(
    () => selTipos.size === 0 ? afterEntity : afterEntity.filter(p => selTipos.has(p.type)),
    [afterEntity, selTipos],
  )
  const filteredProducts = useMemo(
    () => selProducts.size === 0 ? afterTipo : afterTipo.filter(p => selProducts.has(p.id)),
    [afterTipo, selProducts],
  )

  // Available options
  const optEntities = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of products) map.set(p.entity.id, p.entity.name)
    return [...map.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label }))
  }, [products])

  const optTipos = useMemo(() => {
    const set = new Set<string>()
    for (const p of afterEntity) set.add(p.type)
    return [...set]
      .sort((a, b) => (PRODUCT_TYPE_LABELS[a as ProductType] ?? a).localeCompare(PRODUCT_TYPE_LABELS[b as ProductType] ?? b))
      .map(t => ({ value: t, label: PRODUCT_TYPE_LABELS[t as ProductType] ?? t }))
  }, [afterEntity])

  const optProducts = useMemo(() =>
    [...afterTipo]
      .sort((a, b) => a.entity.name.localeCompare(b.entity.name) || a.name.localeCompare(b.name))
      .map(p => ({ value: p.id, label: `${p.entity.name} · ${p.name}` })),
    [afterTipo],
  )

  function handleEntityChange(v: Set<string>) {
    setSelEntities(v)
    const filtered = v.size === 0 ? products : products.filter(p => v.has(p.entity.id))
    const validTipos = new Set<string>(filtered.map(p => p.type))
    const newTipos = new Set([...selTipos].filter(t => validTipos.has(t)))
    if (newTipos.size !== selTipos.size) {
      setSelTipos(newTipos)
      setSelProducts(new Set())
      return
    }
    const afterT = newTipos.size === 0 ? filtered : filtered.filter(p => newTipos.has(p.type))
    const validProds = new Set(afterT.map(p => p.id))
    setSelProducts(new Set([...selProducts].filter(id => validProds.has(id))))
  }

  function handleTipoChange(v: Set<string>) {
    setSelTipos(v)
    const filtered = v.size === 0 ? afterEntity : afterEntity.filter(p => v.has(p.type))
    const validProds = new Set(filtered.map(p => p.id))
    setSelProducts(new Set([...selProducts].filter(id => validProds.has(id))))
  }

  const filteredIds = useMemo(() => new Set(filteredProducts.map((p) => p.id)), [filteredProducts])
  const filteredSnapshots = useMemo(
    () => snapshots.filter((s) => filteredIds.has(s.productId)),
    [snapshots, filteredIds],
  )
  const timeline = useMemo(
    () => buildTimeline(filteredSnapshots, filteredProducts),
    [filteredSnapshots, filteredProducts],
  )

  const last = timeline.at(-1)
  const prev = timeline.at(-2)

  const diff    = last && prev ? last.total - prev.total : null
  const diffPct = diff !== null && prev && prev.total > 0 ? (diff / prev.total) * 100 : null

  const yearAgo    = last ? findYearAgo(timeline, last) : null
  const diffYear   = last && yearAgo ? last.total - yearAgo.total : null
  const diffYearPct = diffYear !== null && yearAgo && yearAgo.total > 0
    ? (diffYear / yearAgo.total) * 100
    : null

  const maxVal = timeline.length > 0 ? Math.max(...timeline.map((p) => p.total)) : null
  const filtered = filterByPeriod(timeline, period)

  function handleDelete(date: string) {
    setDeletingDate(date)
    startTransition(async () => {
      await deleteSnapshotDate(date)
      setDeletingDate(null)
    })
  }

  function trend(v: number | null): "up" | "down" | "flat" | undefined {
    if (v === null) return undefined
    return v > 0 ? "up" : v < 0 ? "down" : "flat"
  }

  // ── Sin datos (BD vacía) ──
  if (snapshots.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="rounded-full bg-muted p-4">
          <TrendingUp className="size-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">Sin datos todavía</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Registra el valor de tus productos para ver la evolución.
          </p>
        </div>
        <Link href="/snapshots"><Button size="sm">Registrar snapshot</Button></Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* ── Filtros ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <MultiSelectFilter
            placeholder="Entidades"
            options={optEntities}
            selected={selEntities}
            onChange={handleEntityChange}
          />
          <MultiSelectFilter
            placeholder="Tipos"
            options={optTipos}
            selected={selTipos}
            onChange={handleTipoChange}
          />
          <MultiSelectFilter
            placeholder="Productos"
            options={optProducts}
            selected={selProducts}
            onChange={setSelProducts}
          />
        </div>
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      {timeline.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
          <p className="text-sm font-medium">Sin datos para este filtro</p>
          <p className={cn(tx.caption, "mt-1")}>Prueba con otra combinación de filtros.</p>
        </div>
      )}

      {last && (
        <>
      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Patrimonio actual" value={formatEur(last.total)} />
        <KpiCard
          label="vs mes anterior"
          value={diff !== null ? signedEur(diff) : "—"}
          sub={diffPct !== null ? signedPct(diffPct) : undefined}
          trend={trend(diff)}
        />
        <KpiCard
          label="vs año anterior"
          value={diffYear !== null ? signedEur(diffYear) : "—"}
          sub={diffYearPct !== null ? signedPct(diffYearPct) : undefined}
          trend={trend(diffYear)}
        />
        <KpiCard label="Máximo histórico" value={maxVal !== null ? formatEur(maxVal) : "—"} />
      </div>

      {/* ── Evolución ── */}
      <DashboardBlock title="Evolución">
        <div className="h-56 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart data={filtered} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHART_TICK }} tickLine={false}
                axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: CHART_TICK }} tickLine={false} axisLine={false}
                tickFormatter={(v) => formatNumber(v)} width={52} />
              <Tooltip content={<PatrimonioTooltip />} />
              <Line type="monotone" dataKey="total" stroke={CHART_COLORS.primary} strokeWidth={2}
                dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: CHART_COLORS.primary }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </DashboardBlock>

      {/* ── Distribución ── */}
      <DistributionBlock lastPoint={last} products={filteredProducts} />

      {/* ── Historial ── */}
      <div className="flex justify-end">
        <HistoryDialog
          timeline={timeline}
          products={filteredProducts}
          isPending={isPending}
          deletingDate={deletingDate}
          onDelete={handleDelete}
        />
      </div>
        </>
      )}
    </div>
  )
}
