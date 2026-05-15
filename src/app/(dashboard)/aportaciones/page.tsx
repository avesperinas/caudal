import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { AportacionesView } from "@/components/finance/AportacionesView"

export default async function AportacionesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const [aportaciones, products] = await Promise.all([
    prisma.personalTransaction.findMany({
      where: { userId, type: "TRANSFER" },
      include: { product: { include: { entity: true } } },
      orderBy: [{ date: "desc" }, { year: "desc" }, { month: "desc" }, { createdAt: "desc" }],
    }),
    prisma.product.findMany({
      where: { userId, closedAt: null, countForSavings: true },
      include: { entity: true },
      orderBy: [{ entity: { name: "asc" } }, { name: "asc" }],
    }),
  ])

  return <AportacionesView aportaciones={aportaciones} products={products} />
}
