"use client"

import { useState, useMemo } from "react"
import {
  AreaChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"
import { tx } from "@/lib/styles"
import { formatAmountAbs } from "@/lib/format"
import { cn } from "@/lib/utils"

// ─── Constantes visuales ──────────────────────────────────────────────────────

const C_PORTFOLIO = "#6366f1"
const C_FIRE      = "#f59e0b"
const CHART_TICK  = "#94a3b8"
const GRID_COLOR  = "#e2e8f0"

// ─── Cálculo ─────────────────────────────────────────────────────────────────

type YearRow = { year: number; portfolio: number; fire: number }

type FireResult = {
  rows: YearRow[]
  fireNumber: number
  fireNumberNominal: number | null
  anosHastaFIRE: number | null
  rentaMensual: number
  rentaMensualNominal: number | null
}

function calcFIRE(
  gastosAnuales: number,
  portfolioActual: number,
  ahorroMensual: number,
  rentNominal: number,
  inflacion: number,
  tasaRetirada: number,
): FireResult | null {
  if (gastosAnuales <= 0 || tasaRetirada <= 0) return null

  // FIRE en euros de hoy
  const fireNumber   = Math.round(gastosAnuales / (tasaRetirada / 100))
  const rentaMensual = Math.round(gastosAnuales / 12)

  // Simulación en términos nominales: portfolio crece al tipo nominal,
  // objetivo FIRE crece con la inflación año a año
  const nominalMensual = Math.pow(1 + rentNominal / 100, 1 / 12) - 1
  const inflMensual    = Math.pow(1 + inflacion  / 100, 1 / 12) - 1

  const rows: YearRow[] = []
  let portfolio          = portfolioActual
  let anosHastaFIRE: number | null = portfolioActual >= fireNumber ? 0 : null
  let fireReachedYear    = 0
  let fireNumberNominal: number | null = null

  for (let year = 1; year <= 60; year++) {
    for (let m = 0; m < 12; m++) {
      portfolio = portfolio * (1 + nominalMensual) + ahorroMensual
      const totalMeses      = (year - 1) * 12 + m + 1
      const fireTargetMes   = gastosAnuales * Math.pow(1 + inflMensual, totalMeses) / (tasaRetirada / 100)
      if (anosHastaFIRE === null && portfolio >= fireTargetMes) {
        anosHastaFIRE     = year - 1 + (m + 1) / 12
        fireReachedYear   = year
        fireNumberNominal = Math.round(fireTargetMes)
      }
    }
    const fireTargetYear = Math.round(gastosAnuales * Math.pow(1 + inflacion / 100, year) / (tasaRetirada / 100))
    rows.push({ year, portfolio: Math.round(portfolio), fire: fireTargetYear })

    const cutoff = fireReachedYear > 0 ? fireReachedYear + 10 : 50
    if (year >= cutoff) break
  }

  const rentaMensualNominal = fireNumberNominal != null
    ? Math.round(fireNumberNominal * (tasaRetirada / 100) / 12)
    : null

  return { rows, fireNumber, fireNumberNominal, anosHastaFIRE, rentaMensual, rentaMensualNominal }
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
  active?: boolean; payload?: { name: string; value: number; color: string; dataKey: string }[]; label?: string
}) {
  if (!active || !payload?.length) return null
  const portfolio = payload.find((p) => p.dataKey === "portfolio")
  const fire      = payload.find((p) => p.dataKey === "fire")
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-md">
      <p className="mb-1.5 text-xs text-muted-foreground">Año {label}</p>
      {portfolio && (
        <div className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: C_PORTFOLIO }} />
          <span className="text-muted-foreground">Portfolio:</span>
          <span className="font-medium tabular-nums">{formatAmountAbs(portfolio.value)}</span>
        </div>
      )}
      {fire && (
        <div className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: C_FIRE }} />
          <span className="text-muted-foreground">Objetivo FIRE:</span>
          <span className="font-medium tabular-nums">{formatAmountAbs(fire.value)}</span>
        </div>
      )}
      {portfolio && fire && (
        <div className="mt-1.5 border-t border-border pt-1.5 text-sm">
          <span className="text-muted-foreground">Progreso: </span>
          <span className="font-semibold tabular-nums">
            {Math.min(100, Math.round((portfolio.value / fire.value) * 100))} %
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export function CalcFIRE() {
  const [gastosAnuales,  setGastosAnuales]  = useState(24_000)
  const [portfolioActual, setPortfolioActual] = useState(50_000)
  const [ahorroMensual,  setAhorroMensual]  = useState(800)
  const [rentNominal,    setRentNominal]    = useState(7)
  const [inflacion,      setInflacion]      = useState(2.5)
  const [tasaRetirada,   setTasaRetirada]   = useState(4)

  const result = useMemo(
    () => calcFIRE(gastosAnuales, portfolioActual, ahorroMensual, rentNominal, inflacion, tasaRetirada),
    [gastosAnuales, portfolioActual, ahorroMensual, rentNominal, inflacion, tasaRetirada],
  )

  const anosLabel = result?.anosHastaFIRE == null
    ? "No alcanzable en 60 años"
    : result.anosHastaFIRE === 0
    ? "¡Ya eres FIRE!"
    : `${result.anosHastaFIRE.toFixed(1)} años`

  const tickInterval = result
    ? (result.rows.length > 30 ? 9 : result.rows.length > 15 ? 4 : 1)
    : 1

  return (
    <div className="space-y-6">
      {/* Inputs + resultados */}
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <InputField label="Gastos anuales" value={gastosAnuales} onChange={setGastosAnuales} suffix="€/año" min={0} step={1000} />
          <InputField label="Portfolio actual" value={portfolioActual} onChange={setPortfolioActual} suffix="€" min={0} step={1000} />
          <InputField label="Ahorro mensual" value={ahorroMensual} onChange={setAhorroMensual} suffix="€/mes" min={0} step={100} />
          <InputField label="Rentabilidad nominal esperada" value={rentNominal} onChange={setRentNominal} suffix="%" min={0} max={30} step={0.5} />
          <InputField label="Inflación esperada" value={inflacion} onChange={setInflacion} suffix="%" min={0} max={20} step={0.5} />
          <InputField label="Tasa de retirada" value={tasaRetirada} onChange={setTasaRetirada} suffix="%" min={0.5} max={10} step={0.5} />
        </div>

        {result ? (
          <div className="space-y-3">
            <ResultCard
              label="Número FIRE (euros de hoy)"
              value={formatAmountAbs(result.fireNumber)}
              sub={`Regla del ${tasaRetirada} % · lo que necesitas en cartera`}
              highlight
            />
            {result.fireNumberNominal != null && (
              <ResultCard
                label="Número FIRE en euros nominales"
                value={formatAmountAbs(result.fireNumberNominal)}
                sub={`Lo que equivaldrá en ${new Date().getFullYear() + Math.round(result.anosHastaFIRE!)}, ajustado al ${inflacion} % de inflación`}
              />
            )}
            <ResultCard
              label="Tiempo hasta la independencia financiera"
              value={anosLabel}
            />
            <ResultCard
              label="Rentabilidad real (descontada inflación)"
              value={`${(((1 + rentNominal / 100) / (1 + inflacion / 100) - 1) * 100).toFixed(2)} %`}
            />
            <ResultCard
              label="Renta mensual en FIRE"
              value={formatAmountAbs(result.rentaMensual)}
              sub={result.rentaMensualNominal != null
                ? `En euros de hoy · ${formatAmountAbs(result.rentaMensualNominal)} en euros nominales`
                : "En euros de hoy"}
            />
          </div>
        ) : (
          <p className={tx.secondary}>Introduce datos válidos para calcular.</p>
        )}
      </div>

      {/* Gráfica */}
      {result && (
        <div className="space-y-2">
          <p className={tx.label}>Evolución del portfolio vs objetivo FIRE</p>
          <p className={tx.secondary}>Rentabilidad real (ya descontada la inflación). Todo en euros de hoy.</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={result.rows} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPortfolio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={C_PORTFOLIO} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={C_PORTFOLIO} stopOpacity={0.05} />
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
                <Area
                  type="monotone"
                  dataKey="portfolio"
                  name="Portfolio"
                  stroke={C_PORTFOLIO}
                  strokeWidth={2}
                  fill="url(#gradPortfolio)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: C_PORTFOLIO }}
                />
                <Line
                  type="monotone"
                  dataKey="fire"
                  name="Objetivo FIRE"
                  stroke={C_FIRE}
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: C_FIRE }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
