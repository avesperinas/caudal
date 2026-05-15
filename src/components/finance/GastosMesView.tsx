"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Plus, Trash2, Pencil } from "lucide-react"
import {
  SharedCategory, SharedDeposit, SharedExpense,
  SharedPayer, SharedPersonIncome, SharedYearConfig, SplitType,
} from "@prisma/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { tx } from "@/lib/styles"
import { formatAmountAbs } from "@/lib/format"
import {
  MONTHS, SPLIT_LABELS, calcMonthBalance,
  ExpenseWithCategory, MonthBalance,
} from "@/lib/gastos"
import {
  createExpense, updateExpense, deleteExpense,
  createDeposit, updateDeposit, deleteDeposit,
} from "@/app/(dashboard)/gastos/actions"

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Props = {
  year: number
  month: number
  yearConfig: SharedYearConfig | null
  personIncomes: SharedPersonIncome[]
  categories: SharedCategory[]
  expenses: ExpenseWithCategory[]
  deposits: SharedDeposit[]
  basePath?: string
}

const PAYER_OPTIONS = (p1: string, p2: string) => [
  { value: "ACCOUNT" as SharedPayer, label: "Cuenta conjunta" },
  { value: "PERSON1" as SharedPayer, label: p1 },
  { value: "PERSON2" as SharedPayer, label: p2 },
]

// ─── Balance card ─────────────────────────────────────────────────────────────

function BalanceCard({ name, balance, idx }: { name: string; balance: MonthBalance; idx: 1 | 2 }) {
  const b = idx === 1 ? balance.balance1 : balance.balance2
  const contribution = idx === 1 ? balance.contribution1 : balance.contribution2
  const obligation = idx === 1 ? balance.obligation1 : balance.obligation2
  const deposits = idx === 1 ? balance.deposits1 : balance.deposits2
  const individual = idx === 1 ? balance.individual1 : balance.individual2

  const positive = b >= 0

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <p className={tx.label}>{name}</p>
      <div className="space-y-1">
        <Row label="Cuenta" value={deposits} />
        <Row label="Individual" value={individual} />
        <Row label="Contribuido" value={contribution} bold />
        <Row label="Obligación" value={obligation} />
      </div>
      <div className={cn(
        "rounded-lg px-3 py-2 text-center tabular-nums font-semibold",
        positive
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
      )}>
        {positive ? "+" : ""}{formatAmountAbs(b)}
      </div>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className={tx.secondary}>{label}</span>
      <span className={cn("tabular-nums", bold && "font-medium")}>{formatAmountAbs(value)}</span>
    </div>
  )
}

// ─── Diálogo de gasto ─────────────────────────────────────────────────────────

function ExpenseDialog({
  open, onClose, year, month, categories, p1Name, p2Name,
  editing,
}: {
  open: boolean; onClose: () => void
  year: number; month: number
  categories: SharedCategory[]
  p1Name: string; p2Name: string
  editing: ExpenseWithCategory | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? categories[0]?.id ?? "")
  const [amount, setAmount]         = useState(editing ? String(editing.amount) : "")
  const [paidBy, setPaidBy]         = useState<SharedPayer>(editing?.paidBy ?? "ACCOUNT")
  const [note, setNote]             = useState(editing?.note ?? "")

  // Reset when dialog opens
  const handleOpenChange = (o: boolean) => { if (!o) onClose() }

  const payerOpts = PAYER_OPTIONS(p1Name, p2Name)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) return

    startTransition(async () => {
      if (editing) {
        await updateExpense(editing.id, { categoryId, amount: amt, paidBy, note: note || undefined })
      } else {
        await createExpense({ year, month, categoryId, amount: amt, paidBy, note: note || undefined })
      }
      router.refresh()
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar gasto" : "Añadir gasto"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <Field label="Categoría">
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} — {SPLIT_LABELS[c.splitType as SplitType]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Importe">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring tabular-nums"
            />
          </Field>

          <Field label="Pagado por">
            <div className="flex gap-1 rounded-lg border border-border bg-muted/50 p-1">
              {payerOpts.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPaidBy(opt.value)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                    paidBy === opt.value
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Nota (opcional)">
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ej: factura agosto"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {pending ? "Guardando…" : editing ? "Guardar" : "Añadir"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Diálogo de aportación ────────────────────────────────────────────────────

function DepositDialog({
  open, onClose, year, month, p1Name, p2Name, editing,
}: {
  open: boolean; onClose: () => void
  year: number; month: number
  p1Name: string; p2Name: string
  editing: SharedDeposit | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [person, setPerson] = useState<1 | 2>(editing ? (editing.person as 1 | 2) : 1)
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "")
  const [note, setNote]     = useState(editing?.note ?? "")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (isNaN(amt) || amt <= 0) return

    startTransition(async () => {
      if (editing) {
        await updateDeposit(editing.id, { person, amount: amt, note: note || undefined })
      } else {
        await createDeposit({ year, month, person, amount: amt, note: note || undefined })
      }
      router.refresh()
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar aportación" : "Añadir aportación"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <Field label="Persona">
            <div className="flex gap-1 rounded-lg border border-border bg-muted/50 p-1">
              {([1, 2] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPerson(p)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                    person === p
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p === 1 ? p1Name : p2Name}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Importe">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring tabular-nums"
            />
          </Field>

          <Field label="Nota (opcional)">
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={pending} className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              {pending ? "Guardando…" : editing ? "Guardar" : "Añadir"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className={tx.label}>{label}</p>
      {children}
    </div>
  )
}

function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <p className={tx.label}>{title}</p>
      <button
        onClick={onAdd}
        className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
      >
        <Plus className="size-3.5" /> Añadir
      </button>
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export function GastosMesView({
  year, month, yearConfig, personIncomes, categories, expenses, deposits,
  basePath = "/registro/gastos",
}: Props) {
  const p1Name = yearConfig?.person1Name ?? "Persona 1"
  const p2Name = yearConfig?.person2Name ?? "Persona 2"

  const [expenseDialog, setExpenseDialog] = useState<{ open: boolean; editing: ExpenseWithCategory | null }>({ open: false, editing: null })
  const [depositDialog, setDepositDialog] = useState<{ open: boolean; editing: SharedDeposit | null }>({ open: false, editing: null })

  const [, startTransition] = useTransition()
  const router = useRouter()

  const balance = calcMonthBalance(expenses, deposits, personIncomes, year, month)

  // Agrupar gastos por categoría
  const grouped = categories
    .map(cat => ({ cat, items: expenses.filter(e => e.categoryId === cat.id) }))
    .filter(g => g.items.length > 0)

  // Gastos de categorías no activas (pueden existir de antes)
  const uncategorized = expenses.filter(e => !categories.find(c => c.id === e.categoryId))

  const prevMonth = month === 1  ? { year: year - 1, month: 12 } : { year, month: month - 1 }
  const nextMonth = month === 12 ? { year: year + 1, month: 1  } : { year, month: month + 1 }

  function handleDelete(id: string, type: "expense" | "deposit") {
    startTransition(async () => {
      if (type === "expense") await deleteExpense(id)
      else await deleteDeposit(id)
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="space-y-1">
        {/* Nivel año */}
        <div className="flex items-center gap-1.5">
          <Link
            href={`${basePath}/${year - 1}`}
            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="size-3.5" />
          </Link>
          <Link
            href={`${basePath}/${year}`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {year}
          </Link>
          <Link
            href={`${basePath}/${year + 1}`}
            className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="size-3.5" />
          </Link>
        </div>
        {/* Nivel mes */}
        <div className="flex items-center gap-3">
          <Link
            href={`${basePath}/${prevMonth.year}/${prevMonth.month}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <h1 className="text-xl font-semibold">{MONTHS[month - 1]}</h1>
          <Link
            href={`${basePath}/${nextMonth.year}/${nextMonth.month}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Balance */}
      <div className="grid grid-cols-2 gap-3">
        <BalanceCard name={p1Name} balance={balance} idx={1} />
        <BalanceCard name={p2Name} balance={balance} idx={2} />
      </div>

      {/* Gastos */}
      <div className="space-y-3">
        <SectionHeader title="Gastos" onAdd={() => setExpenseDialog({ open: true, editing: null })} />

        {grouped.length === 0 && uncategorized.length === 0 ? (
          <p className={cn(tx.secondary, "py-4 text-center")}>Sin gastos este mes</p>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            {grouped.map(({ cat, items }) => (
              <div key={cat.id}>
                <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2">
                  <span className="text-xs font-medium">{cat.name}</span>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    cat.splitType === "FIFTY_FIFTY"
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400"
                      : "bg-muted text-muted-foreground border border-border",
                  )}>
                    {SPLIT_LABELS[cat.splitType as SplitType]}
                  </span>
                </div>
                {items.map(exp => (
                  <ExpenseRow
                    key={exp.id}
                    expense={exp}
                    p1Name={p1Name}
                    p2Name={p2Name}
                    onEdit={() => setExpenseDialog({ open: true, editing: exp })}
                    onDelete={() => handleDelete(exp.id, "expense")}
                  />
                ))}
              </div>
            ))}
            {uncategorized.map(exp => (
              <ExpenseRow
                key={exp.id}
                expense={exp}
                p1Name={p1Name}
                p2Name={p2Name}
                onEdit={() => setExpenseDialog({ open: true, editing: exp })}
                onDelete={() => handleDelete(exp.id, "expense")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Aportaciones */}
      <div className="space-y-3">
        <SectionHeader title="Aportaciones a cuenta" onAdd={() => setDepositDialog({ open: true, editing: null })} />

        {deposits.length === 0 ? (
          <p className={cn(tx.secondary, "py-4 text-center")}>Sin aportaciones este mes</p>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            {deposits.map(dep => (
              <div key={dep.id} className="group flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
                <div>
                  <span className="text-sm font-medium">{dep.person === 1 ? p1Name : p2Name}</span>
                  {dep.note && <span className={cn(tx.caption, "ml-2")}>{dep.note}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular-nums text-sm font-medium">{formatAmountAbs(dep.amount)}</span>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => setDepositDialog({ open: true, editing: dep })} className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground">
                      <Pencil className="size-3.5" />
                    </button>
                    <button onClick={() => handleDelete(dep.id, "deposit")} className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-600 dark:hover:bg-red-950">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialogs */}
      <ExpenseDialog
        open={expenseDialog.open}
        onClose={() => setExpenseDialog({ open: false, editing: null })}
        year={year}
        month={month}
        categories={categories}
        p1Name={p1Name}
        p2Name={p2Name}
        editing={expenseDialog.editing}
      />
      <DepositDialog
        open={depositDialog.open}
        onClose={() => setDepositDialog({ open: false, editing: null })}
        year={year}
        month={month}
        p1Name={p1Name}
        p2Name={p2Name}
        editing={depositDialog.editing}
      />
    </div>
  )
}

// ─── Fila de gasto ────────────────────────────────────────────────────────────

function ExpenseRow({
  expense, p1Name, p2Name, onEdit, onDelete,
}: {
  expense: ExpenseWithCategory
  p1Name: string; p2Name: string
  onEdit: () => void; onDelete: () => void
}) {
  const payerLabel =
    expense.paidBy === "ACCOUNT"  ? "Cuenta conjunta" :
    expense.paidBy === "PERSON1" ? p1Name : p2Name

  return (
    <div className="group flex items-center justify-between border-b border-border px-4 py-3 last:border-0">
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs",
            expense.paidBy === "ACCOUNT"
              ? "bg-muted text-muted-foreground"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
          )}>
            {payerLabel}
          </span>
          {expense.note && <span className={cn(tx.caption, "truncate")}>{expense.note}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <span className="tabular-nums text-sm font-medium">{formatAmountAbs(expense.amount)}</span>
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={onEdit} className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground">
            <Pencil className="size-3.5" />
          </button>
          <button onClick={onDelete} className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-600 dark:hover:bg-red-950">
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
