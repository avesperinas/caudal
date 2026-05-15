"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react"
import { PersonalCategory, PersonalTransaction } from "@prisma/client"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { tx } from "@/lib/styles"
import { formatAmountAbs } from "@/lib/format"
import { MONTHS } from "@/lib/gastos"
import {
  createPersonalTransaction,
  updatePersonalTransaction,
  deletePersonalTransaction,
} from "@/app/(dashboard)/personal/actions"

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TxWithCat = PersonalTransaction & { category: PersonalCategory | null }

type Props = {
  year: number
  monthData: { month: number; transactions: TxWithCat[] }[]
  categories: PersonalCategory[]
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function parseAmt(s: string) { return parseFloat(s.replace(",", ".")) }

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
const COLOR    = { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" }

// ─── Quick-add ────────────────────────────────────────────────────────────────

function QuickAdd({ year, month, categories }: { year: number; month: number; categories: PersonalCategory[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [amount, setAmount]         = useState("")
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "")
  const ref = useRef<HTMLInputElement>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseAmt(amount)
    if (isNaN(amt) || amt <= 0) return
    startTransition(async () => {
      await createPersonalTransaction({ year, month, type: "INCOME", amount: amt, categoryId: categoryId || undefined })
      setAmount("")
      router.refresh()
      ref.current?.focus()
    })
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2 bg-muted/30 px-4 py-2.5">
      <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
        className="flex-1 min-w-0 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
        <option value="">Sin categoría</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input ref={ref} type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
        placeholder="0,00"
        className="w-28 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-ring" />
      <button type="submit" disabled={pending || !amount.trim()}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-40 transition-opacity">
        <Plus className="size-4" />
      </button>
    </form>
  )
}

// ─── Fila de transacción ──────────────────────────────────────────────────────

function TxRow({ t, onEdit, onDelete }: { t: TxWithCat; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="group flex items-center gap-3 border-b border-border/50 last:border-0 px-4 py-2.5">
      <p className="flex-1 text-sm truncate">{t.category?.name ?? "Sin categoría"}</p>
      {t.note && <p className={cn(tx.caption, "truncate hidden sm:block max-w-[100px]")}>{t.note}</p>}
      <span className={cn("tabular-nums text-sm font-medium shrink-0", COLOR.text)}>{formatAmountAbs(t.amount)}</span>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={onEdit} className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <Pencil className="size-3.5" />
        </button>
        <button onClick={onDelete} className="rounded p-1 text-muted-foreground hover:text-red-500 transition-colors">
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Diálogo de edición ───────────────────────────────────────────────────────

function EditDialog({ open, onClose, editing, categories }: {
  open: boolean; onClose: () => void; editing: TxWithCat; categories: PersonalCategory[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [amount, setAmount]         = useState(String(editing.amount))
  const [categoryId, setCategoryId] = useState(editing.categoryId ?? "")
  const [note, setNote]             = useState(editing.note ?? "")

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseAmt(amount)
    if (isNaN(amt) || amt <= 0) return
    startTransition(async () => {
      await updatePersonalTransaction(editing.id, { amount: amt, categoryId: categoryId || null, note: note || null })
      router.refresh(); onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogTitle>Editar ingreso</DialogTitle>
        <form onSubmit={submit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <p className={tx.label}>Categoría</p>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputCls}>
              <option value="">Sin categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <p className={tx.label}>Importe</p>
            <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0,00" className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <p className={tx.label}>Nota</p>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} className={inputCls} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={pending} className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
              {pending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function IngresosAnualView({ year, monthData, categories }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [editing, setEditing]             = useState<TxWithCat | null>(null)

  const now  = new Date()
  const isCY = now.getFullYear() === year
  const cm   = now.getMonth() + 1

  const allTxs      = monthData.flatMap(m => m.transactions)
  const annualTotal = allTxs.reduce((s, t) => s + t.amount, 0)
  const monthsWithData = monthData.filter(m => m.transactions.length > 0).length
  const avgMonthly  = monthsWithData > 0 ? annualTotal / monthsWithData : 0

  const mTxs   = selectedMonth !== null ? (monthData.find(m => m.month === selectedMonth)?.transactions ?? []) : []
  const mTotal = mTxs.reduce((s, t) => s + t.amount, 0)

  // Category breakdown
  const categoryTotals = categories
    .map(cat => ({
      name: cat.name,
      total: allTxs.filter(t => t.categoryId === cat.id).reduce((s, t) => s + t.amount, 0),
    }))
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)

  function handleDelete(id: string) {
    startTransition(async () => { await deletePersonalTransaction(id); router.refresh() })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Ingresos</h1>
        <div className="flex items-center gap-1.5">
          <Link href={`/ingresos/${year - 1}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
            <ChevronLeft className="size-4" />
          </Link>
          <span className="w-12 text-center text-sm font-medium">{year}</span>
          <Link href={`/ingresos/${year + 1}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 gap-3">
        <div className={cn("rounded-2xl px-5 py-4 col-span-2 sm:col-span-1", COLOR.bg)}>
          <p className="text-xs font-medium opacity-70 mb-1">Total {year}</p>
          <p className="text-3xl font-semibold tabular-nums">{formatAmountAbs(annualTotal)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-5 py-4 col-span-2 sm:col-span-1">
          <p className="text-xs font-medium text-muted-foreground mb-1">Promedio mensual</p>
          <p className={cn("text-3xl font-semibold tabular-nums", annualTotal > 0 ? COLOR.text : "text-muted-foreground")}>
            {monthsWithData > 0 ? formatAmountAbs(avgMonthly) : "—"}
          </p>
        </div>
      </div>

      {/* ── Grid de meses ── */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {monthData.map(({ month, transactions }) => {
          const total   = transactions.reduce((s, t) => s + t.amount, 0)
          const hasData = transactions.length > 0
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
                ? <p className={cn("tabular-nums text-sm font-medium", COLOR.text)}>{formatAmountAbs(total)}</p>
                : <p className={tx.caption}>Sin datos</p>
              }
            </button>
          )
        })}
      </div>

      {/* ── Desglose por categoría ── */}
      {categoryTotals.length > 0 && (
        <div>
          <p className={cn(tx.sectionLabel, "mb-3")}>Por categoría</p>
          <div className="rounded-xl border border-border overflow-hidden">
            {categoryTotals.map(({ name, total }) => (
              <div key={name} className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-0">
                <p className="flex-1 text-sm">{name}</p>
                <div className="w-24 h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400"
                    style={{ width: `${annualTotal > 0 ? Math.min(100, (total / annualTotal) * 100) : 0}%` }}
                  />
                </div>
                <p className={cn("tabular-nums text-sm font-medium w-20 text-right shrink-0", COLOR.text)}>
                  {formatAmountAbs(total)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Modal de mes ── */}
      <Dialog open={selectedMonth !== null} onOpenChange={o => { if (!o) setSelectedMonth(null) }}>
        <DialogContent className="max-w-2xl w-full p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
          {selectedMonth !== null && (
            <>
              <DialogTitle className="sr-only">{MONTHS[selectedMonth - 1]} {year}</DialogTitle>

              {/* Nav */}
              <div className="flex items-center gap-2 px-6 py-4 pr-14 border-b border-border shrink-0">
                <button onClick={() => setSelectedMonth(m => Math.max(1, (m ?? 1) - 1))}
                  disabled={selectedMonth === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors">
                  <ChevronLeft className="size-4" />
                </button>
                <p className="flex-1 text-center text-sm font-semibold">{MONTHS[selectedMonth - 1]} {year}</p>
                <button onClick={() => setSelectedMonth(m => Math.min(12, (m ?? 12) + 1))}
                  disabled={selectedMonth === 12}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors">
                  <ChevronRight className="size-4" />
                </button>
              </div>

              {/* Contenido desplazable */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

                {/* Total del mes */}
                {mTotal > 0 && (
                  <div className={cn("rounded-xl px-4 py-3 flex items-center justify-between", COLOR.bg)}>
                    <p className="text-sm font-medium opacity-80">Total</p>
                    <p className="text-xl font-semibold tabular-nums">{formatAmountAbs(mTotal)}</p>
                  </div>
                )}

                {/* Lista + quick-add */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-border/50 bg-muted/30">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-500">Ingresos</p>
                  </div>
                  {mTxs.length === 0 && (
                    <p className={cn(tx.caption, "px-4 py-3")}>Sin ingresos este mes</p>
                  )}
                  {mTxs.map(t => (
                    <TxRow key={t.id} t={t} onEdit={() => setEditing(t)} onDelete={() => handleDelete(t.id)} />
                  ))}
                  <QuickAdd key={`${year}-${selectedMonth}`} year={year} month={selectedMonth} categories={categories} />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de edición (fuera del modal para evitar anidamiento) */}
      {editing && (
        <EditDialog key={editing.id} open={!!editing} onClose={() => setEditing(null)}
          editing={editing} categories={categories} />
      )}
    </div>
  )
}
