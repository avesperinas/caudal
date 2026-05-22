"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { tx } from "@/lib/styles"
import {
  acceptCompartidoInvitation,
  declineCompartidoInvitation,
} from "@/app/(dashboard)/compartido/access-actions"

type Invitation = {
  id: string
  owner: { id: string; name: string | null; email: string; image: string | null }
}

export function PendingInvitationsSection({ invitations }: { invitations: Invitation[] }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  if (invitations.length === 0) return null

  function accept(accessId: string) {
    startTransition(async () => {
      const result = await acceptCompartidoInvitation(accessId)
      if (result.error) {
        alert(result.error)
      }
      router.refresh()
    })
  }

  function decline(accessId: string) {
    startTransition(async () => {
      await declineCompartidoInvitation(accessId)
      router.refresh()
    })
  }

  const btnBase = "h-8 rounded-md px-3 text-xs font-medium transition-colors disabled:opacity-50"

  return (
    <div className="mx-auto max-w-2xl px-4 pb-4 md:px-6">
      <div className="rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30 overflow-hidden">
        <div className="px-5 py-4 border-b border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/50">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">Invitaciones recibidas</p>
          <p className={cn(tx.caption, "mt-0.5")}>
            Al aceptar, tus gastos compartidos actuales se archivarán y compartirás los del invitante.
          </p>
        </div>
        <div className="px-5 divide-y divide-amber-200 dark:divide-amber-900">
          {invitations.map(inv => (
            <div key={inv.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={inv.owner.image ?? undefined} alt={inv.owner.name ?? ""} />
                  <AvatarFallback className="text-xs font-medium">
                    {inv.owner.name?.[0]?.toUpperCase() ?? inv.owner.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className={tx.label}>
                    {inv.owner.name ?? <span className={tx.caption}>Sin nombre</span>}
                  </p>
                  <p className={tx.caption}>{inv.owner.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => decline(inv.id)}
                  disabled={pending}
                  className={cn(btnBase, "text-muted-foreground hover:bg-muted border border-border")}
                >
                  Rechazar
                </button>
                <button
                  onClick={() => accept(inv.id)}
                  disabled={pending}
                  className={cn(btnBase, "bg-primary text-primary-foreground hover:bg-primary/90")}
                >
                  Aceptar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
