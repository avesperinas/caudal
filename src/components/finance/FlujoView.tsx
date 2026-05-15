"use client"

import { useMemo, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts"

type TooltipPayloadItem = { value: number; name?: string; dataKey?: string; color?: string }
type TooltipBoxProps = { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }
import { Table2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  KpiCard, PeriodTabs, Period, DashboardBlock,
  ChartTooltipBox, CHART_TICK, CHART_GRID, CHART_COLORS,
} from "@/components/finance/Dashboard"
import { tx } from "@/lib/styles"
import { cn } from "@/lib/utils"
import { formatAmountAbs, formatAmount, formatPct } from "@/lib/format"
import { MONTHS } from "@/lib/gastos"

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type FlujoMonth = {
  year: number
  month: number
  ingresos: number
  gastosPersonales: number
  gastosCompartidos: number
  aportaciones: number              // mías
  aportacionesFinancieras: number   // subset countForSavings
  gastosViviendaYAmpliados: number  // categorías countForExtendedSavings
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function monthLabel(m: FlujoMonth, short = false): string {
  const name = short ? MONTHS[m.month - 1].slice(0, 3) : MONTHS[m.month - 1]
  return `${name} ${String(m.year).slice(-2)}`
}

function filterByPeriod(months: FlujoMonth[], period: Period): FlujoMonth[] {
  if (period === "todo") return months
  const n = period === "6m" ? 6 : period === "1a" ? 12 : 36
  return months.slice(-n)
}

function pctSafe(num: number, den: number): number {
  if (den === 0) return 0
  return (num / den) * 100
}

// ─── Tooltips ─────────────────────────────────────────────────────────────────

function FlowTooltip({ active, payload, label }: TooltipBoxProps) {
  if (!active || !payload?.length) return null
  const get = (key: string) => payload.find((p) => p.dataKey === key)?.value ?? 0
  const ing = get("ingresos")
  const gas = get("gastos")
  const ahorro = ing - gas
  return (
    <ChartTooltipBox
      label={label}
      rows={[
        { label: "Ingresos", value: formatAmountAbs(ing), color: CHART_COLORS.income },
        { label: "Gastos",   value: formatAmountAbs(gas), color: CHART_COLORS.expense },
        { label: "Ahorro",   value: formatAmount(ahorro), emphasis: true },
      ]}
    />
  )
}

function RateTooltip({ active, payload, label }: TooltipBoxProps) {
  if (!active || !payload?.length) return null
  return (
    <ChartTooltipBox
      label={label}
      rows={payload.map((p) => ({
        label: String(p.name ?? ""),
        value: formatPct(Number(p.value), 1),
        color: p.color,
      }))}
    />
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function FlujoView({ months }: { months: FlujoMonth[] }) {
  const [period, setPeriod] = useState<Period>("1a")
  const filtered = useMemo(() => filterByPeriod(months, period), [months, period])

  // ── KPIs del período ──
  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, m) => ({
        ingresos: acc.ingresos + m.ingresos,
        gastos: acc.gastos + m.gastosPersonales + m.gastosCompartidos,
        aportacionesFinancieras: acc.aportacionesFinancieras + m.aportacionesFinancieras,
        ampliadas: acc.ampliadas + m.aportacionesFinancieras + m.gastosViviendaYAmpliados,
      }),
      { ingresos: 0, gastos: 0, aportacionesFinancieras: 0, ampliadas: 0 },
    )
  }, [filtered])

  const n = filtered.length || 1
  const ingresoMedio = totals.ingresos / n
  const gastoMedio   = totals.gastos / n
  const tasaAhorro   = pctSafe(totals.aportacionesFinancieras, totals.ingresos)
  const tasaAmpliada = pctSafe(totals.ampliadas, totals.ingresos)

  // ── Datos de chart ──
  const chartData = useMemo(() => filtered.map((m) => ({
    label: monthLabel(m, true),
    ingresos: Math.round(m.ingresos),
    gastos: Math.round(m.gastosPersonales + m.gastosCompartidos),
    tasaFinanciera: Number(pctSafe(m.aportacionesFinancieras, m.ingresos).toFixed(1)),
    tasaAmpliada: Number(pctSafe(m.aportacionesFinancieras + m.gastosViviendaYAmpliados, m.ingresos).toFixed(1)),
  })), [filtered])

  const tickInterval = chartData.length > 18 ? 3 : chartData.length > 12 ? 2 : 0

  return (
    <div className="space-y-5">

      {/* ── Filtros ── */}
      <div className="flex items-center justify-between">
        <p className={tx.secondary}>Período</p>
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          label="Ingreso medio"
          value={formatAmountAbs(ingresoMedio)}
          sub={`${n} ${n === 1 ? "mes" : "meses"}`}
        />
        <KpiCard
          label="Gasto medio"
          value={formatAmountAbs(gastoMedio)}
          sub={`${formatPct(pctSafe(gastoMedio, ingresoMedio), 0)} del ingreso`}
        />
        <KpiCard
          label="Tasa de ahorro"
          value={formatPct(tasaAhorro, 1)}
          sub="financiero"
          accent={tasaAhorro >= 20 ? "positive" : tasaAhorro < 10 ? "negative" : "default"}
        />
        <KpiCard
          label="Tasa ampliada"
          value={formatPct(tasaAmpliada, 1)}
          sub="incl. vivienda"
          accent={tasaAmpliada >= 30 ? "positive" : tasaAmpliada < 15 ? "negative" : "default"}
        />
      </div>

      {/* ── Charts ── */}
      <DashboardBlock title="Ingresos vs gastos">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="20%" barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHART_TICK }} tickLine={false} axisLine={false} interval={tickInterval} />
              <YAxis tick={{ fontSize: 11, fill: CHART_TICK }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={42} />
              <Tooltip content={<FlowTooltip />} />
              <Bar dataKey="ingresos" name="Ingresos" fill={CHART_COLORS.income}  radius={[3, 3, 0, 0]} />
              <Bar dataKey="gastos"   name="Gastos"   fill={CHART_COLORS.expense} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </DashboardBlock>

      <DashboardBlock title="Evolución de la tasa de ahorro">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: CHART_TICK }} tickLine={false} axisLine={false} interval={tickInterval} />
              <YAxis tick={{ fontSize: 11, fill: CHART_TICK }} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${v}%`} width={42} />
              <Tooltip content={<RateTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
              <Line type="monotone" dataKey="tasaFinanciera" name="Financiero" stroke={CHART_COLORS.savings}
                strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: CHART_COLORS.savings }} />
              <Line type="monotone" dataKey="tasaAmpliada" name="Ampliado" stroke={CHART_COLORS.cost}
                strokeWidth={2} strokeDasharray="5 3" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: CHART_COLORS.cost }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </DashboardBlock>

      {/* ── Tabla modal ── */}
      <div className="flex justify-end">
        <FlujoTableDialog months={filtered} />
      </div>
    </div>
  )
}

// ─── Tabla modal ──────────────────────────────────────────────────────────────

function FlujoTableDialog({ months }: { months: FlujoMonth[] }) {
  const [open, setOpen] = useState(false)
  const rows = [...months].reverse()

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Table2 className="size-3.5" />
        Ver datos
      </Button>
      <Dialog open={open} onOpenChange={(o) => { if (!o) setOpen(false) }}>
        <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Flujo mensual</DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-auto">
          <table className="w-full min-w-[640px] text-xs">
            <thead className="sticky top-0 z-10 bg-popover">
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-2 py-2 font-medium">Mes</th>
                <th className="px-2 py-2 text-right font-medium">Ingresos</th>
                <th className="px-2 py-2 text-right font-medium">Gastos pers.</th>
                <th className="px-2 py-2 text-right font-medium">Gastos comp.</th>
                <th className="px-2 py-2 text-right font-medium">Aport.</th>
                <th className="px-2 py-2 text-right font-medium">Tasa</th>
                <th className="px-2 py-2 text-right font-medium">Ampliada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((m) => {
                const tf = pctSafe(m.aportacionesFinancieras, m.ingresos)
                const ta = pctSafe(m.aportacionesFinancieras + m.gastosViviendaYAmpliados, m.ingresos)
                return (
                  <tr key={`${m.year}-${m.month}`} className="hover:bg-muted/30">
                    <td className="px-2 py-1.5 font-medium">{monthLabel(m)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatAmountAbs(m.ingresos)}
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{formatAmountAbs(m.gastosPersonales)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{formatAmountAbs(m.gastosCompartidos)}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-blue-600 dark:text-blue-400">
                      {formatAmountAbs(m.aportaciones)}
                    </td>
                    <td className={cn("px-2 py-1.5 text-right tabular-nums font-medium",
                      tf >= 20 ? "text-emerald-600 dark:text-emerald-400" : tf < 10 ? "text-rose-600 dark:text-rose-400" : "")}>
                      {formatPct(tf, 1)}
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{formatPct(ta, 1)}</td>
                  </tr>
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
