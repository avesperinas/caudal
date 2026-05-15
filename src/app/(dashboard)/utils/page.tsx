"use client"

import { useState } from "react"
import { ArrowLeft, Flame, Home, TrendingUp, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { tx } from "@/lib/styles"
import { CalcHipoteca } from "@/components/finance/CalcHipoteca"
import { CalcInteresCompuesto } from "@/components/finance/CalcInteresCompuesto"
import { CalcFIRE } from "@/components/finance/CalcFIRE"
import { CalcSalarioNeto } from "@/components/finance/CalcSalarioNeto"

// ─── Registro de herramientas ─────────────────────────────────────────────────

const TOOLS = [
  {
    id: "hipoteca",
    label: "Hipoteca",
    description: "Calcula la cuota mensual y coste total de un préstamo hipotecario.",
    icon: Home,
    component: CalcHipoteca,
  },
  {
    id: "interes-compuesto",
    label: "Interés compuesto",
    description: "Simula el crecimiento de un capital con aportaciones periódicas.",
    icon: TrendingUp,
    component: CalcInteresCompuesto,
  },
  {
    id: "fire",
    label: "Calculadora FIRE",
    description: "Calcula cuándo alcanzarás la independencia financiera, ajustado a inflación.",
    icon: Flame,
    component: CalcFIRE,
  },
  {
    id: "salario-neto",
    label: "Salario neto",
    description: "Calcula tu salario neto en España 2026 por CCAA, con SS e IRPF precisos.",
    icon: Wallet,
    component: CalcSalarioNeto,
  },
] as const

type ToolId = (typeof TOOLS)[number]["id"]

// ─── Grid de apps ─────────────────────────────────────────────────────────────

function ToolGrid({ onSelect }: { onSelect: (id: ToolId) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {TOOLS.map((tool) => {
        const Icon = tool.icon
        return (
          <button
            key={tool.id}
            onClick={() => onSelect(tool.id)}
            className={cn(
              "group flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 text-left",
              "transition-colors hover:border-primary/30 hover:bg-primary/5",
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-primary/10">
              <Icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium leading-tight">{tool.label}</p>
              <p className={cn(tx.caption, "mt-1 leading-snug")}>{tool.description}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

// ─── Vista de herramienta activa ──────────────────────────────────────────────

function ToolView({ id, onBack }: { id: ToolId; onBack: () => void }) {
  const tool = TOOLS.find((t) => t.id === id)!
  const Component = tool.component

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Herramientas
      </button>

      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{tool.label}</h2>
        <p className={tx.secondary}>{tool.description}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <Component />
      </div>
    </div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function HerramientasPage() {
  const [active, setActive] = useState<ToolId | null>(null)

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      {!active && (
        <div>
          <h1 className="text-xl font-semibold">Herramientas</h1>
          <p className={cn(tx.secondary, "mt-0.5")}>Simuladores y calculadoras financieras.</p>
        </div>
      )}

      {active ? (
        <ToolView id={active} onBack={() => setActive(null)} />
      ) : (
        <ToolGrid onSelect={setActive} />
      )}
    </div>
  )
}
