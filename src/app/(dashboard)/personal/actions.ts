"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { PersonalCategoryType, PersonalTransactionType } from "@prisma/client"

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated")
  return session.user.id
}

function revalidate(year?: number) {
  revalidatePath("/ingresos", "layout")
  revalidatePath("/gastos", "layout")
  revalidatePath("/aportaciones")
  revalidatePath("/flujo", "layout")
  if (year) revalidatePath(`/registro/personal/${year}`)
}

// ─── Categorías ───────────────────────────────────────────────────────────────

export async function seedDefaultPersonalCategories() {
  const userId = await getUserId()
  const defaults = [
    { name: "Salario",          type: "INCOME"  as PersonalCategoryType, order: 0 },
    { name: "Extra / Freelance",type: "INCOME"  as PersonalCategoryType, order: 1 },
    { name: "Dividendos",       type: "INCOME"  as PersonalCategoryType, order: 2 },
    { name: "Otros ingresos",   type: "INCOME"  as PersonalCategoryType, order: 3 },
    { name: "Vivienda",         type: "EXPENSE" as PersonalCategoryType, order: 4 },
    { name: "Alimentación",     type: "EXPENSE" as PersonalCategoryType, order: 5 },
    { name: "Transporte",       type: "EXPENSE" as PersonalCategoryType, order: 6 },
    { name: "Salud",            type: "EXPENSE" as PersonalCategoryType, order: 7 },
    { name: "Ocio",             type: "EXPENSE" as PersonalCategoryType, order: 8 },
    { name: "Otros gastos",     type: "EXPENSE" as PersonalCategoryType, order: 9 },
  ]
  await prisma.personalCategory.createMany({ data: defaults.map(d => ({ userId, ...d })), skipDuplicates: true })
  revalidate()
}

export async function createPersonalCategory(name: string, type: PersonalCategoryType) {
  const userId = await getUserId()
  const last = await prisma.personalCategory.findFirst({ where: { userId, type }, orderBy: { order: "desc" } })
  await prisma.personalCategory.create({ data: { userId, name, type, order: (last?.order ?? -1) + 1 } })
  revalidate()
}

export async function updatePersonalCategory(id: string, name: string) {
  const userId = await getUserId()
  await prisma.personalCategory.updateMany({ where: { id, userId }, data: { name } })
  revalidate()
}

export async function deletePersonalCategory(id: string) {
  const userId = await getUserId()
  await prisma.personalCategory.deleteMany({ where: { id, userId } })
  revalidate()
}

export async function togglePersonalCategory(id: string, isActive: boolean) {
  const userId = await getUserId()
  await prisma.personalCategory.updateMany({ where: { id, userId }, data: { isActive } })
  revalidate()
}

// ─── Transacciones ────────────────────────────────────────────────────────────

export async function createPersonalTransaction(data: {
  year: number; month: number; type: PersonalTransactionType
  amount: number; categoryId?: string; productId?: string
  date?: string; madeByMe?: boolean; note?: string
}) {
  const userId = await getUserId()
  const { date, ...rest } = data
  await prisma.personalTransaction.create({
    data: { userId, ...rest, date: date ? new Date(date) : null },
  })
  revalidate(data.year)
}

export async function updatePersonalTransaction(id: string, data: {
  amount: number; categoryId?: string | null; productId?: string | null
  date?: string | null; madeByMe?: boolean; note?: string | null
}) {
  const userId = await getUserId()
  const { date, ...rest } = data
  await prisma.personalTransaction.updateMany({
    where: { id, userId },
    data: { ...rest, date: date ? new Date(date) : date === null ? null : undefined },
  })
  revalidate()
}

export async function deletePersonalTransaction(id: string) {
  const userId = await getUserId()
  const tx = await prisma.personalTransaction.findFirst({ where: { id, userId } })
  await prisma.personalTransaction.deleteMany({ where: { id, userId } })
  if (tx) revalidate(tx.year)
}
