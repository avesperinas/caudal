/**
 * format.ts — funciones de formateo centralizadas.
 * Nunca formatear moneda o fechas inline en componentes.
 */

const CURRENCY = "EUR";
const LOCALE = "es-ES";

/** Formatea un importe con símbolo y signo explícito. Ej: "+1.240,50 €" */
export function formatAmount(value: number, showSign = true): string {
  const formatted = new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 2,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useGrouping: "always" as any,
  }).format(Math.abs(value));

  if (!showSign) return formatted;
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

/** Formatea un importe sin signo explícito. Ej: "1.240,50 €" */
export function formatAmountAbs(value: number): string {
  return formatAmount(value, false);
}

/** Formatea sin decimales para importes redondos. Ej: "1.500 €" */
export function formatAmountRound(value: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useGrouping: "always" as any,
  }).format(value)
}

/** Formatea un porcentaje con locale. Ej: "2,35%" */
export function formatPct(value: number, decimals = 2): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useGrouping: "always" as any,
  }).format(value) + "%"
}

/** Porcentaje con signo explícito. Ej: "+2,35%" / "-2,35%" */
export function formatPctSigned(value: number, decimals = 2): string {
  return (value >= 0 ? "+" : "-") + formatPct(Math.abs(value), decimals)
}

/** Formatea un número con separador de miles pero sin símbolo de moneda. Ej: "1.500" */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useGrouping: "always" as any,
  }).format(value)
}

/** Formatea una fecha relativa simple. */
export function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / 86_400_000);

  if (days === 0) return "Hoy";
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;

  return date.toLocaleDateString(LOCALE, { day: "numeric", month: "short" });
}

/** Formatea una fecha completa. Ej: "14 de abril de 2026" */
export function formatDateLong(date: Date): string {
  return date.toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
