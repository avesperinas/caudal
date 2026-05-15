import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PersonalConfigView } from "@/components/finance/PersonalConfigView"
import { seedDefaultPersonalCategories } from "../actions"

export default async function PersonalConfigPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const count = await prisma.personalCategory.count({ where: { userId } })
  if (count === 0) await seedDefaultPersonalCategories()

  const categories = await prisma.personalCategory.findMany({
    where: { userId },
    orderBy: [{ type: "asc" }, { order: "asc" }],
  })

  return <PersonalConfigView categories={categories} />
}
