"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ProductType } from "@prisma/client"
import { revalidatePath } from "next/cache"

async function getSession() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("No autorizado")
  return session
}

// ─── Entidades ────────────────────────────────────────────────────────────────

export async function createEntity(data: { name: string; color: string; icon?: string | null }) {
  const session = await getSession()
  const entity = await prisma.entity.create({
    data: { ...data, userId: session.user.id },
  })
  revalidatePath("/productos")
  return entity
}

export async function updateEntity(id: string, data: { name: string; color: string; icon?: string | null }) {
  const session = await getSession()
  const entity = await prisma.entity.update({
    where: { id, userId: session.user.id },
    data,
  })
  revalidatePath("/productos")
  return entity
}

// ─── Productos ────────────────────────────────────────────────────────────────

type ProductData = {
  name: string
  entityId: string
  type: ProductType
  ownership: number
  openedAt: string // YYYY-MM-DD
  closedAt?: string | null
  countForSavings?: boolean
}

export async function createProduct(data: ProductData) {
  const session = await getSession()
  await prisma.product.create({
    data: {
      name: data.name,
      entityId: data.entityId,
      type: data.type,
      ownership: data.ownership,
      openedAt: new Date(data.openedAt),
      closedAt: data.closedAt ? new Date(data.closedAt) : null,
      countForSavings: data.countForSavings ?? true,
      userId: session.user.id,
    },
  })
  revalidatePath("/productos")
}

export async function updateProduct(id: string, data: ProductData) {
  const session = await getSession()
  await prisma.product.update({
    where: { id, userId: session.user.id },
    data: {
      name: data.name,
      entityId: data.entityId,
      type: data.type,
      ownership: data.ownership,
      openedAt: new Date(data.openedAt),
      closedAt: data.closedAt ? new Date(data.closedAt) : null,
      countForSavings: data.countForSavings ?? true,
    },
  })
  revalidatePath("/productos")
  revalidatePath("/flujo", "layout")
}
