import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CompartidoAnualView } from "@/components/finance/CompartidoAnualView"

export default async function CompartidoAnualPage({
  params,
  searchParams,
}: {
  params: Promise<{ year: string }>
  searchParams: Promise<{ owner?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const sessionUserId = session.user.id

  const { year: yearStr } = await params
  const { owner: requestedOwner } = await searchParams
  const year = parseInt(yearStr)
  if (isNaN(year)) redirect("/compartido")

  // Resolver dueño efectivo
  let ownerUserId = sessionUserId
  let ownerName: string | null = null
  if (requestedOwner && requestedOwner !== sessionUserId) {
    const access = await prisma.sharedAccountAccess.findUnique({
      where: {
        ownerUserId_collaboratorUserId: {
          ownerUserId: requestedOwner,
          collaboratorUserId: sessionUserId,
        },
      },
      include: { owner: { select: { name: true } } },
    })
    if (access) {
      ownerUserId = requestedOwner
      ownerName = access.owner.name
    }
  }

  const isOwner = ownerUserId === sessionUserId

  // Cuentas compartidas a las que este usuario tiene acceso (para el switcher)
  const sharedAccounts = await prisma.sharedAccountAccess.findMany({
    where: { collaboratorUserId: sessionUserId },
    include: { owner: { select: { id: true, name: true } } },
  })

  const [yearConfig, personIncomes, categories, expenses, deposits] = await Promise.all([
    prisma.sharedYearConfig.findUnique({ where: { userId_year: { userId: ownerUserId, year } } }),
    prisma.sharedPersonIncome.findMany({ where: { userId: ownerUserId, year }, orderBy: { fromDate: "asc" } }),
    prisma.sharedCategory.findMany({ where: { userId: ownerUserId }, orderBy: { order: "asc" } }),
    prisma.sharedExpense.findMany({
      where: { userId: ownerUserId, year },
      include: { category: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.sharedDeposit.findMany({ where: { userId: ownerUserId, year }, orderBy: { createdAt: "asc" } }),
  ])

  return (
    <CompartidoAnualView
      year={year}
      yearConfig={yearConfig}
      personIncomes={personIncomes}
      categories={categories}
      expenses={expenses}
      deposits={deposits}
      basePath="/compartido"
      ownerUserId={ownerUserId}
      isOwner={isOwner}
      ownerName={ownerName}
      sharedAccounts={sharedAccounts.map(a => ({ id: a.owner.id, name: a.owner.name }))}
    />
  )
}
