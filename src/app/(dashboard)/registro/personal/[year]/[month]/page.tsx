import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PersonalMesView } from "@/components/finance/PersonalMesView"
import { seedDefaultPersonalCategories } from "@/app/(dashboard)/personal/actions"

export default async function RegistroPersonalMesPage({
  params,
}: {
  params: Promise<{ year: string; month: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const { year: yearStr, month: monthStr } = await params
  const year  = parseInt(yearStr)
  const month = parseInt(monthStr)
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) redirect("/registro/personal")

  const userId = session.user.id

  const catCount = await prisma.personalCategory.count({ where: { userId } })
  if (catCount === 0) await seedDefaultPersonalCategories()

  const [categories, transactions, products] = await Promise.all([
    prisma.personalCategory.findMany({
      where: { userId, isActive: true },
      orderBy: [{ type: "asc" }, { order: "asc" }],
    }),
    prisma.personalTransaction.findMany({
      where: { userId, year, month },
      include: { category: true, product: { include: { entity: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.product.findMany({
      where: { userId, closedAt: null },
      include: { entity: true },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <PersonalMesView
      year={year}
      month={month}
      categories={categories}
      transactions={transactions}
      products={products}
    />
  )
}
