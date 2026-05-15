import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { SnapshotsAnualView } from "@/components/finance/SnapshotsAnualView"

export default async function SnapshotsPage() {
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
      orderBy: { date: "asc" },
    }),
  ])

  return <SnapshotsAnualView products={products} snapshots={snapshots} />
}
