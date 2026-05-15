"use client"

import { useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Plus, Pencil, Trash2, Settings } from "lucide-react"
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

type MonthData = { month: number; transactions: TransactionFull[] }

type Props = {
  year: number
  monthData: MonthData[]
  categories: PersonalCategory[]
  products: ProductWithEntity[]
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function parseAmount(s: string): number {
  return parseFloat(s.replace(",", "."))
}

const fieldCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"

const TYPE_COLORS = {
  INCOME:   { label: "Ingresos", text: "text-emerald-600 dark:text-emerald-400", heading: "text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-500" },
  EXPENSE:  { label: "Gastos",   text: "text-red-500 dark:text-red-400",         heading: "text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-500" },
  TRANSFER: { label: "Ahorro",   text: "text-blue-600 dark:text-blue-400",       heading: "text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-500" },
} as const

// ─── Quick-add inline ─────────────────────────────────────────────────────────

function QuickAdd({ type, categories, products, year, month }: {
  type: PersonalTransactionType
  categories: PersonalCategory[]
  products: ProductWithEntity[]
  year: number; month: number
}) {
  const router = useRouter()
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
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5 mt-1">
      {type === "TRANSFER" ? (
        <select value={productId} onChange={e => setProductId(e.target.value)}
          className="flex-1 min-w-0 rounded-md border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="">Sin producto</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.entity.name} · {p.name}</option>)}
        </select>
      ) : (
        <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
          className="flex-1 min-w-0 rounded-md border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring">
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
        className="w-24 rounded-md border border-input bg-background px-2 py-1 text-xs text-right tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <button
        type="submit"
        disabled={pending || !amount.trim()}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
      >
        <Plus className="size-3" />
      </button>
    </form>
  )
}

// ─── Fila de transacción ──────────────────────────────────────────────────────

function TxRow({ t, onEdit, onDelete }: { t: TransactionFull; onEdit: () => void; onDelete: () => void }) {
  const label = t.type === "TRANSFER"
    ? (t.product ? `${t.product.entity.name} · ${t.product.name}` : "Ahorro")
    : (t.category?.name ?? "Sin categoría")

  const amountColor = TYPE_COLORS[t.type].text

  return (
    <div className="group flex items-center gap-2 py-1">
      <p className="flex-1 text-xs text-muted-foreground truncate">{label}</p>
      {t.note && <p className="text-xs text-muted-foreground/60 truncate max-w-[80px] hidden sm:block">{t.note}</p>}
      <span className={cn("tabular-nums text-xs font-medium shrink-0", amountColor)}>
        {formatAmountAbs(t.amount)}
      </span>
      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button onClick={onEdit}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <Pencil className="size-3" />
        </button>
        <button onClick={onDelete}
          className="rounded p-0.5 text-muted-foreground hover:text-red-500 transition-colors">
          <Trash2 className="size-3" />
        </button>
      </div>
    </div>
  )
}

// ─── Sub-sección dentro del mes ───────────────────────────────────────────────

function TypeSubSection({ type, items, categories, products, year, month, onEdit, onDelete }: {
  type: PersonalTransactionType
  items: TransactionFull[]
  categories: PersonalCategory[]
  products: ProductWithEntity[]
  year: number; month: number
  onEdit: (t: TransactionFull) => void
  onDelete: (id: string) => void
}) {
  const colors = TYPE_COLORS[type]
  const total  = items.reduce((s, t) => s + t.amount, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className={colors.heading}>{colors.label}</p>
        {total > 0 && (
          <p className={cn("text-xs font-semibold tabular-nums", colors.text)}>
            {formatAmountAbs(total)}
          </p>
        )}
      </div>
      {items.map(t => (
        <TxRow key={t.id} t={t} onEdit={() => onEdit(t)} onDelete={() => onDelete(t.id)} />
      ))}
      <QuickAdd type={type} categories={categories} products={products} year={year} month={month} />
    </div>
  )
}

// ─── Mes (expandible) ─────────────────────────────────────────────────────────

function MonthSection({ year, month, transactions, categories, products, isExpanded, onToggle, onEdit, onDelete }: {
  year: number; month: number
  transactions: TransactionFull[]
  categories: PersonalCategory[]
  products: ProductWithEntity[]
  isExpanded: boolean
  onToggle: () => void
  onEdit: (t: TransactionFull) => void
  onDelete: (id: string) => void
}) {
  const now = new Date()
  const isCurrent = now.getFullYear() === year && now.getMonth() + 1 === month
  const hasData   = transactions.length > 0

  const incomes   = transactions.filter(t => t.type === "INCOME")
  const expenses  = transactions.filter(t => t.type === "EXPENSE")
  const transfers = transactions.filter(t => t.type === "TRANSFER")

  const totalIncome   = incomes.reduce((s, t)   => s + t.amount, 0)
  const totalExpense  = expenses.reduce((s, t)  => s + t.amount, 0)
  const totalTransfer = transfers.reduce((s, t) => s + t.amount, 0)

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-colors",
      isCurrent ? "border-primary/30 bg-primary/5" : "border-border bg-card",
    )}>
      {/* Cabecera del mes */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <p className={cn("text-sm font-semibold w-16 shrink-0", isCurrent && "text-primary")}>
          {MONTHS[month - 1]}
        </p>
        <div className="flex-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
          {hasData && !isExpanded ? (
            <>
              {totalIncome   > 0 && <span className="text-xs tabular-nums text-emerald-600 dark:text-emerald-400">+{formatAmountAbs(totalIncome)}</span>}
              {totalExpense  > 0 && <span className="text-xs tabular-nums text-red-500 dark:text-red-400">−{formatAmountAbs(totalExpense)}</span>}
              {totalTransfer > 0 && <span className="text-xs tabular-nums text-blue-600 dark:text-blue-400">→{formatAmountAbs(totalTransfer)}</span>}
            </>
          ) : !hasData ? (
            <span className={tx.caption}>Sin datos</span>
          ) : null}
        </div>
        {isExpanded
          ? <ChevronUp   className="size-4 shrink-0 text-muted-foreground" />
          : <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        }
      </button>

      {/* Contenido expandido */}
      {isExpanded && (
        <div className="border-t border-border/50 px-4 pt-3 pb-4 space-y-4">
          <TypeSubSection type="INCOME" items={incomes}
            categories={categories} products={products}
            year={year} month={month} onEdit={onEdit} onDelete={onDelete} />
          <TypeSubSection type="EXPENSE" items={expenses}
            categories={categories} products={products}
            year={year} month={month} onEdit={onEdit} onDelete={onDelete} />
          <TypeSubSection type="TRANSFER" items={transfers}
            categories={categories} products={products}
            year={year} month={month} onEdit={onEdit} onDelete={onDelete} />
        </div>
      )}
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

export function PersonalAnualView({ year, monthData, categories, products }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [editing, setEditing] = useState<TransactionFull | null>(null)

  const now = new Date()
  const currentYear  = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const defaultExpanded = new Set<number>(year === currentYear ? [currentMonth] : [])
  const [expanded, setExpanded] = useState<Set<number>>(defaultExpanded)

  function toggle(month: number) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(month) ? next.delete(month) : next.add(month)
      return next
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deletePersonalTransaction(id)
      router.refresh()
    })
  }

  const allTx         = monthData.flatMap(m => m.transactions)
  const annualIncome  = allTx.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
  const annualExpense = allTx.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)
  const annualSavings = allTx.filter(t => t.type === "TRANSFER").reduce((s, t) => s + t.amount, 0)
  const hasAnyData    = allTx.length > 0

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/registro/personal/${year - 1}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
            <ChevronLeft className="size-4" />
          </Link>
          <h1 className="text-xl font-semibold">{year}</h1>
          <Link href={`/registro/personal/${year + 1}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
            <ChevronRight className="size-4" />
          </Link>
        </div>
        <Link href="/registro/personal/config"
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">
          <Settings className="size-3.5" />
          Categorías
        </Link>
      </div>

      {/* Stats anuales */}
      {hasAnyData && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Ingresos", value: annualIncome,  cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" },
            { label: "Gastos",   value: annualExpense,  cls: "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400" },
            { label: "Ahorro",   value: annualSavings,  cls: "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400" },
          ].map(({ label, value, cls }) => (
            <div key={label} className={cn("rounded-xl p-3", cls)}>
              <p className="text-xs font-medium opacity-70 mb-0.5">{label}</p>
              <p className="text-lg font-semibold tabular-nums">{formatAmountAbs(value)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Meses */}
      <div className="space-y-2">
        {monthData.map(({ month, transactions }) => (
          <MonthSection
            key={month}
            year={year}
            month={month}
            transactions={transactions}
            categories={categories}
            products={products}
            isExpanded={expanded.has(month)}
            onToggle={() => toggle(month)}
            onEdit={setEditing}
            onDelete={handleDelete}
          />
        ))}
      </div>

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
