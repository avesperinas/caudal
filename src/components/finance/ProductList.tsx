"use client"

import { useState } from "react"
import { Pencil, Plus, LucideIcon, Building2, PiggyBank, TrendingUp, Shield, BarChart2, Home, Zap, Package } from "lucide-react"
import { Entity, Product, ProductType } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { tx, interactive, layout } from "@/lib/styles"
import { PRODUCT_TYPE_LABELS, formatMonthYear } from "@/lib/products"
import { EntityBadge } from "@/components/finance/EntityBadge"
import { EntityIcon } from "@/components/finance/EntityIcon"
import { ProductDialog } from "@/components/finance/ProductDialog"

type ProductWithEntity = Product & { entity: Entity }
type Tab     = "activos" | "cerrados" | "todos"
type GroupBy = "entity" | "type"

// ─── Constantes ───────────────────────────────────────────────────────────────

const TABS: { value: Tab; label: string }[] = [
  { value: "activos",  label: "Activos" },
  { value: "cerrados", label: "Cerrados" },
  { value: "todos",    label: "Todos" },
]

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "entity", label: "Entidad" },
  { value: "type",   label: "Tipo" },
]

const PRODUCT_TYPE_ICONS: Record<ProductType, LucideIcon> = {
  CHECKING:    Building2,
  SAVINGS:     PiggyBank,
  FUND:        TrendingUp,
  PENSION:     Shield,
  ETF:         BarChart2,
  REAL_ESTATE: Home,
  CRYPTO:      Zap,
  OTHER:       Package,
}

// ─── Lógica de agrupación ─────────────────────────────────────────────────────

type Group = {
  key: string
  entity?: Entity
  typeKey?: ProductType
  products: ProductWithEntity[]
}

function buildGroups(products: ProductWithEntity[], groupBy: GroupBy): Group[] {
  if (groupBy === "entity") {
    const map = new Map<string, Group>()
    for (const p of products) {
      if (!map.has(p.entityId)) {
        map.set(p.entityId, { key: p.entityId, entity: p.entity, products: [] })
      }
      map.get(p.entityId)!.products.push(p)
    }
    return Array.from(map.values()).sort((a, b) =>
      (a.entity?.name ?? "").localeCompare(b.entity?.name ?? ""),
    )
  }

  // by type
  const map = new Map<ProductType, Group>()
  for (const p of products) {
    if (!map.has(p.type)) {
      map.set(p.type, { key: p.type, typeKey: p.type, products: [] })
    }
    map.get(p.type)!.products.push(p)
  }
  return Array.from(map.values()).sort((a, b) =>
    PRODUCT_TYPE_LABELS[a.typeKey!].localeCompare(PRODUCT_TYPE_LABELS[b.typeKey!]),
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

type Props = { products: ProductWithEntity[]; entities: Entity[] }

export function ProductList({ products, entities }: Props) {
  const [tab,     setTab]     = useState<Tab>("activos")
  const [groupBy, setGroupBy] = useState<GroupBy>("entity")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ProductWithEntity | undefined>()

  const filtered = products.filter((p) => {
    if (tab === "activos")  return !p.closedAt
    if (tab === "cerrados") return Boolean(p.closedAt)
    return true
  })

  const counts = {
    activos:  products.filter((p) => !p.closedAt).length,
    cerrados: products.filter((p) => p.closedAt).length,
    todos:    products.length,
  }

  const groups = buildGroups(filtered, groupBy)

  function openCreate() { setEditing(undefined); setDialogOpen(true) }
  function openEdit(p: ProductWithEntity) { setEditing(p); setDialogOpen(true) }

  return (
    <div className={layout.page}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className={tx.pageTitle}>Productos</h1>
          <p className={cn(tx.secondary, "mt-1")}>Tus cuentas e inversiones</p>
        </div>
        <Button onClick={openCreate} size="sm" className="shrink-0 gap-2">
          <Plus className="size-4" />
          Nuevo
        </Button>
      </div>

      {/* Controles */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {/* Filter tabs */}
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tab === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
              <span className={cn(
                "rounded-full px-1.5 py-px text-xs tabular-nums",
                tab === value ? "bg-muted text-foreground" : "text-muted-foreground",
              )}>
                {counts[value]}
              </span>
            </button>
          ))}
        </div>

        {/* Group selector */}
        <div className="flex items-center gap-2">
          <span className={tx.caption}>Agrupar</span>
          <div className="flex gap-1 rounded-lg bg-muted p-1">
            {GROUP_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setGroupBy(value)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  groupBy === value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <EmptyState tab={tab} onCreateClick={openCreate} />
        ) : (
          groups.map((group) => (
            <Card key={group.key} className="overflow-hidden">
              {/* Group header */}
              <GroupHeader group={group} groupBy={groupBy} />
              <CardContent className="p-0">
                {group.products.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    showEntity={groupBy === "type"}
                    onEdit={() => openEdit(product)}
                  />
                ))}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entities={entities}
        product={editing}
      />
    </div>
  )
}

// ─── Group header ─────────────────────────────────────────────────────────────

function GroupHeader({ group, groupBy }: { group: Group; groupBy: GroupBy }) {
  const count = group.products.length
  const label = count === 1 ? "producto" : "productos"

  return (
    <div className="flex items-center gap-2.5 border-b border-border bg-muted/30 px-4 py-2.5">
      {groupBy === "entity" && group.entity && (
        <EntityBadge name={group.entity.name} color={group.entity.color} icon={group.entity.icon} />
      )}
      {groupBy === "type" && group.typeKey && (
        <>
          {(() => {
            const Icon = PRODUCT_TYPE_ICONS[group.typeKey]
            return <Icon className="size-3.5 text-muted-foreground" />
          })()}
          <span className={tx.sectionLabel}>{PRODUCT_TYPE_LABELS[group.typeKey]}</span>
        </>
      )}
      <span className={cn(tx.caption, "ml-auto tabular-nums")}>
        {count} {label}
      </span>
    </div>
  )
}

// ─── Product row ──────────────────────────────────────────────────────────────

function ProductRow({
  product,
  showEntity,
  onEdit,
}: {
  product: ProductWithEntity
  showEntity: boolean
  onEdit: () => void
}) {
  const isClosed = Boolean(product.closedAt)
  const Icon = PRODUCT_TYPE_ICONS[product.type as ProductType]

  return (
    <div
      className={cn(
        interactive.listRow,
        "items-center gap-3 px-4",
        isClosed && "opacity-55",
      )}
    >
      {/* Icono de entidad */}
      <EntityIcon
        iconName={product.entity.icon}
        color={product.entity.color}
        muted={isClosed}
      />

      {/* Nombre + tipo */}
      <div className="min-w-0 flex-1">
        <p className={cn(tx.label, "truncate")}>{product.name}</p>
        <p className={tx.caption}>{PRODUCT_TYPE_LABELS[product.type as ProductType]}</p>
      </div>

      {/* Right: entidad + meta + editar */}
      <div className="flex shrink-0 items-center gap-3">
        {showEntity && (
          <EntityBadge
            name={product.entity.name}
            color={product.entity.color}
            icon={product.entity.icon}
            className="hidden sm:inline-flex"
          />
        )}

        <div className="hidden text-right md:block">
          <p className={tx.amount}>{product.ownership}%</p>
          <p className={tx.caption}>titularidad</p>
        </div>

        <div className="hidden text-right sm:block">
          <p className={tx.amount}>{formatMonthYear(product.openedAt)}</p>
          <p className={cn(tx.caption, "whitespace-nowrap")}>
            {isClosed && product.closedAt
              ? `→ ${formatMonthYear(product.closedAt)}`
              : "apertura"}
          </p>
        </div>

        <button
          onClick={onEdit}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Editar"
        >
          <Pencil className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ tab, onCreateClick }: { tab: Tab; onCreateClick: () => void }) {
  const messages: Record<Tab, string> = {
    activos:  "No tienes productos activos.",
    cerrados: "No tienes productos cerrados.",
    todos:    "Aún no has añadido ningún producto.",
  }
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-16 text-center">
      <p className={tx.secondary}>{messages[tab]}</p>
      {tab !== "cerrados" && (
        <Button variant="outline" size="sm" onClick={onCreateClick} className="gap-2">
          <Plus className="size-4" />
          Añadir producto
        </Button>
      )}
    </div>
  )
}
