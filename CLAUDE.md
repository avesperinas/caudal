# Caudal — CLAUDE.md

## Project

Personal finance management app (net worth + cash flow). Small scale (few users, personal/family use).
Incremental and iterative development: don't get ahead on features, don't over-engineer.

## Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: PostgreSQL (via Docker)
- **ORM**: Prisma
- **Auth**: Auth.js v5 (NextAuth)
- **Deploy**: Docker Compose on self-hosted server

## Design principles

- Clean, modern and minimalist style. Consistent across the whole app.
- Optimized for desktop and mobile (PWA).
- Design tokens centralized in `globals.css` (colors, radii, typography).
- shadcn/ui components as the base — customize them, don't rewrite them.

## Styling system — centralization rules

**CORE RULE: no Tailwind styling class is repeated "by hand" in more than one place.**

### System layers (from most generic to most specific)

1. **`globals.css`** — design tokens: colors, radii, base typography. CSS variables only.
2. **`src/lib/styles.ts`** — reusable Tailwind class constants (typography, layout, finance).
   - Use whenever a class pattern appears in 2+ places.
   - Use `cva()` for variants with logic (e.g. positive/negative amount).
3. **`src/components/ui/`** — atomic shadcn components (Button, Card, Badge…).
4. **`src/components/layout/`** — page shells and wrappers (`PageShell`, `PageHeader`, `Section`).
5. **`src/components/finance/`** — domain components (`TransactionRow`, `StatCard`…).

### What NOT to do

- Don't write `text-sm text-muted-foreground` directly in pages — use `tx.secondary` from `styles.ts`.
- Don't define positive/negative colors inline — use the variants from `styles.ts`.
- Don't create layout wrappers in each page — use the ones in `components/layout/`.
- Don't duplicate currency formatting logic — centralize it in `src/lib/format.ts`.

## Folder structure

```
src/
├── app/
│   ├── (auth)/          # login, signup
│   ├── (dashboard)/     # authenticated routes
│   └── (style-test)/    # development only: visual tests
├── components/
│   ├── ui/              # shadcn/ui components (do not edit directly)
│   ├── layout/          # shell, nav, sidebar
│   └── finance/         # domain-specific components
├── lib/                 # prisma client, auth config, utils
└── types/               # domain TypeScript types
```

## Conventions

- Routes in `(name)` groups to share layouts without adding a URL segment — `(auth)/login/page.tsx` → `/login`, not `/auth/login`.
- Folders with parentheses do NOT create a URL. For a `/foo` route the folder must be named `foo`, not `(foo)`.
- Server Components by default; "use client" only when needed.
- Styling only with Tailwind classes, no inline CSS or CSS modules.
- File names: `kebab-case` for routes, `PascalCase` for components.
- Don't add libraries without consensus — keep dependencies minimal.
- `Button` uses `@base-ui/react/button` — **it does not support `asChild`**. For link-buttons use `buttonVariants` directly on `<Link>`.

## Current status

- [x] Next.js 15 + Tailwind v4 + shadcn/ui scaffolding
- [x] Visual style tests
- [x] Basic auth (login, session)
- [x] Skeleton (home, profile)
- [x] Finance features
