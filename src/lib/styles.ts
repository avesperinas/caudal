/**
 * styles.ts — fuente única de verdad para clases Tailwind reutilizables.
 *
 * Reglas:
 * - Cualquier patrón de clases que aparezca en 2+ sitios va aquí.
 * - Las páginas y componentes importan de aquí; nunca repiten clases a mano.
 * - Para variantes con lógica condicional, usar cva() de este mismo fichero.
 */

import { cva } from "class-variance-authority";

// ─── Tipografía ──────────────────────────────────────────────────────────────

export const tx = {
  /** Título de página principal */
  pageTitle: "text-2xl font-semibold tracking-tight",
  /** Título de sección o card */
  sectionTitle: "text-base font-medium",
  /** Label de campo o columna */
  label: "text-sm font-medium",
  /** Texto de cuerpo estándar */
  body: "text-sm",
  /** Texto secundario / subtítulo */
  secondary: "text-sm text-muted-foreground",
  /** Texto muy pequeño (fechas, refs, metadata) */
  caption: "text-xs text-muted-foreground",
  /** Anotación bajo un dato, dentro de tablas densas */
  microCaption: "text-[10px] text-muted-foreground",
  /** Importe / número con alineación tabular */
  amount: "text-sm font-medium tabular-nums",
  /** Importe grande (balance principal) */
  amountLarge: "text-2xl font-semibold tabular-nums",
  /** Label de sección (uppercase, espaciado) */
  sectionLabel: "text-xs font-medium uppercase tracking-widest text-muted-foreground",
} as const;

// ─── Colores semánticos de finanzas ──────────────────────────────────────────

export const financeColor = cva("", {
  variants: {
    sign: {
      positive: "text-emerald-600 dark:text-emerald-400",
      negative: "text-foreground",
      neutral: "text-muted-foreground",
    },
  },
  defaultVariants: { sign: "neutral" },
});

/** Devuelve la variante de color según el signo del importe */
export function amountSign(value: number): "positive" | "negative" | "neutral" {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export const layout = {
  /** Contenedor de página con padding responsivo */
  page: "mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-10",
  /** Espaciado vertical entre secciones de página */
  pageSections: "space-y-8",
  /** Espaciado interno de una sección */
  section: "space-y-4",
  /** Grid estándar de stats (1 col móvil, 3 en desktop) */
  statsGrid: "grid grid-cols-1 gap-4 sm:grid-cols-3",
} as const;

// ─── Interactividad ──────────────────────────────────────────────────────────

export const interactive = {
  /** Fila de lista clicable */
  listRow: "flex items-center justify-between py-3 border-b last:border-0",
  /** Icono de categoría / avatar placeholder */
  categoryIcon: "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-medium",
  /** Acciones de fila (editar / borrar): visibles en móvil, al hover en desktop */
  rowActions: "flex gap-0.5 shrink-0 transition-opacity sm:opacity-0 sm:group-hover:opacity-100",
} as const;
