"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home, Settings, UserCircle, Calculator,
  TrendingUp, BarChart2, Landmark,
  Wallet, Receipt, ArrowUpDown, Camera,
  LineChart, Tag, Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Estructura de nav ────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    items: [
      { href: "/home", label: "Inicio", icon: Home },
    ],
  },
  {
    label: "Registro",
    items: [
      { href: "/ingresos",     label: "Ingresos",     icon: Wallet },
      { href: "/gastos",       label: "Gastos",        icon: Receipt },
      { href: "/compartido",   label: "Compartido",    icon: Users },
      { href: "/aportaciones", label: "Aportaciones",  icon: ArrowUpDown },
      { href: "/snapshots",    label: "Snapshots",     icon: Camera },
    ],
  },
  {
    label: "Análisis",
    items: [
      { href: "/flujo",        label: "Flujo",         icon: LineChart },
      { href: "/inversiones",  label: "Inversiones",   icon: BarChart2 },
      { href: "/patrimonio",   label: "Patrimonio",    icon: TrendingUp },
    ],
  },
  {
    label: "Configuración",
    items: [
      { href: "/productos",    label: "Productos",     icon: Landmark },
      { href: "/categorias",   label: "Categorías",    icon: Tag },
      { href: "/utils",        label: "Herramientas",  icon: Calculator },
    ],
  },
]

const SECONDARY = [
  { href: "/profile",  label: "Perfil",  icon: UserCircle },
  { href: "/settings", label: "Ajustes", icon: Settings },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const allHrefs = [
  ...NAV_GROUPS.flatMap(g => g.items.map(i => i.href)),
  ...SECONDARY.map(i => i.href),
]

function isActive(href: string, pathname: string) {
  if (pathname !== href && !pathname.startsWith(href + "/")) return false
  return !allHrefs.some(
    other =>
      other !== href &&
      other.length > href.length &&
      (pathname === other || pathname.startsWith(other + "/")),
  )
}

function NavItem({ href, label, icon: Icon, active }: {
  href: string; label: string; icon: React.ElementType; active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent",
      )}
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </Link>
  )
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-4 px-3">
      {NAV_GROUPS.map((group, gi) => (
        <div key={gi} className="space-y-0.5">
          {group.label && (
            <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              {group.label}
            </p>
          )}
          {group.items.map(item => (
            <NavItem
              key={item.href}
              {...item}
              active={isActive(item.href, pathname)}
            />
          ))}
        </div>
      ))}

      <div className="border-t border-sidebar-border pt-2 space-y-0.5">
        {SECONDARY.map(item => (
          <NavItem
            key={item.href}
            {...item}
            active={isActive(item.href, pathname)}
          />
        ))}
      </div>
    </nav>
  )
}
