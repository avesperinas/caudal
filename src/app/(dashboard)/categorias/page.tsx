import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CategoriasView } from "@/components/finance/CategoriasView"
import { seedDefaultPersonalCategories } from "@/app/(dashboard)/personal/actions"

export default async function CategoriasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const catCount = await prisma.personalCategory.count({ where: { userId } })
  if (catCount === 0) await seedDefaultPersonalCategories()

  const [incomeCategories, expenseCategories] = await Promise.all([
    prisma.personalCategory.findMany({
      where: { userId, type: "INCOME" },
      orderBy: { order: "asc" },
    }),
    prisma.personalCategory.findMany({
      where: { userId, type: "EXPENSE" },
      orderBy: { order: "asc" },
    }),
  ])

  return <CategoriasView incomeCategories={incomeCategories} expenseCategories={expenseCategories} />
}
