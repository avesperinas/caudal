# Caudal — CLAUDE.md

## Proyecto

App personal de gestión financiera (patrimonio + flujo). Escala pequeña (pocos usuarios, uso personal/familiar).
Desarrollo incremental e iterativo: no adelantar features, no over-engineer.

## Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Estilos**: Tailwind CSS v4 + shadcn/ui
- **Base de datos**: PostgreSQL (vía Docker)
- **ORM**: Prisma
- **Auth**: Auth.js v5 (NextAuth)
- **Deploy**: Docker Compose en servidor propio

## Principios de diseño

- Estilo limpio, moderno y minimalista. Coherente en toda la app.
- Optimizado para PC y móvil (PWA).
- Design tokens centralizados en `globals.css` (colores, radios, tipografía).
- Componentes shadcn/ui como base — se personalizan, no se reescriben.

## Sistema de estilos — reglas de centralización

**REGLA CORE: ninguna clase Tailwind de estilo se repite "a mano" en más de un sitio.**

### Capas del sistema (de más genérico a más específico)

1. **`globals.css`** — design tokens: colores, radios, tipografía base. Solo variables CSS.
2. **`src/lib/styles.ts`** — constantes de clases Tailwind reutilizables (typography, layout, finance).
   - Usar siempre que un patrón de clases aparezca en 2+ lugares.
   - Usar `cva()` para variantes con lógica (ej: importe positivo/negativo).
3. **`src/components/ui/`** — componentes atómicos de shadcn (Button, Card, Badge…).
4. **`src/components/layout/`** — shells y wrappers de página (`PageShell`, `PageHeader`, `Section`).
5. **`src/components/finance/`** — componentes del dominio (`TransactionRow`, `StatCard`…).

### Lo que NO se hace

- No escribir `text-sm text-muted-foreground` directamente en páginas — usar `tx.secondary` de `styles.ts`.
- No definir colores de positivo/negativo inline — usar las variantes de `styles.ts`.
- No crear layout wrappers en cada página — usar los de `components/layout/`.
- No duplicar lógica de formateo de moneda — centralizar en `src/lib/format.ts`.

## Estructura de carpetas

```
src/
├── app/
│   ├── (auth)/          # login, registro
│   ├── (dashboard)/     # rutas autenticadas
│   └── (style-test)/    # solo desarrollo: pruebas visuales
├── components/
│   ├── ui/              # shadcn/ui components (no editar directamente)
│   ├── layout/          # shell, nav, sidebar
│   └── finance/         # componentes específicos del dominio
├── lib/                 # prisma client, auth config, utils
└── types/               # tipos TypeScript del dominio
```

## Convenciones

- Rutas en grupos `(nombre)` para compartir layouts sin añadir segmento de URL — `(auth)/login/page.tsx` → `/login`, no `/auth/login`.
- Las carpetas con paréntesis NO crean URL. Para una ruta `/foo` la carpeta debe llamarse `foo`, no `(foo)`.
- Server Components por defecto; "use client" solo cuando necesario.
- Estilos solo con clases Tailwind, sin CSS inline ni módulos CSS.
- Nombres de archivos: `kebab-case` para rutas, `PascalCase` para componentes.
- No añadir librerías sin consenso — mantener dependencias mínimas.
- `Button` usa `@base-ui/react/button` — **no soporta `asChild`**. Para botones-link usar `buttonVariants` directamente sobre `<Link>`.

## Estado actual

- [x] Scaffolding Next.js 15 + Tailwind v4 + shadcn/ui
- [ ] Pruebas de estilo visual
- [ ] Auth básica (login, sesión)
- [ ] Skeleton (home, perfil)
- [ ] Features de finanzas
