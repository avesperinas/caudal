# Caudal

Self-hosted personal finance manager. Tracks **net worth** (snapshots of financial products) and **cash flow** (income, personal and shared expenses, contributions), with analytics dashboards and monthly email backups.

> *Caudal*: Spanish for "water flow" and "wealth". The two core sections of the app.

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind v4** + **shadcn/ui**
- **PostgreSQL 16** + **Prisma 6**
- **Auth.js v5** (NextAuth)
- **Docker Compose** for the database, app and backup service
- **Resend** (optional) for sending backups by email

## Quick start

Requirements: Docker + Docker Compose.

```bash
cp .env.example .env.local
# edit .env.local with your secrets (AUTH_SECRET, etc.)

docker compose up -d --build
```

Open [http://localhost:3000](http://localhost:3000) and register your user.

To load sample data:

```bash
docker compose exec app npx prisma migrate dev
node scripts/seed-mock.mjs    # synthetic data: 4 entities, 6 products, snapshots 2023-2026
```

## Features

- **Personal**: income, expenses and contributions to products by month/year.
- **Shared**: common expenses with split calculation (50/50 or proportional to income).
- **Products**: accounts, funds, ETFs, pension plans, real estate, crypto.
- **Snapshots**: periodic recording of each product's value.
- **Dashboards**:
  - *Cash flow*: income vs expenses, savings rate, monthly/annual evolution.
  - *Investments*: portfolio, returns, IRR, distribution.
  - *Net worth*: net evolution, distribution by type/entity.
- **Filters**: by category or individual product across the dashboards.
- **PWA**: installable, responsive, mobile navigation with drawer.
- **Monthly backups**: per-user CSV ZIP, optionally sent by email.

## Monthly backup configuration

By default (without Resend), it stores ZIPs in the `backups` Docker volume. To enable email delivery, set `RESEND_API_KEY` and `BACKUP_FROM_EMAIL` in `.env.local`. Details in [`scripts/backup/SETUP.md`](scripts/backup/SETUP.md).

## Documentation

- [`CLAUDE.md`](CLAUDE.md) — code conventions and architecture.
- [`scripts/backup/SETUP.md`](scripts/backup/SETUP.md) — backups and Resend.
