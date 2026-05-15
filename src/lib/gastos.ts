/**
 * gastos.ts — dominio de gastos comunes (pareja).
 */

import { SharedCategory, SharedDeposit, SharedExpense, SharedPersonIncome, SplitType } from "@prisma/client"

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

/**
 * Ratio de contribución proporcional para un mes dado.
 * Pondera por los días que cada persona tiene salario activo en ese mes.
 */
export function getRatio(
  incomes: SharedPersonIncome[],
  year: number,
  month: number,
): { ratio1: number; ratio2: number } {
  const mStart = new Date(Date.UTC(year, month - 1, 1))
  const mEnd   = new Date(Date.UTC(year, month, 0))   // último día del mes

  let s1 = 0, s2 = 0
  for (const inc of incomes) {
    const days = overlapDays(new Date(inc.fromDate), new Date(inc.toDate), mStart, mEnd)
    if (days <= 0) continue
    if (inc.person === 1) s1 += days * inc.salary
    else                   s2 += days * inc.salary
  }

  const total = s1 + s2
  if (total === 0) return { ratio1: 0.5, ratio2: 0.5 }
  return { ratio1: s1 / total, ratio2: 1 - s1 / total }
}

/** Ingresos anuales reales de una persona (salario diario ponderado × días + extras). */
export function getAnnualIncome(incomes: SharedPersonIncome[], person: 1 | 2, year: number): number {
  const pi = incomes.filter(i => i.person === person)
  if (pi.length === 0) return 0

  const yStart     = new Date(Date.UTC(year, 0, 1))
  const yEnd       = new Date(Date.UTC(year, 11, 31))
  const daysInYear = isLeapYear(year) ? 366 : 365

  let total = 0
  for (const inc of pi) {
    const days = overlapDays(new Date(inc.fromDate), new Date(inc.toDate), yStart, yEnd)
    if (days <= 0) continue
    total += (inc.salary / daysInYear) * days + inc.extra
  }
  return total
}

/** Ratio de contribución anual ponderado e ingresos totales por persona. */
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
  month: number,
): MonthBalance {
  const { ratio1, ratio2 } = getRatio(incomes, year, month)

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
