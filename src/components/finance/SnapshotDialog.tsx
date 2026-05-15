"use client"

import { useState, useTransition } from "react"
import { PlusCircle, CalendarDays, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EntityIcon } from "@/components/finance/EntityIcon"
import { saveSnapshots } from "@/app/(dashboard)/patrimonio/actions"
import { toDateInput } from "@/lib/products"
import { formatAmountAbs } from "@/lib/format"

type Product = {
  id: string
  name: string
  ownership: number
  entity: {
    name: string
    color: string
    icon: string | null
  }
}

type Props = {
  products: Product[]
  /** Si se pasa, es edición de fecha existente */
  defaultDate?: string
  defaultValues?: Record<string, number>
  onClose?: () => void
  trigger?: React.ReactNode
}

export function SnapshotDialog({ products, defaultDate, defaultValues, onClose, trigger }: Props) {
  const [open, setOpen] = useState(false)

  // Fecha: por defecto día 1 del mes actual
  const today = new Date()
  const firstOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`
  const [date, setDate] = useState(defaultDate ?? firstOfMonth)

  const [values, setValues] = useState<Record<string, string>>(() => {
    if (!defaultValues) return {}
    return Object.fromEntries(
      Object.entries(defaultValues).map(([k, v]) => [k, String(v)])
    )
  })

  const [isPending, startTransition] = useTransition()

  function handleClose(o: boolean) {
    setOpen(o)
    if (!o) onClose?.()
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const snapshots = products
      .map((p) => ({ productId: p.id, value: parseFloat(values[p.id] ?? "") }))
      .filter((s) => !isNaN(s.value))

    if (snapshots.length === 0) return

    startTransition(async () => {
      await saveSnapshots(date, snapshots)
      handleClose(false)
    })
  }

  // Activos con valor → patrimonio total proporcional (preview)
  const total = products.reduce((acc, p) => {
    const v = parseFloat(values[p.id] ?? "")
    return acc + (isNaN(v) ? 0 : v * (p.ownership / 100))
  }, 0)

  const hasValues = products.some((p) => !isNaN(parseFloat(values[p.id] ?? "")))

  const defaultTrigger = (
    <Button size="sm" onClick={() => setOpen(true)}>
      <PlusCircle className="size-4" />
      Registrar snapshot
    </Button>
  )

  const triggerWithOpen = trigger
    ? <span onClick={() => setOpen(true)} className="contents">{trigger}</span>
    : defaultTrigger

  return (
    <>
      {triggerWithOpen}
      <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" />
            Snapshot de patrimonio
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Fecha */}
          <div className="space-y-1.5">
            <Label htmlFor="snap-date">Fecha</Label>
            <Input
              id="snap-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {/* Productos */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Valor de cada producto</p>
            <p className="text-xs text-muted-foreground">
              Introduce el valor total. La titularidad se aplica automáticamente.
            </p>

            <div className="divide-y divide-border rounded-xl border">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-3 py-2.5">
                  <EntityIcon iconName={p.entity.icon} color={p.entity.color} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.entity.name} · {p.ownership}%</p>
                  </div>
                  <div className="relative w-28">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0,00"
                      value={values[p.id] ?? ""}
                      onChange={(e) => setValues((v) => ({ ...v, [p.id]: e.target.value }))}
                      className="pr-6 text-right text-sm"
                    />
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      €
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Preview total */}
          {hasValues && (
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2.5 text-sm">
              <span className="text-muted-foreground">Patrimonio proporcional</span>
              <span className="font-semibold tabular-nums">
                {formatAmountAbs(total)}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !hasValues}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  )
}
