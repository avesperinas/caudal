/**
 * inversiones.ts — cálculo de rentabilidad de la cartera.
 *
 * Regla de fecha: un snapshot se fecha el día 1 y recoge el saldo a principio de
 * mes, así que solo refleja lo aportado ESTRICTAMENTE antes de esa fecha. Todo
 * lo que se calcula aquí (capital, ganancia, rentabilidad, TIR y series) acota
 * las aportaciones con ese mismo corte: `estaReflejada()`.
 *
 * Regla de titularidad: aquí se habla SIEMPRE del producto entero, nunca de la
 * parte de un titular. El valor es el del snapshot sin prorratear y el capital
 * son las aportaciones de todos los titulares, así que `ownership` y `madeByMe`
 * no se leen en ningún cálculo de este módulo. Mi parte del patrimonio se
 * prorratea en Patrimonio, y mi flujo de caja se filtra en Flujo y Aportaciones.
 *
 * Sin imports a propósito: el módulo es puro y se puede ejecutar con node para
 * verificarlo sin arrastrar el resto de la app.
 */

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type SnapshotInput = {
  id: string
  /** ISO de un `@db.Date`: medianoche UTC. */
  date: string
  /** Valor total del producto, sin prorratear por ownership. */
  value: number
}

export type AportacionInput = {
  id: string
  year: number
  month: number
  /** ISO de un `@db.Date`, o null en el histórico anterior a la migración. */
  date: string | null
  amount: number
  madeByMe: boolean
  note: string | null
}

export type ProductoInversion = {
  id: string
  name: string
  type: string
  /** Porcentaje de titularidad, 0-100. Aquí no se usa: es etiqueta de UI. */
  ownership: number
  openedAt: string
  closedAt: string | null
  entity: { id: string; name: string; color: string }
  snapshots: SnapshotInput[]
  aportaciones: AportacionInput[]
}

export type Metricas = {
  /** Hay al menos un snapshot con el que valorar el producto. */
  hasData: boolean
  /** Valor del último snapshot: el producto entero, sin prorratear. */
  valor: number
  ultimaFecha: string | null
  ultimaFechaMs: number | null
  /** Aportaciones positivas de todos los titulares ya reflejadas en la valoración. */
  capitalInvertido: number
  /** Retiradas ya reflejadas en la valoración, en positivo. */
  capitalRetirado: number
  capitalNeto: number
  /** Neto aportado que la valoración todavía no recoge. Puede ser negativo. */
  aportadoPosterior: number
  /** Hay coste base con el que comparar el valor. Sin él no hay rentabilidad. */
  hasCosteBase: boolean
  gananciaAbsoluta: number
  rentabilidad: number
  tir: number | null
}

export type Totales = {
  valor: number
  capital: number
  ganancia: number
  rentabilidad: number
  aportadoPosterior: number
  tir: number | null
}

export type FilaCartera = { producto: ProductoInversion; metricas: Metricas }

export type SeriePunto = { dateMs: number; valor: number; coste: number }

// ─── Fechas: siempre en ms UTC ───────────────────────────────────────────────

/**
 * ms de la medianoche UTC de un ISO de `@db.Date`.
 * Parsea el prefijo YYYY-MM-DD en lugar de `new Date(iso)` para no depender del
 * huso del navegador ni de que el ISO llegue con hora u offset.
 */
export function dateOnlyMs(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number)
  return Date.UTC(y, m - 1, d)
}

/** Instante de una aportación: su día si lo tiene, si no el día 1 de su mes. */
export function aportacionMs(a: AportacionInput): number {
  return a.date ? dateOnlyMs(a.date) : Date.UTC(a.year, a.month - 1, 1)
}

/**
 * Único punto de decisión del corte: ¿está esta aportación dentro del valor de
 * un snapshot fechado en `snapMs`?
 *
 * Estricto y no `<=` porque las aportaciones creadas desde la vista mensual se
 * guardan con fecha del día 1, la misma que el snapshot de ese mes: con `<=` se
 * colarían todas y el capital contaría dinero que la valoración no recoge.
 *
 * Efecto secundario buscado: todo flujo queda estrictamente antes del valor
 * terminal, que es lo que la TIR necesita para tener sentido.
 */
export function estaReflejada(a: AportacionInput, snapMs: number): boolean {
  return aportacionMs(a) < snapMs
}

/** Copia ordenada por fecha ascendente. No se confía en el orderBy de Prisma. */
function ordenados(snapshots: SnapshotInput[]): SnapshotInput[] {
  return [...snapshots].sort((a, b) => dateOnlyMs(a.date) - dateOnlyMs(b.date))
}

/** Último snapshot con fecha <= atMs dentro de una lista ya ordenada. */
function vigenteEn(snaps: SnapshotInput[], atMs: number): SnapshotInput | null {
  for (let i = snaps.length - 1; i >= 0; i--) {
    if (dateOnlyMs(snaps[i].date) <= atMs) return snaps[i]
  }
  return null
}

/** Snapshot vigente en `atMs`, o el último de todos si no se pasa fecha. */
export function snapshotVigente(snapshots: SnapshotInput[], atMs?: number): SnapshotInput | null {
  const snaps = ordenados(snapshots)
  if (snaps.length === 0) return null
  if (atMs === undefined) return snaps[snaps.length - 1]
  return vigenteEn(snaps, atMs)
}

// ─── TIR ─────────────────────────────────────────────────────────────────────

/** TIR anual por Newton-Raphson. null si no converge o los flujos no la admiten. */
export function xirr(flows: { dateMs: number; amount: number }[]): number | null {
  if (flows.length < 2) return null
  if (!flows.some((f) => f.amount > 0) || !flows.some((f) => f.amount < 0)) return null

  const sorted = [...flows].sort((a, b) => a.dateMs - b.dateMs)
  const t0 = sorted[0].dateMs
  const MS_YEAR = 365.25 * 24 * 3600 * 1000
  const years = sorted.map((f) => (f.dateMs - t0) / MS_YEAR)

  const npv  = (r: number) => sorted.reduce((s, f, i) => s + f.amount / Math.pow(1 + r, years[i]), 0)
  const dnpv = (r: number) => sorted.reduce((s, f, i) => {
    if (years[i] === 0) return s
    return s - years[i] * f.amount / Math.pow(1 + r, years[i] + 1)
  }, 0)

  let r = 0.1
  for (let i = 0; i < 100; i++) {
    const f = npv(r), df = dnpv(r)
    if (Math.abs(df) < 1e-10 || !isFinite(f)) return null
    const r2 = r - f / df
    if (!isFinite(r2) || r2 < -0.9999 || r2 > 50) return null
    if (Math.abs(r2 - r) < 1e-7) return r2
    r = r2
  }
  return null
}

// ─── Métricas ────────────────────────────────────────────────────────────────

function round2(v: number): number {
  return Math.round(v * 100) / 100
}

export function calcMetricas(p: ProductoInversion): Metricas {
  const snap = snapshotVigente(p.snapshots)

  // Sin valoración no hay nada que comparar: el capital no cuenta y todo lo
  // aportado queda pendiente de valorar.
  if (!snap) {
    return {
      hasData: false,
      valor: 0,
      ultimaFecha: null, ultimaFechaMs: null,
      capitalInvertido: 0, capitalRetirado: 0, capitalNeto: 0,
      aportadoPosterior: p.aportaciones.reduce((s, a) => s + a.amount, 0),
      hasCosteBase: false,
      gananciaAbsoluta: 0, rentabilidad: 0, tir: null,
    }
  }

  const snapMs = dateOnlyMs(snap.date)
  const valor = snap.value

  let capitalInvertido = 0
  let capitalRetirado = 0
  let aportadoPosterior = 0
  const flows: { dateMs: number; amount: number }[] = []

  for (const a of p.aportaciones) {
    if (!estaReflejada(a, snapMs)) {
      aportadoPosterior += a.amount
      continue
    }
    if (a.amount >= 0) capitalInvertido += a.amount
    else capitalRetirado += -a.amount
    flows.push({ dateMs: aportacionMs(a), amount: -a.amount })
  }

  const capitalNeto = capitalInvertido - capitalRetirado
  const hasCosteBase = capitalNeto > 0

  // Sin coste base el "beneficio" sería el saldo íntegro del producto, que no
  // es una ganancia. Se deja a cero para que no contamine los agregados.
  const gananciaAbsoluta = hasCosteBase ? valor - capitalNeto : 0
  const rentabilidad = hasCosteBase ? (gananciaAbsoluta / capitalNeto) * 100 : 0

  flows.push({ dateMs: snapMs, amount: valor })
  const tir = hasCosteBase ? xirr(flows) : null

  return {
    hasData: true,
    valor,
    ultimaFecha: snap.date, ultimaFechaMs: snapMs,
    capitalInvertido, capitalRetirado, capitalNeto,
    aportadoPosterior,
    hasCosteBase,
    gananciaAbsoluta, rentabilidad, tir,
  }
}

/**
 * Métricas por producto y agregados de cartera en una sola pasada, para que los
 * KPI, la tabla y la distribución no puedan divergir.
 *
 * La TIR de cartera lleva un valor terminal POR PRODUCTO en la fecha de su
 * propio último snapshot: mezclarlos todos en la fecha máxima descontaría un
 * valor antiguo como si fuera reciente.
 */
export function calcCartera(products: ProductoInversion[]): {
  porProducto: FilaCartera[]
  totales: Totales
} {
  const porProducto: FilaCartera[] = products.map((producto) => ({
    producto,
    metricas: calcMetricas(producto),
  }))

  let valor = 0, capital = 0, ganancia = 0, aportadoPosterior = 0
  const flows: { dateMs: number; amount: number }[] = []

  for (const { producto, metricas } of porProducto) {
    // Lo aportado a un producto sin valorar también está pendiente de valorar.
    aportadoPosterior += metricas.aportadoPosterior
    if (!metricas.hasData) continue

    valor += metricas.valor
    capital += metricas.capitalNeto
    ganancia += metricas.gananciaAbsoluta

    const snapMs = metricas.ultimaFechaMs as number
    for (const a of producto.aportaciones) {
      if (!estaReflejada(a, snapMs)) continue
      flows.push({ dateMs: aportacionMs(a), amount: -a.amount })
    }
    flows.push({ dateMs: snapMs, amount: metricas.valor })
  }

  return {
    porProducto,
    totales: {
      valor, capital, ganancia,
      rentabilidad: capital > 0 ? (ganancia / capital) * 100 : 0,
      aportadoPosterior,
      tir: xirr(flows),
    },
  }
}

// ─── Series ──────────────────────────────────────────────────────────────────

/**
 * Serie valor vs coste base de la cartera.
 *
 * El eje X son solo fechas de snapshot: si se añadieran las de aportación, en
 * los puntos intermedios el coste subiría con el valor plano, que es el mismo
 * desfase que corrige `estaReflejada`.
 *
 * En cada punto, un producto aporta el valor de SU snapshot vigente y el coste
 * reflejado en ESE snapshot, no el acumulado hasta la fecha del punto. Así un
 * producto con snapshots trimestrales no mezcla valor de abril con coste de mayo.
 */
export function buildPortfolioSeries(products: ProductoInversion[]): SeriePunto[] {
  const prep = products.map((p) => ({
    snaps: ordenados(p.snapshots),
    aportaciones: p.aportaciones,
  }))

  const fechas = new Set<number>()
  for (const { snaps } of prep) {
    for (const s of snaps) fechas.add(dateOnlyMs(s.date))
  }

  return [...fechas]
    .sort((a, b) => a - b)
    .map((dateMs) => {
      let valor = 0
      let coste = 0
      for (const { snaps, aportaciones } of prep) {
        const s = vigenteEn(snaps, dateMs)
        if (!s) continue
        valor += s.value
        const snapMs = dateOnlyMs(s.date)
        for (const a of aportaciones) {
          if (estaReflejada(a, snapMs)) coste += a.amount
        }
      }
      return { dateMs, valor: round2(valor), coste: round2(coste) }
    })
}

/** Serie de un solo producto. Mismas reglas que la de cartera. */
export function buildProductSeries(p: ProductoInversion): SeriePunto[] {
  return buildPortfolioSeries([p])
}
