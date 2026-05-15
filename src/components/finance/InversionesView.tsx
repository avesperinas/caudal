"use client"

import { useState, useMemo, Fragment } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts"

type TooltipPayloadItem = { value: number; name?: string; dataKey?: string; color?: string }
type TooltipBoxProps = { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }
import {
  TrendingUp, BarChart2, Shield, Zap,
  PiggyBank, Building2, CreditCard, Package, Table2,
  ChevronDown, ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  KpiCard, PeriodTabs, Period, DashboardBlock,
  ChartTooltipBox, CHART_TICK, CHART_GRID, CHART_COLORS,
  ProductCategoryFilter, applyProductFilter, ProductFilter,
} from "@/components/finance/Dashboard"
import { tx } from "@/lib/styles"
import { cn } from "@/lib/utils"
import { formatAmountAbs, formatAmount, formatPctSigned } from "@/lib/format"

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ProductoInversion = {
  id: string
  name: string
  type: string
  ownership: number
  openedAt: string
  closedAt: string | null
  entity: { id: string; name: string; color: string }
  snapshots: Array<{ id: string; date: string; value: number }>
  aportaciones: Array<{ id: string; year: number; month: number; date: string | null; amount: number; madeByMe: boolean; note: string | null }>
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const TIPO_LABEL: Record<string, string> = {
  CHECKING: "Cuenta corriente", SAVINGS: "Cuenta ahorro",
  FUND: "Fondo inversión", PENSION: "Plan pensiones",
  ETF: "ETF", REAL_ESTATE: "Inmueble",
  CRYPTO: "Cripto", OTHER: "Otro",
}

const TIPO_ICON: Record<string, React.ElementType> = {
  CHECKING: CreditCard, SAVINGS: PiggyBank,
  FUND: BarChart2, PENSION: Shield,
  ETF: TrendingUp, REAL_ESTATE: Building2,
  CRYPTO: Zap, OTHER: Package,
}

const TYPE_COLORS: Record<string, string> = {
  CHECKING: "#64748b", SAVINGS: "#22c55e",
  FUND: "#6366f1", PENSION: "#8b5cf6",
  ETF: "#3b82f6", REAL_ESTATE: "#f59e0b",
  CRYPTO: "#f97316", OTHER: "#94a3b8",
}

// ─── Métricas por producto ────────────────────────────────────────────────────

function xirr(cashflows: { date: Date; amount: number }[]): number | null {
  if (cashflows.length < 2) return null
  const t0 = cashflows[0].date.getTime()
  const MS_YEAR = 365.25 * 24 * 3600 * 1000
  const years = cashflows.map((cf) => (cf.date.getTime() - t0) / MS_YEAR)

  const npv  = (r: number) => cashflows.reduce((s, cf, i) => s + cf.amount / Math.pow(1 + r, years[i]), 0)
  const dnpv = (r: number) => cashflows.reduce((s, cf, i) => {
    if (years[i] === 0) return s
    return s - years[i] * cf.amount / Math.pow(1 + r, years[i] + 1)
  }, 0)

  let r = 0.1
  for (let i = 0; i < 100; i++) {
    const f = npv(r), df = dnpv(r)
    if (Math.abs(df) < 1e-10 || !isFinite(f)) return null
    const r2 = r - f / df
    if (!isFinite(r2) || r2 < -0.9999 || r2 > 50) return null
    if (Math.abs(r2 - r) < 1e-7) return r2
    r = r2
  }
  return null
}

type Metricas = {
  valorActual: number
  valorTotal: number
  capitalInvertido: number
  capitalRetirado: number
  capitalNeto: number
  gananciaAbsoluta: number
  rentabilidad: number
  tir: number | null
  ultimaFecha: string | null
  hasData: boolean
}

function calcMetricas(p: ProductoInversion): Metricas {
  const pct = p.ownership / 100
  const hasData = p.snapshots.length > 0

  const valorTotal  = hasData ? p.snapshots[p.snapshots.length - 1].value : 0
  const valorActual = valorTotal * pct
  const ultimaFecha = hasData ? p.snapshots[p.snapshots.length - 1].date : null

  const mias = p.aportaciones.filter(a => a.madeByMe)
  const capitalInvertido = mias.reduce((s, a) => s + Math.max(0, a.amount), 0)
  const capitalRetirado  = mias.reduce((s, a) => s + Math.max(0, -a.amount), 0)
  const capitalNeto = capitalInvertido - capitalRetirado

  const gananciaAbsoluta = valorActual - capitalNeto
  const rentabilidad = capitalNeto > 0 ? (gananciaAbsoluta / capitalNeto) * 100 : 0

  let tir: number | null = null
  if (hasData && mias.length > 0) {
    const cfs = [
      ...mias.map((a) => ({
        date: a.date ? new Date(a.date) : new Date(a.year, a.month - 1, 1),
        amount: -a.amount,
      })),
      { date: new Date(ultimaFecha!), amount: valorActual },
    ].sort((a, b) => a.date.getTime() - b.date.getTime())
    tir = xirr(cfs)
  }

  return { valorActual, valorTotal, capitalInvertido, capitalRetirado, capitalNeto, gananciaAbsoluta, rentabilidad, tir, ultimaFecha, hasData }
}

// ─── Serie agregada cartera ──────────────────────────────────────────────────

type PortfolioPoint = { dateMs: number; label: string; valor: number; coste: number }

function buildPortfolioSeries(products: ProductoInversion[]): PortfolioPoint[] {
  // Recolecta todas las fechas únicas (snapshots + aportaciones)
  const dates = new Set<number>()
  for (const p of products) {
    for (const s of p.snapshots) dates.add(new Date(s.date).getTime())
    for (const a of p.aportaciones.filter(x => x.madeByMe)) {
      const d = a.date ? new Date(a.date) : new Date(a.year, a.month - 1, 1)
      dates.add(d.getTime())
    }
  }
  const sortedMs = [...dates].sort((a, b) => a - b)
  if (sortedMs.length === 0) return []

  // Para cada fecha, suma valor (último snapshot ≤ fecha × ownership) y coste base
  return sortedMs.map((ms) => {
    let valor = 0
    let coste = 0
    for (const p of products) {
      const pct = p.ownership / 100
      const snaps = p.snapshots
        .filter((s) => new Date(s.date).getTime() <= ms)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      if (snaps.length > 0) valor += snaps[0].value * pct

      for (const a of p.aportaciones) {
        if (!a.madeByMe) continue
        const aMs = (a.date ? new Date(a.date) : new Date(a.year, a.month - 1, 1)).getTime()
        if (aMs <= ms) coste += a.amount
      }
    }
    const d = new Date(ms)
    return {
      dateMs: ms,
      label: d.toLocaleDateString("es-ES", { month: "short", year: "2-digit", timeZone: "UTC" }),
      valor: Math.round(valor * 100) / 100,
      coste: Math.round(coste * 100) / 100,
    }
  })
}

function filterSeriesByPeriod(series: PortfolioPoint[], period: Period): PortfolioPoint[] {
  if (period === "todo" || series.length === 0) return series
  const months = period === "6m" ? 6 : period === "1a" ? 12 : 36
  const lastMs = series[series.length - 1].dateMs
  const cutoff = lastMs - months * 30.5 * 24 * 3600 * 1000
  return series.filter((p) => p.dateMs >= cutoff)
}

// ─── Tooltips ─────────────────────────────────────────────────────────────────

function PortfolioTooltip({ active, payload, label }: TooltipBoxProps) {
  if (!active || !payload?.length) return null
  const valor = payload.find((p) => p.dataKey === "valor")?.value ?? 0
  const coste = payload.find((p) => p.dataKey === "coste")?.value ?? 0
  const ganancia = Number(valor) - Number(coste)
  return (
    <ChartTooltipBox
      label={label}
      rows={[
        { label: "Valor",    value: formatAmountAbs(Number(valor)), color: CHART_COLORS.value },
        { label: "Coste",    value: formatAmountAbs(Number(coste)), color: CHART_COLORS.cost },
        { label: "Ganancia", value: formatAmount(ganancia), emphasis: true },
      ]}
    />
  )
}

// ─── Tabla modal con detalle expandible ──────────────────────────────────────

function ProductoExpand({ producto, metricas }: { producto: ProductoInversion; metricas: Metricas }) {
  const chartData = useMemo(() => {
    const sorted = [...producto.aportaciones]
      .filter((a) => a.madeByMe)
      .map((a) => ({
        date: (a.date ? new Date(a.date) : new Date(a.year, a.month - 1, 1)).getTime(),
        amount: Math.max(0, a.amount),
      }))
      .sort((a, b) => a.date - b.date)

    return producto.snapshots.map((s) => {
      const snapMs = new Date(s.date).getTime()
      const coste = sorted.filter((a) => a.date <= snapMs).reduce((sum, a) => sum + a.amount, 0)
      const d = new Date(s.date)
      const label = d.toLocaleDateString("es-ES", { month: "short", year: "2-digit", timeZone: "UTC" })
      return { label, valor: Math.round(s.value * 100) / 100, coste: Math.round(coste * 100) / 100 }
    })
  }, [producto])

  return (
    <div className="space-y-3 bg-muted/30 px-3 py-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { label: "Capital invertido", value: formatAmountAbs(metricas.capitalInvertido) },
          metricas.capitalRetirado > 0
            ? { label: "Capital retirado", value: formatAmountAbs(metricas.capitalRetirado) }
            : { label: "Capital neto",     value: formatAmountAbs(metricas.capitalNeto) },
          { label: "Ganancia", value: formatAmount(metricas.gananciaAbsoluta) },
          { label: "TIR anual", value: metricas.tir != null ? formatPctSigned(metricas.tir * 100) : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-md border border-border bg-background px-2 py-1.5">
            <p className={tx.caption}>{label}</p>
            <p className="text-xs font-medium tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {chartData.length >= 2 && (
        <div className="h-32 w-full rounded-md bg-background p-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: CHART_TICK }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: CHART_TICK }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={36} />
              <Tooltip content={<PortfolioTooltip />} />
              <Area type="monotone" dataKey="valor" stroke={CHART_COLORS.value} strokeWidth={2}
                fill={CHART_COLORS.value} fillOpacity={0.15} dot={false} />
              <Area type="monotone" dataKey="coste" stroke={CHART_COLORS.cost} strokeWidth={1.5}
                strokeDasharray="5 3" fill="transparent" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {producto.aportaciones.length > 0 && (
        <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-background divide-y divide-border/40">
          {[...producto.aportaciones]
            .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month)
            .map((a) => (
              <div key={a.id} className="flex items-center justify-between px-2 py-1 text-xs">
                <span className="text-muted-foreground">
                  {new Date(a.year, a.month - 1, 1).toLocaleDateString("es-ES", { month: "short", year: "numeric" })}
                  {a.note && <span className="ml-2 italic">· {a.note}</span>}
                </span>
                <span className={cn("tabular-nums font-medium",
                  a.amount >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                  {formatAmount(a.amount)}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

function ProductsTableDialog({ products }: { products: ProductoInversion[] }) {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const rows = useMemo(() => products.map((p) => ({
    producto: p,
    metricas: calcMetricas(p),
  })).sort((a, b) => b.metricas.valorActual - a.metricas.valorActual), [products])

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Table2 className="size-3.5" />
        Ver productos
      </Button>
      <Dialog open={open} onOpenChange={(o) => { if (!o) setOpen(false); setExpanded(null) }}>
        <DialogContent className="max-w-3xl w-full p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="border-b border-border px-4 py-3">
            <DialogTitle>Productos ({rows.length})</DialogTitle>
          </DialogHeader>

          <div className="overflow-auto">
            <table className="w-full min-w-[640px] text-xs">
              <thead className="sticky top-0 z-10 bg-popover">
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Producto</th>
                  <th className="px-2 py-2 text-right font-medium">Valor</th>
                  <th className="px-2 py-2 text-right font-medium">Capital</th>
                  <th className="px-2 py-2 text-right font-medium">Ganancia</th>
                  <th className="px-2 py-2 text-right font-medium">Rent.</th>
                  <th className="w-8 px-2 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.map(({ producto: p, metricas: m }) => {
                  const Icon = TIPO_ICON[p.type] ?? Package
                  const positivo = m.gananciaAbsoluta >= 0
                  const isOpen = expanded === p.id
                  return (
                    <Fragment key={p.id}>
                      <tr className="cursor-pointer hover:bg-muted/40"
                          onClick={() => setExpanded(isOpen ? null : p.id)}>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="flex size-6 shrink-0 items-center justify-center rounded"
                              style={{ backgroundColor: p.entity.color + "22", color: p.entity.color }}>
                              <Icon className="size-3" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{p.name}</p>
                              <p className="truncate text-[10px] text-muted-foreground">
                                {p.entity.name} · {TIPO_LABEL[p.type] ?? p.type}
                                {p.ownership < 100 && ` · ${p.ownership}%`}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums font-medium">
                          {m.hasData ? formatAmountAbs(m.valorActual) : "—"}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums">{formatAmountAbs(m.capitalNeto)}</td>
                        <td className={cn("px-2 py-2 text-right tabular-nums",
                          positivo ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                          {formatAmount(m.gananciaAbsoluta)}
                        </td>
                        <td className={cn("px-2 py-2 text-right tabular-nums font-medium",
                          positivo ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400")}>
                          {formatPctSigned(m.rentabilidad)}
                        </td>
                        <td className="px-2 py-2 text-muted-foreground">
                          {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={6} className="p-0">
                            <ProductoExpand producto={p} metricas={m} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export function InversionesView({ products }: { products: ProductoInversion[] }) {
  const [period, setPeriod] = useState<Period>("1a")
  const [filter, setFilter] = useState<ProductFilter>("__all__")

  const productosFiltrados = useMemo(
    () => applyProductFilter(products, filter),
    [products, filter],
  )

  // ── Totales actuales ──
  const totales = useMemo(() => {
    const m = productosFiltrados.filter((p) => p.snapshots.length > 0).map(calcMetricas)
    return {
      valor:    m.reduce((s, x) => s + x.valorActual,      0),
      capital:  m.reduce((s, x) => s + x.capitalNeto,      0),
      ganancia: m.reduce((s, x) => s + x.gananciaAbsoluta, 0),
    }
  }, [productosFiltrados])

  const rentabilidadTotal = totales.capital > 0 ? (totales.ganancia / totales.capital) * 100 : 0
  const positivo = totales.ganancia >= 0

  // ── Serie agregada ──
  const series = useMemo(() => buildPortfolioSeries(productosFiltrados), [productosFiltrados])
  const seriesFiltrada = useMemo(() => filterSeriesByPeriod(series, period), [series, period])
  const tickInterval = seriesFiltrada.length > 24 ? 5 : seriesFiltrada.length > 12 ? 2 : 0

  // ── Distribución por tipo ──
  const distTipo = useMemo(() => {
    const map = new Map<string, { key: string; label: string; color: string; total: number }>()
    for (const p of productosFiltrados) {
      const m = calcMetricas(p)
      if (!m.hasData) continue
      if (!map.has(p.type)) {
        map.set(p.type, {
          key: p.type,
          label: TIPO_LABEL[p.type] ?? p.type,
          color: TYPE_COLORS[p.type] ?? "#94a3b8",
          total: 0,
        })
      }
      map.get(p.type)!.total += m.valorActual
    }
    const items = [...map.values()].sort((a, b) => b.total - a.total)
    const sum = items.reduce((s, i) => s + i.total, 0)
    return items.map((i) => ({ ...i, pct: sum > 0 ? (i.total / sum) * 100 : 0 }))
  }, [productosFiltrados])

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
        <p className="text-sm font-medium">Sin productos</p>
        <p className={cn(tx.caption, "mt-1")}>Crea productos en la sección Productos para verlos aquí.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">

      {/* ── Filtros ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <ProductCategoryFilter value={filter} onChange={setFilter} products={products} />
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Valor actual"    value={formatAmountAbs(totales.valor)} />
        <KpiCard label="Capital neto"    value={formatAmountAbs(totales.capital)} />
        <KpiCard
          label="Ganancia"
          value={formatAmount(totales.ganancia)}
          accent={positivo ? "positive" : "negative"}
        />
        <KpiCard
          label="Rentabilidad"
          value={formatPctSigned(rentabilidadTotal)}
          accent={positivo ? "positive" : "negative"}
          trend={positivo ? "up" : "down"}
        />
      </div>

      {/* ── Evolución cartera ── */}
      {seriesFiltrada.length >= 2 ? (
        <DashboardBlock title="Valor vs coste base">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={seriesFiltrada} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPortfolio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={CHART_COLORS.value} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS.value} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHART_TICK }} tickLine={false} axisLine={false} interval={tickInterval} />
                <YAxis tick={{ fontSize: 11, fill: CHART_TICK }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={42} />
                <Tooltip content={<PortfolioTooltip />} />
                <Area type="monotone" dataKey="valor" name="Valor" stroke={CHART_COLORS.value} strokeWidth={2}
                  fill="url(#gradPortfolio)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: CHART_COLORS.value }} />
                <Area type="monotone" dataKey="coste" name="Coste" stroke={CHART_COLORS.cost} strokeWidth={1.5}
                  strokeDasharray="5 3" fill="transparent" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: CHART_COLORS.cost }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full" style={{ backgroundColor: CHART_COLORS.value }} />Valor</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-4" style={{ backgroundColor: CHART_COLORS.cost }} />Coste base</span>
          </div>
        </DashboardBlock>
      ) : (
        <DashboardBlock title="Valor vs coste base">
          <p className={cn(tx.caption, "py-8 text-center")}>No hay suficientes datos para mostrar evolución.</p>
        </DashboardBlock>
      )}

      {/* ── Distribución ── */}
      {distTipo.length > 0 && (
        <DashboardBlock title="Distribución por tipo">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex shrink-0 items-center justify-center sm:w-36">
              <PieChart width={120} height={120}>
                <Pie data={distTipo} cx={60} cy={60} innerRadius={36} outerRadius={56}
                  dataKey="total" strokeWidth={0}>
                  {distTipo.map((it, i) => <Cell key={i} fill={it.color} />)}
                </Pie>
              </PieChart>
            </div>
            <div className="flex-1 space-y-2">
              {distTipo.map((it) => (
                <div key={it.key}>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: it.color }} />
                    <span className="min-w-0 flex-1 truncate text-sm">{it.label}</span>
                    <span className={cn(tx.caption, "shrink-0")}>{it.pct.toFixed(1)}%</span>
                    <span className="shrink-0 text-sm font-medium tabular-nums">{formatAmountAbs(it.total)}</span>
                  </div>
                  <div className="ml-[18px] h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${it.pct}%`, backgroundColor: it.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DashboardBlock>
      )}

      {/* ── Tabla ── */}
      <div className="flex justify-end">
        <ProductsTableDialog products={productosFiltrados} />
      </div>
    </div>
  )
}
