import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PatrimonioView } from "@/components/finance/PatrimonioView"

export default async function PatrimonioPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const userId = session.user.id

  const [products, snapshots] = await Promise.all([
    prisma.product.findMany({
      where: { userId, closedAt: null },
      include: { entity: true },
      orderBy: [{ entity: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.productSnapshot.findMany({
      where: { userId },
      include: {
        product: {
          include: { entity: true },
        },
      },
      orderBy: { date: "asc" },
    }),
  ])

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold">Patrimonio</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Evolución de tu patrimonio neto proporcional.
        </p>
      </div>
      <PatrimonioView products={products} snapshots={snapshots} />
    </div>
  )
}
