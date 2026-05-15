import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { GastosPersonalAnualView } from "@/components/finance/GastosPersonalAnualView"

export default async function GastosAnualPage({
  params,
}: {
  params: Promise<{ year: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const { year: yearStr } = await params
  const year = parseInt(yearStr)
  if (isNaN(year)) redirect("/gastos")

  const [categories, transactions] = await Promise.all([
    prisma.personalCategory.findMany({
      where: { userId, isActive: true, type: "EXPENSE" },
      orderBy: { order: "asc" },
    }),
    prisma.personalTransaction.findMany({
      where: { userId, year, type: "EXPENSE" },
      include: { category: true },
      orderBy: { createdAt: "asc" },
    }),
  ])

  const monthData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    transactions: transactions.filter(t => t.month === i + 1),
  }))

  return <GastosPersonalAnualView year={year} monthData={monthData} categories={categories} />
}
