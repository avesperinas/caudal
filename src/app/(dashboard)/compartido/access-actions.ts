"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function getSessionUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated")
  return session.user.id
}

/** Enviar invitación de compartido (status PENDING). */
export async function sendCompartidoInvitation(
  collaboratorUserId: string,
): Promise<{ error?: string }> {
  const ownerUserId = await getSessionUserId()
  if (collaboratorUserId === ownerUserId) return { error: "No puedes invitarte a ti mismo" }

  // Verificar amistad aceptada
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { senderId: ownerUserId, receiverId: collaboratorUserId },
        { senderId: collaboratorUserId, receiverId: ownerUserId },
      ],
    },
  })
  if (!friendship) return { error: "Solo puedes compartir con amigos" }

  // Verificar que no exista ya una invitación aceptada
  const existing = await prisma.sharedAccountAccess.findUnique({
    where: {
      ownerUserId_collaboratorUserId: { ownerUserId, collaboratorUserId },
    },
  })
  if (existing?.status === "ACCEPTED") return { error: "Ya tiene acceso" }

  await prisma.sharedAccountAccess.upsert({
    where: {
      ownerUserId_collaboratorUserId: { ownerUserId, collaboratorUserId },
    },
    create: { ownerUserId, collaboratorUserId, status: "PENDING" },
    update: { status: "PENDING" },
  })

  revalidatePath("/compartido/config/[year]", "page")
  revalidatePath("/compartido", "page")
  revalidatePath("/compartido/[year]", "page")
  return {}
}

/** Aceptar invitación: archivar datos propios y activar acceso. */
export async function acceptCompartidoInvitation(
  accessId: string,
): Promise<{ error?: string }> {
  const userId = await getSessionUserId()

  const access = await prisma.sharedAccountAccess.findUnique({
    where: { id: accessId },
    include: { owner: { select: { name: true } } },
  })
  if (!access || access.collaboratorUserId !== userId) return { error: "Invitación no encontrada" }
  if (access.status === "ACCEPTED") return { error: "Ya aceptada" }

  // Archivar datos compartidos del colaborador
  const [yearConfigs, personIncomes, categories, expenses, deposits] = await Promise.all([
    prisma.sharedYearConfig.findMany({ where: { userId } }),
    prisma.sharedPersonIncome.findMany({ where: { userId } }),
    prisma.sharedCategory.findMany({ where: { userId } }),
    prisma.sharedExpense.findMany({ where: { userId } }),
    prisma.sharedDeposit.findMany({ where: { userId } }),
  ])

  const hasData = yearConfigs.length > 0 || personIncomes.length > 0 ||
    categories.length > 0 || expenses.length > 0 || deposits.length > 0

  await prisma.$transaction(async (tx) => {
    // Archivar si hay datos
    if (hasData) {
      await tx.archivedCompartido.create({
        data: {
          userId,
          reason: `Aceptaste la invitación de ${access.owner.name ?? "un usuario"}`,
          data: { yearConfigs, personIncomes, categories, expenses, deposits },
        },
      })

      // Borrar datos compartidos activos del colaborador
      await tx.sharedExpense.deleteMany({ where: { userId } })
      await tx.sharedDeposit.deleteMany({ where: { userId } })
      await tx.sharedPersonIncome.deleteMany({ where: { userId } })
      await tx.sharedYearConfig.deleteMany({ where: { userId } })
      // No borramos categorías: se mantienen por si algún día deja de compartir
    }

    // Aceptar la invitación
    await tx.sharedAccountAccess.update({
      where: { id: accessId },
      data: { status: "ACCEPTED" },
    })
  })

  revalidatePath("/compartido/config/[year]", "page")
  revalidatePath("/compartido", "page")
  revalidatePath("/compartido/[year]", "page")
  return {}
}

/** Rechazar invitación pendiente. */
export async function declineCompartidoInvitation(
  accessId: string,
): Promise<{ error?: string }> {
  const userId = await getSessionUserId()

  const access = await prisma.sharedAccountAccess.findUnique({ where: { id: accessId } })
  if (!access || access.collaboratorUserId !== userId) return { error: "Invitación no encontrada" }
  if (access.status === "ACCEPTED") return { error: "No puedes rechazar una invitación ya aceptada" }

  await prisma.sharedAccountAccess.delete({ where: { id: accessId } })

  revalidatePath("/compartido/config/[year]", "page")
  revalidatePath("/compartido", "page")
  revalidatePath("/compartido/[year]", "page")
  return {}
}

/** Revocar acceso (solo el dueño). */
export async function revokeCompartidoAccess(collaboratorUserId: string) {
  const ownerUserId = await getSessionUserId()
  await prisma.sharedAccountAccess.deleteMany({
    where: { ownerUserId, collaboratorUserId },
  })
  revalidatePath("/compartido/config/[year]", "page")
  revalidatePath("/compartido", "page")
  revalidatePath("/compartido/[year]", "page")
}
