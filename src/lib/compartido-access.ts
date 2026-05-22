import { prisma } from "./prisma"

/** Lanza si el sessionUserId no tiene acceso ACEPTADO al compartido de ownerUserId. */
export async function assertCompartidoAccess(sessionUserId: string, ownerUserId: string) {
  if (sessionUserId === ownerUserId) return
  const access = await prisma.sharedAccountAccess.findUnique({
    where: {
      ownerUserId_collaboratorUserId: { ownerUserId, collaboratorUserId: sessionUserId },
    },
  })
  if (!access || access.status !== "ACCEPTED") throw new Error("Acceso denegado al compartido")
}

/**
 * Devuelve el userId efectivo del dueño del compartido.
 * Si requestedOwnerUserId es distinto al session user, verifica acceso ACEPTADO.
 */
export async function resolveCompartidoOwner(
  sessionUserId: string,
  requestedOwnerUserId?: string,
): Promise<string> {
  if (!requestedOwnerUserId || requestedOwnerUserId === sessionUserId) return sessionUserId
  await assertCompartidoAccess(sessionUserId, requestedOwnerUserId)
  return requestedOwnerUserId
}

/**
 * Devuelve el SharedAccountAccess ACEPTADO donde este usuario es colaborador.
 * Si tiene uno, significa que sus gastos compartidos son los del dueño.
 */
export async function getActiveSharedAccess(userId: string) {
  return prisma.sharedAccountAccess.findFirst({
    where: { collaboratorUserId: userId, status: "ACCEPTED" },
    include: { owner: { select: { id: true, name: true } } },
  })
}
