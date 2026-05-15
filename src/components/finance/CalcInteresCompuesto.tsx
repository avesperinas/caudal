"use client"

import { useState, useMemo } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { tx } from "@/lib/styles"
import { formatAmountAbs } from "@/lib/format"
import { cn } from "@/lib/utils"

// ─── Constantes visuales ──────────────────────────────────────────────────────

const C_APORTADO  = "#6366f1"
const C_BENEFICIO = "#10b981"
const CHART_TICK  = "#94a3b8"
const GRID_COLOR  = "#e2e8f0"

// ─── Cálculo ─────────────────────────────────────────────────────────────────

type YearRow = {
  year: number
  aportado: number
  beneficio: number
  balance: number
}

function calcCompuesto(
  capitalInicial: number,
  aportacionMensual: number,
  tir: number,
  plazoAnos: number,
): { rows: YearRow[]; final: YearRow } | null {
  if (plazoAnos <= 0 || tir < 0) return null
  const r = tir / 100 / 12
  const rows: YearRow[] = []

  for (let year = 1; year <= plazoAnos; year++) {
    const n = year * 12
    const balanceInicial = capitalInicial * Math.pow(1 + r, n)
    const balanceAportaciones =
      r === 0
        ? aportacionMensual * n
        : aportacionMensual * ((Math.pow(1 + r, n) - 1) / r)
    const balance = balanceInicial + balanceAportaciones
    const aportado = capitalInicial + aportacionMensual * n
    rows.push({
      year,
      balance: Math.round(balance),
      aportado: Math.round(aportado),
      beneficio: Math.round(balance - aportado),
    })
  }

  const final = rows[rows.length - 1] ?? { year: 0, balance: 0, aportado: 0, beneficio: 0 }
  return { rows, final }
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function InputField({
  label, value, onChange, suffix, min, max, step,
}: {
  label: string; value: number; onChange: (v: number) => void
  suffix: string; min?: number; max?: number; step?: number
}) {
  const [text, setText] = useState(String(value))

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    setText(raw)
    const num = parseFloat(raw)
    if (raw !== "" && !isNaN(num)) onChange(num)
  }

  function handleBlur() {
    const num = parseFloat(text)
    if (text === "" || isNaN(num)) {
      setText("0")
      onChange(0)
    } else {
      setText(String(num))
    }
  }

  return (
    <div className="space-y-1.5">
      <label className={tx.label}>{label}</label>
      <div className="flex items-center overflow-hidden rounded-lg border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <input
          type="text"
          inputMode="decimal"
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full bg-transparent px-3 py-2 text-sm outline-none tabular-nums"
        />
        <span className={cn(tx.caption, "shrink-0 border-l border-input px-3 py-2")}>{suffix}</span>
      </div>
    </div>
  )
}

function ResultCard({ label, value, sub, highlight }: {
  label: string; value: string; sub?: string; highlight?: boolean
}) {
  return (
    <div className={cn("rounded-lg border px-4 py-3", highlight ? "border-primary/20 bg-primary/5" : "border-border bg-muted/40")}>
      <p className={tx.caption}>{label}</p>
      <p className={cn("mt-0.5 tabular-nums", highlight ? "text-xl font-semibold" : "text-base font-medium")}>{value}</p>
      {sub && <p className={cn(tx.caption, "mt-0.5")}>{sub}</p>}
    </div>
  )
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string
}) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + p.value, 0)
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="mb-1.5 text-xs text-muted-foreground">Año {label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium tabular-nums">{formatAmountAbs(p.value)}</span>
        </div>
      ))}
      <div className="mt-1.5 border-t border-border pt-1.5 text-sm">
        <span className="text-muted-foreground">Total: </span>
        <span className="font-semibold tabular-nums">{formatAmountAbs(total)}</span>
      </div>
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export function CalcInteresCompuesto() {
  const [capitalInicial, setCapitalInicial] = useState(10_000)
  const [aportacion, setAportacion]         = useState(300)
  const [tir, setTir]                       = useState(7)
  const [plazo, setPlazo]                   = useState(20)

  const result = useMemo(
    () => calcCompuesto(capitalInicial, aportacion, tir, plazo),
    [capitalInicial, aportacion, tir, plazo],
  )

  const tickInterval = plazo > 20 ? 4 : plazo > 10 ? 2 : 1

  return (
    <div className="space-y-6">
      {/* Inputs + resultados */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <InputField label="Capital inicial" value={capitalInicial} onChange={setCapitalInicial} suffix="€" min={0} step={1000} />
          <InputField label="Aportación mensual" value={aportacion} onChange={setAportacion} suffix="€/mes" min={0} step={50} />
          <InputField label="Rentabilidad anual estimada" value={tir} onChange={setTir} suffix="%" min={0} max={50} step={0.5} />
          <InputField label="Plazo" value={plazo} onChange={setPlazo} suffix="años" min={1} max={50} step={1} />
        </div>

        {result ? (
          <div className="space-y-3">
            <ResultCard label="Capital final" value={formatAmountAbs(result.final.balance)} highlight />
            <ResultCard label="Total aportado" value={formatAmountAbs(result.final.aportado)} />
            <ResultCard
              label="Beneficio"
              value={`+${formatAmountAbs(result.final.beneficio)}`}
              sub={`×${(result.final.balance / result.final.aportado).toFixed(2)} sobre lo aportado`}
            />
            <ResultCard
              label="Rentabilidad total"
              value={`${((result.final.beneficio / result.final.aportado) * 100).toFixed(1)} %`}
            />
          </div>
        ) : (
          <p className={tx.secondary}>Introduce datos válidos para calcular.</p>
        )}
      </div>

      {/* Gráfica de crecimiento */}
      {result && (
        <div className="space-y-2">
          <p className={tx.label}>Crecimiento del capital</p>
          <p className={tx.secondary}>Capital aportado vs beneficio generado por el interés compuesto.</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={result.rows} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradAportado" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C_APORTADO} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={C_APORTADO} stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradBeneficio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C_BENEFICIO} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={C_BENEFICIO} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fill: CHART_TICK }}
                  tickLine={false}
                  axisLine={false}
                  interval={tickInterval - 1}
                  tickFormatter={(v) => `${v}a`}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: CHART_TICK }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  width={40}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
                <Area
                  type="monotone"
                  dataKey="aportado"
                  name="Capital aportado"
                  stackId="1"
                  stroke={C_APORTADO}
                  strokeWidth={2}
                  fill="url(#gradAportado)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: C_APORTADO }}
                />
                <Area
                  type="monotone"
                  dataKey="beneficio"
                  name="Beneficio"
                  stackId="1"
                  stroke={C_BENEFICIO}
                  strokeWidth={2}
                  fill="url(#gradBeneficio)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: C_BENEFICIO }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
