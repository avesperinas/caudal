"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function saveSnapshots(
  date: string, // YYYY-MM-DD
  snapshots: { productId: string; value: number }[]
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autenticado")
  const userId = session.user.id

  const dateObj = new Date(date)

  await prisma.$transaction(
    snapshots.map(({ productId, value }) =>
      prisma.productSnapshot.upsert({
        where: { productId_date: { productId, date: dateObj } },
        update: { value },
        create: { productId, userId, value, date: dateObj },
      })
    )
  )

  revalidatePath("/patrimonio")
  revalidatePath("/snapshots")
}

export async function deleteSnapshotDate(date: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autenticado")
  const userId = session.user.id

  await prisma.productSnapshot.deleteMany({
    where: { userId, date: new Date(date) },
  })

  revalidatePath("/patrimonio")
  revalidatePath("/snapshots")
}
