/**
 * products.ts — constantes del dominio de productos financieros.
 */

import { ProductType } from "@prisma/client"

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  CHECKING:    "Cuenta corriente",
  SAVINGS:     "Cuenta ahorro",
  FUND:        "Fondo de inversión",
  PENSION:     "Plan de pensiones",
  ETF:         "ETF / Acciones",
  REAL_ESTATE: "Inmueble",
  CRYPTO:      "Criptomoneda",
  OTHER:       "Otro",
}

export const PRODUCT_TYPES = Object.entries(PRODUCT_TYPE_LABELS) as [ProductType, string][]

/**
 * Iconos disponibles para entidades — nombres de componentes Lucide.
 * Se guardan como string en BD y se mapean en tiempo de render.
 */
export const ENTITY_ICON_NAMES = [
  "Landmark",
  "Building2",
  "Building",
  "Wallet",
  "CreditCard",
  "PiggyBank",
  "TrendingUp",
  "BarChart2",
  "LineChart",
  "Coins",
  "DollarSign",
  "Home",
  "Globe",
  "Briefcase",
  "Shield",
  "Zap",
  "Layers",
  "Package",
  "Store",
  "Banknote",
] as const

export type EntityIconName = (typeof ENTITY_ICON_NAMES)[number]

/** Paleta de colores para entidades (tonos 400, legibles en light y dark). */
export const ENTITY_COLORS = [
  "#94A3B8", // slate
  "#F87171", // red
  "#FB923C", // orange
  "#FBBF24", // amber
  "#4ADE80", // green
  "#34D399", // emerald
  "#22D3EE", // cyan
  "#60A5FA", // blue
  "#818CF8", // indigo
  "#A78BFA", // violet
  "#F472B6", // pink
] as const

/** Formatea una fecha Date como string YYYY-MM-DD para inputs type="date". */
export function toDateInput(date: Date): string {
  const d = new Date(date)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** Formatea una fecha para mostrar en la UI. Ej: "ene 2024" */
export function formatMonthYear(date: Date): string {
  return new Date(date).toLocaleDateString("es-ES", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}
