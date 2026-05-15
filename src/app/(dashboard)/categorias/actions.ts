"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated")
  return session.user.id
}

export async function toggleExtendedSavings(id: string, value: boolean) {
  const userId = await getUserId()
  await prisma.personalCategory.updateMany({
    where: { id, userId },
    data: { countForExtendedSavings: value },
  })
  revalidatePath("/categorias")
  revalidatePath("/flujo", "layout")
}
