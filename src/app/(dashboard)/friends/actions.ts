"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function getSession() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")
  return session
}

export async function sendFriendRequest(email: string): Promise<{ error?: string }> {
  const session = await getSession()
  const userId = session.user.id

  const target = await prisma.user.findUnique({ where: { email } })
  if (!target) return { error: "No existe ningún usuario con ese email." }
  if (target.id === userId) return { error: "No puedes añadirte a ti mismo." }

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { senderId: userId, receiverId: target.id },
        { senderId: target.id, receiverId: userId },
      ],
    },
  })
  if (existing?.status === "ACCEPTED") return { error: "Ya sois amigos." }
  if (existing?.status === "PENDING") return { error: "Ya hay una solicitud pendiente con ese usuario." }

  await prisma.friendship.create({
    data: { senderId: userId, receiverId: target.id },
  })

  revalidatePath("/friends")
  return {}
}

export async function acceptFriendRequest(friendshipId: string): Promise<void> {
  const session = await getSession()
  await prisma.friendship.update({
    where: { id: friendshipId, receiverId: session.user.id, status: "PENDING" },
    data: { status: "ACCEPTED" },
  })
  revalidatePath("/friends")
}

export async function declineFriendRequest(friendshipId: string): Promise<void> {
  const session = await getSession()
  await prisma.friendship.delete({
    where: { id: friendshipId, receiverId: session.user.id },
  })
  revalidatePath("/friends")
}

export async function cancelFriendRequest(friendshipId: string): Promise<void> {
  const session = await getSession()
  await prisma.friendship.delete({
    where: { id: friendshipId, senderId: session.user.id, status: "PENDING" },
  })
  revalidatePath("/friends")
}

export async function removeFriend(friendshipId: string): Promise<void> {
  const session = await getSession()
  const userId = session.user.id
  await prisma.friendship.delete({
    where: {
      id: friendshipId,
      status: "ACCEPTED",
      OR: [{ senderId: userId }, { receiverId: userId }],
    },
  })
  revalidatePath("/friends")
}
