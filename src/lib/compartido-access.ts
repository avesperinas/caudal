import { prisma } from "./prisma"

/** Lanza si el sessionUserId no tiene acceso al compartido de ownerUserId. */
export async function assertCompartidoAccess(sessionUserId: string, ownerUserId: string) {
  if (sessionUserId === ownerUserId) return
  const access = await prisma.sharedAccountAccess.findUnique({
    where: {
      ownerUserId_collaboratorUserId: { ownerUserId, collaboratorUserId: sessionUserId },
    },
  })
  if (!access) throw new Error("Acceso denegado al compartido")
}

/**
 * Devuelve el userId efectivo del dueño del compartido.
 * Si requestedOwnerUserId es distinto al session user, verifica acceso.
 */
export async function resolveCompartidoOwner(
  sessionUserId: string,
  requestedOwnerUserId?: string,
): Promise<string> {
  if (!requestedOwnerUserId || requestedOwnerUserId === sessionUserId) return sessionUserId
  await assertCompartidoAccess(sessionUserId, requestedOwnerUserId)
  return requestedOwnerUserId
}
