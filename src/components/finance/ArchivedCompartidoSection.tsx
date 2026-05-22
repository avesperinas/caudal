"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Archive } from "lucide-react"
import { cn } from "@/lib/utils"
import { tx } from "@/lib/styles"
import { formatAmountAbs } from "@/lib/format"

type ArchivedData = {
  id: string
  reason: string | null
  archivedAt: string
  data: {
    yearConfigs?: { year: number; person1Name: string; person2Name: string }[]
    expenses?: { year: number; month: number; amount: number; note?: string | null }[]
    deposits?: { year: number; month: number; amount: number; person: number; note?: string | null }[]
  }
}

export function ArchivedCompartidoSection({ archives }: { archives: ArchivedData[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (archives.length === 0) return null

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 md:px-6">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
          <Archive className="size-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-semibold">Datos archivados</p>
            <p className={cn(tx.caption, "mt-0.5")}>
              Tus gastos compartidos anteriores a la colaboración actual.
            </p>
          </div>
        </div>

        <div className="divide-y divide-border">
          {archives.map(archive => {
            const isExpanded = expandedId === archive.id
            const date = new Date(archive.archivedAt)
            const expenseTotal = (archive.data.expenses ?? []).reduce((s, e) => s + e.amount, 0)
            const depositTotal = (archive.data.deposits ?? []).reduce((s, d) => s + d.amount, 0)

            return (
              <div key={archive.id}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : archive.id)}
                  className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-muted/30 transition-colors"
                >
                  {isExpanded
                    ? <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                    : <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {archive.reason ?? "Datos archivados"}
                    </p>
                    <p className={tx.caption}>
                      {date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm tabular-nums font-medium">{formatAmountAbs(expenseTotal)}</p>
                    <p className={tx.caption}>en gastos</p>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-4 space-y-3 border-t border-border/50 bg-muted/10">
                    {/* Resumen por año */}
                    {(() => {
                      const years = new Set([
                        ...(archive.data.expenses ?? []).map(e => e.year),
                        ...(archive.data.deposits ?? []).map(d => d.year),
                      ])
                      return Array.from(years).sort().map(year => {
                        const yearExpenses = (archive.data.expenses ?? []).filter(e => e.year === year)
                        const yearDeposits = (archive.data.deposits ?? []).filter(d => d.year === year)
                        const yearTotal = yearExpenses.reduce((s, e) => s + e.amount, 0)
                        const yearDepTotal = yearDeposits.reduce((s, d) => s + d.amount, 0)

                        return (
                          <div key={year} className="pt-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                              {year}
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="rounded-lg border border-border bg-card p-3">
                                <p className={tx.caption}>Gastos</p>
                                <p className="text-sm font-medium tabular-nums">{formatAmountAbs(yearTotal)}</p>
                                <p className={tx.caption}>{yearExpenses.length} registros</p>
                              </div>
                              <div className="rounded-lg border border-border bg-card p-3">
                                <p className={tx.caption}>Aportaciones</p>
                                <p className="text-sm font-medium tabular-nums">{formatAmountAbs(yearDepTotal)}</p>
                                <p className={tx.caption}>{yearDeposits.length} registros</p>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    })()}

                    {expenseTotal === 0 && depositTotal === 0 && (
                      <p className={cn(tx.caption, "pt-3")}>No había datos en el momento del archivado.</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
