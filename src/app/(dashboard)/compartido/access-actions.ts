"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function getSessionUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated")
  return session.user.id
}

export async function grantCompartidoAccess(
  collaboratorUserId: string,
): Promise<{ error?: string }> {
  const ownerUserId = await getSessionUserId()
  if (collaboratorUserId === ownerUserId) return { error: "No puedes añadirte a ti mismo" }

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

  await prisma.sharedAccountAccess.upsert({
    where: {
      ownerUserId_collaboratorUserId: { ownerUserId, collaboratorUserId },
    },
    create: { ownerUserId, collaboratorUserId },
    update: {},
  })

  revalidatePath("/compartido/config/[year]", "page")
  return {}
}

export async function revokeCompartidoAccess(collaboratorUserId: string) {
  const ownerUserId = await getSessionUserId()
  await prisma.sharedAccountAccess.deleteMany({
    where: { ownerUserId, collaboratorUserId },
  })
  revalidatePath("/compartido/config/[year]", "page")
}
