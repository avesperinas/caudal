"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Trash2, Pencil, ChevronLeft } from "lucide-react"
import { PersonalCategory, PersonalCategoryType } from "@prisma/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { tx } from "@/lib/styles"
import {
  createPersonalCategory, updatePersonalCategory,
  deletePersonalCategory, togglePersonalCategory,
} from "@/app/(dashboard)/personal/actions"

type Props = { categories: PersonalCategory[] }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <p className={tx.label}>{label}</p>
      {children}
    </div>
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

// ─── Diálogo ──────────────────────────────────────────────────────────────────

function CategoryDialog({ open, onClose, type, editing }: {
  open: boolean; onClose: () => void
  type: PersonalCategoryType; editing: PersonalCategory | null
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [name, setName] = useState(editing?.name ?? "")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    startTransition(async () => {
      if (editing) await updatePersonalCategory(editing.id, name.trim())
      else         await createPersonalCategory(name.trim(), type)
      router.refresh()
      onClose()
    })
  }

  const typeLabel = type === "INCOME" ? "ingreso" : "gasto"

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar" : "Nueva"} categoría de {typeLabel}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <Field label="Nombre">
            <input
              value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Salario"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
              Cancelar
            </button>
            <button type="submit" disabled={pending}
              className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
              {pending ? "Guardando…" : editing ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Lista de categorías ──────────────────────────────────────────────────────

function CategoryList({ categories, type }: { categories: PersonalCategory[]; type: PersonalCategoryType }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [dialog, setDialog] = useState<{ open: boolean; editing: PersonalCategory | null }>({ open: false, editing: null })

  const filtered = categories.filter(c => c.type === type)
  const title = type === "INCOME" ? "Categorías de ingresos" : "Categorías de gastos"

  function handleToggle(id: string, current: boolean) {
    startTransition(async () => { await togglePersonalCategory(id, !current); router.refresh() })
  }
  function handleDelete(id: string) {
    startTransition(async () => { await deletePersonalCategory(id); router.refresh() })
  }

  return (
    <>
      <CardSection
        title={title}
        action={
          <button onClick={() => setDialog({ open: true, editing: null })}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-muted">
            <Plus className="size-3.5" /> Añadir
          </button>
        }
      >
        {filtered.length === 0 ? (
          <p className={cn(tx.secondary, "text-center text-xs py-2")}>Sin categorías</p>
        ) : (
          <div className="space-y-1.5">
            {filtered.map(cat => (
              <div key={cat.id} className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2.5 transition-opacity",
                cat.isActive ? "border-border" : "border-border opacity-50",
              )}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(cat.id, cat.isActive)}
                    className={cn("h-4 w-4 rounded border transition-colors",
                      cat.isActive ? "border-primary bg-primary" : "border-muted-foreground")}
                  >
                    {cat.isActive && (
                      <svg viewBox="0 0 16 16" className="size-4 text-primary-foreground" fill="currentColor">
                        <path d="M13.5 3.5L6 11 2.5 7.5l-1 1L6 13l8.5-8.5-1-1z"/>
                      </svg>
                    )}
                  </button>
                  <p className="text-sm font-medium">{cat.name}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setDialog({ open: true, editing: cat })}
                    className="rounded p-1.5 hover:bg-muted text-muted-foreground">
                    <Pencil className="size-3.5" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)}
                    className="rounded p-1.5 hover:bg-red-50 text-muted-foreground hover:text-red-600 dark:hover:bg-red-950">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardSection>

      <CategoryDialog
        key={dialog.editing?.id ?? `new-${type}`}
        open={dialog.open}
        onClose={() => setDialog({ open: false, editing: null })}
        type={type}
        editing={dialog.editing}
      />
    </>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function PersonalConfigView({ categories }: Props) {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div className="flex items-center gap-3">
        <Link href="/registro/personal" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="size-4" />
          Personal
        </Link>
        <span className={cn(tx.secondary, "text-xs")}>/</span>
        <h1 className="text-lg font-semibold">Categorías</h1>
      </div>

      <CategoryList categories={categories} type="INCOME" />
      <CategoryList categories={categories} type="EXPENSE" />
    </div>
  )
}
