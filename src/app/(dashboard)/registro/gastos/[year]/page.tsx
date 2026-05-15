import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CompartidoAnualView } from "@/components/finance/CompartidoAnualView"

export default async function RegistroGastosAnualPage({
  params,
}: {
  params: Promise<{ year: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { year: yearStr } = await params
  const year = parseInt(yearStr)
  if (isNaN(year)) redirect("/registro/gastos")

  const userId = session.user.id

  const [yearConfig, personIncomes, categories, expenses, deposits] = await Promise.all([
    prisma.sharedYearConfig.findUnique({ where: { userId_year: { userId, year } } }),
    prisma.sharedPersonIncome.findMany({ where: { userId, year }, orderBy: { fromDate: "asc" } }),
    prisma.sharedCategory.findMany({ where: { userId }, orderBy: { order: "asc" } }),
    prisma.sharedExpense.findMany({
      where: { userId, year },
      include: { category: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.sharedDeposit.findMany({ where: { userId, year }, orderBy: { createdAt: "asc" } }),
  ])

  return (
    <CompartidoAnualView
      year={year}
      yearConfig={yearConfig}
      personIncomes={personIncomes}
      categories={categories}
      expenses={expenses}
      deposits={deposits}
      ownerUserId={userId}
      isOwner={true}
    />
  )
}
