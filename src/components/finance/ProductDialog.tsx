"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { Check, ChevronDown, Plus, X } from "lucide-react"
import { Entity, Product, ProductType } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { tx } from "@/lib/styles"
import { ENTITY_COLORS, PRODUCT_TYPES, toDateInput } from "@/lib/products"
import { EntityIcon, EntityIconPicker } from "@/components/finance/EntityIcon"
import { createEntity, createProduct, updateProduct } from "@/app/(dashboard)/productos/actions"

type ProductWithEntity = Product & { entity: Entity }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  entities: Entity[]
  product?: ProductWithEntity
}

// ─── Entity selector ─────────────────────────────────────────────────────────

function EntitySelector({
  entities,
  value,
  onChange,
  onEntityCreated,
}: {
  entities: Entity[]
  value: string
  onChange: (id: string) => void
  onEntityCreated: (entity: Entity) => void
}) {
  const [dropOpen, setDropOpen]   = useState(false)
  const [showForm, setShowForm]   = useState(false)
  const [newName, setNewName]     = useState("")
  const [newColor, setNewColor]   = useState<string>(ENTITY_COLORS[7])
  const [newIcon, setNewIcon]     = useState("")
  const [creating, startCreating] = useTransition()
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!dropOpen) return
    function onClickOutside(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false)
      }
    }
    document.addEventListener("mousedown", onClickOutside)
    return () => document.removeEventListener("mousedown", onClickOutside)
  }, [dropOpen])

  const selected = entities.find((e) => e.id === value)

  function handleCreateEntity() {
    if (!newName.trim()) return
    startCreating(async () => {
      const entity = await createEntity({ name: newName.trim(), color: newColor, icon: newIcon || null })
      onEntityCreated(entity)
      onChange(entity.id)
      setShowForm(false)
      setNewName("")
      setNewIcon("")
    })
  }

  return (
    <div className="space-y-2">
      {/* Trigger */}
      <div className="relative" ref={dropRef}>
        <button
          type="button"
          onClick={() => { setDropOpen((v) => !v); setShowForm(false) }}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input px-3 text-sm",
            "bg-background transition-colors hover:border-ring/50",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          )}
        >
          {selected ? (
            <span className="flex items-center gap-2">
              <EntityIcon iconName={selected.icon} color={selected.color} size="sm" />
              <span>{selected.name}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Selecciona una entidad</span>
          )}
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </button>

        {dropOpen && (
          <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-md">
            {entities.length === 0 && (
              <p className={cn(tx.caption, "px-3 py-2")}>Sin entidades aún</p>
            )}
            {entities.map((entity) => (
              <button
                key={entity.id}
                type="button"
                onClick={() => { onChange(entity.id); setDropOpen(false) }}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  value === entity.id && "bg-accent",
                )}
              >
                <EntityIcon iconName={entity.icon} color={entity.color} size="sm" />
                <span className="flex-1 text-left">{entity.name}</span>
                {value === entity.id && <Check className="size-3.5 text-primary" />}
              </button>
            ))}
            <div className="border-t border-border">
              <button
                type="button"
                onClick={() => { setDropOpen(false); setShowForm(true) }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Plus className="size-3.5" />
                Nueva entidad
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inline new entity form */}
      {showForm && (
        <div className="rounded-lg border border-border bg-muted/40 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Preview del icono */}
              <EntityIcon iconName={newIcon} color={newColor} size="sm" />
              <p className={tx.label}>Nueva entidad</p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <Input
            placeholder="Nombre (ej: BBVA, Indexa...)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateEntity() } }}
            autoFocus
          />

          {/* Icon picker */}
          <div className="space-y-1.5">
            <p className={tx.caption}>Icono</p>
            <EntityIconPicker value={newIcon} color={newColor} onChange={setNewIcon} />
          </div>

          {/* Color picker */}
          <div className="space-y-1.5">
            <p className={tx.caption}>Color</p>
            <div className="flex flex-wrap gap-2">
              {ENTITY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className={cn(
                    "size-6 rounded-full transition-transform hover:scale-110",
                    newColor === color && "ring-2 ring-offset-2 ring-offset-background scale-110",
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!newName.trim() || creating}
              onClick={handleCreateEntity}
            >
              {creating ? "Creando…" : "Crear entidad"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Dialog principal ─────────────────────────────────────────────────────────

export function ProductDialog({ open, onOpenChange, entities: initialEntities, product }: Props) {
  const isEdit = Boolean(product)
  const [entities, setEntities]   = useState(initialEntities)
  const [isPending, startTransition] = useTransition()

  const [name, setName]                   = useState("")
  const [entityId, setEntityId]           = useState("")
  const [type, setType]                   = useState<ProductType>("CHECKING")
  const [ownership, setOwnership]         = useState(100)
  const [openedAt, setOpenedAt]           = useState("")
  const [closedAt, setClosedAt]           = useState("")
  const [countForSavings, setCountForSavings] = useState(true)

  useEffect(() => {
    if (!open) return
    setEntities(initialEntities)
    setName(product?.name ?? "")
    setEntityId(product?.entityId ?? "")
    setType(product?.type ?? "CHECKING")
    setOwnership(product?.ownership ?? 100)
    setOpenedAt(product?.openedAt ? toDateInput(product.openedAt) : "")
    setClosedAt(product?.closedAt ? toDateInput(product.closedAt) : "")
    setCountForSavings(product?.countForSavings ?? true)
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !entityId || !openedAt) return
    startTransition(async () => {
      const data = { name: name.trim(), entityId, type, ownership, openedAt, closedAt: closedAt || null, countForSavings }
      if (isEdit && product) await updateProduct(product.id, data)
      else await createProduct(data)
      onOpenChange(false)
    })
  }

  const inputClass = cn(
    "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
    "ring-offset-background placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50",
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="Ej: Cuenta nómina, Fondo indexado…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Entidad</Label>
            <EntitySelector
              entities={entities}
              value={entityId}
              onChange={setEntityId}
              onEntityCreated={(e) => setEntities((prev) => [...prev, e])}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type">Tipo de producto</Label>
            <select
              id="type"
              className={inputClass}
              value={type}
              onChange={(e) => setType(e.target.value as ProductType)}
            >
              {PRODUCT_TYPES.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ownership">Titularidad</Label>
              <div className="relative">
                <input
                  id="ownership"
                  type="number"
                  min={1} max={100} step={1}
                  className={cn(inputClass, "pr-6")}
                  value={ownership}
                  onChange={(e) => setOwnership(Number(e.target.value))}
                  required
                />
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  %
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="openedAt">Apertura</Label>
              <input id="openedAt" type="date" className={inputClass} value={openedAt} onChange={(e) => setOpenedAt(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="closedAt">Cierre</Label>
              <input id="closedAt" type="date" className={inputClass} value={closedAt} onChange={(e) => setClosedAt(e.target.value)} />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCountForSavings((v) => !v)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-colors",
              countForSavings
                ? "border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/40"
                : "border-border bg-background hover:bg-muted",
            )}
          >
            <div className="text-left">
              <p className={cn("font-medium", countForSavings ? "text-violet-700 dark:text-violet-400" : "text-foreground")}>
                Cuenta para tasa de ahorro
              </p>
              <p className="text-xs text-muted-foreground">
                {countForSavings ? "Las aportaciones a este producto se incluyen en la tasa financiera" : "Excluido del cálculo de tasa de ahorro"}
              </p>
            </div>
            <div className={cn(
              "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
              countForSavings
                ? "border-violet-500 bg-violet-500 text-white"
                : "border-border bg-background",
            )}>
              {countForSavings && <Check className="size-3" />}
            </div>
          </button>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending || !name.trim() || !entityId || !openedAt}>
              {isPending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
