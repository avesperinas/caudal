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

const C_CAPITAL   = "#6366f1"
const C_INTERESES = "#f59e0b"
const CHART_TICK  = "#94a3b8"
const GRID_COLOR  = "#e2e8f0"

// ─── Cálculo ─────────────────────────────────────────────────────────────────

type AmortRow = { year: number; capital: number; intereses: number }

function calcHipoteca(capitalFinanciado: number, plazoAnos: number, tin: number) {
  const n = plazoAnos * 12
  const r = tin / 100 / 12
  if (n <= 0 || capitalFinanciado <= 0) return null

  const cuota = r === 0 ? capitalFinanciado / n : (capitalFinanciado * r) / (1 - Math.pow(1 + r, -n))
  const totalPagado   = cuota * n
  const totalIntereses = totalPagado - capitalFinanciado

  let balance = capitalFinanciado
  let cumIntereses = 0
  const rows: AmortRow[] = []

  for (let year = 1; year <= plazoAnos; year++) {
    for (let m = 0; m < 12; m++) {
      const intMes  = balance * r
      const prinMes = cuota - intMes
      cumIntereses += intMes
      balance = Math.max(0, balance - prinMes)
    }
    rows.push({
      year,
      capital:   Math.round(capitalFinanciado - balance),
      intereses: Math.round(cumIntereses),
    })
  }

  return { cuota, totalPagado, totalIntereses, rows }
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
    if (text === "" || isNaN(num)) { setText("0"); onChange(0) }
    else setText(String(num))
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

function ResultCard({ label, value, sub, highlight, dim }: {
  label: string; value: string; sub?: string; highlight?: boolean; dim?: boolean
}) {
  return (
    <div className={cn(
      "rounded-lg border px-4 py-3",
      highlight ? "border-primary/20 bg-primary/5" : "border-border bg-muted/40",
      dim && "opacity-60",
    )}>
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
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium tabular-nums">{formatAmountAbs(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export function CalcHipoteca() {
  const [precio,    setPrecio]    = useState(250_000)
  const [aportado,  setAportado]  = useState(68_750)
  const [tasas,     setTasas]     = useState(7.5)
  const [plazo,     setPlazo]     = useState(30)
  const [tin,       setTin]       = useState(3.5)

  const costeTasas        = precio * (tasas / 100)
  const entrada           = Math.max(0, aportado - costeTasas)
  const capitalFinanciado = Math.max(0, precio - entrada)

  const result = useMemo(
    () => calcHipoteca(capitalFinanciado, plazo, tin),
    [capitalFinanciado, plazo, tin],
  )

  const tickInterval = plazo > 20 ? 4 : plazo > 10 ? 2 : 1

  return (
    <div className="space-y-6">
      {/* Inputs + resultados */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-4">
          <InputField label="Precio de la vivienda" value={precio}   onChange={setPrecio}   suffix="€" min={0} step={5000} />
          <InputField label="Capital aportado"       value={aportado} onChange={setAportado} suffix="€" min={0} step={5000} />
          <InputField label="Tasas e impuestos"      value={tasas}    onChange={setTasas}    suffix="%" min={0} max={20} step={0.5} />
          <div className="border-t border-border pt-4 space-y-4">
            <InputField label="Plazo"     value={plazo} onChange={setPlazo} suffix="años" min={1} max={40} step={1} />
            <InputField label="TIN anual" value={tin}   onChange={setTin}   suffix="%" min={0} max={20} step={0.05} />
          </div>
        </div>

        {/* Resultados */}
        <div className="space-y-3">
          {result ? (
            <>
              <ResultCard label="Cuota mensual" value={formatAmountAbs(result.cuota)} highlight />
              <ResultCard
                label="Capital a financiar"
                value={formatAmountAbs(capitalFinanciado)}
                sub={`${((capitalFinanciado / precio) * 100).toFixed(1)} % del precio`}
              />
              <ResultCard
                label="Coste tasas"
                value={formatAmountAbs(costeTasas)}
                sub={`${tasas} % · parte del capital aportado`}
              />
              <ResultCard
                label="Coste real total"
                value={formatAmountAbs(aportado + result.totalPagado)}
                sub="Capital aportado + hipoteca completa"
              />
            </>
          ) : (
            <p className={tx.secondary}>El capital aportado supera el precio.</p>
          )}
        </div>
      </div>

      {/* Gráfica de amortización */}
      {result && (
        <div className="space-y-2">
          <p className={tx.label}>Amortización acumulada</p>
          <p className={tx.secondary}>Capital recuperado vs intereses pagados año a año.</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={result.rows} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradCapital" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C_CAPITAL}   stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C_CAPITAL}   stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradIntereses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C_INTERESES} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C_INTERESES} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11, fill: CHART_TICK }}
                  tickLine={false} axisLine={false}
                  interval={tickInterval - 1}
                  tickFormatter={(v) => `${v}a`}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: CHART_TICK }}
                  tickLine={false} axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  width={40}
                />
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                <Area type="monotone" dataKey="capital"   name="Capital amortizado" stroke={C_CAPITAL}   strokeWidth={2} fill="url(#gradCapital)"   dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: C_CAPITAL }} />
                <Area type="monotone" dataKey="intereses" name="Intereses pagados"  stroke={C_INTERESES} strokeWidth={2} fill="url(#gradIntereses)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: C_INTERESES }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
