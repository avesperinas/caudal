import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { PersonalConfigView } from "@/components/finance/PersonalConfigView"

export default async function RegistroPersonalConfigPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const categories = await prisma.personalCategory.findMany({
    where: { userId },
    orderBy: [{ type: "asc" }, { order: "asc" }],
  })

  return <PersonalConfigView categories={categories} />
}
