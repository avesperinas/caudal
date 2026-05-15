/**
 * seed-mock.mjs — Datos mock completos para desarrollo y testing.
 *
 * Genera: entidades, productos, snapshots mensuales (2023-2026),
 * categorías personales y transacciones mensuales detalladas.
 *
 * Ejecución: node scripts/seed-mock.mjs
 */

import pg from "pg"
import crypto from "crypto"

const createId = () => "m" + crypto.randomBytes(11).toString("hex")
const { Pool } = pg
const pool = new Pool({ connectionString: "postgresql://finances:finances_dev@localhost:5432/my_finances" })

async function q(sql, params = []) {
  const client = await pool.connect()
  try { return await client.query(sql, params) }
  finally { client.release() }
}

// Variación determinista (sin Math.random)
function det(base, amplitude, seed) {
  const h = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return base + (h - Math.floor(h) - 0.5) * 2 * amplitude
}
const rnd = (base, amp, seed) => Math.round(det(base, amp, seed))

// ─── Precios BTC en EUR (aproximados, históricos) ────────────────────────────

const BTC_EUR = {
  "2022-11": 16000, "2022-12": 15800,
  "2023-01": 19500, "2023-02": 22500, "2023-03": 24000, "2023-04": 26500,
  "2023-05": 24000, "2023-06": 24500, "2023-07": 26800, "2023-08": 25200,
  "2023-09": 24100, "2023-10": 27600, "2023-11": 33200, "2023-12": 38600,
  "2024-01": 41500, "2024-02": 47200, "2024-03": 62500, "2024-04": 56100,
  "2024-05": 58200, "2024-06": 55300, "2024-07": 56400, "2024-08": 53100,
  "2024-09": 52300, "2024-10": 59200, "2024-11": 80500, "2024-12": 89200,
  "2025-01": 93500, "2025-02": 80300, "2025-03": 76100, "2025-04": 72500,
  "2025-05": 68400, "2025-06": 63200, "2025-07": 62100, "2025-08": 65300,
  "2025-09": 58400, "2025-10": 63100, "2025-11": 70200, "2025-12": 78300,
  "2026-01": 82400, "2026-02": 74100, "2026-03": 71300, "2026-04": 75200,
  "2026-05": 78500,
}

// BTC acumulado por mes de compra
const BTC_PURCHASES = [
  { ym: "2022-11", eur: 2000 },  // 0.125 BTC
  { ym: "2023-07", eur: 500  },  // ~0.019 BTC
  { ym: "2023-11", eur: 1000 },  // ~0.030 BTC
  { ym: "2024-10", eur: 1500 },  // ~0.025 BTC
]

function btcValue(ym) {
  let btc = 0
  for (const p of BTC_PURCHASES) {
    if (p.ym <= ym) btc += p.eur / BTC_EUR[p.ym]
  }
  return Math.round((btc * (BTC_EUR[ym] ?? 0)) * 100) / 100
}

// ─── Compute monthly snapshot values ─────────────────────────────────────────

function monthlyRate(year, annualRates) {
  const r = annualRates[year] ?? annualRates[Object.keys(annualRates).at(-1)]
  return Math.pow(1 + r, 1 / 12) - 1
}

/**
 * @param {string} startYM   "YYYY-MM"
 * @param {string} endYM     "YYYY-MM"
 * @param {number} startValue
 * @param {Record<number,number>} annualRates  {year: decimal rate}
 * @param {Array<{ym:string,amount:number}>} contributions  monthly contributions
 */
function computeSnapshots(startYM, endYM, startValue, annualRates, contributions = []) {
  const result = []
  let value = startValue

  let [y, m] = startYM.split("-").map(Number)
  const [ey, em] = endYM.split("-").map(Number)

  while (y < ey || (y === ey && m <= em)) {
    const ym = `${y}-${String(m).padStart(2, "0")}`
    const contrib = contributions.filter(c => c.ym === ym).reduce((s, c) => s + c.amount, 0)
    value += contrib
    result.push({ ym, value: Math.round(value * 100) / 100 })
    value *= 1 + monthlyRate(y, annualRates)

    m++
    if (m > 12) { m = 1; y++ }
  }

  return result
}

// ─── Helpers de fecha ─────────────────────────────────────────────────────────

function ymToDate(ym) {
  return ym + "-01"
}

function* iterMonths(startYM, endYM) {
  let [y, m] = startYM.split("-").map(Number)
  const [ey, em] = endYM.split("-").map(Number)
  while (y < ey || (y === ey && m <= em)) {
    yield { y, m, ym: `${y}-${String(m).padStart(2, "0")}` }
    m++
    if (m > 12) { m = 1; y++ }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { rows: [user] } = await q(`SELECT id, email FROM "User" LIMIT 1`)
  if (!user) throw new Error("Sin usuario en la BD")
  const uid = user.id
  console.log(`\nUsuario: ${user.email} (${uid})\n`)

  // ── Limpiar datos previos de prueba ──────────────────────────────────────────
  console.log("Limpiando datos existentes…")
  await q(`DELETE FROM "PersonalTransaction" WHERE "userId" = $1`, [uid])
  await q(`DELETE FROM "PersonalCategory"   WHERE "userId" = $1`, [uid])
  await q(`DELETE FROM "ProductSnapshot"    WHERE "userId" = $1`, [uid])
  await q(`DELETE FROM "Product"            WHERE "userId" = $1`, [uid])
  await q(`DELETE FROM "Entity"             WHERE "userId" = $1`, [uid])
  console.log("✓ Tablas vaciadas\n")

  // ─── 1. Entidades ─────────────────────────────────────────────────────────

  const entityIds = {}
  const ENTITIES = [
    { key: "myInvestor", name: "myInvestor", color: "#7C3AED", icon: "chart"  },
    { key: "BBVA",       name: "BBVA",       color: "#1A56DB", icon: "bank"   },
    { key: "Bestinver",  name: "Bestinver",  color: "#059669", icon: "shield" },
    { key: "Binance",    name: "Binance",    color: "#F59E0B", icon: "crypto" },
  ]

  for (const e of ENTITIES) {
    const id = createId()
    await q(
      `INSERT INTO "Entity" (id,"userId",name,color,icon,"createdAt","updatedAt")
       VALUES ($1,$2,$3,$4,$5,NOW(),NOW())`,
      [id, uid, e.name, e.color, e.icon]
    )
    entityIds[e.key] = id
  }
  console.log(`✓ ${ENTITIES.length} entidades creadas`)

  // ─── 2. Productos ─────────────────────────────────────────────────────────

  const prodIds = {}

  const PRODUCTS = [
    { key: "etf",     entityKey: "myInvestor", name: "Vanguard Global Stock ETF",    type: "ETF",         ownership: 100, openedAt: "2023-01-01" },
    { key: "sp500",   entityKey: "myInvestor", name: "Fondo Indexado S&P 500",        type: "FUND",        ownership: 100, openedAt: "2023-03-01" },
    { key: "savings", entityKey: "BBVA",       name: "Cuenta de Ahorro",              type: "SAVINGS",     ownership: 100, openedAt: "2022-01-01" },
    { key: "cc",      entityKey: "BBVA",       name: "Cuenta Corriente",              type: "CHECKING",    ownership: 100, openedAt: "2020-01-01" },
    { key: "pension", entityKey: "Bestinver",  name: "Plan de Pensiones Bestinver",   type: "PENSION",     ownership: 100, openedAt: "2020-01-01" },
    { key: "btc",     entityKey: "Binance",    name: "Bitcoin (BTC)",                 type: "CRYPTO",      ownership: 100, openedAt: "2022-11-01" },
  ]

  for (const p of PRODUCTS) {
    const id = createId()
    await q(
      `INSERT INTO "Product" (id,"userId","entityId",name,type,ownership,"openedAt","createdAt","updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7::date,NOW(),NOW())`,
      [id, uid, entityIds[p.entityKey], p.name, p.type, p.ownership, p.openedAt]
    )
    prodIds[p.key] = id
  }
  console.log(`✓ ${PRODUCTS.length} productos creados`)

  // ─── 3. Snapshots ─────────────────────────────────────────────────────────

  const END_YM = "2026-05"

  // ETF Vanguard — contribución 300€/mes desde Feb 2023
  const etfContribs = []
  for (const { ym } of iterMonths("2023-02", END_YM)) etfContribs.push({ ym, amount: 300 })

  const etfSnaps = computeSnapshots("2023-01", END_YM, 5000,
    { 2023: 0.14, 2024: 0.21, 2025: 0.10, 2026: 0.05 }, etfContribs)

  // Fondo S&P 500 — contribución 200€/mes desde Mar 2023
  const spContribs = []
  for (const { ym } of iterMonths("2023-03", END_YM)) spContribs.push({ ym, amount: 200 })

  const spSnaps = computeSnapshots("2023-03", END_YM, 200,
    { 2023: 0.13, 2024: 0.23, 2025: 0.09, 2026: 0.04 }, spContribs)

  // Cuenta Ahorro — aportes irregulares
  const savingsContribs = []
  for (const { y, m, ym } of iterMonths("2023-01", END_YM)) {
    const seed = y * 100 + m
    if (m % 2 === 0 || m === 1 || m === 9) savingsContribs.push({ ym, amount: rnd(300, 150, seed * 7.3) })
  }

  const savingsSnaps = computeSnapshots("2023-01", END_YM, 4000,
    { 2023: 0.02, 2024: 0.03, 2025: 0.025, 2026: 0.02 }, savingsContribs)

  // Plan de Pensiones — 125€/mes
  const pensionContribs = []
  for (const { ym } of iterMonths("2023-01", END_YM)) pensionContribs.push({ ym, amount: 125 })

  const pensionSnaps = computeSnapshots("2023-01", END_YM, 9700,
    { 2023: 0.07, 2024: 0.10, 2025: 0.07, 2026: 0.04 }, pensionContribs)

  // Bitcoin — precio de mercado
  const btcSnaps = []
  for (const { ym } of iterMonths("2022-11", END_YM)) {
    if (BTC_EUR[ym]) btcSnaps.push({ ym, value: btcValue(ym) })
  }

  // Cuenta Corriente — trimestral, saldo operacional variable
  const ccSnaps = []
  for (const { y, m, ym } of iterMonths("2023-01", END_YM)) {
    if ([1, 4, 7, 10].includes(m)) {
      const seed = y * 100 + m
      ccSnaps.push({ ym, value: rnd(3500, 1200, seed * 11.7) })
    }
  }

  async function insertSnaps(productKey, snaps) {
    const pid = prodIds[productKey]
    let count = 0
    for (const s of snaps) {
      if (s.value <= 0) continue
      await q(
        `INSERT INTO "ProductSnapshot" (id,"productId","userId",value,date,"createdAt")
         VALUES ($1,$2,$3,$4,$5::date,NOW())
         ON CONFLICT ("productId",date) DO UPDATE SET value = EXCLUDED.value`,
        [createId(), pid, uid, s.value, ymToDate(s.ym)]
      )
      count++
    }
    return count
  }

  const snapsTotal =
    await insertSnaps("etf",     etfSnaps)     +
    await insertSnaps("sp500",   spSnaps)      +
    await insertSnaps("savings", savingsSnaps) +
    await insertSnaps("pension", pensionSnaps) +
    await insertSnaps("btc",     btcSnaps)     +
    await insertSnaps("cc",      ccSnaps)

  console.log(`✓ ${snapsTotal} snapshots insertados`)

  // ─── 4. Categorías personales ─────────────────────────────────────────────

  const catIds = {}
  const CATS = [
    { key: "salario",     name: "Salario",           type: "INCOME",  order: 0 },
    { key: "extra",       name: "Extra / Freelance",  type: "INCOME",  order: 1 },
    { key: "dividendos",  name: "Dividendos",         type: "INCOME",  order: 2 },
    { key: "alim",        name: "Alimentación",       type: "EXPENSE", order: 3 },
    { key: "transp",      name: "Transporte",         type: "EXPENSE", order: 4 },
    { key: "salud",       name: "Salud",              type: "EXPENSE", order: 5 },
    { key: "suscr",       name: "Suscripciones",      type: "EXPENSE", order: 6 },
    { key: "ropa",        name: "Ropa",               type: "EXPENSE", order: 7 },
    { key: "ocio",        name: "Ocio",               type: "EXPENSE", order: 8 },
    { key: "tecnologia",  name: "Tecnología",         type: "EXPENSE", order: 9 },
    { key: "otros_gasto", name: "Otros gastos",       type: "EXPENSE", order: 10 },
  ]

  for (const c of CATS) {
    const id = createId()
    await q(
      `INSERT INTO "PersonalCategory" (id,"userId",name,type,"order","isActive","createdAt")
       VALUES ($1,$2,$3,$4,$5,true,NOW())`,
      [id, uid, c.name, c.type, c.order]
    )
    catIds[c.key] = id
  }
  console.log(`✓ ${CATS.length} categorías personales creadas`)

  // ─── 5. Transacciones personales ─────────────────────────────────────────

  const txs = [] // acumulamos y hacemos bulk insert

  function tx(year, month, type, amount, catKey, productKey, note) {
    txs.push({
      id: createId(), uid, year, month, type,
      amount: Math.round(amount * 100) / 100,
      catId:  catKey     ? catIds[catKey]     : null,
      prodId: productKey ? prodIds[productKey] : null,
      note:   note ?? null,
    })
  }

  // ─── Gastos extra y eventos especiales ────────────────────────────────────

  // Bonus enero de cada año
  tx(2023, 1,  "INCOME",  1500,  "extra",       null,  "Paga extra enero")
  tx(2024, 1,  "INCOME",  2000,  "extra",       null,  "Paga extra enero")
  tx(2025, 1,  "INCOME",  2200,  "extra",       null,  "Paga extra enero")
  tx(2026, 1,  "INCOME",  3000,  "extra",       null,  "Paga extra enero")

  // Freelance / proyectos puntuales
  tx(2023, 6,  "INCOME",  900,   "extra",       null,  "Proyecto web freelance")
  tx(2024, 4,  "INCOME",  1200,  "extra",       null,  "Consultoría técnica")
  tx(2024, 9,  "INCOME",  800,   "extra",       null,  "Formación interna empresa")
  tx(2025, 3,  "INCOME",  2500,  "extra",       null,  "Proyecto freelance — app móvil")
  tx(2025, 10, "INCOME",  1800,  "extra",       null,  "Consultoría")
  tx(2026, 3,  "INCOME",  3200,  "extra",       null,  "Proyecto datos — IA")

  // Devolución IRPF
  tx(2024, 6,  "INCOME",  780,   "extra",       null,  "Devolución IRPF 2023")
  tx(2025, 6,  "INCOME",  640,   "extra",       null,  "Devolución IRPF 2024")
  tx(2026, 6,  "INCOME",  920,   "extra",       null,  "Devolución IRPF 2025")

  // Dividendos fondos
  tx(2023, 12, "INCOME",  45,    "dividendos",  null,  "Dividendo VWCE")
  tx(2024, 6,  "INCOME",  80,    "dividendos",  null,  "Dividendo VWCE")
  tx(2024, 12, "INCOME",  115,   "dividendos",  null,  "Dividendo VWCE")
  tx(2025, 6,  "INCOME",  145,   "dividendos",  null,  "Dividendo VWCE + SP500")
  tx(2025, 12, "INCOME",  170,   "dividendos",  null,  "Dividendo VWCE + SP500")
  tx(2026, 5,  "INCOME",  195,   "dividendos",  null,  "Dividendo VWCE + SP500")

  // Compras BTC (como TRANSFER a producto)
  tx(2022, 11, "TRANSFER", 2000, null, "btc",  "Compra Bitcoin — 0.125 BTC")
  tx(2023, 7,  "TRANSFER",  500, null, "btc",  "Compra Bitcoin — 0.019 BTC")
  tx(2023, 11, "TRANSFER", 1000, null, "btc",  "Compra Bitcoin — 0.030 BTC")
  tx(2024, 10, "TRANSFER", 1500, null, "btc",  "Compra Bitcoin — 0.025 BTC")

  // Gastos tecnología (ocasionales)
  tx(2023, 9,  "EXPENSE",  400,  "tecnologia",  null,  "MacBook Pro — amortización")
  tx(2024, 3,  "EXPENSE",  250,  "tecnologia",  null,  "SSD externo + periféricos")
  tx(2025, 1,  "EXPENSE", 1200,  "tecnologia",  null,  "iPad Pro")
  tx(2025, 8,  "EXPENSE",  180,  "tecnologia",  null,  "Suscripción anual software")
  tx(2026, 2,  "EXPENSE",  350,  "tecnologia",  null,  "Monitor 4K")

  // ─── Bucle mensual Jan 2023 – May 2026 ───────────────────────────────────

  for (const { y, m, ym } of iterMonths("2023-01", "2026-05")) {
    const seed = y * 100 + m

    // ── Salario ──
    const salario =
      y === 2023 ? 2000 :
      y === 2024 ? 2100 :
      (y === 2025 && m <= 4) ? 2200 :
      (y === 2025 && m >= 5) ? 2474 :
      2600

    tx(y, m, "INCOME", salario, "salario", null, null)

    // ── Gastos fijos / variables ──
    tx(y, m, "EXPENSE", rnd(285, 75, seed * 1.1),  "alim",        null, null)
    tx(y, m, "EXPENSE", rnd(110, 35, seed * 2.3),  "transp",      null, null)
    tx(y, m, "EXPENSE", 35,                        "suscr",       null, "Netflix, Spotify, etc.")
    tx(y, m, "EXPENSE", rnd(140, 55, seed * 5.3),  "ocio",        null, null)
    tx(y, m, "EXPENSE", rnd(35,  30, seed * 6.1),  "otros_gasto", null, null)

    // Salud: irregular ~cada 3 meses
    if (m % 3 === 1) tx(y, m, "EXPENSE", rnd(75, 45, seed * 3.1), "salud", null, null)

    // Ropa: estacional
    if ([1, 3, 7, 9, 11].includes(m)) {
      const importeRopa = rnd(85, 60, seed * 4.7)
      if (importeRopa > 0) tx(y, m, "EXPENSE", importeRopa, "ropa", null, null)
    }

    // ── Transfers a inversiones ──

    // ETF: desde feb 2023
    if (ym >= "2023-02") {
      const baseETF = y >= 2025 ? 400 : 300
      tx(y, m, "TRANSFER", baseETF, null, "etf", "Aportación mensual ETF")
    }

    // S&P 500: desde abr 2023
    if (ym >= "2023-04") {
      const baseSP = y >= 2025 ? 250 : 200
      tx(y, m, "TRANSFER", baseSP, null, "sp500", "Aportación mensual S&P 500")
    }

    // Plan de pensiones: siempre
    tx(y, m, "TRANSFER", 125, null, "pension", "Aportación plan pensiones")

    // Ahorro: en meses pares y algunos impares, cantidad variable
    if (m % 2 === 0 || m === 1 || m === 9) {
      const ahorroBase = y === 2023 ? 200 : y === 2024 ? 300 : y === 2025 ? 400 : 500
      const ahorro = rnd(ahorroBase, 120, seed * 9.7)
      if (ahorro > 50) tx(y, m, "TRANSFER", ahorro, null, "savings", "Traspaso a ahorro")
    }
  }

  // Bulk insert transacciones
  for (const t of txs) {
    await q(
      `INSERT INTO "PersonalTransaction"
         (id,"userId",year,month,type,amount,"categoryId","productId",note,"createdAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())`,
      [t.id, t.uid, t.year, t.month, t.type, t.amount, t.catId, t.prodId, t.note]
    )
  }

  console.log(`✓ ${txs.length} transacciones personales creadas`)

  // ─── Resumen ──────────────────────────────────────────────────────────────

  const etfFinal   = etfSnaps.at(-1)
  const spFinal    = spSnaps.at(-1)
  const pensFinal  = pensionSnaps.at(-1)
  const btcFinal   = btcSnaps.at(-1)
  const savFinal   = savingsSnaps.at(-1)

  console.log("\n─── Resumen patrimonio generado (May 2026) ───────────────────")
  console.log(`  Vanguard ETF     : ${etfFinal.value.toFixed(2)} € (invertido: ~${(etfSnaps.length * 300 + 5000).toFixed(0)} €)`)
  console.log(`  Fondo S&P 500    : ${spFinal.value.toFixed(2)} € (invertido: ~${(spSnaps.length * 200 + 200).toFixed(0)} €)`)
  console.log(`  Plan Pensiones   : ${pensFinal.value.toFixed(2)} € (invertido: ~${(pensionSnaps.length * 125 + 9700).toFixed(0)} €)`)
  console.log(`  Bitcoin          : ${btcFinal.value.toFixed(2)} € (invertido: 5.000 €)`)
  console.log(`  Cuenta Ahorro    : ${savFinal.value.toFixed(2)} €`)
  console.log("──────────────────────────────────────────────────────────────")
  console.log("\n✅ Seed completado")
}

main()
  .catch(e => { console.error("\n❌ Error:", e.message); process.exit(1) })
  .finally(() => pool.end())
