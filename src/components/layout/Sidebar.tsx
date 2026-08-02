"use client"

import { useState, useEffect } from "react"
import { PanelLeftClose, PanelLeft, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarNav } from "./SidebarNav"
import { signOutAction } from "@/app/(dashboard)/actions"
import { tx } from "@/lib/styles"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "sidebar-collapsed"

type User = {
  name?: string | null
  email?: string | null
  image?: string | null
}

export function Sidebar({ user, version }: { user: User; version: string }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "true")
  }, [])

  function toggle() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(STORAGE_KEY, String(next))
  }

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col shrink-0 border-r bg-sidebar h-screen sticky top-0",
          "transition-[width] duration-200 ease-in-out overflow-hidden",
          mounted && collapsed ? "w-0 border-r-0" : "w-56",
        )}
      >
        {/* Header: logo + colapsar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border">
          <span className="text-sm font-semibold text-sidebar-foreground whitespace-nowrap">
            Caudal
          </span>
          <button
            onClick={toggle}
            className="ml-2 rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            title="Ocultar barra lateral"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>

        {/* Navegación */}
        <div className="flex-1 overflow-y-auto py-3">
          <SidebarNav />
        </div>

        {/* Versión desplegada, pegada al separador de abajo */}
        <div className="px-5 pb-2">
          <span className={cn(tx.caption, "whitespace-nowrap tabular-nums")}>
            {version}
          </span>
        </div>

        {/* Usuario + cerrar sesión */}
        <div className="border-t border-sidebar-border p-3 space-y-1">
          <div className="flex items-center gap-2.5 px-3 py-1.5">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
              <AvatarFallback className="text-xs">
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className={cn(tx.label, "truncate text-sidebar-foreground leading-tight")}>
                {user?.name}
              </p>
              <p className={cn(tx.caption, "truncate leading-tight")}>{user?.email}</p>
            </div>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2",
                "text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                "transition-colors"
              )}
            >
              <LogOut className="size-4 shrink-0" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Botón flotante para restaurar cuando está colapsado */}
      {mounted && collapsed && (
        <button
          onClick={toggle}
          className={cn(
            "hidden md:flex fixed left-3 top-3.5 z-50",
            "items-center justify-center rounded-md p-1.5",
            "bg-sidebar border border-sidebar-border shadow-sm",
            "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
          )}
          title="Mostrar barra lateral"
        >
          <PanelLeft className="size-4" />
        </button>
      )}
    </>
  )
}
