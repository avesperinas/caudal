# Caudal

Gestor personal de finanzas autoalojado. Trackea **patrimonio** (snapshots de productos financieros) y **flujo** (ingresos, gastos personales y compartidos, aportaciones), con dashboards de análisis y backup mensual por email.

> *Caudal*: en castellano, "flujo de agua" y "riqueza". Las dos secciones core de la app.

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind v4** + **shadcn/ui**
- **PostgreSQL 16** + **Prisma 6**
- **Auth.js v5** (NextAuth)
- **Docker Compose** para BD, app y servicio de backup
- **Resend** (opcional) para envío de backups por email

## Quick start

Requisitos: Docker + Docker Compose.

```bash
cp .env.example .env.local
# edita .env.local con tus secretos (AUTH_SECRET, etc.)

docker compose up -d --build
```

Abre [http://localhost:3000](http://localhost:3000) y registra tu usuario.

Para cargar datos de ejemplo:

```bash
docker compose exec app npx prisma migrate dev
node scripts/seed-mock.mjs    # datos sintéticos: 4 entidades, 6 productos, snapshots 2023-2026
```

## Funcionalidades

- **Personal**: ingresos, gastos y aportaciones a productos por mes/año.
- **Compartido**: gastos comunes con cálculo de split (50/50 o proporcional a ingresos).
- **Productos**: cuentas, fondos, ETFs, planes de pensiones, inmuebles, cripto.
- **Snapshots**: registro periódico del valor de cada producto.
- **Dashboards**:
  - *Flujo*: ingresos vs gastos, tasa de ahorro, evolución mensual/anual.
  - *Inversiones*: cartera, rentabilidad, TIR, distribución.
  - *Patrimonio*: evolución del neto, distribución por tipo/entidad.
- **Filtros**: por categoría o producto individual en los dashboards.
- **PWA**: instalable, responsive, navegación móvil con drawer.
- **Backups mensuales**: ZIP de CSVs por usuario, opcionalmente enviados por email.

## Configuración del backup mensual

Por defecto (sin Resend), guarda ZIPs en el volumen Docker `backups`. Para habilitar envío por email, configura `RESEND_API_KEY` y `BACKUP_FROM_EMAIL` en `.env.local`. Detalles en [`scripts/backup/SETUP.md`](scripts/backup/SETUP.md).

## Documentación

- [`CLAUDE.md`](CLAUDE.md) — convenciones de código y arquitectura.
- [`scripts/backup/SETUP.md`](scripts/backup/SETUP.md) — backups y Resend.
