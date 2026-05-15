"use client"

import { useState, useMemo } from "react"
import { tx } from "@/lib/styles"
import { formatAmountAbs } from "@/lib/format"
import { cn } from "@/lib/utils"

// ─── Datos SS 2026 (Orden PJC/297/2026, BOE) ─────────────────────────────────

const SS_BASE_MAX_ANUAL = 5101.20 * 12 // 61,214.40 €/año

const SS_TIPO = { indefinido: 0.0650, temporal: 0.0655 }
// 4.70% comunes + 1.55/1.60% desempleo + 0.10% FP + 0.15% MEI

// ─── Escalas IRPF 2026 ────────────────────────────────────────────────────────

type Tramo = [number, number, number] // [desde, hasta, tipo%]

const ESCALA_ESTADO: Tramo[] = [
  [0,       12450,    9.5],
  [12450,   20200,    12],
  [20200,   35200,    15],
  [35200,   60000,    18.5],
  [60000,   300000,   22.5],
  [300000,  Infinity, 24.5],
]

interface CCAADef { nombre: string; foral?: true; escala: Tramo[] }

const CCAA_MAP: Record<string, CCAADef> = {
  AND: { nombre: "Andalucía", escala: [
    [0,12450,9.5],[12450,20200,12],[20200,35200,15],[35200,60000,18.5],[60000,Infinity,22.5],
  ]},
  ARA: { nombre: "Aragón", escala: [
    [0,13972.5,9.5],[13972.5,21210,12],[21210,36960,15],[36960,52500,18.5],
    [52500,60000,20.5],[60000,80000,23],[80000,90000,24],[90000,130000,25],[130000,Infinity,25.5],
  ]},
  AST: { nombre: "Asturias", escala: [
    [0,12450,10],[12450,17707.2,12],[17707.2,33007.2,14],[33007.2,53407.2,18.5],
    [53407.2,70000,21.5],[70000,90000,22.5],[90000,175000,25],[175000,Infinity,25.5],
  ]},
  BAL: { nombre: "Illes Balears", escala: [
    [0,10000,9],[10000,18000,11],[18000,30000,13.75],[30000,48000,15],
    [48000,70000,18.5],[70000,100000,19.5],[100000,150000,22.5],[150000,200000,24],[200000,Infinity,24.75],
  ]},
  CAN: { nombre: "Canarias", escala: [
    [0,12450,9],[12450,17707.2,11.5],[17707.2,33007.2,14],[33007.2,53407.2,18.5],
    [53407.2,90000,23.5],[90000,120000,24.5],[120000,Infinity,26],
  ]},
  CTB: { nombre: "Cantabria", escala: [
    [0,12450,8.5],[12450,20200,11.7],[20200,35200,14.7],[35200,60000,18],[60000,90000,21.5],[90000,Infinity,24.5],
  ]},
  CLM: { nombre: "Castilla-La Mancha", escala: [
    [0,12450,9.5],[12450,20200,12],[20200,35200,15],[35200,60000,18.5],[60000,Infinity,22.5],
  ]},
  CYL: { nombre: "Castilla y León", escala: [
    [0,12450,9],[12450,20200,11.5],[20200,35200,14],[35200,60000,18.5],[60000,Infinity,21.5],
  ]},
  CAT: { nombre: "Cataluña", escala: [
    [0,17707.2,10.5],[17707.2,33007.2,12],[33007.2,53407.2,14],[53407.2,90000,15],
    [90000,120000,18.5],[120000,175000,21.5],[175000,300000,23.5],[300000,Infinity,25.5],
  ]},
  EXT: { nombre: "Extremadura", escala: [
    [0,12450,10],[12450,20200,12.5],[20200,35200,16],[35200,60000,19],[60000,80000,21],[80000,Infinity,25],
  ]},
  GAL: { nombre: "Galicia", escala: [
    [0,12450,9],[12450,20200,11.65],[20200,35200,15.4],[35200,60000,18.4],[60000,Infinity,22.5],
  ]},
  MAD: { nombre: "Comunidad de Madrid", escala: [
    [0,13362.22,8.5],[13362.22,20225.44,10.7],[20225.44,35240.58,12.8],
    [35240.58,53407.2,17.4],[53407.2,Infinity,20.5],
  ]},
  MUR: { nombre: "Región de Murcia", escala: [
    [0,12450,9.5],[12450,20200,12],[20200,35200,15],[35200,60000,18.5],[60000,Infinity,22.5],
  ]},
  NAV: { nombre: "Navarra (Foral) †", foral: true, escala: [
    [0,        4458,    13  ],
    [4458,    10030,    22  ],
    [10030,   21175,    25  ],
    [21175,   35663,    28  ],
    [35663,   51266,    36.5],
    [51266,   66869,    41.5],
    [66869,   89159,    44  ],
    [89159,  139310,    47  ],
    [139310, 195034,    49  ],
    [195034, 334344,    50.5],
    [334344, Infinity,  52  ],
  ]},
  PVA: { nombre: "País Vasco – Álava (Foral) †", foral: true, escala: [
    [0,16770,23],[16770,33540,28],[33540,67080,35],[67080,100620,42],[100620,201240,46],[201240,Infinity,49],
  ]},
  PVG: { nombre: "País Vasco – Gipuzkoa (Foral) †", foral: true, escala: [
    [0,15900,23],[15900,25700,28],[25700,44000,35],[44000,72000,42],[72000,140000,46],[140000,Infinity,49],
  ]},
  PVV: { nombre: "País Vasco – Bizkaia (Foral) †", foral: true, escala: [
    [0,17634,23],[17634,30000,28],[30000,66870,35],[66870,100000,42],[100000,199626,46],[199626,Infinity,49],
  ]},
  RIO: { nombre: "La Rioja", escala: [
    [0,12450,8],[12450,20200,10.5],[20200,35200,14.5],[35200,60000,18.5],[60000,Infinity,23],
  ]},
  VAL: { nombre: "C. Valenciana", escala: [
    [0,12450,9.5],[12450,17707,12],[17707,33007.2,14],[33007.2,53407.2,17.5],
    [53407.2,90000,21.5],[90000,140000,23.5],[140000,175000,25],[175000,200000,29],[200000,Infinity,29.5],
  ]},
}

// ─── Funciones de cálculo ─────────────────────────────────────────────────────

function aplicarEscala(tramos: Tramo[], base: number): number {
  let cuota = 0
  for (const [desde, hasta, tipo] of tramos) {
    if (base <= desde) break
    cuota += (Math.min(base, hasta) - desde) * (tipo / 100)
  }
  return cuota
}

function tipoMarginalEn(base: number, ccaaKey: string): number {
  const ccaa = CCAA_MAP[ccaaKey]
  if (!ccaa) return 0
  function rate(tramos: Tramo[], b: number) {
    for (const [desde, hasta, tipo] of [...tramos].reverse()) {
      if (b > desde) return tipo
      void hasta
    }
    return tramos[0][2]
  }
  if (ccaa.foral) return rate(ccaa.escala, base)
  return rate(ESCALA_ESTADO, base) + rate(ccaa.escala, base)
}

function calcIRPF(baseLiquidable: number, minimo: number, ccaaKey: string): number {
  const ccaa = CCAA_MAP[ccaaKey]
  if (!ccaa) return 0
  if (ccaa.foral) {
    return Math.max(0, aplicarEscala(ccaa.escala, baseLiquidable) - aplicarEscala(ccaa.escala, minimo))
  }
  const cuotaBase = aplicarEscala(ESCALA_ESTADO, baseLiquidable) + aplicarEscala(ccaa.escala, baseLiquidable)
  const cuotaMin  = aplicarEscala(ESCALA_ESTADO, minimo)         + aplicarEscala(ccaa.escala, minimo)
  return Math.max(0, cuotaBase - cuotaMin)
}

interface Input {
  bruto: number
  ccaa: string
  contrato: "indefinido" | "temporal"
  hijos3a25: number
  hijosMenores3: number
  asc65: number
  asc75: number
  planPensiones: number
  cuotasSindicales: number
  otrasDeduccionesCuota: number
}

interface Result {
  ss: number
  rnt: number
  reduccionArt20: number
  baseImponible: number
  reducciones: number
  baseLiquidable: number
  minimo: number
  cuotaIRPF: number
  deduccionMat: number
  otrasDeducc: number
  cuotaLiquida: number
  neto: number
  tipoEfectivoIRPF: number
  tipoEfectivoTotal: number
  tipoMarginal: number
  ahorroFiscalDeducciones: number
}

function calcular(input: Input): Result | null {
  if (input.bruto <= 0) return null
  const { bruto, ccaa, contrato, hijos3a25, hijosMenores3, asc65, asc75,
          planPensiones, cuotasSindicales, otrasDeduccionesCuota } = input

  // 1. SS
  const baseSS = Math.min(bruto, SS_BASE_MAX_ANUAL)
  const ss = baseSS * SS_TIPO[contrato]

  // 2. Rendimiento neto del trabajo (Art. 19 LIRPF)
  const gastosDeducibles = ss + 2000
  const rnt = Math.max(0, bruto - gastosDeducibles)

  // 3. Reducción por rendimientos del trabajo (Art. 20 LIRPF)
  let reduccionArt20 = 0
  if (rnt <= 14047.5) reduccionArt20 = 6498
  else if (rnt <= 19747.5) reduccionArt20 = Math.max(0, 6498 - 1.14286 * (rnt - 14047.5))

  // 4. Base imponible
  const baseImponible = Math.max(0, rnt - reduccionArt20)

  // 5. Reducciones de la base (plan de pensiones + cuotas sindicales)
  const maxPP = Math.min(planPensiones, Math.max(1500, rnt * 0.30))
  const maxCS = Math.min(cuotasSindicales, 500)
  const reducciones = maxPP + maxCS
  const baseLiquidable = Math.max(0, baseImponible - reducciones)

  // 6. Mínimo personal y familiar (Art. 57-61 LIRPF)
  const MINIMOS_DESCENDIENTES = [2400, 2700, 4000, 4500]
  let minimo = 5550
  const totalHijos = hijos3a25 + hijosMenores3
  for (let i = 0; i < totalHijos; i++) minimo += MINIMOS_DESCENDIENTES[Math.min(i, 3)]
  minimo += hijosMenores3 * 2800
  minimo += asc65 * 1150
  minimo += asc75 * 2550

  // 7. Cuota IRPF íntegra
  const cuotaIRPF = calcIRPF(baseLiquidable, minimo, ccaa)

  // 8. Deducciones en cuota
  const deduccionMat = hijosMenores3 * 1200
  const otrasDeducc  = otrasDeduccionesCuota
  const cuotaLiquida = Math.max(0, cuotaIRPF - deduccionMat - otrasDeducc)

  // 9. Ahorro fiscal de las reducciones (base) comparado con sin ellas
  const cuotaSinReducciones = calcIRPF(baseImponible, minimo, ccaa)
  const ahorroFiscalDeducciones = Math.max(0, cuotaSinReducciones - cuotaIRPF)

  const neto = bruto - ss - cuotaLiquida
  const tipoEfectivoIRPF  = (cuotaLiquida / bruto) * 100
  const tipoEfectivoTotal = ((ss + cuotaLiquida) / bruto) * 100
  const tipoMarginal = tipoMarginalEn(baseLiquidable, ccaa)

  return {
    ss, rnt, reduccionArt20, baseImponible, reducciones, baseLiquidable,
    minimo, cuotaIRPF, deduccionMat, otrasDeducc, cuotaLiquida,
    neto, tipoEfectivoIRPF, tipoEfectivoTotal, tipoMarginal, ahorroFiscalDeducciones,
  }
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function NumberField({ label, value, onChange, suffix, min = 0, step = 1000, hint }: {
  label: string; value: number; onChange: (v: number) => void
  suffix: string; min?: number; step?: number; hint?: string
}) {
  const [text, setText] = useState(String(value))
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value; setText(raw)
    const n = parseFloat(raw)
    if (raw !== "" && !isNaN(n)) onChange(n)
  }
  function handleBlur() {
    const n = parseFloat(text)
    if (text === "" || isNaN(n)) { setText("0"); onChange(0) }
    else setText(String(n))
  }
  return (
    <div className="space-y-1.5">
      <label className={tx.label}>{label}</label>
      <div className="flex items-center overflow-hidden rounded-lg border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <input type="text" inputMode="decimal" value={text} onChange={handleChange} onBlur={handleBlur}
          step={step} min={min}
          className="w-full bg-transparent px-3 py-2 text-sm outline-none tabular-nums" />
        <span className={cn(tx.caption, "shrink-0 border-l border-input px-3 py-2")}>{suffix}</span>
      </div>
      {hint && <p className={tx.caption}>{hint}</p>}
    </div>
  )
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="space-y-1.5">
      <label className={tx.label}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function Counter({ label, value, onChange, max = 5 }: {
  label: string; value: number; onChange: (v: number) => void; max?: number
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={tx.label}>{label}</span>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-sm hover:bg-muted">−</button>
        <span className="w-4 text-center text-sm tabular-nums">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-sm hover:bg-muted">+</button>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, highlight }: {
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

function BreakdownBar({ neto, irpf, ss, total }: { neto: number; irpf: number; ss: number; total: number }) {
  const pN = (neto / total) * 100
  const pI = (irpf / total) * 100
  const pS = (ss   / total) * 100
  return (
    <div className="space-y-2">
      <div className="flex h-5 w-full overflow-hidden rounded-full">
        <div style={{ width: `${pN}%` }} className="bg-emerald-500 dark:bg-emerald-400" />
        <div style={{ width: `${pI}%` }} className="bg-amber-400 dark:bg-amber-400" />
        <div style={{ width: `${pS}%` }} className="bg-blue-400 dark:bg-blue-400" />
      </div>
      <div className="flex flex-wrap gap-3">
        {[
          { color: "bg-emerald-500", label: "Neto", pct: pN },
          { color: "bg-amber-400",   label: "IRPF", pct: pI },
          { color: "bg-blue-400",    label: "SS",   pct: pS },
        ].map(({ color, label, pct }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("h-2 w-2 rounded-full", color)} />
            {label} {pct.toFixed(1)} %
          </span>
        ))}
      </div>
    </div>
  )
}

function DesgloseLine({ label, value, indent, bold, separator }: {
  label: string; value: string; indent?: boolean; bold?: boolean; separator?: boolean
}) {
  return (
    <div className={cn(
      "flex items-baseline justify-between py-1.5 text-sm",
      separator ? "border-t border-border mt-1 pt-2.5 font-medium" : "border-b border-border/50 last:border-0",
      indent && "pl-3"
    )}>
      <span className={cn(bold ? "font-medium" : "text-muted-foreground")}>{label}</span>
      <span className={cn("tabular-nums", bold && "font-semibold")}>{value}</span>
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

const CCAA_OPTIONS = Object.entries(CCAA_MAP).map(([k, v]) => ({ value: k, label: v.nombre }))

export function CalcSalarioNeto() {
  const [brutoInput, setBrutoInput] = useState(40000)
  const [modo, setModo] = useState<"anual" | "mensual">("anual")
  const [ccaa, setCcaa] = useState("MAD")
  const [contrato, setContrato] = useState<"indefinido" | "temporal">("indefinido")
  const [hijos3a25, setHijos3a25] = useState(0)
  const [hijosMenores3, setHijosMenores3] = useState(0)
  const [asc65, setAsc65] = useState(0)
  const [asc75, setAsc75] = useState(0)
  const [planPensiones, setPlanPensiones] = useState(0)
  const [cuotasSindicales, setCuotasSindicales] = useState(0)
  const [otrasDeducc, setOtrasDeducc] = useState(0)
  const [showDesglose, setShowDesglose] = useState(false)

  const bruto = modo === "mensual" ? brutoInput * 12 : brutoInput

  const result = useMemo(() => calcular({
    bruto, ccaa, contrato, hijos3a25, hijosMenores3, asc65, asc75,
    planPensiones, cuotasSindicales, otrasDeduccionesCuota: otrasDeducc,
  }), [bruto, ccaa, contrato, hijos3a25, hijosMenores3, asc65, asc75,
       planPensiones, cuotasSindicales, otrasDeducc])

  const isForal = CCAA_MAP[ccaa]?.foral

  const fmt = (n: number) => formatAmountAbs(Math.round(n))
  const fmtPct = (n: number) => `${n.toFixed(2)} %`

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">

        {/* ── Inputs ── */}
        <div className="space-y-5">

          {/* Salario */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <p className={tx.sectionTitle}>Retribución</p>
              <div className="flex overflow-hidden rounded-md border border-input text-xs">
                {(["anual", "mensual"] as const).map((m) => (
                  <button key={m} onClick={() => setModo(m)}
                    className={cn("px-2.5 py-1 capitalize transition-colors",
                      modo === m ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <NumberField
              label={modo === "anual" ? "Salario bruto anual" : "Salario bruto mensual"}
              value={brutoInput} onChange={setBrutoInput}
              suffix={modo === "anual" ? "€/año" : "€/mes"} step={500}
            />
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Comunidad autónoma" value={ccaa} onChange={setCcaa} options={CCAA_OPTIONS} />
              <SelectField label="Tipo de contrato" value={contrato} onChange={(v) => setContrato(v as "indefinido" | "temporal")} options={[
                { value: "indefinido", label: "Indefinido" },
                { value: "temporal",  label: "Temporal" },
              ]} />
            </div>
          </div>

          {/* Situación familiar */}
          <div className="space-y-2">
            <p className={tx.sectionTitle}>Situación familiar</p>
            <div className="space-y-2 rounded-lg border border-border p-3">
              <Counter label="Hijos menores de 3 años" value={hijosMenores3} onChange={setHijosMenores3} />
              <Counter label="Hijos de 3 a 25 años"   value={hijos3a25}     onChange={setHijos3a25} />
              <Counter label="Ascendientes ≥ 65 años (no ≥ 75)" value={asc65} onChange={setAsc65} />
              <Counter label="Ascendientes ≥ 75 años" value={asc75} onChange={setAsc75} />
            </div>
          </div>

          {/* Deducciones */}
          <div className="space-y-2">
            <p className={tx.sectionTitle}>Deducciones</p>
            <div className="space-y-3 rounded-lg border border-border p-3">
              <NumberField
                label="Aportación plan de pensiones"
                value={planPensiones} onChange={setPlanPensiones}
                suffix="€/año" step={100}
                hint="Reduce la base imponible (máx. 1.500 € o 30 % del RNT)"
              />
              <NumberField
                label="Cuotas sindicales / colegio profesional"
                value={cuotasSindicales} onChange={setCuotasSindicales}
                suffix="€/año" step={50}
                hint="Reducen la base imponible (máx. 500 €)"
              />
              <NumberField
                label="Otras deducciones en cuota"
                value={otrasDeducc} onChange={setOtrasDeducc}
                suffix="€/año" step={100}
                hint="Alquiler habitual (pre-2015), donativos, etc."
              />
            </div>
          </div>

          {isForal && (
            <p className={cn(tx.caption, "rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400")}>
              † Territorio foral: escala completa aplicada directamente. Las deducciones y mínimos forales pueden diferir ligeramente.
            </p>
          )}
        </div>

        {/* ── Resultados ── */}
        {result ? (
          <div className="space-y-3">
            <StatCard
              label="Salario neto mensual"
              value={fmt(result.neto / 12)}
              sub={`${fmt(result.neto)} netos al año`}
              highlight
            />
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="IRPF a pagar" value={fmt(result.cuotaLiquida)}
                sub={`Tipo efectivo ${fmtPct(result.tipoEfectivoIRPF)}`} />
              <StatCard label="Cotización SS" value={fmt(result.ss)}
                sub={`${fmtPct(result.ss / bruto * 100)} del bruto`} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Retención total" value={fmtPct(result.tipoEfectivoTotal)}
                sub="IRPF + SS sobre bruto" />
              <StatCard label="Tipo marginal" value={fmtPct(result.tipoMarginal)}
                sub="Tipo al que tributa el último €" />
            </div>

            {result.ahorroFiscalDeducciones > 0 && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-950">
                <p className={cn(tx.caption, "text-emerald-700 dark:text-emerald-400")}>Ahorro fiscal por deducciones</p>
                <p className="mt-0.5 text-base font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {fmt(result.ahorroFiscalDeducciones)} / año
                </p>
              </div>
            )}

            <div className="space-y-1.5 pt-1">
              <p className={tx.label}>Distribución del salario bruto</p>
              <BreakdownBar neto={result.neto} irpf={result.cuotaLiquida} ss={result.ss} total={bruto} />
            </div>

            <button onClick={() => setShowDesglose(!showDesglose)}
              className="w-full rounded-lg border border-border py-2 text-sm text-muted-foreground transition-colors hover:bg-muted">
              {showDesglose ? "Ocultar desglose" : "Ver desglose completo"}
            </button>

            {showDesglose && (
              <div className="rounded-lg border border-border px-4 py-2">
                <DesgloseLine label="Salario bruto anual"              value={fmt(bruto)}                    bold />
                <DesgloseLine label="(−) Cotización SS trabajador"     value={`−${fmt(result.ss)}`}          indent />
                <DesgloseLine label="(−) Gastos deducibles (2.000 €)"  value={`−${fmt(2000)}`}               indent />
                <DesgloseLine label="Rendimiento neto del trabajo"      value={fmt(result.rnt)}               bold />
                <DesgloseLine label="(−) Reducción Art. 20 LIRPF"      value={`−${fmt(result.reduccionArt20)}`} indent />
                <DesgloseLine label="Base imponible"                    value={fmt(result.baseImponible)}     bold />
                {result.reducciones > 0 && (
                  <DesgloseLine label="(−) Reducciones base (PP / cuotas)" value={`−${fmt(result.reducciones)}`} indent />
                )}
                <DesgloseLine label="Base liquidable general"           value={fmt(result.baseLiquidable)}    bold />
                <DesgloseLine label="Mínimo personal y familiar"        value={fmt(result.minimo)}            indent />
                <DesgloseLine label="Cuota íntegra IRPF"               value={fmt(result.cuotaIRPF)}         bold />
                {result.deduccionMat > 0 && (
                  <DesgloseLine label="(−) Deducción maternidad"        value={`−${fmt(result.deduccionMat)}`} indent />
                )}
                {result.otrasDeducc > 0 && (
                  <DesgloseLine label="(−) Otras deducciones cuota"     value={`−${fmt(result.otrasDeducc)}`}  indent />
                )}
                <DesgloseLine label="IRPF a pagar"                     value={fmt(result.cuotaLiquida)}      bold />
                <DesgloseLine label="Salario neto anual"               value={fmt(result.neto)}              bold separator />
                <DesgloseLine label="Salario neto mensual"             value={fmt(result.neto / 12)}         bold />
              </div>
            )}
          </div>
        ) : (
          <p className={tx.secondary}>Introduce un salario para calcular.</p>
        )}
      </div>
    </div>
  )
}
