"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Pencil, Check, X } from "lucide-react"
import { PersonalCategory } from "@prisma/client"
import { cn } from "@/lib/utils"
import { tx, interactive } from "@/lib/styles"
import { useConfirmDelete } from "@/components/ui/confirm-delete"
import {
  createPersonalCategory,
  updatePersonalCategory,
  deletePersonalCategory,
  togglePersonalCategory,
} from "@/app/(dashboard)/personal/actions"

// ─── Action de flag ───────────────────────────────────────────────────────────
// Se necesita una action nueva para countForExtendedSavings
import { toggleExtendedSavings } from "@/app/(dashboard)/categorias/actions"

type Props = {
  incomeCategories: PersonalCategory[]
  expenseCategories: PersonalCategory[]
}

// ─── Fila de categoría ────────────────────────────────────────────────────────

function CatRow({
  cat,
  showExtended,
  onToggleActive,
  onToggleExtended,
  onEdit,
  onDelete,
}: {
  cat: PersonalCategory
  showExtended: boolean
  onToggleActive: () => void
  onToggleExtended: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className={cn(
      "group flex items-center gap-3 border-b border-border px-4 py-3 last:border-0",
      !cat.isActive && "opacity-50",
    )}>
      <button
        onClick={onToggleActive}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
          cat.isActive
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background",
        )}
        title={cat.isActive ? "Desactivar" : "Activar"}
      >
        {cat.isActive && <Check className="size-3" />}
      </button>

      <p className="flex-1 text-sm font-medium truncate">{cat.name}</p>

      {showExtended && (
        <button
          onClick={onToggleExtended}
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
            cat.countForExtendedSavings
              ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
          title="Incluir en tasa de ahorro ampliada"
        >
          {cat.countForExtendedSavings ? "En tasa" : "Excluida"}
        </button>
      )}

      <div className={interactive.rowActions}>
        <button onClick={onEdit} className="rounded p-1 hover:bg-muted text-muted-foreground">
          <Pencil className="size-3.5" />
        </button>
        <button onClick={onDelete}
          className="rounded p-1 hover:bg-red-50 text-muted-foreground hover:text-red-600 dark:hover:bg-red-950">
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Sección de categorías ────────────────────────────────────────────────────

function CatSection({
  title, description, categories, showExtended, type,
}: {
  title: string
  description: string
  categories: PersonalCategory[]
  showExtended: boolean
  type: "INCOME" | "EXPENSE"
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const { confirmDelete, confirmDialog } = useConfirmDelete({ title: "¿Eliminar la categoría?" })

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    startTransition(async () => {
      await createPersonalCategory(newName.trim(), type)
      router.refresh()
      setNewName("")
      setAdding(false)
    })
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editId || !editName.trim()) return
    startTransition(async () => {
      await updatePersonalCategory(editId, editName.trim())
      router.refresh()
      setEditId(null)
    })
  }

  return (
    <div className="space-y-3">
      <div>
        <p className={tx.label}>{title}</p>
        <p className={tx.caption}>{description}</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        {categories.map(cat => (
          editId === cat.id ? (
            <form key={cat.id} onSubmit={handleEdit}
              className="flex items-center gap-2 border-b border-border px-4 py-2 last:border-0">
              <input
                autoFocus
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <button type="submit" className="rounded p-1 text-emerald-600 hover:bg-emerald-50">
                <Check className="size-4" />
              </button>
              <button type="button" onClick={() => setEditId(null)} className="rounded p-1 text-muted-foreground hover:bg-muted">
                <X className="size-4" />
              </button>
            </form>
          ) : (
            <CatRow
              key={cat.id}
              cat={cat}
              showExtended={showExtended}
              onToggleActive={() => startTransition(async () => {
                await togglePersonalCategory(cat.id, !cat.isActive)
                router.refresh()
              })}
              onToggleExtended={() => startTransition(async () => {
                await toggleExtendedSavings(cat.id, !cat.countForExtendedSavings)
                router.refresh()
              })}
              onEdit={() => { setEditId(cat.id); setEditName(cat.name) }}
              onDelete={() => confirmDelete(() => startTransition(async () => {
                await deletePersonalCategory(cat.id)
                router.refresh()
              }))}
            />
          )
        ))}

        {adding ? (
          <form onSubmit={handleAdd}
            className="flex items-center gap-2 px-4 py-2 border-t border-border">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nombre de la categoría"
              className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button type="submit" className="rounded p-1 text-emerald-600 hover:bg-emerald-50">
              <Check className="size-4" />
            </button>
            <button type="button" onClick={() => setAdding(false)} className="rounded p-1 text-muted-foreground hover:bg-muted">
              <X className="size-4" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex w-full items-center gap-2 border-t border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            <Plus className="size-4" /> Añadir categoría
          </button>
        )}
      </div>
      {confirmDialog}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function CategoriasView({ incomeCategories, expenseCategories }: Props) {
  return (
    <div className="mx-auto max-w-2xl space-y-8 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold">Categorías</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Gestiona las categorías de ingresos y gastos.
        </p>
      </div>

      <CatSection
        title="Ingresos"
        description="Tipos de ingreso (nómina, bono, etc.)"
        categories={incomeCategories}
        showExtended={false}
        type="INCOME"
      />

      <CatSection
        title="Gastos personales"
        description='Las categorías marcadas como "En tasa" cuentan para la tasa de ahorro ampliada.'
        categories={expenseCategories}
        showExtended={true}
        type="EXPENSE"
      />
    </div>
  )
}
