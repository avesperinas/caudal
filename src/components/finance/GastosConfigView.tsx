"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Pencil, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import {
  SharedCategory, SharedPersonIncome, SharedYearConfig, SplitType, Entity, Product,
} from "@prisma/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { tx } from "@/lib/styles"
import { formatAmountAbs } from "@/lib/format"
import { SPLIT_LABELS, getAnnualIncome } from "@/lib/gastos"
import {
  upsertYearConfig, setYearSettled,
  createPersonIncome, updatePersonIncome, deletePersonIncome,
  createCategory, updateCategory, deleteCategory, toggleCategory,
} from "@/app/(dashboard)/gastos/actions"

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ProductWithEntity = Product & { entity: Entity }

type Props = {
  year: number
  yearConfig: SharedYearConfig | null
  categories: SharedCategory[]
  personIncomes: SharedPersonIncome[]
  products: ProductWithEntity[]
  basePath?: string
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

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring tabular-nums"
    />
  )
}

function CardSection({ title, children, action }: {
  title: string; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-medium">{title}</p>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// ─── Diálogo de categoría ─────────────────────────────────────────────────────

function CategoryDialog({
  open, onClose, editing,
}: {
  open: boolean; onClose: () => void; editing: SharedCategory | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [name, setName]           = useState(editing?.name ?? "")
  const [splitType, setSplitType] = useState<SplitType>(editing?.splitType ?? "PROPORTIONAL")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    startTransition(async () => {
      if (editing) await updateCategory(editing.id, name.trim(), splitType)
      else         await createCategory(name.trim(), splitType)
      router.refresh()
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <Field label="Nombre">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Restaurantes" />
          </Field>
          <Field label="Tipo de reparto">
            <div className="flex gap-1 rounded-lg border border-border bg-muted/50 p-1">
              {(["FIFTY_FIFTY", "PROPORTIONAL"] as SplitType[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSplitType(s)}
                  className={cn(
                    "flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                    splitType === s
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {SPLIT_LABELS[s]}
                </button>
              ))}
            </div>
          </Field>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={pending} className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
              {pending ? "Guardando…" : editing ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Helpers de fecha ─────────────────────────────────────────────────────────

function toDateInput(d: Date): string {
  // Prisma devuelve @db.Date como UTC midnight — formatear en UTC para evitar off-by-one
  const yyyy = d.getUTCFullYear()
  const mm   = String(d.getUTCMonth() + 1).padStart(2, "0")
  const dd   = String(d.getUTCDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "UTC" })
}

// ─── Diálogo de ingreso por persona ──────────────────────────────────────────

function PersonIncomeDialog({
  open, onClose, year, person, personName, editing,
}: {
  open: boolean; onClose: () => void
  year: number; person: 1 | 2; personName: string
  editing: SharedPersonIncome | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [fromDate, setFromDate] = useState(editing ? toDateInput(editing.fromDate) : `${year}-01-01`)
  const [toDate,   setToDate]   = useState(editing ? toDateInput(editing.toDate)   : `${year}-12-31`)
  const [salary,   setSalary]   = useState(editing ? String(editing.salary) : "")
  const [extra,    setExtra]    = useState(editing ? String(editing.extra)  : "0")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const data = {
      fromDate,
      toDate,
      salary: parseFloat(salary) || 0,
      extra:  parseFloat(extra)  || 0,
    }
    startTransition(async () => {
      if (editing) await updatePersonIncome(editing.id, data)
      else         await createPersonIncome({ year, person, ...data })
      router.refresh()
      onClose()
    })
  }

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar" : "Añadir"} ingreso · {personName}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Desde">
              <Input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                min={`${year}-01-01`} max={`${year}-12-31`} />
            </Field>
            <Field label="Hasta">
              <Input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                min={`${year}-01-01`} max={`${year}-12-31`} />
            </Field>
          </div>
          <Field label="Salario neto anual">
            <Input type="text" inputMode="decimal" value={salary}
              onChange={e => setSalary(e.target.value)} placeholder="0" />
          </Field>
          <Field label="Ingresos extra (periodo)">
            <Input type="text" inputMode="decimal" value={extra}
              onChange={e => setExtra(e.target.value)} placeholder="0" />
          </Field>
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

// ─── Sección de ingresos por persona ─────────────────────────────────────────

function PersonIncomeSection({
  personName, person, incomes, year,
}: {
  personName: string; person: 1 | 2; incomes: SharedPersonIncome[]; year: number
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [dialog, setDialog] = useState<{ open: boolean; editing: SharedPersonIncome | null }>({ open: false, editing: null })

  const totalExtra = incomes.reduce((s, i) => s + i.extra, 0)
  const annualIncome = getAnnualIncome(incomes, person, year)

  function handleDelete(id: string) {
    startTransition(async () => {
      await deletePersonIncome(id)
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{personName}</p>
          {annualIncome > 0 && (
            <p className={cn(tx.caption, "tabular-nums")}>
              {formatAmountAbs(annualIncome)} / año
            </p>
          )}
        </div>
        <button
          onClick={() => setDialog({ open: true, editing: null })}
          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
        >
          <Plus className="size-3.5" /> Añadir
        </button>
      </div>

      {incomes.length === 0 ? (
        <p className={cn(tx.secondary, "text-center py-2 text-xs")}>Sin ingresos configurados</p>
      ) : (
        <div className="space-y-1.5">
          {incomes.map(inc => (
            <div key={inc.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <div>
                <p className="text-sm">
                  <span className="font-medium">{formatAmountAbs(inc.salary)}</span>
                  <span className={cn(tx.secondary, "ml-1.5")}>neto/año</span>
                </p>
                <p className={tx.caption}>
                  {fmtDate(inc.fromDate)}
                  {toDateInput(inc.fromDate) !== toDateInput(inc.toDate) && ` – ${fmtDate(inc.toDate)}`}
                  {inc.extra > 0 && <span className="ml-2 text-amber-600 dark:text-amber-400">+{formatAmountAbs(inc.extra)} extra</span>}
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setDialog({ open: true, editing: inc })} className="rounded p-1.5 hover:bg-muted text-muted-foreground">
                  <Pencil className="size-3.5" />
                </button>
                <button onClick={() => handleDelete(inc.id)} className="rounded p-1.5 hover:bg-red-50 text-muted-foreground hover:text-red-600 dark:hover:bg-red-950">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
          {totalExtra > 0 && (
            <p className={cn(tx.caption, "px-1 text-amber-600 dark:text-amber-400")}>
              Extra total: {formatAmountAbs(totalExtra)}
            </p>
          )}
        </div>
      )}

      <PersonIncomeDialog
        key={dialog.editing?.id ?? "new"}
        open={dialog.open}
        onClose={() => setDialog({ open: false, editing: null })}
        year={year}
        person={person}
        personName={personName}
        editing={dialog.editing}
      />
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export function GastosConfigView({ year, yearConfig, categories, personIncomes, products, basePath = "${basePath}" }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const [p1Name,    setP1Name]    = useState(yearConfig?.person1Name ?? "")
  const [p2Name,    setP2Name]    = useState(yearConfig?.person2Name ?? "")
  const [productId, setProductId] = useState(yearConfig?.productId ?? "")

  const [catDialog, setCatDialog] = useState<{ open: boolean; editing: SharedCategory | null }>({ open: false, editing: null })

  const p1Display = yearConfig?.person1Name || p1Name || "Persona 1"
  const p2Display = yearConfig?.person2Name || p2Name || "Persona 2"

  const incomes1 = personIncomes.filter(i => i.person === 1)
  const incomes2 = personIncomes.filter(i => i.person === 2)

  const settled = yearConfig?.settled ?? false

  function handleSaveYearConfig(e: React.FormEvent) {
    e.preventDefault()
    if (!p1Name.trim() || !p2Name.trim()) return
    startTransition(async () => {
      await upsertYearConfig(year, p1Name.trim(), p2Name.trim(), productId || null)
      router.refresh()
    })
  }

  function handleToggleSettled() {
    startTransition(async () => {
      await setYearSettled(year, !settled)
      router.refresh()
    })
  }

  function handleToggleCategory(id: string, current: boolean) {
    startTransition(async () => {
      await toggleCategory(id, !current)
      router.refresh()
    })
  }

  function handleDeleteCategory(id: string) {
    startTransition(async () => {
      await deleteCategory(id)
      router.refresh()
    })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="space-y-1">
        {/* Nivel raíz */}
        <div className="flex items-center gap-1.5">
          <Link
            href={`${basePath}/${year}`}
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Gastos
          </Link>
          <span className={cn(tx.secondary, "text-xs")}>/</span>
          <span className="text-sm font-medium text-muted-foreground">Configuración</span>
        </div>
        {/* Nivel año */}
        <div className="flex items-center gap-3">
          <Link
            href={`${basePath}/config/${year - 1}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
          >
            <ChevronLeft className="size-4" />
          </Link>
          <h1 className="text-xl font-semibold">{year}</h1>
          <Link
            href={`${basePath}/config/${year + 1}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
          >
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Personas */}
      <CardSection title="Personas">
        <form onSubmit={handleSaveYearConfig} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Persona 1">
              <Input value={p1Name} onChange={e => setP1Name(e.target.value)} placeholder="Nombre" />
            </Field>
            <Field label="Persona 2">
              <Input value={p2Name} onChange={e => setP2Name(e.target.value)} placeholder="Nombre" />
            </Field>
          </div>
          <Field label="Cuenta compartida">
            <select
              value={productId}
              onChange={e => setProductId(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">— Sin cuenta vinculada —</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.entity.name} · {p.name}</option>
              ))}
            </select>
          </Field>
          <button
            type="submit"
            className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Guardar
          </button>
        </form>
        <div className="mt-4 border-t border-border pt-4">
          <button
            onClick={handleToggleSettled}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition-colors",
              settled
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-900"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor">
              <path d="M13.5 3.5L6 11 2.5 7.5l-1 1L6 13l8.5-8.5-1-1z"/>
            </svg>
            {settled ? "Saldo solventado" : "Marcar saldo como solventado"}
          </button>
        </div>
      </CardSection>

      {/* Ingresos por persona */}
      <CardSection title="Ingresos">
        <div className="space-y-5">
          <PersonIncomeSection
            personName={p1Display}
            person={1}
            incomes={incomes1}
            year={year}
          />
          <div className="border-t border-border" />
          <PersonIncomeSection
            personName={p2Display}
            person={2}
            incomes={incomes2}
            year={year}
          />
        </div>
      </CardSection>

      {/* Categorías */}
      <CardSection
        title="Categorías"
        action={
          <button
            onClick={() => setCatDialog({ open: true, editing: null })}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            <Plus className="size-3.5" /> Añadir
          </button>
        }
      >
        <div className="space-y-1.5">
          {categories.map(cat => (
            <div key={cat.id} className={cn(
              "flex items-center justify-between rounded-lg border px-3 py-2.5 transition-opacity",
              cat.isActive ? "border-border" : "border-border opacity-50",
            )}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleCategory(cat.id, cat.isActive)}
                  className={cn(
                    "h-4 w-4 rounded border transition-colors",
                    cat.isActive
                      ? "border-primary bg-primary"
                      : "border-muted-foreground",
                  )}
                >
                  {cat.isActive && (
                    <svg viewBox="0 0 16 16" className="size-4 text-primary-foreground" fill="currentColor">
                      <path d="M13.5 3.5L6 11 2.5 7.5l-1 1L6 13l8.5-8.5-1-1z"/>
                    </svg>
                  )}
                </button>
                <p className="text-sm font-medium">{cat.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  cat.splitType === "FIFTY_FIFTY"
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400"
                    : "bg-muted text-muted-foreground",
                )}>
                  {SPLIT_LABELS[cat.splitType as SplitType]}
                </span>
                <button onClick={() => setCatDialog({ open: true, editing: cat })} className="rounded p-1.5 hover:bg-muted text-muted-foreground">
                  <Pencil className="size-3.5" />
                </button>
                <button onClick={() => handleDeleteCategory(cat.id)} className="rounded p-1.5 hover:bg-red-50 text-muted-foreground hover:text-red-600 dark:hover:bg-red-950">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardSection>

      {/* Dialogs */}
      <CategoryDialog
        open={catDialog.open}
        onClose={() => setCatDialog({ open: false, editing: null })}
        editing={catDialog.editing}
      />
    </div>
  )
}
