"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Settings, ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react"
import {
  SharedCategory, SharedDeposit, SharedPayer,
  SharedPersonIncome, SharedYearConfig, SplitType,
} from "@prisma/client"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { tx, interactive } from "@/lib/styles"
import { useConfirmDelete } from "@/components/ui/confirm-delete"
import { formatAmountAbs, formatPctSigned } from "@/lib/format"
import {
  MONTHS, SPLIT_LABELS, calcMonthBalance,
  ExpenseWithCategory, getAnnualRatio,
} from "@/lib/gastos"
import {
  createExpense, updateExpense, deleteExpense,
  createDeposit, updateDeposit, deleteDeposit,
} from "@/app/(dashboard)/gastos/actions"

const SWAP_PAYER: Record<SharedPayer, SharedPayer> = {
  ACCOUNT: "ACCOUNT", PERSON1: "PERSON2", PERSON2: "PERSON1",
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Props = {
  year: number
  yearConfig: SharedYearConfig | null
  personIncomes: SharedPersonIncome[]
  categories: SharedCategory[]
  expenses: ExpenseWithCategory[]
  deposits: SharedDeposit[]
  basePath?: string
  ownerUserId?: string
  isOwner?: boolean
  ownerName?: string | null
  sharedAccounts?: { id: string; name: string | null }[]
  /** El colaborador ve Persona 1 ↔ 2 intercambiadas; al guardar hay que revertir. */
  personSwapped?: boolean
  /** Gastos del año anterior, solo para comparar medias mensuales. */
  prevYearExpenses?: PrevYearExpense[]
}

type PrevYearExpense = { categoryId: string; month: number; amount: number }

const fieldCls = "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"

// ─── ExpenseDialog ────────────────────────────────────────────────────────────

function ExpenseDialog({ open, onClose, year, month, categories, p1Name, p2Name, editing, ownerUserId, personSwapped }: {
  open: boolean; onClose: () => void
  year: number; month: number
  categories: SharedCategory[]
  p1Name: string; p2Name: string
  editing: ExpenseWithCategory | null
  ownerUserId?: string
  personSwapped?: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? categories[0]?.id ?? "")
  const [amount, setAmount]         = useState(editing ? String(editing.amount) : "")
  const [paidBy, setPaidBy]         = useState<SharedPayer>(editing?.paidBy ?? "ACCOUNT")
  const [note, setNote]             = useState(editing?.note ?? "")

  const payerOpts: { value: SharedPayer; label: string }[] = [
    { value: "ACCOUNT", label: "Cuenta conjunta" },
    { value: "PERSON1", label: p1Name },
    { value: "PERSON2", label: p2Name },
  ]

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount.replace(",", "."))
    if (isNaN(amt) || amt <= 0) return
    startTransition(async () => {
      const savePaidBy = personSwapped ? SWAP_PAYER[paidBy] : paidBy
      if (editing) {
        await updateExpense(editing.id, { categoryId, amount: amt, paidBy: savePaidBy, note: note || undefined }, ownerUserId)
      } else {
        await createExpense({ year, month, categoryId, amount: amt, paidBy: savePaidBy, note: note || undefined }, ownerUserId)
      }
      router.refresh(); onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogTitle>{editing ? "Editar gasto" : "Añadir gasto"}</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <p className={tx.label}>Categoría</p>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={fieldCls}>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name} — {SPLIT_LABELS[c.splitType as SplitType]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <p className={tx.label}>Importe</p>
            <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0,00" className={cn(fieldCls, "tabular-nums")} />
          </div>
          <div className="space-y-1.5">
            <p className={tx.label}>Pagado por</p>
            <div className="flex gap-1 rounded-lg border border-border bg-muted/50 p-1">
              {payerOpts.map(opt => (
                <button key={opt.value} type="button" onClick={() => setPaidBy(opt.value)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                    paidBy === opt.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className={tx.label}>Nota (opcional)</p>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} className={fieldCls} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={pending} className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
              {pending ? "Guardando…" : editing ? "Guardar" : "Añadir"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── DepositDialog ────────────────────────────────────────────────────────────

function DepositDialog({ open, onClose, year, month, p1Name, p2Name, editing, ownerUserId, personSwapped }: {
  open: boolean; onClose: () => void
  year: number; month: number
  p1Name: string; p2Name: string
  editing: SharedDeposit | null
  ownerUserId?: string
  personSwapped?: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [person, setPerson] = useState<1 | 2>(editing ? (editing.person as 1 | 2) : 1)
  const [amount, setAmount] = useState(editing ? String(editing.amount) : "")
  const [note, setNote]     = useState(editing?.note ?? "")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount.replace(",", "."))
    if (isNaN(amt) || amt <= 0) return
    startTransition(async () => {
      if (editing) {
        const savePerson = personSwapped ? (person === 1 ? 2 : 1) : person
        await updateDeposit(editing.id, { person: savePerson, amount: amt, note: note || undefined }, ownerUserId)
      } else {
        const savePerson = personSwapped ? (person === 1 ? 2 : 1) : person
        await createDeposit({ year, month, person: savePerson, amount: amt, note: note || undefined }, ownerUserId)
      }
      router.refresh(); onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogTitle>{editing ? "Editar aportación" : "Añadir aportación"}</DialogTitle>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="space-y-1.5">
            <p className={tx.label}>Persona</p>
            <div className="flex gap-1 rounded-lg border border-border bg-muted/50 p-1">
              {([1, 2] as const).map(p => (
                <button key={p} type="button" onClick={() => setPerson(p)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                    person === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}>
                  {p === 1 ? p1Name : p2Name}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <p className={tx.label}>Importe</p>
            <input type="text" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)}
              placeholder="0,00" className={cn(fieldCls, "tabular-nums")} />
          </div>
          <div className="space-y-1.5">
            <p className={tx.label}>Nota (opcional)</p>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} className={fieldCls} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={pending} className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
              {pending ? "Guardando…" : editing ? "Guardar" : "Añadir"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── BalanceCard anual ────────────────────────────────────────────────────────

function AnnualBalanceCard({ name, pct, contribution, obligation, balance, settled }: {
  name: string; pct: number; contribution: number; obligation: number; balance: number; settled: boolean
}) {
  const positive = balance >= 0
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className={tx.label}>{name}</p>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
          {(pct * 100).toFixed(1)}%
        </span>
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className={tx.secondary}>Contribuido</span>
          <span className="tabular-nums font-medium">{formatAmountAbs(contribution)}</span>
        </div>
        <div className="flex justify-between">
          <span className={tx.secondary}>Obligación</span>
          <span className="tabular-nums">{formatAmountAbs(obligation)}</span>
        </div>
      </div>
      <div className={cn(
        "rounded-lg px-3 py-2 text-center tabular-nums font-semibold",
        settled ? "bg-muted text-muted-foreground"
          : positive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
      )}>
        <span className={cn(settled && "line-through")}>
          {positive ? "+" : ""}{formatAmountAbs(balance)}
        </span>
        <span className={cn(tx.caption, "ml-1.5", settled ? "" : positive ? "text-emerald-600" : "text-red-600", settled && "line-through")}>
          {positive ? "a favor" : "a deber"}
        </span>
      </div>
    </div>
  )
}

// ─── Celda de variación anual ─────────────────────────────────────────────────

function ChangeCell({ pct }: { pct: number | null }) {
  if (pct === null) return <span className={tx.caption}>—</span>
  return (
    <span className={cn(
      pct > 0 ? "text-rose-600 dark:text-rose-400"
        : pct < 0 ? "text-emerald-600 dark:text-emerald-400"
        : "text-muted-foreground",
    )}>
      {formatPctSigned(pct, 1)}
    </span>
  )
}

// ─── BalanceCard de mes ───────────────────────────────────────────────────────

function MonthBalanceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-sm">
      <span className={tx.secondary}>{label}</span>
      <span className="tabular-nums">{formatAmountAbs(value)}</span>
    </div>
  )
}

function MonthBalanceCard({ name, contribution, obligation, balance }: {
  name: string; contribution: number; obligation: number; balance: number
}) {
  const positive = balance >= 0
  return (
    <div className="rounded-xl border border-border bg-card p-3 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">{name}</p>
      <MonthBalanceRow label="Contribuido" value={contribution} />
      <MonthBalanceRow label="Obligación" value={obligation} />
      <div className={cn(
        "rounded-md px-2.5 py-1.5 text-center text-sm tabular-nums font-semibold",
        positive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
      )}>
        {positive ? "+" : ""}{formatAmountAbs(balance)}
      </div>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function CompartidoAnualView({
  year, yearConfig, personIncomes, categories, expenses, deposits,
  basePath = "/compartido",
  ownerUserId,
  isOwner = true,
  ownerName,
  sharedAccounts = [],
  personSwapped = false,
  prevYearExpenses = [],
}: Props) {
  const router  = useRouter()
  const [, startTransition] = useTransition()

  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [expDialog, setExpDialog] = useState<{ open: boolean; editing: ExpenseWithCategory | null }>({ open: false, editing: null })
  const [depDialog, setDepDialog] = useState<{ open: boolean; editing: SharedDeposit | null }>({ open: false, editing: null })

  const p1Name  = yearConfig?.person1Name ?? "Persona 1"
  const p2Name  = yearConfig?.person2Name ?? "Persona 2"
  const settled = yearConfig?.settled ?? false

  const { ratio1: incomeRatio1, ratio2: incomeRatio2 } = getAnnualRatio(personIncomes, year)

  const now  = new Date()
  const isCY = now.getFullYear() === year
  const cm   = now.getMonth() + 1

  const monthData = Array.from({ length: 12 }, (_, i) => {
    const month    = i + 1
    const mExp     = expenses.filter(e => e.month === month)
    const mDep     = deposits.filter(d => d.month === month)
    const balance  = calcMonthBalance(mExp, mDep, personIncomes, year, month)
    return { month, expenses: mExp, deposits: mDep, balance, hasData: mExp.length > 0 || mDep.length > 0 }
  })

  const annualBalance = monthData.reduce(
    (acc, m) => ({
      obligation1:   acc.obligation1   + m.balance.obligation1,
      obligation2:   acc.obligation2   + m.balance.obligation2,
      contribution1: acc.contribution1 + m.balance.contribution1,
      contribution2: acc.contribution2 + m.balance.contribution2,
      balance1:      acc.balance1      + m.balance.balance1,
      balance2:      acc.balance2      + m.balance.balance2,
    }),
    { obligation1: 0, obligation2: 0, contribution1: 0, contribution2: 0, balance1: 0, balance2: 0 },
  )

  // % de reparto realmente aplicado: los gastos 50/50 lo acercan al 50 %, así que
  // no tiene por qué coincidir con el reparto por ingresos. Sin gastos aún, se cae a este.
  const totalObligation = annualBalance.obligation1 + annualBalance.obligation2
  const share1 = totalObligation > 0 ? annualBalance.obligation1 / totalObligation : incomeRatio1
  const share2 = totalObligation > 0 ? annualBalance.obligation2 / totalObligation : incomeRatio2

  // Divisor de la media: meses con gastos, para no infravalorar el año en curso.
  const activeMonths     = new Set(expenses.map(e => e.month)).size
  const prevActiveMonths = new Set(prevYearExpenses.map(e => e.month)).size

  const prevTotalByCat = prevYearExpenses.reduce((acc, e) => {
    acc.set(e.categoryId, (acc.get(e.categoryId) ?? 0) + e.amount)
    return acc
  }, new Map<string, number>())

  const monthlyAvg     = (total: number) => activeMonths     > 0 ? total / activeMonths     : 0
  const prevMonthlyAvg = (total: number) => prevActiveMonths > 0 ? total / prevActiveMonths : 0

  /** Variación de la media mensual frente al año anterior; null si no hay base con la que comparar. */
  function avgChangePct(total: number, prevTotal: number): number | null {
    const prev = prevMonthlyAvg(prevTotal)
    if (prev === 0) return null
    return (monthlyAvg(total) - prev) / prev * 100
  }

  const categoryTotals = categories
    .map(cat => ({
      cat,
      total: expenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0),
      prevTotal: prevTotalByCat.get(cat.id) ?? 0,
    }))
    .filter(c => c.total > 0)

  const totalExpenses     = categoryTotals.reduce((s, c) => s + c.total, 0)
  const prevTotalExpenses = prevYearExpenses.reduce((s, e) => s + e.amount, 0)

  const mData = selectedMonth !== null ? monthData.find(m => m.month === selectedMonth) : null

  // Sufijo de owner para links de año (colaborador)
  const ownerSuffix = !isOwner && ownerUserId ? `?owner=${ownerUserId}` : ""

  const { confirmDelete, confirmDialog } = useConfirmDelete()

  function handleDeleteExpense(id: string) {
    confirmDelete(() => startTransition(async () => { await deleteExpense(id, ownerUserId); router.refresh() }))
  }
  function handleDeleteDeposit(id: string) {
    confirmDelete(() => startTransition(async () => { await deleteDeposit(id, ownerUserId); router.refresh() }))
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      {confirmDialog}

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold">Compartido</h1>
          {!isOwner && ownerName && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              de {ownerName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Link href={`${basePath}/${year - 1}${ownerSuffix}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
              <ChevronLeft className="size-4" />
            </Link>
            <span className="w-12 text-center text-sm font-medium">{year}</span>
            <Link href={`${basePath}/${year + 1}${ownerSuffix}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted">
              <ChevronRight className="size-4" />
            </Link>
          </div>
          {isOwner && (
            <Link href={`${basePath}/config/${year}`}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">
              <Settings className="size-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Switcher de cuenta ── */}
      {sharedAccounts.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          <Link
            href={`${basePath}/${year}`}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              isOwner
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}>
            Mi cuenta
          </Link>
          {sharedAccounts.map(a => (
            <Link
              key={a.id}
              href={`${basePath}/${year}?owner=${a.id}`}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                !isOwner && ownerUserId === a.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80",
              )}>
              {a.name ?? "Sin nombre"}
            </Link>
          ))}
        </div>
      )}

      {!yearConfig && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            No hay configuración para {year}.{" "}
            {isOwner && (
              <Link href={`${basePath}/config/${year}`} className="font-medium underline underline-offset-2">
                Configura los nombres y salarios
              </Link>
            )}
          </p>
        </div>
      )}

      {/* ── Balance anual ── */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <p className={tx.sectionLabel}>Balance anual</p>
          {settled && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              Solventado
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <AnnualBalanceCard name={p1Name} pct={share1} contribution={annualBalance.contribution1}
            obligation={annualBalance.obligation1} balance={annualBalance.balance1} settled={settled} />
          <AnnualBalanceCard name={p2Name} pct={share2} contribution={annualBalance.contribution2}
            obligation={annualBalance.obligation2} balance={annualBalance.balance2} settled={settled} />
        </div>
      </div>

      {/* ── Grid de meses ── */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {monthData.map(({ month, hasData, balance }) => {
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
                ? <p className={tx.caption}>{formatAmountAbs(balance.totalExpenses)}</p>
                : <p className={tx.caption}>Sin datos</p>
              }
            </button>
          )
        })}
      </div>

      {/* ── Totales por categoría ── */}
      {categoryTotals.length > 0 && (
        <div>
          <p className={cn(tx.sectionLabel, "mb-3")}>Por categoría</p>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Categoría</th>
                  <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">Media mensual</th>
                  <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">vs. {year - 1}</th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Total anual</th>
                </tr>
              </thead>
              <tbody>
                {categoryTotals.map(({ cat, total, prevTotal }) => (
                  <tr key={cat.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cat.name}</span>
                        <span className={cn(
                          "rounded-full px-1.5 py-0.5 text-xs",
                          cat.splitType === "FIFTY_FIFTY"
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400"
                            : "bg-muted text-muted-foreground",
                        )}>
                          {SPLIT_LABELS[cat.splitType as SplitType]}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{formatAmountAbs(monthlyAvg(total))}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">
                      <ChangeCell pct={avgChangePct(total, prevTotal)} />
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium">{formatAmountAbs(total)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-border bg-muted/30">
                  <td className="px-4 py-2.5 font-semibold">Total</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold">{formatAmountAbs(monthlyAvg(totalExpenses))}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold">
                    <ChangeCell pct={avgChangePct(totalExpenses, prevTotalExpenses)} />
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold">{formatAmountAbs(totalExpenses)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Modal de mes ── */}
      <Dialog open={selectedMonth !== null} onOpenChange={o => { if (!o) setSelectedMonth(null) }}>
        <DialogContent className="max-w-2xl w-full p-0 gap-0 max-h-[90vh] overflow-hidden flex flex-col">
          {selectedMonth !== null && mData && (
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

              {/* Contenido */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

                {mData.hasData && (
                  <div className="grid grid-cols-2 gap-2">
                    <MonthBalanceCard name={p1Name}
                      contribution={mData.balance.contribution1}
                      obligation={mData.balance.obligation1}
                      balance={mData.balance.balance1} />
                    <MonthBalanceCard name={p2Name}
                      contribution={mData.balance.contribution2}
                      obligation={mData.balance.obligation2}
                      balance={mData.balance.balance2} />
                  </div>
                )}

                {/* Gastos */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-muted/30">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Gastos</p>
                    <button onClick={() => setExpDialog({ open: true, editing: null })}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                      <Plus className="size-3" /> Añadir
                    </button>
                  </div>
                  {mData.expenses.length === 0
                    ? <p className={cn(tx.caption, "px-4 py-3")}>Sin gastos este mes</p>
                    : mData.expenses.map(exp => {
                        const payerLabel =
                          exp.paidBy === "ACCOUNT" ? "Cuenta conjunta" :
                          exp.paidBy === "PERSON1" ? p1Name : p2Name
                        return (
                          <div key={exp.id} className="group flex items-center gap-3 border-b border-border/50 last:border-0 px-4 py-2.5">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{exp.category?.name ?? "Sin categoría"}</p>
                              <div className="flex items-center gap-1.5">
                                <span className={cn(
                                  "text-xs rounded-full px-1.5 py-0.5",
                                  exp.paidBy === "ACCOUNT" ? "bg-muted text-muted-foreground" : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
                                )}>{payerLabel}</span>
                                {exp.note && <span className={tx.caption}>{exp.note}</span>}
                              </div>
                            </div>
                            <span className="tabular-nums text-sm font-medium shrink-0">{formatAmountAbs(exp.amount)}</span>
                            <div className={interactive.rowActions}>
                              <button onClick={() => setExpDialog({ open: true, editing: exp })}
                                className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                                <Pencil className="size-3.5" />
                              </button>
                              <button onClick={() => handleDeleteExpense(exp.id)}
                                className="rounded p-1 text-muted-foreground hover:text-red-500 transition-colors">
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        )
                      })
                  }
                </div>

                {/* Aportaciones */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/50 bg-muted/30">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aportaciones a cuenta</p>
                    <button onClick={() => setDepDialog({ open: true, editing: null })}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
                      <Plus className="size-3" /> Añadir
                    </button>
                  </div>
                  {mData.deposits.length === 0
                    ? <p className={cn(tx.caption, "px-4 py-3")}>Sin aportaciones este mes</p>
                    : mData.deposits.map(dep => (
                        <div key={dep.id} className="group flex items-center gap-3 border-b border-border/50 last:border-0 px-4 py-2.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{dep.person === 1 ? p1Name : p2Name}</p>
                            {dep.note && <p className={tx.caption}>{dep.note}</p>}
                          </div>
                          <span className="tabular-nums text-sm font-medium shrink-0">{formatAmountAbs(dep.amount)}</span>
                          <div className={interactive.rowActions}>
                            <button onClick={() => setDepDialog({ open: true, editing: dep })}
                              className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                              <Pencil className="size-3.5" />
                            </button>
                            <button onClick={() => handleDeleteDeposit(dep.id)}
                              className="rounded p-1 text-muted-foreground hover:text-red-500 transition-colors">
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                  }
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogos fuera del modal para evitar anidamiento */}
      {selectedMonth !== null && (
        <>
          <ExpenseDialog
            key={`exp-${expDialog.editing?.id ?? "new"}-${selectedMonth}`}
            open={expDialog.open}
            onClose={() => setExpDialog({ open: false, editing: null })}
            year={year}
            month={selectedMonth}
            categories={categories}
            p1Name={p1Name}
            p2Name={p2Name}
            editing={expDialog.editing}
            ownerUserId={ownerUserId}
            personSwapped={personSwapped}
          />
          <DepositDialog
            key={`dep-${depDialog.editing?.id ?? "new"}-${selectedMonth}`}
            open={depDialog.open}
            onClose={() => setDepDialog({ open: false, editing: null })}
            year={year}
            month={selectedMonth}
            p1Name={p1Name}
            p2Name={p2Name}
            editing={depDialog.editing}
            ownerUserId={ownerUserId}
            personSwapped={personSwapped}
          />
        </>
      )}
    </div>
  )
}
