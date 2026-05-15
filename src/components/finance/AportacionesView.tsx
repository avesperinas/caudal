"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, Plus, Trash2, Pencil, AlertCircle } from "lucide-react"
import { PersonalTransaction, Product, Entity } from "@prisma/client"
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

type ProductWithEntity = Product & { entity: Entity }
type AportacionFull = PersonalTransaction & { product: ProductWithEntity | null }

type Props = {
  aportaciones: AportacionFull[]
  products: ProductWithEntity[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fieldCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"

function formatDay(dateStr: string | null, year: number, month: number): string {
  if (dateStr) {
    const d = new Date(dateStr)
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })
  }
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
  return `${months[month - 1]} ${year}`
}

// ─── AportacionDialog ─────────────────────────────────────────────────────────

function AportacionDialog({
  open, onClose, products, editing, defaultYear, defaultMonth,
}: {
  open: boolean; onClose: () => void
  products: ProductWithEntity[]
  editing: AportacionFull | null
  defaultYear: number
  defaultMonth: number | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const today = new Date()
  const computedDefault = defaultMonth
    ? `${defaultYear}-${String(defaultMonth).padStart(2, "0")}-01`
    : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  const editDate = editing?.date
    ? new Date(editing.date).toISOString().slice(0, 10)
    : null

  const [date, setDate]           = useState(editDate ?? computedDefault)
  const [productId, setProductId] = useState(editing?.productId ?? "")
  const [amount, setAmount]       = useState(editing ? String(editing.amount) : "")
  const [madeByMe, setMadeByMe]   = useState(editing?.madeByMe ?? true)
  const [note, setNote]           = useState(editing?.note ?? "")

  const selectedProduct = products.find(p => p.id === productId)
  const showMadeByMe = selectedProduct && selectedProduct.ownership < 100

  const dateObj = new Date(date + "T00:00:00Z")
  const year  = dateObj.getUTCFullYear()
  const month = dateObj.getUTCMonth() + 1

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount.replace(",", "."))
    if (isNaN(amt) || amt <= 0 || !productId) return
    startTransition(async () => {
      if (editing) {
        await updatePersonalTransaction(editing.id, {
          amount: amt, productId, date,
          madeByMe: showMadeByMe ? madeByMe : true,
          note: note || null,
        })
      } else {
        await createPersonalTransaction({
          year, month, type: "TRANSFER",
          amount: amt, productId, date,
          madeByMe: showMadeByMe ? madeByMe : true,
          note: note || undefined,
        })
      }
      router.refresh()
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogTitle>{editing ? "Editar aportación" : "Nueva aportación"}</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <p className={tx.label}>Fecha</p>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className={fieldCls} />
          </div>
          <div className="space-y-1.5">
            <p className={tx.label}>Producto</p>
            <select value={productId} onChange={e => setProductId(e.target.value)} className={fieldCls} required>
              <option value="">— Seleccionar —</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.entity.name} · {p.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <p className={tx.label}>Importe</p>
            <input autoFocus type="text" inputMode="decimal"
              value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0,00" className={fieldCls} />
          </div>
          {showMadeByMe && (
            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
              <AlertCircle className="size-4 shrink-0 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm font-medium">Titularidad {selectedProduct.ownership}%</p>
                <p className="text-xs text-muted-foreground">¿Esta aportación la has hecho tú?</p>
              </div>
              <button type="button" onClick={() => setMadeByMe(v => !v)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  madeByMe
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground",
                )}>
                {madeByMe ? "Sí, yo" : "No, otro"}
              </button>
            </div>
          )}
          <div className="space-y-1.5">
            <p className={tx.label}>Nota (opcional)</p>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} className={fieldCls} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
              Cancelar
            </button>
            <button type="submit" disabled={pending}
              className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
              {pending ? "Guardando…" : editing ? "Guardar" : "Añadir"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Fila de aportación ───────────────────────────────────────────────────────

function AportacionRow({ a, onEdit, onDelete }: {
  a: AportacionFull; onEdit: () => void; onDelete: () => void
}) {
  return (
    <div className="group flex items-center gap-3 border-b border-border/50 last:border-0 px-4 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {a.product ? `${a.product.entity.name} · ${a.product.name}` : "Sin producto"}
        </p>
        <div className="flex items-center gap-2">
          <p className={tx.caption}>{formatDay(a.date ? a.date.toString() : null, a.year, a.month)}</p>
          {!a.madeByMe && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">cotitular</span>
          )}
          {a.note && <p className={cn(tx.caption, "truncate")}>{a.note}</p>}
        </div>
      </div>
      <span className={cn(
        "tabular-nums text-sm font-medium shrink-0",
        a.madeByMe ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground",
      )}>
        {formatAmountAbs(a.amount)}
      </span>
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

// ─── Componente principal ─────────────────────────────────────────────────────

export function AportacionesView({ aportaciones, products }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const now = new Date()
  const qpYear  = Number(searchParams.get("year"))
  const qpMonth = Number(searchParams.get("month"))
  const initYear  = Number.isFinite(qpYear)  && qpYear  > 0                ? qpYear  : now.getFullYear()
  const initMonth = Number.isFinite(qpMonth) && qpMonth >= 1 && qpMonth <= 12 ? qpMonth : null

  const [selectedYear, setSelectedYear]   = useState(initYear)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(initMonth)
  const [dialog, setDialog] = useState<{ open: boolean; editing: AportacionFull | null }>({ open: false, editing: null })

  const isCY = selectedYear === now.getFullYear()
  const cm   = now.getMonth() + 1

  const byYear    = aportaciones.filter(a => a.year === selectedYear)
  const yearTotal = byYear.filter(a => a.madeByMe).reduce((s, a) => s + a.amount, 0)
  const yearCount = byYear.filter(a => a.madeByMe).length

  const monthData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const items = byYear.filter(a => a.month === month)
    const total = items.filter(a => a.madeByMe).reduce((s, a) => s + a.amount, 0)
    return { month, items, total, hasData: items.length > 0 }
  })

  // Product breakdown
  const productTotals = products
    .map(p => ({
      name: `${p.entity.name} · ${p.name}`,
      total: byYear.filter(a => a.productId === p.id && a.madeByMe).reduce((s, a) => s + a.amount, 0),
    }))
    .filter(p => p.total > 0)
    .sort((a, b) => b.total - a.total)

  const mData = selectedMonth !== null ? monthData.find(m => m.month === selectedMonth) : null

  function handleDelete(id: string) {
    startTransition(async () => { await deletePersonalTransaction(id); router.refresh() })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Aportaciones</h1>
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
        <div className="rounded-2xl px-5 py-4 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 col-span-2 sm:col-span-1">
          <p className="text-xs font-medium opacity-70 mb-1">Total aportado {selectedYear}</p>
          <p className="text-3xl font-semibold tabular-nums">{formatAmountAbs(yearTotal)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-5 py-4 col-span-2 sm:col-span-1">
          <p className="text-xs font-medium text-muted-foreground mb-1">Aportaciones</p>
          <p className={cn("text-3xl font-semibold tabular-nums", yearCount > 0 ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground")}>
            {yearCount > 0 ? yearCount : "—"}
          </p>
        </div>
      </div>

      {/* ── Grid de meses ── */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {monthData.map(({ month, total, hasData }) => {
          const isCur = isCY && month === cm
          return (
            <button key={month} onClick={() => setSelectedMonth(month)}
              className={cn(
                "flex flex-col items-start gap-2 rounded-2xl border p-3 text-left w-full transition-all",
                "hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm",
                isCur ? "border-primary/30 bg-primary/5" : "border-border bg-card",
              )}>
              <p className={cn("text-sm font-semibold", isCur && "text-primary")}>{MONTHS[month - 1]}</p>
              {hasData
                ? <p className="tabular-nums text-sm font-medium text-blue-600 dark:text-blue-400">{formatAmountAbs(total)}</p>
                : <p className={tx.caption}>Sin datos</p>
              }
            </button>
          )
        })}
      </div>

      {/* ── Desglose por producto ── */}
      {productTotals.length > 0 && (
        <div>
          <p className={cn(tx.sectionLabel, "mb-3")}>Por producto</p>
          <div className="rounded-xl border border-border overflow-hidden">
            {productTotals.map(({ name, total }) => (
              <div key={name} className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-0">
                <p className="flex-1 text-sm truncate">{name}</p>
                <div className="w-24 h-1.5 rounded-full bg-blue-100 dark:bg-blue-950 overflow-hidden shrink-0">
                  <div
                    className="h-full rounded-full bg-blue-400 dark:bg-blue-500"
                    style={{ width: `${yearTotal > 0 ? Math.min(100, (total / yearTotal) * 100) : 0}%` }}
                  />
                </div>
                <p className="tabular-nums text-sm font-medium w-20 text-right text-blue-600 dark:text-blue-400 shrink-0">
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
          {selectedMonth !== null && mData && (
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

                {/* Total del mes */}
                {mData.total > 0 && (
                  <div className="rounded-xl px-4 py-3 flex items-center justify-between bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                    <p className="text-sm font-medium opacity-80">Total aportado</p>
                    <p className="text-xl font-semibold tabular-nums">{formatAmountAbs(mData.total)}</p>
                  </div>
                )}

                {/* Lista */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-muted/30">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-500">Aportaciones</p>
                    <button onClick={() => setDialog({ open: true, editing: null })}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                      <Plus className="size-3" /> Añadir
                    </button>
                  </div>
                  {mData.items.length === 0
                    ? <p className={cn(tx.caption, "px-4 py-3")}>Sin aportaciones este mes</p>
                    : mData.items.map(a => (
                        <AportacionRow
                          key={a.id} a={a}
                          onEdit={() => setDialog({ open: true, editing: a })}
                          onDelete={() => handleDelete(a.id)}
                        />
                      ))
                  }
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo fuera del modal para evitar anidamiento */}
      <AportacionDialog
        key={dialog.editing?.id ?? `new-${selectedMonth}`}
        open={dialog.open}
        onClose={() => setDialog(d => ({ ...d, open: false }))}
        products={products}
        editing={dialog.editing}
        defaultYear={selectedYear}
        defaultMonth={selectedMonth}
      />
    </div>
  )
}
