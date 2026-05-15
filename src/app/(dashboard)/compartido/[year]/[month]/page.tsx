import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { GastosMesView } from "@/components/finance/GastosMesView"
import { seedDefaultCategories } from "@/app/(dashboard)/gastos/actions"

export default async function CompartidoMesPage({
  params,
}: {
  params: Promise<{ year: string; month: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const { year: yearStr, month: monthStr } = await params
  const year  = parseInt(yearStr)
  const month = parseInt(monthStr)
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) redirect("/compartido")

  const catCount = await prisma.sharedCategory.count({ where: { userId } })
  if (catCount === 0) await seedDefaultCategories()

  const [yearConfig, personIncomes, categories, expenses, deposits] = await Promise.all([
    prisma.sharedYearConfig.findUnique({ where: { userId_year: { userId, year } } }),
    prisma.sharedPersonIncome.findMany({ where: { userId, year }, orderBy: { fromDate: "asc" } }),
    prisma.sharedCategory.findMany({ where: { userId, isActive: true }, orderBy: { order: "asc" } }),
    prisma.sharedExpense.findMany({
      where: { userId, year, month },
      include: { category: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.sharedDeposit.findMany({ where: { userId, year, month }, orderBy: { createdAt: "asc" } }),
  ])

  return (
    <GastosMesView
      year={year}
      month={month}
      yearConfig={yearConfig}
      personIncomes={personIncomes}
      categories={categories}
      expenses={expenses}
      deposits={deposits}
      basePath="/compartido"
    />
  )
}
