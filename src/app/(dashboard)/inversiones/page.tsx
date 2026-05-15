import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { InversionesView } from "@/components/finance/InversionesView"

export default async function InversionesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const products = await prisma.product.findMany({
    where: { userId, countForSavings: true },
    include: {
      entity: true,
      snapshots: { orderBy: { date: "asc" } },
      personalTransactions: {
        where: { type: "TRANSFER" },
        orderBy: [{ year: "asc" }, { month: "asc" }],
      },
    },
    orderBy: [{ entity: { name: "asc" } }, { name: "asc" }],
  })

  const serialized = products.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type as string,
    ownership: p.ownership,
    openedAt: p.openedAt.toISOString(),
    closedAt: p.closedAt?.toISOString() ?? null,
    entity: { id: p.entity.id, name: p.entity.name, color: p.entity.color },
    snapshots: p.snapshots.map((s) => ({
      id: s.id,
      date: s.date.toISOString(),
      value: s.value,
    })),
    aportaciones: p.personalTransactions.map((t) => ({
      id: t.id,
      year: t.year,
      month: t.month,
      date: t.date?.toISOString() ?? null,
      amount: t.amount,
      madeByMe: t.madeByMe,
      note: t.note,
    })),
  }))

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold">Inversiones</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Rentabilidad y seguimiento de tus productos de inversión.
        </p>
      </div>
      <InversionesView products={serialized} />
    </div>
  )
}
