"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Plus, Trash2, Pencil } from "lucide-react"
import { PersonalCategory, PersonalTransaction } from "@prisma/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { tx } from "@/lib/styles"
import { formatAmountAbs } from "@/lib/format"
import { MONTHS } from "@/lib/gastos"
import {
  createPersonalTransaction,
  updatePersonalTransaction,
  deletePersonalTransaction,
} from "@/app/(dashboard)/personal/actions"

type TxFull = PersonalTransaction & { category: PersonalCategory | null }

type Props = {
  year: number
  month: number
  categories: PersonalCategory[]
  transactions: TxFull[]
}

const inputCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className={tx.label}>{label}</p>
      {children}
    </div>
  )
}

function IngresosDialog({
  open, onClose, year, month, categories, editing,
}: {
  open: boolean; onClose: () => void
  year: number; month: number
  categories: PersonalCategory[]
  editing: TxFull | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "")
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? "")
  const [note, setNote] = useState(editing?.note ?? "")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount.replace(",", "."))
    if (isNaN(amt) || amt <= 0) return
    startTransition(async () => {
      if (editing) {
        await updatePersonalTransaction(editing.id, {
          amount: amt,
          categoryId: categoryId || null,
          note: note || null,
        })
      } else {
        await createPersonalTransaction({
          year, month, type: "INCOME",
          amount: amt,
          categoryId: categoryId || undefined,
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
        <DialogHeader>
          <DialogTitle>{editing ? "Editar ingreso" : "Añadir ingreso"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <Field label="Importe">
            <input
              autoFocus
              type="text" inputMode="decimal"
              value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0,00" className={inputCls}
            />
          </Field>
          <Field label="Tipo">
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputCls}>
              <option value="">Sin categoría</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Nota (opcional)">
            <input type="text" value={note} onChange={e => setNote(e.target.value)} className={inputCls} />
          </Field>
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

export function IngresosMesView({ year, month, categories, transactions }: Props) {
  const [, startTransition] = useTransition()
  const router = useRouter()
  const [dialog, setDialog] = useState<{ open: boolean; editing: TxFull | null }>({ open: false, editing: null })

  const prev = month === 1  ? { year: year - 1, month: 12 } : { year, month: month - 1 }
  const next = month === 12 ? { year: year + 1, month: 1  } : { year, month: month + 1 }
  const total = transactions.reduce((s, t) => s + t.amount, 0)

  function handleDelete(id: string) {
    startTransition(async () => {
      await deletePersonalTransaction(id)
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          <Link href={`/ingresos/${year - 1}`} className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <ChevronLeft className="size-3.5" />
          </Link>
          <Link href={`/ingresos/${year}`} className="text-sm font-medium text-muted-foreground hover:text-foreground">{year}</Link>
          <Link href={`/ingresos/${year + 1}`} className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/ingresos/${prev.year}/${prev.month}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
            <ChevronLeft className="size-4" />
          </Link>
          <h1 className="text-xl font-semibold">{MONTHS[month - 1]}</h1>
          <Link href={`/ingresos/${next.year}/${next.month}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Resumen */}
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between">
        <p className={tx.label}>Total ingresos</p>
        <p className="text-xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
          {formatAmountAbs(total)}
        </p>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className={tx.label}>Ingresos</p>
          <button
            onClick={() => setDialog({ open: true, editing: null })}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted">
            <Plus className="size-3.5" /> Añadir
          </button>
        </div>

        {transactions.length > 0 ? (
          <div className="rounded-xl border border-border overflow-hidden">
            {transactions.map(t => (
              <div key={t.id} className="group flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{t.category?.name ?? "Sin categoría"}</p>
                  {t.note && <p className={cn(tx.caption, "truncate")}>{t.note}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="tabular-nums text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    +{formatAmountAbs(t.amount)}
                  </span>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => setDialog({ open: true, editing: t })}
                      className="rounded p-1 hover:bg-muted text-muted-foreground">
                      <Pencil className="size-3.5" />
                    </button>
                    <button onClick={() => handleDelete(t.id)}
                      className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-600 dark:hover:bg-red-950">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={cn(tx.secondary, "py-6 text-center text-xs")}>Sin ingresos este mes</p>
        )}
      </div>

      <IngresosDialog
        key={dialog.editing?.id ?? "new"}
        open={dialog.open}
        onClose={() => setDialog(d => ({ ...d, open: false }))}
        year={year} month={month}
        categories={categories}
        editing={dialog.editing}
      />
    </div>
  )
}
