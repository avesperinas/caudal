import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PersonalAnualView } from "@/components/finance/PersonalAnualView"

export default async function PersonalAnualPage({
  params,
}: {
  params: Promise<{ year: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { year: yearStr } = await params
  const year = parseInt(yearStr)
  if (isNaN(year)) redirect("/personal")

  const userId = session.user.id

  const [categories, transactions, products] = await Promise.all([
    prisma.personalCategory.findMany({
      where: { userId, isActive: true },
      orderBy: [{ type: "asc" }, { order: "asc" }],
    }),
    prisma.personalTransaction.findMany({
      where: { userId, year },
      include: { category: true, product: { include: { entity: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.product.findMany({
      where: { userId, closedAt: null },
      include: { entity: true },
      orderBy: { name: "asc" },
    }),
  ])

  const monthData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    transactions: transactions.filter(t => t.month === i + 1),
  }))

  return (
    <PersonalAnualView
      year={year}
      monthData={monthData}
      categories={categories}
      products={products}
    />
  )
}
