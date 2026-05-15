"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { SplitType, SharedPayer } from "@prisma/client"
import { DEFAULT_CATEGORIES } from "@/lib/gastos"
import { resolveCompartidoOwner } from "@/lib/compartido-access"

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Not authenticated")
  return session.user.id
}

/** Devuelve el userId efectivo: el propio o el del dueño si hay acceso delegado. */
async function resolveOwner(ownerUserId?: string) {
  const sessionUserId = await getUserId()
  return resolveCompartidoOwner(sessionUserId, ownerUserId)
}

// ─── Configuración anual ──────────────────────────────────────────────────────

export async function upsertYearConfig(year: number, person1Name: string, person2Name: string, productId?: string | null) {
  const userId = await getUserId()
  await prisma.sharedYearConfig.upsert({
    where:  { userId_year: { userId, year } },
    create: { userId, year, person1Name, person2Name, productId: productId || null },
    update: { person1Name, person2Name, productId: productId || null },
  })
  revalidatePath(`/registro/gastos/${year}`)
  revalidatePath("/registro/gastos/config/[year]", "page")
  revalidatePath(`/compartido/${year}`)
  revalidatePath("/compartido/config/[year]", "page")
}

export async function setYearSettled(year: number, settled: boolean) {
  const userId = await getUserId()
  await prisma.sharedYearConfig.upsert({
    where:  { userId_year: { userId, year } },
    create: { userId, year, settled },
    update: { settled },
  })
  revalidatePath(`/registro/gastos/${year}`)
  revalidatePath("/registro/gastos/config/[year]", "page")
  revalidatePath(`/compartido/${year}`)
  revalidatePath("/compartido/config/[year]", "page")
}

// ─── Ingresos por persona ─────────────────────────────────────────────────────

export async function createPersonIncome(data: {
  year: number; person: number; fromDate: string; toDate: string
  salary: number; extra?: number
}) {
  const userId = await getUserId()
  await prisma.sharedPersonIncome.create({
    data: { userId, extra: 0, ...data, fromDate: new Date(data.fromDate), toDate: new Date(data.toDate) },
  })
  revalidatePath("/registro/gastos/config/[year]", "page")
  revalidatePath("/compartido/config/[year]", "page")
}

export async function updatePersonIncome(id: string, data: {
  fromDate: string; toDate: string; salary: number; extra: number
}) {
  const userId = await getUserId()
  await prisma.sharedPersonIncome.updateMany({
    where: { id, userId },
    data: { ...data, fromDate: new Date(data.fromDate), toDate: new Date(data.toDate) },
  })
  revalidatePath("/registro/gastos/config/[year]", "page")
  revalidatePath("/compartido/config/[year]", "page")
}

export async function deletePersonIncome(id: string) {
  const userId = await getUserId()
  await prisma.sharedPersonIncome.deleteMany({ where: { id, userId } })
  revalidatePath("/registro/gastos/config/[year]", "page")
  revalidatePath("/compartido/config/[year]", "page")
}

// ─── Categorías ───────────────────────────────────────────────────────────────

export async function seedDefaultCategories() {
  const userId = await getUserId()
  await prisma.sharedCategory.createMany({
    data: DEFAULT_CATEGORIES.map(c => ({ userId, ...c })),
    skipDuplicates: true,
  })
  revalidatePath("/registro/gastos/config/[year]", "page")
  revalidatePath("/compartido/config/[year]", "page")
}

export async function createCategory(name: string, splitType: SplitType) {
  const userId = await getUserId()
  const last = await prisma.sharedCategory.findFirst({
    where: { userId },
    orderBy: { order: "desc" },
  })
  await prisma.sharedCategory.create({
    data: { userId, name, splitType, order: (last?.order ?? -1) + 1 },
  })
  revalidatePath("/registro/gastos/config/[year]", "page")
  revalidatePath("/compartido/config/[year]", "page")
}

export async function updateCategory(id: string, name: string, splitType: SplitType) {
  const userId = await getUserId()
  await prisma.sharedCategory.updateMany({ where: { id, userId }, data: { name, splitType } })
  revalidatePath("/registro/gastos/config/[year]", "page")
  revalidatePath("/compartido/config/[year]", "page")
}

export async function toggleCategory(id: string, isActive: boolean) {
  const userId = await getUserId()
  await prisma.sharedCategory.updateMany({ where: { id, userId }, data: { isActive } })
  revalidatePath("/registro/gastos/config/[year]", "page")
  revalidatePath("/compartido/config/[year]", "page")
}

export async function deleteCategory(id: string) {
  const userId = await getUserId()
  await prisma.sharedCategory.deleteMany({ where: { id, userId } })
  revalidatePath("/registro/gastos/config/[year]", "page")
  revalidatePath("/compartido/config/[year]", "page")
}

// ─── Gastos ───────────────────────────────────────────────────────────────────

export async function createExpense(data: {
  year: number; month: number; categoryId: string
  amount: number; paidBy: SharedPayer; note?: string
}, ownerUserId?: string) {
  const userId = await resolveOwner(ownerUserId)
  await prisma.sharedExpense.create({ data: { userId, ...data } })
  revalidatePath(`/registro/gastos/${data.year}/${data.month}`)
  revalidatePath(`/registro/gastos/${data.year}`)
  revalidatePath(`/compartido/${data.year}/${data.month}`)
  revalidatePath(`/compartido/${data.year}`)
}

export async function updateExpense(id: string, data: {
  categoryId: string; amount: number; paidBy: SharedPayer; note?: string
}, ownerUserId?: string) {
  const userId = await resolveOwner(ownerUserId)
  const expense = await prisma.sharedExpense.findFirst({ where: { id, userId } })
  if (!expense) throw new Error("Not found")
  await prisma.sharedExpense.update({ where: { id }, data })
  revalidatePath(`/registro/gastos/${expense.year}/${expense.month}`)
  revalidatePath(`/registro/gastos/${expense.year}`)
  revalidatePath(`/compartido/${expense.year}/${expense.month}`)
  revalidatePath(`/compartido/${expense.year}`)
}

export async function deleteExpense(id: string, ownerUserId?: string) {
  const userId = await resolveOwner(ownerUserId)
  const expense = await prisma.sharedExpense.findFirst({ where: { id, userId } })
  if (!expense) throw new Error("Not found")
  await prisma.sharedExpense.delete({ where: { id } })
  revalidatePath(`/registro/gastos/${expense.year}/${expense.month}`)
  revalidatePath(`/registro/gastos/${expense.year}`)
  revalidatePath(`/compartido/${expense.year}/${expense.month}`)
  revalidatePath(`/compartido/${expense.year}`)
}

// ─── Aportaciones ─────────────────────────────────────────────────────────────

export async function createDeposit(data: {
  year: number; month: number; person: number; amount: number; note?: string
}, ownerUserId?: string) {
  const userId = await resolveOwner(ownerUserId)
  await prisma.sharedDeposit.create({ data: { userId, ...data } })
  revalidatePath(`/registro/gastos/${data.year}/${data.month}`)
  revalidatePath(`/registro/gastos/${data.year}`)
  revalidatePath(`/compartido/${data.year}/${data.month}`)
  revalidatePath(`/compartido/${data.year}`)
}

export async function updateDeposit(id: string, data: {
  person: number; amount: number; note?: string
}, ownerUserId?: string) {
  const userId = await resolveOwner(ownerUserId)
  const deposit = await prisma.sharedDeposit.findFirst({ where: { id, userId } })
  if (!deposit) throw new Error("Not found")
  await prisma.sharedDeposit.update({ where: { id }, data })
  revalidatePath(`/registro/gastos/${deposit.year}/${deposit.month}`)
  revalidatePath(`/registro/gastos/${deposit.year}`)
  revalidatePath(`/compartido/${deposit.year}/${deposit.month}`)
  revalidatePath(`/compartido/${deposit.year}`)
}

export async function deleteDeposit(id: string, ownerUserId?: string) {
  const userId = await resolveOwner(ownerUserId)
  const deposit = await prisma.sharedDeposit.findFirst({ where: { id, userId } })
  if (!deposit) throw new Error("Not found")
  await prisma.sharedDeposit.delete({ where: { id } })
  revalidatePath(`/registro/gastos/${deposit.year}/${deposit.month}`)
  revalidatePath(`/registro/gastos/${deposit.year}`)
  revalidatePath(`/compartido/${deposit.year}/${deposit.month}`)
  revalidatePath(`/compartido/${deposit.year}`)
}
