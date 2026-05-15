"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Plus, Trash2, Pencil } from "lucide-react"
import { PersonalCategory, PersonalTransaction, Product, Entity, PersonalTransactionType } from "@prisma/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { tx } from "@/lib/styles"
import { formatAmountAbs } from "@/lib/format"
import { MONTHS } from "@/lib/gastos"
import { createPersonalTransaction, updatePersonalTransaction, deletePersonalTransaction } from "@/app/(dashboard)/personal/actions"

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ProductWithEntity = Product & { entity: Entity }
type TransactionFull   = PersonalTransaction & {
  category: PersonalCategory | null
  product:  ProductWithEntity | null
}

type Props = {
  year: number; month: number
  categories: PersonalCategory[]
  transactions: TransactionFull[]
  products: ProductWithEntity[]
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function parseAmount(s: string): number {
  return parseFloat(s.replace(",", "."))
}

const fieldCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"

const SECTION_COLORS = {
  INCOME:   { text: "text-emerald-600 dark:text-emerald-400", badge: "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/50", label: "text-emerald-700 dark:text-emerald-500" },
  EXPENSE:  { text: "text-red-500 dark:text-red-400",         badge: "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/50",                 label: "text-red-700 dark:text-red-500" },
  TRANSFER: { text: "text-blue-600 dark:text-blue-400",       badge: "text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50",             label: "text-blue-700 dark:text-blue-500" },
} as const

// ─── Quick-add inline ─────────────────────────────────────────────────────────

function QuickAdd({ type, categories, products, year, month }: {
  type: PersonalTransactionType
  categories: PersonalCategory[]
  products: ProductWithEntity[]
  year: number; month: number
}) {
  const router      = useRouter()
  const [pending, startTransition] = useTransition()
  const [amount, setAmount] = useState("")
  const filteredCats = categories.filter(c =>
    type === "INCOME" ? c.type === "INCOME" : c.type === "EXPENSE"
  )
  const [categoryId, setCategoryId] = useState(filteredCats[0]?.id ?? "")
  const [productId,  setProductId]  = useState(products[0]?.id ?? "")
  const amountRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseAmount(amount)
    if (isNaN(amt) || amt <= 0) return
    const data = {
      amount: amt, type,
      categoryId: type !== "TRANSFER" ? (categoryId || undefined) : undefined,
      productId:  type === "TRANSFER" ? (productId  || undefined) : undefined,
    }
    startTransition(async () => {
      await createPersonalTransaction({ year, month, ...data })
      setAmount("")
      router.refresh()
      amountRef.current?.focus()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-muted/30 px-4 py-2.5">
      {type === "TRANSFER" ? (
        <select value={productId} onChange={e => setProductId(e.target.value)}
          className="flex-1 min-w-0 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Sin producto</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.entity.name} · {p.name}</option>)}
        </select>
      ) : (
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
          className="flex-1 min-w-0 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Sin categoría</option>
          {filteredCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}
      <input
        ref={amountRef}
        type="text"
        inputMode="decimal"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="0,00"
        className="w-28 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        type="submit"
        disabled={pending || !amount.trim()}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
      >
        <Plus className="size-4" />
      </button>
    </form>
  )
}

// ─── Fila de transacción ──────────────────────────────────────────────────────

function TxRow({ t, onEdit, onDelete }: { t: TransactionFull; onEdit: () => void; onDelete: () => void }) {
  const label = t.type === "TRANSFER"
    ? (t.product ? `${t.product.entity.name} · ${t.product.name}` : "Ahorro")
    : (t.category?.name ?? "Sin categoría")

  const amountColor = SECTION_COLORS[t.type].text

  return (
    <div className="group flex items-center gap-3 border-b border-border/50 last:border-0 px-4 py-2.5">
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{label}</p>
        {t.note && <p className={cn(tx.caption, "truncate")}>{t.note}</p>}
      </div>
      <span className={cn("tabular-nums text-sm font-medium shrink-0", amountColor)}>
        {formatAmountAbs(t.amount)}
      </span>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={onEdit}
          className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <Pencil className="size-3.5" />
        </button>
        <button onClick={onDelete}
          className="rounded p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors">
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Sección (Ingresos / Gastos / Ahorro) ────────────────────────────────────

function Section({ title, items, type, categories, products, year, month, onEdit, onDelete }: {
  title: string
  items: TransactionFull[]
  type: PersonalTransactionType
  categories: PersonalCategory[]
  products: ProductWithEntity[]
  year: number; month: number
  onEdit: (t: TransactionFull) => void
  onDelete: (id: string) => void
}) {
  const colors = SECTION_COLORS[type]
  const total  = items.reduce((s, t) => s + t.amount, 0)

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <p className={tx.label}>{title}</p>
        {total > 0 && (
          <span className={cn("rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums", colors.badge)}>
            {formatAmountAbs(total)}
          </span>
        )}
      </div>
      {items.length > 0 && (
        <div className="border-t border-border/50">
          {items.map(t => (
            <TxRow key={t.id} t={t} onEdit={() => onEdit(t)} onDelete={() => onDelete(t.id)} />
          ))}
        </div>
      )}
      <div className="border-t border-border/50">
        <QuickAdd type={type} categories={categories} products={products} year={year} month={month} />
      </div>
    </div>
  )
}

// ─── Diálogo de edición ───────────────────────────────────────────────────────

function EditDialog({ open, onClose, editing, categories, products }: {
  open: boolean; onClose: () => void
  editing: TransactionFull
  categories: PersonalCategory[]
  products: ProductWithEntity[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [amount,     setAmount]     = useState(String(editing.amount))
  const [categoryId, setCategoryId] = useState(editing.categoryId ?? "")
  const [productId,  setProductId]  = useState(editing.productId  ?? "")
  const [note,       setNote]       = useState(editing.note ?? "")

  const filteredCats = categories.filter(c =>
    editing.type === "INCOME" ? c.type === "INCOME" : c.type === "EXPENSE"
  )
  const typeName = editing.type === "INCOME" ? "ingreso" : editing.type === "EXPENSE" ? "gasto" : "aportación"

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseAmount(amount)
    if (isNaN(amt) || amt <= 0) return
    startTransition(async () => {
      await updatePersonalTransaction(editing.id, {
        amount: amt,
        categoryId: editing.type !== "TRANSFER" ? (categoryId || null) : null,
        productId:  editing.type === "TRANSFER"  ? (productId  || null) : null,
        note: note || null,
      })
      router.refresh()
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar {typeName}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {editing.type !== "TRANSFER" ? (
            <div className="space-y-1.5">
              <p className={tx.label}>Categoría</p>
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={fieldCls}>
                <option value="">Sin categoría</option>
                {filteredCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          ) : (
            <div className="space-y-1.5">
              <p className={tx.label}>Producto</p>
              <select value={productId} onChange={e => setProductId(e.target.value)} className={fieldCls}>
                <option value="">Sin producto</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.entity.name} · {p.name}</option>)}
              </select>
            </div>
          )}
          <div className="space-y-1.5">
            <p className={tx.label}>Importe</p>
            <input type="text" inputMode="decimal" value={amount}
              onChange={e => setAmount(e.target.value)} placeholder="0,00" className={fieldCls} />
          </div>
          <div className="space-y-1.5">
            <p className={tx.label}>Nota</p>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} className={fieldCls} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
              Cancelar
            </button>
            <button type="submit" disabled={pending}
              className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
              {pending ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function PersonalMesView({ year, month, categories, transactions, products }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [editing, setEditing] = useState<TransactionFull | null>(null)

  const prevMonth = month === 1  ? { year: year - 1, month: 12 } : { year, month: month - 1 }
  const nextMonth = month === 12 ? { year: year + 1, month: 1  } : { year, month: month + 1 }

  const incomes   = transactions.filter(t => t.type === "INCOME")
  const expenses  = transactions.filter(t => t.type === "EXPENSE")
  const transfers = transactions.filter(t => t.type === "TRANSFER")

  function handleDelete(id: string) {
    startTransition(async () => {
      await deletePersonalTransaction(id)
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 p-4 md:p-6">
      {/* Header */}
      <div>
        <div className="mb-1 flex items-center gap-1">
          <Link href={`/registro/personal/${year - 1}`}
            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <ChevronLeft className="size-3.5" />
          </Link>
          <Link href={`/registro/personal/${year}`} className={cn(tx.secondary, "hover:text-foreground")}>
            {year}
          </Link>
          <Link href={`/registro/personal/${year + 1}`}
            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground">
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/registro/personal/${prevMonth.year}/${prevMonth.month}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
            <ChevronLeft className="size-4" />
          </Link>
          <h1 className="text-xl font-semibold">{MONTHS[month - 1]}</h1>
          <Link href={`/registro/personal/${nextMonth.year}/${nextMonth.month}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Secciones */}
      <Section title="Ingresos" items={incomes} type="INCOME"
        categories={categories} products={products} year={year} month={month}
        onEdit={setEditing} onDelete={handleDelete} />

      <Section title="Gastos" items={expenses} type="EXPENSE"
        categories={categories} products={products} year={year} month={month}
        onEdit={setEditing} onDelete={handleDelete} />

      <Section title="Ahorro" items={transfers} type="TRANSFER"
        categories={categories} products={products} year={year} month={month}
        onEdit={setEditing} onDelete={handleDelete} />

      {/* Diálogo de edición */}
      {editing && (
        <EditDialog
          key={editing.id}
          open={!!editing}
          onClose={() => setEditing(null)}
          editing={editing}
          categories={categories}
          products={products}
        />
      )}
    </div>
  )
}
