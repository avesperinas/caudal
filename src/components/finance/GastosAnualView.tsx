import Link from "next/link"
import { Settings, ChevronLeft, ChevronRight } from "lucide-react"
import { SharedCategory, SharedPersonIncome, SharedYearConfig, SplitType } from "@prisma/client"
import { cn } from "@/lib/utils"
import { tx, layout } from "@/lib/styles"
import { formatAmountAbs } from "@/lib/format"
import { MONTHS, SPLIT_LABELS, MonthBalance, getAnnualRatio } from "@/lib/gastos"

// ─── Tipos ────────────────────────────────────────────────────────────────────

type MonthSummary = {
  month: number
  hasData: boolean
  balance: MonthBalance
}

type CategoryTotal = {
  category: SharedCategory
  total: number
}

type AnnualBalance = {
  obligation1: number; obligation2: number
  contribution1: number; contribution2: number
  balance1: number; balance2: number
}

// ─── Balance card ─────────────────────────────────────────────────────────────

function BalanceCard({
  name,
  pct,
  contribution,
  obligation,
  balance,
  settled,
}: {
  name: string; pct: number; contribution: number; obligation: number; balance: number; settled: boolean
}) {
  const positive = balance >= 0
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className={tx.label}>{name}</p>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs tabular-nums text-muted-foreground">
          {(pct * 100).toFixed(1)}%
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className={tx.secondary}>Contribuido</span>
          <span className="tabular-nums font-medium">{formatAmountAbs(contribution)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className={tx.secondary}>Obligación</span>
          <span className="tabular-nums">{formatAmountAbs(obligation)}</span>
        </div>
      </div>
      <div className={cn(
        "rounded-lg px-3 py-2 text-center tabular-nums font-semibold",
        settled
          ? "bg-muted text-muted-foreground"
          : positive
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
            : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
      )}>
        <span className={cn(settled && "line-through")}>
          {positive ? "+" : ""}{formatAmountAbs(balance)}
        </span>
        <span className={cn(
          tx.caption, "ml-1.5",
          settled
            ? "no-underline"
            : positive ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500",
          settled && "line-through",
        )}>
          {positive ? "a favor" : "a deber"}
        </span>
      </div>
    </div>
  )
}

// ─── Tarjeta de mes ───────────────────────────────────────────────────────────

function MonthCard({ year, month, hasData, balance, basePath }: {
  year: number; month: number; hasData: boolean; balance: MonthBalance; basePath: string
}) {
  const isCurrentMonth = (() => {
    const now = new Date()
    return now.getFullYear() === year && now.getMonth() + 1 === month
  })()

  return (
    <Link
      href={`${basePath}/${year}/${month}`}
      className={cn(
        "flex flex-col gap-2 rounded-xl border p-3 transition-colors hover:border-primary/30 hover:bg-primary/5",
        isCurrentMonth ? "border-primary/40 bg-primary/5" : "border-border bg-card",
      )}
    >
      <div className="flex items-center justify-between">
        <p className={cn("text-sm font-medium", isCurrentMonth && "text-primary")}>{MONTHS[month - 1]}</p>
        {hasData && (
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        )}
      </div>
      {hasData ? (
        <p className={tx.caption}>{formatAmountAbs(balance.totalExpenses)}</p>
      ) : (
        <p className={tx.caption}>Sin datos</p>
      )}
    </Link>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────

export function GastosAnualView({
  year,
  yearConfig,
  personIncomes,
  monthSummaries,
  categoryTotals,
  annualBalance,
  basePath = "/registro/gastos",
}: {
  year: number
  yearConfig: SharedYearConfig | null
  personIncomes: SharedPersonIncome[]
  monthSummaries: MonthSummary[]
  categoryTotals: CategoryTotal[]
  annualBalance: AnnualBalance
  basePath?: string
}) {
  const p1Name  = yearConfig?.person1Name ?? "Persona 1"
  const p2Name  = yearConfig?.person2Name ?? "Persona 2"
  const settled = yearConfig?.settled ?? false

  const { ratio1, ratio2 } = getAnnualRatio(personIncomes, year)

  const totalExpenses = categoryTotals.reduce((s, ct) => s + ct.total, 0)

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="space-y-1">
        {/* Nivel raíz */}
        <p className="text-sm font-medium text-muted-foreground">Gastos</p>
        {/* Nivel año */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`${basePath}/${year - 1}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
            >
              <ChevronLeft className="size-4" />
            </Link>
            <h1 className="text-xl font-semibold">{year}</h1>
            <Link
              href={`${basePath}/${year + 1}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted"
            >
              <ChevronRight className="size-4" />
            </Link>
          </div>
          <Link
            href={`${basePath}/config/${year}`}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted"
          >
            <Settings className="size-3.5" />
            Configuración
          </Link>
        </div>
      </div>

      {!yearConfig && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            No hay configuración para {year}.{" "}
            <Link href={`${basePath}/config/${year}`} className="font-medium underline underline-offset-2">
              Configura los nombres y salarios
            </Link>
            .
          </p>
        </div>
      )}

      {/* Balance anual */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <p className={tx.sectionLabel}>Balance anual</p>
          {settled && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <svg viewBox="0 0 16 16" className="size-3" fill="currentColor">
                <path d="M13.5 3.5L6 11 2.5 7.5l-1 1L6 13l8.5-8.5-1-1z"/>
              </svg>
              Solventado
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <BalanceCard
            name={p1Name}
            pct={ratio1}
            contribution={annualBalance.contribution1}
            obligation={annualBalance.obligation1}
            balance={annualBalance.balance1}
            settled={settled}
          />
          <BalanceCard
            name={p2Name}
            pct={ratio2}
            contribution={annualBalance.contribution2}
            obligation={annualBalance.obligation2}
            balance={annualBalance.balance2}
            settled={settled}
          />
        </div>
      </div>

      {/* Grid de meses */}
      <div>
        <p className={cn(tx.sectionLabel, "mb-3")}>Meses</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {monthSummaries.map(s => (
            <MonthCard key={s.month} year={year} {...s} basePath={basePath} />
          ))}
        </div>
      </div>

      {/* Totales por categoría */}
      {categoryTotals.length > 0 && (
        <div>
          <p className={cn(tx.sectionLabel, "mb-3")}>Totales por categoría</p>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Categoría</th>
                  <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">{p1Name}</th>
                  <th className="px-3 py-2.5 text-right font-medium text-muted-foreground">{p2Name}</th>
                  <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {categoryTotals.map(({ category, total }) => {
                  const r1 = category.splitType === "FIFTY_FIFTY" ? 0.5 : ratio1
                  const r2 = category.splitType === "FIFTY_FIFTY" ? 0.5 : ratio2
                  return (
                    <tr key={category.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{category.name}</span>
                          <span className={cn(
                            "rounded-full px-1.5 py-0.5 text-xs",
                            category.splitType === "FIFTY_FIFTY"
                              ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400"
                              : "bg-muted text-muted-foreground",
                          )}>
                            {SPLIT_LABELS[category.splitType as SplitType]}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                        {formatAmountAbs(total * r1)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                        {formatAmountAbs(total * r2)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums font-medium">
                        {formatAmountAbs(total)}
                      </td>
                    </tr>
                  )
                })}
                {/* Fila de total */}
                <tr className="border-t-2 border-border bg-muted/30">
                  <td className="px-4 py-2.5 font-semibold">Total</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold">
                    {formatAmountAbs(annualBalance.obligation1)}
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold">
                    {formatAmountAbs(annualBalance.obligation2)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums font-semibold">
                    {formatAmountAbs(totalExpenses)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
