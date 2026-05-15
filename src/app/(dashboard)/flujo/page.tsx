import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { FlujoView, FlujoMonth } from "@/components/finance/FlujoView"
import { getRatio } from "@/lib/gastos"
import { tx } from "@/lib/styles"

export default async function FlujoPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const [personalTxs, sharedExpenses, sharedIncomes] = await Promise.all([
    prisma.personalTransaction.findMany({
      where: { userId },
      select: {
        year: true, month: true, type: true, amount: true, madeByMe: true,
        category: { select: { countForExtendedSavings: true } },
        product:  { select: { countForSavings: true, type: true } },
      },
    }),
    prisma.sharedExpense.findMany({
      where: { userId },
      select: { year: true, month: true, amount: true, category: { select: { splitType: true } } },
    }),
    prisma.sharedPersonIncome.findMany({
      where: { userId },
      orderBy: { fromDate: "asc" },
    }),
  ])

  // ── Agrupar por (year, month) ──
  const map = new Map<string, FlujoMonth>()
  const key = (y: number, m: number) => `${y}-${String(m).padStart(2, "0")}`
  const touch = (y: number, m: number): FlujoMonth => {
    const k = key(y, m)
    let row = map.get(k)
    if (!row) {
      row = {
        year: y, month: m,
        ingresos: 0, gastosPersonales: 0, gastosCompartidos: 0,
        aportaciones: 0, aportacionesFinancieras: 0, gastosViviendaYAmpliados: 0,
      }
      map.set(k, row)
    }
    return row
  }

  for (const t of personalTxs) {
    const row = touch(t.year, t.month)
    if (t.type === "INCOME") {
      row.ingresos += t.amount
    } else if (t.type === "EXPENSE") {
      row.gastosPersonales += t.amount
      if (t.category?.countForExtendedSavings) row.gastosViviendaYAmpliados += t.amount
    } else if (t.type === "TRANSFER" && t.madeByMe) {
      row.aportaciones += t.amount
      if (t.product?.countForSavings) {
        if (t.product.type === "REAL_ESTATE") {
          // Inmueble cuenta solo para la tasa ampliada
          row.gastosViviendaYAmpliados += t.amount
        } else {
          row.aportacionesFinancieras += t.amount
        }
      }
    }
  }

  // ── Compartidos: obligación proporcional por mes ──
  const expensesByMonth = new Map<string, { amount: number; splitType: string }[]>()
  for (const e of sharedExpenses) {
    const k = key(e.year, e.month)
    if (!expensesByMonth.has(k)) expensesByMonth.set(k, [])
    expensesByMonth.get(k)!.push({ amount: e.amount, splitType: e.category.splitType })
  }
  for (const [k, list] of expensesByMonth) {
    const [yStr, mStr] = k.split("-")
    const y = parseInt(yStr), m = parseInt(mStr)
    const row = touch(y, m)
    const { ratio1 } = getRatio(sharedIncomes, y, m)
    for (const e of list) {
      const r = e.splitType === "FIFTY_FIFTY" ? 0.5 : ratio1
      row.gastosCompartidos += e.amount * r
    }
  }

  // ── Ordenar ascendente y dejar solo meses con actividad ──
  const months = [...map.values()]
    .filter(m => m.ingresos > 0 || m.gastosPersonales > 0 || m.gastosCompartidos > 0 || m.aportaciones > 0)
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-semibold">Flujo</h1>
        <p className={tx.secondary}>
          Evolución de ingresos, gastos y tasa de ahorro.
        </p>
      </div>

      {months.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-sm font-medium">Sin datos todavía</p>
          <p className={tx.caption}>Registra ingresos y gastos para ver el dashboard.</p>
        </div>
      ) : (
        <FlujoView months={months} />
      )}
    </div>
  )
}
