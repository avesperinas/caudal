"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EntityIcon } from "@/components/finance/EntityIcon"
import { saveSnapshots } from "@/app/(dashboard)/patrimonio/actions"
import { formatAmountAbs } from "@/lib/format"

type Product = {
  id: string
  name: string
  ownership: number
  entity: { name: string; color: string; icon: string | null }
}

type Props = {
  products: Product[]
  defaultDate: string
  defaultValues?: Record<string, number>
}

export function SnapshotForm({ products, defaultDate, defaultValues }: Props) {
  const router = useRouter()
  const [date, setDate] = useState(defaultDate)
  const [values, setValues] = useState<Record<string, string>>(() => {
    if (!defaultValues) return {}
    return Object.fromEntries(
      Object.entries(defaultValues).map(([k, v]) => [k, String(v)])
    )
  })
  const [isPending, startTransition] = useTransition()

  const hasValues = products.some((p) => !isNaN(parseFloat(values[p.id] ?? "")))

  const total = products.reduce((acc, p) => {
    const v = parseFloat(values[p.id] ?? "")
    return acc + (isNaN(v) ? 0 : v * (p.ownership / 100))
  }, 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const snapshots = products
      .map((p) => ({ productId: p.id, value: parseFloat(values[p.id] ?? "") }))
      .filter((s) => !isNaN(s.value))
    if (!snapshots.length) return

    startTransition(async () => {
      await saveSnapshots(date, snapshots)
      router.push("/patrimonio")
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Fecha */}
      <div className="space-y-1.5">
        <Label htmlFor="snap-date">Fecha</Label>
        <Input
          id="snap-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="max-w-48"
        />
      </div>

      {/* Tabla de productos */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium">Valor de cada producto</p>
        <p className="text-xs text-muted-foreground">
          Introduce el valor total del producto. La titularidad se aplica automáticamente al calcular el patrimonio.
        </p>
        <div className="divide-y divide-border rounded-xl border">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3">
              <EntityIcon iconName={p.entity.icon} color={p.entity.color} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.entity.name} · {p.ownership}%</p>
              </div>
              <div className="relative w-36">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={values[p.id] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [p.id]: e.target.value }))}
                  className="pr-7 text-right"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  €
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total proporcional */}
      {hasValues && (
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
          <span className="text-sm text-muted-foreground">Patrimonio proporcional</span>
          <span className="font-semibold tabular-nums">
            {formatAmountAbs(total)}
          </span>
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending || !hasValues}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Guardar snapshot
        </Button>
      </div>
    </form>
  )
}
