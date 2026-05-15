import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { SnapshotForm } from "@/components/finance/SnapshotForm"
import { toDateInput } from "@/lib/products"

type Props = {
  searchParams: Promise<{ date?: string }>
}

export default async function SnapshotsPage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const { date: dateParam } = await searchParams

  const products = await prisma.product.findMany({
    where: { userId, closedAt: null },
    include: { entity: true },
    orderBy: [{ entity: { name: "asc" } }, { name: "asc" }],
  })

  // Fecha por defecto: día 1 del mes actual
  const today = new Date()
  const defaultDate = dateParam ?? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`

  // Si viene fecha, cargar valores existentes
  let defaultValues: Record<string, number> | undefined
  if (dateParam) {
    const existing = await prisma.productSnapshot.findMany({
      where: { userId, date: new Date(dateParam) },
    })
    if (existing.length > 0) {
      defaultValues = Object.fromEntries(existing.map((s) => [s.productId, s.value]))
    }
  }

  const isEditing = !!defaultValues

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold">
          {isEditing ? "Editar snapshot" : "Nuevo snapshot"}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {isEditing
            ? `Editando valores del ${new Date(dateParam!).toLocaleDateString("es-ES", { month: "long", year: "numeric", timeZone: "UTC" })}`
            : "Registra el valor de tus productos a fecha de hoy."}
        </p>
      </div>

      <SnapshotForm
        products={products}
        defaultDate={defaultDate}
        defaultValues={defaultValues}
      />
    </div>
  )
}
