import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { GastosConfigView } from "@/components/finance/GastosConfigView"
import { CompartidoAccessSection } from "@/components/finance/CompartidoAccessSection"
import { seedDefaultCategories } from "@/app/(dashboard)/gastos/actions"

export default async function CompartidoConfigYearPage({
  params,
}: {
  params: Promise<{ year: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const { year: yearStr } = await params
  const year = parseInt(yearStr)
  if (isNaN(year)) redirect(`/compartido/config/${new Date().getFullYear()}`)

  const catCount = await prisma.sharedCategory.count({ where: { userId } })
  if (catCount === 0) await seedDefaultCategories()

  const [categories, yearConfig, personIncomes, products, friendships, collaborators] = await Promise.all([
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
    // Amigos aceptados
    prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender:   { select: { id: true, name: true, email: true, image: true } },
        receiver: { select: { id: true, name: true, email: true, image: true } },
      },
    }),
    // Colaboradores actuales
    prisma.sharedAccountAccess.findMany({
      where: { ownerUserId: userId },
      include: { collaborator: { select: { id: true, name: true, email: true, image: true } } },
    }),
  ])

  const friends = friendships.map(f =>
    f.senderId === userId ? f.receiver : f.sender
  )

  return (
    <>
      <GastosConfigView
        year={year}
        yearConfig={yearConfig}
        categories={categories}
        personIncomes={personIncomes}
        products={products}
        basePath="/compartido"
      />
      <CompartidoAccessSection
        friends={friends}
        collaborators={collaborators.map(c => c.collaborator)}
      />
    </>
  )
}
