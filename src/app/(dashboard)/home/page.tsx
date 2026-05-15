import Link from "next/link"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import {
  TrendingUp, TrendingDown, Wallet, Receipt, ArrowUpDown, Camera, Users,
  LineChart, BarChart2, ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { tx } from "@/lib/styles"
import { formatAmountAbs, formatAmount, formatPctSigned } from "@/lib/format"
import { MONTHS, getRatio } from "@/lib/gastos"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findClosest<T extends { date: Date }>(items: T[], targetMs: number): T | null {
  if (items.length === 0) return null
  return items.reduce((best, p) =>
    Math.abs(p.date.getTime() - targetMs) < Math.abs(best.date.getTime() - targetMs) ? p : best
  )
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function ActionTile({
  href, icon: Icon, label, accent,
}: {
  href: string
  icon: React.ElementType
  label: string
  accent?: "income" | "expense" | "neutral"
}) {
  const color =
    accent === "income"  ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40" :
    accent === "expense" ? "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40" :
    "text-foreground bg-muted/60"
  return (
    <Link
      href={href}
      className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-3 text-center transition-all hover:border-foreground/15 hover:shadow-sm active:scale-[0.98]"
    >
      <div className={cn("flex size-10 items-center justify-center rounded-lg", color)}>
        <Icon className="size-5" />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  )
}

function AnalysisCard({
  href, icon: Icon, label, hint,
}: {
  href: string
  icon: React.ElementType
  label: string
  hint?: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
    >
      <div className="flex items-center gap-3">
        <Icon className="size-4 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium leading-tight">{label}</p>
          {hint && <p className={cn(tx.caption, "leading-tight")}>{hint}</p>}
        </div>
      </div>
      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id
  const firstName = session.user.name?.split(" ")[0]

  const now    = new Date()
  const year   = now.getFullYear()
  const month  = now.getMonth() + 1

  // Mostramos el mes anterior: el actual suele estar incompleto (p.ej. nómina a fin de mes).
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear  = month === 1 ? year - 1 : year

  const [
    ingresosTxs, gastosTxs, aportacionesTxs,
    sharedExpenses, sharedIncomes,
    snapshotsRaw,
  ] = await Promise.all([
    prisma.personalTransaction.findMany({
      where: { userId, year: prevYear, month: prevMonth, type: "INCOME" },
      select: { amount: true },
    }),
    prisma.personalTransaction.findMany({
      where: { userId, year: prevYear, month: prevMonth, type: "EXPENSE" },
      select: { amount: true },
    }),
    prisma.personalTransaction.findMany({
      where: { userId, year: prevYear, month: prevMonth, type: "TRANSFER", madeByMe: true },
      select: { amount: true },
    }),
    prisma.sharedExpense.findMany({
      where: { userId, year: prevYear, month: prevMonth },
      select: { amount: true, category: { select: { splitType: true } } },
    }),
    prisma.sharedPersonIncome.findMany({
      where: { userId },
      orderBy: { fromDate: "asc" },
    }),
    prisma.productSnapshot.findMany({
      where: { userId },
      select: { date: true, value: true, productId: true, product: { select: { ownership: true } } },
      orderBy: { date: "asc" },
    }),
  ])

  // ── Flujo del mes ──
  const ingresos = ingresosTxs.reduce((s, t) => s + t.amount, 0)
  const gastosPersonales = gastosTxs.reduce((s, t) => s + t.amount, 0)
  const aportaciones = aportacionesTxs.reduce((s, t) => s + t.amount, 0)

  const { ratio1 } = getRatio(sharedIncomes, prevYear, prevMonth)
  const gastosCompartidos = sharedExpenses.reduce((s, e) => {
    const r = e.category.splitType === "FIFTY_FIFTY" ? 0.5 : ratio1
    return s + e.amount * r
  }, 0)
  const gastosTotal = gastosPersonales + gastosCompartidos

  // ── Patrimonio + trend ──
  type SnapRow = { date: Date; value: number; productId: string; product: { ownership: number } }
  const byDate = new Map<string, SnapRow[]>()
  for (const s of snapshotsRaw as SnapRow[]) {
    const k = s.date.toISOString().slice(0, 10)
    if (!byDate.has(k)) byDate.set(k, [])
    byDate.get(k)!.push(s)
  }
  const totalsByDate = Array.from(byDate.entries())
    .map(([k, rows]) => ({
      date: new Date(k),
      total: rows.reduce((s, r) => s + r.value * (r.product.ownership / 100), 0),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const latest = totalsByDate.at(-1)
  const patrimonio = latest?.total ?? 0

  const previousCandidates = totalsByDate.filter(t => t !== latest)
  const monthAgoTarget = latest ? latest.date.getTime() - 30 * 24 * 60 * 60 * 1000 : 0
  const monthAgo = latest ? findClosest(previousCandidates, monthAgoTarget) : null
  const diffMes  = latest && monthAgo ? latest.total - monthAgo.total : null
  const diffMesPct = diffMes !== null && monthAgo && monthAgo.total > 0
    ? (diffMes / monthAgo.total) * 100
    : null

  const prevMonthLabel = `${MONTHS[prevMonth - 1]} ${prevYear}`
  const trendUp = diffMes !== null && diffMes > 0

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hola{firstName ? `, ${firstName}` : ""}</h1>
        <p className={tx.caption}>{`${MONTHS[month - 1]} ${year}`}</p>
      </div>

      {/* ── Hero: Patrimonio ── */}
      {patrimonio > 0 ? (
        <Link
          href="/patrimonio"
          className="block rounded-2xl border border-border bg-gradient-to-br from-card to-muted/40 p-5 transition-all hover:border-foreground/15 hover:shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className={tx.caption}>Patrimonio</p>
              <p className="text-3xl font-bold tabular-nums tracking-tight">
                {formatAmountAbs(patrimonio)}
              </p>
              {diffMes !== null && diffMesPct !== null && (
                <div className={cn(
                  "flex items-center gap-1 pt-1 text-sm tabular-nums",
                  trendUp ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
                )}>
                  {trendUp ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                  <span className="font-medium">{formatAmount(diffMes)}</span>
                  <span className="text-muted-foreground">·</span>
                  <span>{formatPctSigned(diffMesPct, 1)}</span>
                  <span className={cn(tx.caption, "ml-1")}>último mes</span>
                </div>
              )}
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
          </div>
        </Link>
      ) : (
        <Link
          href="/snapshots"
          className="block rounded-2xl border border-dashed border-border p-5 text-center transition-colors hover:bg-muted/40"
        >
          <p className="text-sm font-medium">Aún no hay snapshots</p>
          <p className={cn(tx.caption, "mt-1")}>Registra el valor de tus productos para ver tu patrimonio.</p>
        </Link>
      )}

      {/* ── Resumen del mes ── */}
      <Link
        href="/flujo"
        className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/15"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <p className={tx.label}>{prevMonthLabel}</p>
          <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
        </div>

        {/* Breakdown: filas en móvil, grid en desktop */}
        <div className="mt-3 flex flex-col divide-y divide-border border-t border-border sm:mt-4 sm:grid sm:grid-cols-3 sm:gap-3 sm:divide-y-0 sm:border-t-0 sm:border-none sm:pt-0">
          <div className="flex items-center justify-between py-2.5 sm:flex-col sm:items-start sm:gap-0.5 sm:py-0">
            <p className={tx.caption}>Ingresos</p>
            <p className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 sm:text-base">
              {formatAmountAbs(ingresos)}
            </p>
          </div>
          <div className="flex items-center justify-between py-2.5 sm:flex-col sm:items-start sm:gap-0.5 sm:py-0">
            <p className={tx.caption}>Gastos</p>
            <p className="text-sm font-semibold tabular-nums text-rose-600 dark:text-rose-400 sm:text-base">
              {formatAmountAbs(gastosTotal)}
            </p>
          </div>
          <div className="flex items-center justify-between py-2.5 sm:flex-col sm:items-start sm:gap-0.5 sm:py-0">
            <p className={tx.caption}>Aportaciones</p>
            <p className="text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400 sm:text-base">
              {formatAmountAbs(aportaciones)}
            </p>
          </div>
        </div>
      </Link>

      {/* ── Registrar ── */}
      <div className="space-y-3">
        <p className={tx.label}>Registrar</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <ActionTile href={`/ingresos/${year}/${month}`}     icon={Wallet}      label="Ingreso"    accent="income" />
          <ActionTile href={`/gastos/${year}/${month}`}        icon={Receipt}     label="Gasto"      accent="expense" />
          <ActionTile href={`/compartido/${year}/${month}`}    icon={Users}       label="Compartido" accent="expense" />
          <ActionTile href={`/aportaciones?year=${year}&month=${month}`} icon={ArrowUpDown} label="Aportación" accent="neutral" />
          <ActionTile href="/snapshots"                        icon={Camera}      label="Snapshot"   accent="neutral" />
        </div>
      </div>

      {/* ── Análisis ── */}
      <div className="space-y-3">
        <p className={tx.label}>Análisis</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <AnalysisCard href="/flujo"       icon={LineChart}  label="Flujo"       hint="Ingresos y ahorro" />
          <AnalysisCard href="/inversiones" icon={BarChart2}  label="Inversiones" hint="Cartera y rentabilidad" />
          <AnalysisCard href="/patrimonio"  icon={TrendingUp} label="Patrimonio"  hint="Evolución y distribución" />
        </div>
      </div>
    </div>
  )
}
