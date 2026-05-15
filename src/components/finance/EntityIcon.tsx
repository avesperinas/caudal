"use client"

import Image from "next/image"
import {
  Landmark, Building2, Building, Wallet, CreditCard, PiggyBank,
  TrendingUp, BarChart2, LineChart, Coins, DollarSign, Home,
  Globe, Briefcase, Shield, Zap, Layers, Package, Store, Banknote,
  LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ENTITY_ICON_NAMES, EntityIconName } from "@/lib/products"

// ─── Mapa nombre → componente Lucide ─────────────────────────────────────────

export const ENTITY_ICON_MAP: Record<EntityIconName, LucideIcon> = {
  Landmark, Building2, Building, Wallet, CreditCard, PiggyBank,
  TrendingUp, BarChart2, LineChart, Coins, DollarSign, Home,
  Globe, Briefcase, Shield, Zap, Layers, Package, Store, Banknote,
}

// ─── Marcas predefinidas ──────────────────────────────────────────────────────

export type BrandIcon = {
  label: string
  path: string   // ruta en /public (ej: /brand-icons/bbva.svg)
}

export const BRAND_ICONS: BrandIcon[] = [
  { label: "BBVA",         path: "/brand-icons/bbva.svg" },
  { label: "Caja Rural",   path: "/brand-icons/caja-rural.svg" },
  { label: "Finizens",     path: "/brand-icons/finizens.svg" },
  { label: "Revolut",      path: "/brand-icons/revolut.svg" },
  { label: "Renault Bank", path: "/brand-icons/renault-bank.svg" },
  { label: "Binance",      path: "/brand-icons/binance.svg" },
]

/** Devuelve true si el valor guardado es una ruta de imagen (empieza por /). */
export function isImageIcon(icon: string | null | undefined): boolean {
  return Boolean(icon?.startsWith("/"))
}

// ─── Icono de entidad ─────────────────────────────────────────────────────────

type EntityIconProps = {
  iconName?: string | null
  color: string
  size?: "sm" | "md"
  muted?: boolean
  className?: string
}

export function EntityIcon({ iconName, color, size = "md", muted = false, className }: EntityIconProps) {
  const sizeClass  = size === "sm" ? "size-7"   : "size-9"
  const iconSize   = size === "sm" ? "size-3.5" : "size-4"
  const imgSize    = size === "sm" ? 28          : 36
  const radius     = size === "sm" ? "rounded-lg" : "rounded-xl"

  // Imagen de marca
  if (iconName && isImageIcon(iconName)) {
    return (
      <div className={cn("shrink-0 overflow-hidden", sizeClass, radius, muted && "opacity-50", className)}>
        <Image src={iconName} alt="" width={imgSize} height={imgSize} className="object-cover" />
      </div>
    )
  }

  // Icono Lucide
  const Icon = iconName ? ENTITY_ICON_MAP[iconName as EntityIconName] : null

  return (
    <div
      className={cn("flex shrink-0 items-center justify-center", sizeClass, radius, className)}
      style={{
        backgroundColor: muted ? `${color}15` : `${color}22`,
        color: muted ? `${color}80` : color,
      }}
    >
      {Icon
        ? <Icon className={iconSize} strokeWidth={1.75} />
        : <span className={cn("rounded-full bg-current opacity-60", size === "sm" ? "size-1.5" : "size-2")} />
      }
    </div>
  )
}

// ─── Picker de iconos ─────────────────────────────────────────────────────────

type EntityIconPickerProps = {
  value: string
  color: string
  onChange: (name: string) => void
}

export function EntityIconPicker({ value, color, onChange }: EntityIconPickerProps) {
  return (
    <div className="space-y-3">
      {/* Marcas */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Marcas</p>
        <div className="flex flex-wrap gap-1.5">
          {BRAND_ICONS.map(({ label, path }) => {
            const isSelected = value === path
            return (
              <button
                key={path}
                type="button"
                title={label}
                onClick={() => onChange(isSelected ? "" : path)}
                className={cn(
                  "overflow-hidden rounded-xl transition-all",
                  "size-9",
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : "opacity-70 hover:opacity-100",
                )}
              >
                <Image src={path} alt={label} width={36} height={36} className="object-cover" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Iconos genéricos */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">Genéricos</p>
        <div className="flex flex-wrap gap-1.5">
          {ENTITY_ICON_NAMES.map((name) => {
            const Icon = ENTITY_ICON_MAP[name]
            const isSelected = value === name
            return (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => onChange(isSelected ? "" : name)}
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl transition-all",
                  isSelected
                    ? "ring-2 ring-offset-2 ring-offset-background"
                    : "hover:bg-accent",
                )}
                style={isSelected ? {
                  backgroundColor: `${color}22`,
                  color,
                  outlineColor: color,
                } : undefined}
              >
                <Icon
                  className="size-4"
                  strokeWidth={1.75}
                  style={isSelected ? { color } : undefined}
                />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
