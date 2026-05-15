"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { tx } from "@/lib/styles"
import { grantCompartidoAccess, revokeCompartidoAccess } from "@/app/(dashboard)/compartido/access-actions"

type User = { id: string; name: string | null; email: string; image: string | null }

function UserRow({ user, actions }: { user: User; actions: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
          <AvatarFallback className="text-xs font-medium">
            {user.name?.[0]?.toUpperCase() ?? user.email[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className={tx.label}>{user.name ?? <span className={tx.caption}>Sin nombre</span>}</p>
          <p className={tx.caption}>{user.email}</p>
        </div>
      </div>
      <div>{actions}</div>
    </div>
  )
}

export function CompartidoAccessSection({
  friends,
  collaborators,
}: {
  friends: User[]
  collaborators: User[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const collaboratorIds = new Set(collaborators.map(c => c.id))
  const friendsWithoutAccess = friends.filter(f => !collaboratorIds.has(f.id))

  function grant(userId: string) {
    startTransition(async () => {
      await grantCompartidoAccess(userId)
      router.refresh()
    })
  }

  function revoke(userId: string) {
    startTransition(async () => {
      await revokeCompartidoAccess(userId)
      router.refresh()
    })
  }

  const btnBase = "h-8 rounded-md px-3 text-xs font-medium transition-colors disabled:opacity-50"

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 md:px-6 space-y-6">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30">
          <p className="text-sm font-semibold">Colaboradores</p>
          <p className={cn(tx.caption, "mt-0.5")}>
            Estos amigos pueden ver y editar tus gastos comunes.
          </p>
        </div>

        {/* Colaboradores actuales */}
        {collaborators.length > 0 && (
          <div className="px-5 divide-y divide-border">
            {collaborators.map(c => (
              <UserRow
                key={c.id}
                user={c}
                actions={
                  <button
                    onClick={() => revoke(c.id)}
                    disabled={pending}
                    className={cn(btnBase, "text-destructive hover:bg-destructive/10 border border-destructive/30")}
                  >
                    Revocar
                  </button>
                }
              />
            ))}
          </div>
        )}

        {/* Amigos sin acceso */}
        {friendsWithoutAccess.length > 0 && (
          <>
            {collaborators.length > 0 && <div className="border-t border-dashed border-border" />}
            <div className="px-5 divide-y divide-border">
              {friendsWithoutAccess.map(f => (
                <UserRow
                  key={f.id}
                  user={f}
                  actions={
                    <button
                      onClick={() => grant(f.id)}
                      disabled={pending}
                      className={cn(btnBase, "bg-primary text-primary-foreground hover:bg-primary/90")}
                    >
                      Dar acceso
                    </button>
                  }
                />
              ))}
            </div>
          </>
        )}

        {collaborators.length === 0 && friendsWithoutAccess.length === 0 && (
          <p className={cn(tx.caption, "px-5 py-4")}>
            Añade amigos desde la sección <strong>Amigos</strong> para poder compartir.
          </p>
        )}
      </div>
    </div>
  )
}
