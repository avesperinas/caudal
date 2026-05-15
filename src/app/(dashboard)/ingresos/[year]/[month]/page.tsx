import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { IngresosMesView } from "@/components/finance/IngresosMesView"
import { seedDefaultPersonalCategories } from "@/app/(dashboard)/personal/actions"

export default async function IngresosPage({
  params,
}: {
  params: Promise<{ year: string; month: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { year: yearStr, month: monthStr } = await params
  const year  = parseInt(yearStr)
  const month = parseInt(monthStr)
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) redirect("/ingresos")

  const userId = session.user.id

  const catCount = await prisma.personalCategory.count({ where: { userId } })
  if (catCount === 0) await seedDefaultPersonalCategories()

  const [categories, transactions] = await Promise.all([
    prisma.personalCategory.findMany({
      where: { userId, isActive: true, type: "INCOME" },
      orderBy: { order: "asc" },
    }),
    prisma.personalTransaction.findMany({
      where: { userId, year, month, type: "INCOME" },
      include: { category: true },
      orderBy: { createdAt: "asc" },
    }),
  ])

  return <IngresosMesView year={year} month={month} categories={categories} transactions={transactions} />
}
