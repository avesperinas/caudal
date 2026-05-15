"use client"

import { useState } from "react"
import Link from "next/link"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { Menu, LogOut, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarNav } from "./SidebarNav"
import { signOutAction } from "@/app/(dashboard)/actions"
import { tx } from "@/lib/styles"
import { cn } from "@/lib/utils"

type User = {
  name?: string | null
  email?: string | null
  image?: string | null
}

export function MobileNav({ user }: { user: User }) {
  const [open, setOpen] = useState(false)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      {/* Top bar: solo en móvil */}
      <header className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/70">
        <Link href="/home" className="text-sm font-semibold hover:text-primary transition-colors">Caudal</Link>
        <DialogPrimitive.Trigger
          className="-mr-2 flex size-10 items-center justify-center rounded-md text-foreground hover:bg-muted active:bg-muted/80"
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </DialogPrimitive.Trigger>
      </header>

      {/* Drawer */}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-black/40",
            "data-open:animate-in data-open:fade-in-0",
            "data-closed:animate-out data-closed:fade-out-0",
            "duration-150",
          )}
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex h-full w-72 max-w-[85vw] flex-col bg-sidebar shadow-lg",
            "data-open:animate-in data-open:slide-in-from-right",
            "data-closed:animate-out data-closed:slide-out-to-right",
            "duration-200",
          )}
        >
          <DialogPrimitive.Title className="sr-only">Menú</DialogPrimitive.Title>

          {/* Header del drawer */}
          <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-4">
            <span className="text-sm font-semibold text-sidebar-foreground">Caudal</span>
            <DialogPrimitive.Close
              className="-mr-1 flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              aria-label="Cerrar menú"
            >
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          {/* Nav (cierra el drawer al navegar) */}
          <div
            className="flex-1 overflow-y-auto py-3"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("a")) setOpen(false)
            }}
          >
            <SidebarNav />
          </div>

          {/* Usuario + cerrar sesión */}
          <div className="space-y-1 border-t border-sidebar-border p-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? ""} />
                <AvatarFallback className="text-xs">
                  {user?.name?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className={cn(tx.label, "truncate leading-tight text-sidebar-foreground")}>
                  {user?.name}
                </p>
                <p className={cn(tx.caption, "truncate leading-tight")}>{user?.email}</p>
              </div>
            </div>

            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              >
                <LogOut className="size-4 shrink-0" />
                Cerrar sesión
              </button>
            </form>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
