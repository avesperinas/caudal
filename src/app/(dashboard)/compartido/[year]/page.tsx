import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { CompartidoAnualView } from "@/components/finance/CompartidoAnualView"
import { PendingInvitationsSection } from "@/components/finance/PendingInvitationsSection"
import { ArchivedCompartidoSection } from "@/components/finance/ArchivedCompartidoSection"
import { getActiveSharedAccess } from "@/lib/compartido-access"
import { swapPersons } from "@/lib/gastos"

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

  // Si el usuario es colaborador aceptado y no está pidiendo un owner específico,
  // redirigir automáticamente al compartido del dueño
  if (!requestedOwner) {
    const activeAccess = await getActiveSharedAccess(sessionUserId)
    if (activeAccess) {
      redirect(`/compartido/${year}?owner=${activeAccess.ownerUserId}`)
    }
  }

  // Invitaciones pendientes recibidas
  const pendingReceived = await prisma.sharedAccountAccess.findMany({
    where: { collaboratorUserId: sessionUserId, status: "PENDING" },
    include: { owner: { select: { id: true, name: true, email: true, image: true } } },
  })

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
    if (access && access.status === "ACCEPTED") {
      ownerUserId = requestedOwner
      ownerName = access.owner.name
    }
  }

  const isOwner = ownerUserId === sessionUserId

  // Cuentas compartidas a las que este usuario tiene acceso (para el switcher)
  const sharedAccounts = await prisma.sharedAccountAccess.findMany({
    where: { collaboratorUserId: sessionUserId, status: "ACCEPTED" },
    include: { owner: { select: { id: true, name: true } } },
  })

  // Datos archivados del usuario actual
  const archivedData = await prisma.archivedCompartido.findMany({
    where: { userId: sessionUserId },
    orderBy: { archivedAt: "desc" },
  })

  const [rawYearConfig, rawPersonIncomes, categories, rawExpenses, rawDeposits, prevYearExpenses] = await Promise.all([
    prisma.sharedYearConfig.findUnique({ where: { userId_year: { userId: ownerUserId, year } } }),
    prisma.sharedPersonIncome.findMany({ where: { userId: ownerUserId, year }, orderBy: { fromDate: "asc" } }),
    prisma.sharedCategory.findMany({ where: { userId: ownerUserId }, orderBy: { order: "asc" } }),
    prisma.sharedExpense.findMany({
      where: { userId: ownerUserId, year },
      include: { category: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.sharedDeposit.findMany({ where: { userId: ownerUserId, year }, orderBy: { createdAt: "asc" } }),
    // Solo para la comparativa de medias mensuales del resumen anual
    prisma.sharedExpense.findMany({
      where: { userId: ownerUserId, year: year - 1 },
      select: { categoryId: true, month: true, amount: true },
    }),
  ])

  // Swap Persona 1 ↔ 2 para que el colaborador se vea como Persona 1
  const { yearConfig, personIncomes, expenses, deposits } = !isOwner
    ? swapPersons(rawYearConfig, rawPersonIncomes, rawExpenses, rawDeposits)
    : { yearConfig: rawYearConfig, personIncomes: rawPersonIncomes, expenses: rawExpenses, deposits: rawDeposits }

  return (
    <>
      {/* Invitaciones recibidas pendientes */}
      {pendingReceived.length > 0 && (
        <div className="pt-4">
          <PendingInvitationsSection
            invitations={pendingReceived.map(p => ({
              id: p.id,
              owner: p.owner,
            }))}
          />
        </div>
      )}

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
        personSwapped={!isOwner}
        prevYearExpenses={prevYearExpenses}
      />

      {/* Datos archivados */}
      <ArchivedCompartidoSection
        archives={archivedData.map(a => ({
          id: a.id,
          reason: a.reason,
          archivedAt: a.archivedAt.toISOString(),
          data: a.data as Record<string, unknown>,
        }))}
      />
    </>
  )
}
