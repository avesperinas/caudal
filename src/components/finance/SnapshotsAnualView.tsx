"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Loader2, Trash2 } from "lucide-react"
import { ProductType } from "@prisma/client"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { EntityIcon } from "@/components/finance/EntityIcon"
import { cn } from "@/lib/utils"
import { tx } from "@/lib/styles"
import { MONTHS } from "@/lib/gastos"
import { formatAmountRound, formatAmountAbs, formatAmount, formatPctSigned } from "@/lib/format"
import { toDateInput, PRODUCT_TYPE_LABELS } from "@/lib/products"
import { saveSnapshots, deleteSnapshotDate } from "@/app/(dashboard)/patrimonio/actions"

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Product = {
  id: string
  name: string
  type: ProductType
  ownership: number
  entity: { name: string; color: string; icon: string | null }
}

type SnapshotRow = {
  productId: string
  value: number
  date: Date
}

type Props = {
  products: Product[]
  snapshots: SnapshotRow[]
}

// ─── Utils ────────────────────────────────────────────────────────────────────

const formatEur     = formatAmountRound
const formatEurFull = formatAmountAbs
const signedEur     = formatAmount
const signedPct     = (v: number) => formatPctSigned(v, 1)

/** Valor total proporcional de todos los productos en una fecha */
function totalForDate(snapshotsByDate: Map<string, Record<string, number>>, dateKey: string, products: Product[]): number {
  const byProduct = snapshotsByDate.get(dateKey)
  if (!byProduct) return 0
  return products.reduce((acc, p) => acc + (byProduct[p.id] ?? 0) * (p.ownership / 100), 0)
}

/** Agrupa snapshots por "YYYY-MM" para mostrar en el grid de meses */
function buildMonthMap(snapshots: SnapshotRow[], year: number): Map<number, { dateKey: string; total: number; byProduct: Record<string, number> }> {
  const map = new Map<number, { dateKey: string; total: number; byProduct: Record<string, number> }>()
  for (const s of snapshots) {
    const d = new Date(s.date)
    if (d.getUTCFullYear() !== year) continue
    const month = d.getUTCMonth() + 1
    const dateKey = toDateInput(d)
    if (!map.has(month)) {
      map.set(month, { dateKey, total: 0, byProduct: {} })
    }
    const entry = map.get(month)!
    entry.byProduct[s.productId] = s.value
    // Recalculate when we add more products
  }
  return map
}

// ─── Formulario inline de snapshot ───────────────────────────────────────────

function SnapshotModalForm({ products, defaultDate, existingValues, onClose }: {
  products: Product[]
  defaultDate: string
  existingValues: Record<string, number>
  onClose: () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [date, setDate] = useState(defaultDate)
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(Object.entries(existingValues).map(([k, v]) => [k, String(v)]))
  )

  const hasValues = products.some(p => !isNaN(parseFloat(values[p.id] ?? "")))

  const total = products.reduce((acc, p) => {
    const v = parseFloat(values[p.id] ?? "")
    return acc + (isNaN(v) ? 0 : v * (p.ownership / 100))
  }, 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const snapshots = products
      .map(p => ({ productId: p.id, value: parseFloat(values[p.id] ?? "") }))
      .filter(s => !isNaN(s.value))
    if (!snapshots.length) return
    startTransition(async () => {
      await saveSnapshots(date, snapshots)
      router.refresh()
      onClose()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Fecha */}
      <div className="space-y-1.5">
        <p className={tx.label}>Fecha</p>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring max-w-48"
        />
      </div>

      {/* Tabla de productos */}
      <div className="space-y-1.5">
        <p className={tx.label}>Valor de cada producto</p>
        <div className="rounded-xl border border-border overflow-hidden">
          {products.map(p => (
            <div key={p.id} className="flex items-center gap-3 border-b border-border/50 last:border-0 px-4 py-3">
              <EntityIcon iconName={p.entity.icon} color={p.entity.color} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className={tx.caption}>{p.entity.name} · {p.ownership}%</p>
              </div>
              <div className="relative w-32 shrink-0">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={values[p.id] ?? ""}
                  onChange={e => setValues(v => ({ ...v, [p.id]: e.target.value }))}
                  className="w-full rounded-lg border border-input bg-background pr-7 py-2 text-right text-sm tabular-nums outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total proporcional */}
      {hasValues && (
        <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
          <span className="text-sm text-muted-foreground">Patrimonio proporcional</span>
          <span className="font-semibold tabular-nums">{formatEurFull(total)}</span>
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose}
          className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
          Cancelar
        </button>
        <button type="submit" disabled={isPending || !hasValues}
          className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-60 flex items-center justify-center gap-2">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Guardar snapshot
        </button>
      </div>
    </form>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function SnapshotsAnualView({ products, snapshots }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const now = new Date()
  const [selectedYear, setSelectedYear]   = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [deletingDate, setDeletingDate]   = useState<string | null>(null)

  const isCY = selectedYear === now.getFullYear()
  const cm   = now.getMonth() + 1

  // Calcular el total patrimonial por fecha para usar en KPIs
  const snapshotsByDate = new Map<string, Record<string, number>>()
  for (const s of snapshots) {
    const key = toDateInput(new Date(s.date))
    if (!snapshotsByDate.has(key)) snapshotsByDate.set(key, {})
    snapshotsByDate.get(key)![s.productId] = s.value
  }

  // Línea temporal ordenada
  const timeline = Array.from(snapshotsByDate.keys()).sort()
  const lastDateKey = timeline.at(-1)
  const prevDateKey = timeline.at(-2)

  const lastTotal = lastDateKey ? totalForDate(snapshotsByDate, lastDateKey, products) : null
  const prevTotal = prevDateKey ? totalForDate(snapshotsByDate, prevDateKey, products) : null
  const diff      = lastTotal !== null && prevTotal !== null ? lastTotal - prevTotal : null
  const diffPct   = diff !== null && prevTotal && prevTotal > 0 ? (diff / prevTotal) * 100 : null

  // Meses del año seleccionado
  const monthMap = buildMonthMap(snapshots, selectedYear)

  // Calcular totales por mes (después de construir el mapa)
  for (const [month, entry] of monthMap) {
    entry.total = products.reduce((acc, p) => acc + (entry.byProduct[p.id] ?? 0) * (p.ownership / 100), 0)
    monthMap.set(month, entry)
  }

  const mEntry = selectedMonth !== null ? monthMap.get(selectedMonth) : null

  function handleDelete(dateKey: string) {
    setDeletingDate(dateKey)
    startTransition(async () => {
      await deleteSnapshotDate(dateKey)
      router.refresh()
      setDeletingDate(null)
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Snapshots</h1>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setSelectedYear(y => y - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
            <ChevronLeft className="size-4" />
          </button>
          <span className="w-12 text-center text-sm font-medium">{selectedYear}</span>
          <button onClick={() => setSelectedYear(y => y + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl px-5 py-4 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400 col-span-2 sm:col-span-1">
          <p className="text-xs font-medium opacity-70 mb-1">Patrimonio actual</p>
          <p className="text-3xl font-semibold tabular-nums">
            {lastTotal !== null ? formatEur(lastTotal) : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-5 py-4 col-span-2 sm:col-span-1">
          <p className="text-xs font-medium text-muted-foreground mb-1">vs mes anterior</p>
          {diff !== null ? (
            <>
              <p className={cn(
                "text-3xl font-semibold tabular-nums",
                diff >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400",
              )}>
                {signedEur(diff)}
              </p>
              {diffPct !== null && (
                <p className={cn(
                  "text-xs tabular-nums mt-0.5",
                  diffPct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400",
                )}>
                  {signedPct(diffPct)}
                </p>
              )}
            </>
          ) : (
            <p className="text-3xl font-semibold text-muted-foreground">—</p>
          )}
        </div>
      </div>

      {/* ── Grid de meses ── */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
          const entry  = monthMap.get(month)
          const hasData = !!entry
          const isCur   = isCY && month === cm
          return (
            <button key={month} onClick={() => setSelectedMonth(month)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-2xl border p-3 text-left w-full transition-all",
                "hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm",
                isCur ? "border-primary/30 bg-primary/5" : "border-border bg-card",
              )}>
              <p className={cn("text-sm font-semibold", isCur && "text-primary")}>{MONTHS[month - 1]}</p>
              {hasData
                ? <p className="tabular-nums text-sm font-medium text-indigo-600 dark:text-indigo-400">{formatEur(entry.total)}</p>
                : <p className={tx.caption}>Sin datos</p>
              }
            </button>
          )
        })}
      </div>

      {/* ── Distribución de productos (último snapshot) ── */}
      {lastDateKey && (
        <div>
          <p className={cn(tx.sectionLabel, "mb-3")}>Distribución actual</p>
          <div className="rounded-xl border border-border overflow-hidden">
            {products
              .map(p => ({
                p,
                value: (snapshotsByDate.get(lastDateKey)?.[p.id] ?? 0) * (p.ownership / 100),
              }))
              .filter(({ value }) => value > 0)
              .sort((a, b) => b.value - a.value)
              .map(({ p, value }) => (
                <div key={p.id} className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-0">
                  <EntityIcon iconName={p.entity.icon} color={p.entity.color} size="sm" className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{p.name}</p>
                    <p className={tx.caption}>{p.entity.name} · {PRODUCT_TYPE_LABELS[p.type]}</p>
                  </div>
                  <p className="tabular-nums text-sm font-medium shrink-0">{formatEur(value)}</p>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* ── Modal de mes ── */}
      <Dialog open={selectedMonth !== null} onOpenChange={o => { if (!o) setSelectedMonth(null) }}>
        <DialogContent className="max-w-2xl w-full p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
          {selectedMonth !== null && (
            <>
              <DialogTitle className="sr-only">{MONTHS[selectedMonth - 1]} {selectedYear}</DialogTitle>

              {/* Nav */}
              <div className="flex items-center gap-2 px-6 py-4 pr-14 border-b border-border shrink-0">
                <button onClick={() => setSelectedMonth(m => Math.max(1, (m ?? 1) - 1))}
                  disabled={selectedMonth === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors">
                  <ChevronLeft className="size-4" />
                </button>
                <p className="flex-1 text-center text-sm font-semibold">{MONTHS[selectedMonth - 1]} {selectedYear}</p>
                <button onClick={() => setSelectedMonth(m => Math.min(12, (m ?? 12) + 1))}
                  disabled={selectedMonth === 12}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors">
                  <ChevronRight className="size-4" />
                </button>
              </div>

              {/* Contenido */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

                {/* Total del mes si existe */}
                {mEntry && (
                  <div className="flex items-center justify-between rounded-xl px-4 py-3 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <div>
                      <p className="text-sm font-medium opacity-80">Patrimonio registrado</p>
                      <p className={tx.caption}>{mEntry.dateKey}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-semibold tabular-nums">{formatEur(mEntry.total)}</p>
                      <button
                        onClick={() => handleDelete(mEntry.dateKey)}
                        disabled={isPending && deletingDate === mEntry.dateKey}
                        className="rounded p-1 text-indigo-400 hover:text-red-500 transition-colors"
                      >
                        {isPending && deletingDate === mEntry.dateKey
                          ? <Loader2 className="size-3.5 animate-spin" />
                          : <Trash2 className="size-3.5" />
                        }
                      </button>
                    </div>
                  </div>
                )}

                {/* Formulario */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                    {mEntry ? "Editar snapshot" : "Nuevo snapshot"}
                  </p>
                  <SnapshotModalForm
                    key={`${selectedYear}-${selectedMonth}`}
                    products={products}
                    defaultDate={`${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`}
                    existingValues={mEntry?.byProduct ?? {}}
                    onClose={() => setSelectedMonth(null)}
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
