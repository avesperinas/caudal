import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { GastosMesView } from "@/components/finance/GastosMesView"
import { seedDefaultCategories } from "@/app/(dashboard)/gastos/actions"
import { getActiveSharedAccess } from "@/lib/compartido-access"
import { swapPersons } from "@/lib/gastos"

export default async function CompartidoMesPage({
  params,
  searchParams,
}: {
  params: Promise<{ year: string; month: string }>
  searchParams: Promise<{ owner?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const sessionUserId = session.user.id

  const { year: yearStr, month: monthStr } = await params
  const { owner: requestedOwner } = await searchParams
  const year  = parseInt(yearStr)
  const month = parseInt(monthStr)
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) redirect("/compartido")

  // Resolver dueño efectivo
  let userId = sessionUserId
  if (requestedOwner && requestedOwner !== sessionUserId) {
    const access = await prisma.sharedAccountAccess.findUnique({
      where: {
        ownerUserId_collaboratorUserId: {
          ownerUserId: requestedOwner,
          collaboratorUserId: sessionUserId,
        },
      },
    })
    if (access && access.status === "ACCEPTED") {
      userId = requestedOwner
    }
  } else {
    // Auto-resolve: si es colaborador, usar datos del dueño
    const activeAccess = await getActiveSharedAccess(sessionUserId)
    if (activeAccess) {
      userId = activeAccess.ownerUserId
    }
  }

  const catCount = await prisma.sharedCategory.count({ where: { userId } })
  if (catCount === 0 && userId === sessionUserId) await seedDefaultCategories()

  const isCollaborator = userId !== sessionUserId

  const [rawYearConfig, rawPersonIncomes, categories, rawExpenses, rawDeposits] = await Promise.all([
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

  // Swap Persona 1 ↔ 2 para que el colaborador se vea como Persona 1
  const { yearConfig, personIncomes, expenses, deposits } = isCollaborator
    ? swapPersons(rawYearConfig, rawPersonIncomes, rawExpenses, rawDeposits)
    : { yearConfig: rawYearConfig, personIncomes: rawPersonIncomes, expenses: rawExpenses, deposits: rawDeposits }

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
      ownerUserId={isCollaborator ? userId : undefined}
      personSwapped={isCollaborator}
    />
  )
}
