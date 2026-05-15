import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { GastosConfigView } from "@/components/finance/GastosConfigView"
import { seedDefaultCategories } from "../../actions"

export default async function GastosConfigYearPage({
  params,
}: {
  params: Promise<{ year: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const { year: yearStr } = await params
  const year = parseInt(yearStr)
  if (isNaN(year)) redirect(`/gastos/config/${new Date().getFullYear()}`)

  // Auto-seed categorías por defecto si el usuario no tiene ninguna
  const catCount = await prisma.sharedCategory.count({ where: { userId } })
  if (catCount === 0) await seedDefaultCategories()

  const [categories, yearConfig, personIncomes, products] = await Promise.all([
    prisma.sharedCategory.findMany({ where: { userId }, orderBy: { order: "asc" } }),
    prisma.sharedYearConfig.findUnique({ where: { userId_year: { userId, year } } }),
    prisma.sharedPersonIncome.findMany({
      where: { userId, year },
      orderBy: [{ person: "asc" }, { fromDate: "asc" }],
    }),
    prisma.product.findMany({
      where: { userId, closedAt: null },
      include: { entity: true },
      orderBy: [{ entity: { name: "asc" } }, { name: "asc" }],
    }),
  ])

  return (
    <GastosConfigView
      year={year}
      yearConfig={yearConfig}
      categories={categories}
      personIncomes={personIncomes}
      products={products}
      basePath="/gastos"
    />
  )
}
