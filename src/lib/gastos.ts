/**
 * gastos.ts — dominio de gastos comunes (pareja).
 */

import {
  SharedCategory, SharedDeposit, SharedExpense, SharedPayer,
  SharedPersonIncome, SharedYearConfig, SplitType,
} from "@prisma/client"

export const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

export const SPLIT_LABELS: Record<SplitType, string> = {
  FIFTY_FIFTY:  "50/50",
  PROPORTIONAL: "Proporcional",
}

export const DEFAULT_CATEGORIES: { name: string; splitType: SplitType; order: number }[] = [
  { name: "Alquiler",     splitType: "FIFTY_FIFTY",  order: 0 },
  { name: "Supermercado", splitType: "PROPORTIONAL", order: 1 },
  { name: "Internet",     splitType: "PROPORTIONAL", order: 2 },
  { name: "Suministros",  splitType: "PROPORTIONAL", order: 3 },
  { name: "Viajes",       splitType: "PROPORTIONAL", order: 4 },
  { name: "Transporte",   splitType: "PROPORTIONAL", order: 5 },
  { name: "Gatos",        splitType: "PROPORTIONAL", order: 6 },
  { name: "Otros",        splitType: "PROPORTIONAL", order: 7 },
]

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type ExpenseWithCategory = SharedExpense & { category: SharedCategory }

export type MonthBalance = {
  obligation1:   number
  obligation2:   number
  contribution1: number
  contribution2: number
  balance1:      number   // positivo = P1 ha pagado de más
  balance2:      number
  totalExpenses: number
  deposits1:     number
  deposits2:     number
  individual1:   number
  individual2:   number
}

// ─── Swap de personas (para colaboradores) ───────────────────────────────────

const SWAP_PAYER: Record<SharedPayer, SharedPayer> = {
  ACCOUNT: "ACCOUNT",
  PERSON1: "PERSON2",
  PERSON2: "PERSON1",
}

/**
 * Intercambia Persona 1 ↔ Persona 2 en todos los datos compartidos.
 * Así cada usuario se ve a sí mismo como "Persona 1".
 */
export function swapPersons<E extends { paidBy: SharedPayer }>(
  yearConfig: SharedYearConfig | null,
  personIncomes: SharedPersonIncome[],
  expenses: E[],
  deposits: SharedDeposit[],
) {
  const swappedConfig = yearConfig
    ? { ...yearConfig, person1Name: yearConfig.person2Name, person2Name: yearConfig.person1Name }
    : null

  const swappedIncomes = personIncomes.map(i => ({
    ...i,
    person: i.person === 1 ? 2 : 1,
  }))

  const swappedExpenses = expenses.map(e => ({
    ...e,
    paidBy: SWAP_PAYER[e.paidBy],
  }))

  const swappedDeposits = deposits.map(d => ({
    ...d,
    person: d.person === 1 ? 2 : 1,
  }))

  return {
    yearConfig: swappedConfig,
    personIncomes: swappedIncomes,
    expenses: swappedExpenses,
    deposits: swappedDeposits,
  }
}

// ─── Helpers de fecha ─────────────────────────────────────────────────────────

/** Días solapados entre [from1,to1] y [from2,to2]. Las fechas son UTC midnight. */
function overlapDays(from1: Date, to1: Date, from2: Date, to2: Date): number {
  const start = from1 > from2 ? from1 : from2
  const end   = to1   < to2   ? to1   : to2
  if (start > end) return 0
  return Math.round((end.getTime() - start.getTime()) / 86400000) + 1
}

function isLeapYear(year: number): boolean {
  return new Date(Date.UTC(year, 1, 29)).getUTCMonth() === 1
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Días de un tramo de ingresos que caen dentro del año. */
function incomeDaysInYear(inc: SharedPersonIncome, year: number): number {
  return overlapDays(
    new Date(inc.fromDate), new Date(inc.toDate),
    new Date(Date.UTC(year, 0, 1)), new Date(Date.UTC(year, 11, 31)),
  )
}

/**
 * Ingreso diario de un tramo: salario anual prorrateado + extra repartido
 * entre los días del tramo. El extra cuenta igual que el salario, así que
 * cambiarlo mueve el reparto.
 */
function dailyIncome(inc: SharedPersonIncome, year: number): number {
  const days = incomeDaysInYear(inc, year)
  if (days <= 0) return 0
  return inc.salary / (isLeapYear(year) ? 366 : 365) + inc.extra / days
}

/** Ingresos anuales reales de una persona (ingreso diario × días del tramo). */
export function getAnnualIncome(incomes: SharedPersonIncome[], person: 1 | 2, year: number): number {
  return incomes
    .filter(i => i.person === person)
    .reduce((total, inc) => total + dailyIncome(inc, year) * incomeDaysInYear(inc, year), 0)
}

/**
 * Ratio de reparto: la proporción de ingresos anuales de cada persona.
 * Es el porcentaje de los gastos comunes que le toca pagar, y no varía dentro
 * del año: los tramos de ingresos ya se ponderan por días al calcular el total.
 */
export function getAnnualRatio(
  incomes: SharedPersonIncome[],
  year: number,
): { ratio1: number; ratio2: number; income1: number; income2: number } {
  const income1 = getAnnualIncome(incomes, 1, year)
  const income2 = getAnnualIncome(incomes, 2, year)
  const total   = income1 + income2
  if (total === 0) return { ratio1: 0.5, ratio2: 0.5, income1, income2 }
  return { ratio1: income1 / total, ratio2: income2 / total, income1, income2 }
}

export function calcMonthBalance(
  expenses: ExpenseWithCategory[],
  deposits: SharedDeposit[],
  incomes: SharedPersonIncome[],
  year: number,
): MonthBalance {
  const { ratio1, ratio2 } = getAnnualRatio(incomes, year)

  let obligation1 = 0
  let obligation2 = 0

  for (const exp of expenses) {
    const r1 = exp.category.splitType === "FIFTY_FIFTY" ? 0.5 : ratio1
    const r2 = exp.category.splitType === "FIFTY_FIFTY" ? 0.5 : ratio2
    obligation1 += exp.amount * r1
    obligation2 += exp.amount * r2
  }

  const deposits1   = deposits.filter(d => d.person === 1).reduce((s, d) => s + d.amount, 0)
  const deposits2   = deposits.filter(d => d.person === 2).reduce((s, d) => s + d.amount, 0)
  const individual1 = expenses.filter(e => e.paidBy === "PERSON1").reduce((s, e) => s + e.amount, 0)
  const individual2 = expenses.filter(e => e.paidBy === "PERSON2").reduce((s, e) => s + e.amount, 0)

  const contribution1 = deposits1 + individual1
  const contribution2 = deposits2 + individual2

  const rawBalance1 = contribution1 - obligation1
  const rawBalance2 = contribution2 - obligation2
  const netBalance  = (rawBalance1 - rawBalance2) / 2

  return {
    obligation1,
    obligation2,
    contribution1,
    contribution2,
    balance1:      netBalance,
    balance2:      -netBalance,
    totalExpenses: expenses.reduce((s, e) => s + e.amount, 0),
    deposits1,
    deposits2,
    individual1,
    individual2,
  }
}
