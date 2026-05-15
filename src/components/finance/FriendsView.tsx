"use client"

import { useTransition, useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { tx, interactive } from "@/lib/styles"
import { cn } from "@/lib/utils"
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
} from "@/app/(dashboard)/friends/actions"

type OtherUser = { id: string; name: string | null; email: string; image: string | null }

export type FriendEntry = {
  id: string
  status: "PENDING" | "ACCEPTED"
  isIncoming: boolean
  other: OtherUser
}

function UserRow({ user, actions }: { user: OtherUser; actions: React.ReactNode }) {
  return (
    <div className={cn(interactive.listRow, "py-3")}>
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
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
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  )
}

function ActionButton({
  onClick,
  variant = "default",
  children,
  disabled,
}: {
  onClick: () => void
  variant?: "default" | "ghost" | "destructive"
  children: React.ReactNode
  disabled?: boolean
}) {
  const base = "h-8 rounded-md px-3 text-xs font-medium transition-colors disabled:opacity-50"
  const variants = {
    default:     "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost:       "border border-input bg-background hover:bg-muted text-foreground",
    destructive: "text-destructive hover:bg-destructive/10 border border-destructive/30",
  }
  return (
    <button className={cn(base, variants[variant])} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

function AddFriendForm() {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const ref = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const email = ref.current?.value.trim() ?? ""
    if (!email) return
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      const result = await sendFriendRequest(email)
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        if (ref.current) ref.current.value = ""
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          ref={ref}
          type="email"
          placeholder="email@ejemplo.com"
          required
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {pending ? "Enviando…" : "Enviar solicitud"}
        </button>
      </div>
      {error   && <p className="text-xs text-destructive">{error}</p>}
      {success && <p className="text-xs text-emerald-600 dark:text-emerald-400">Solicitud enviada correctamente.</p>}
    </form>
  )
}

export function FriendsView({ entries }: { entries: FriendEntry[] }) {
  const [pending, startTransition] = useTransition()

  const accepted = entries.filter((e) => e.status === "ACCEPTED")
  const incoming = entries.filter((e) => e.status === "PENDING" && e.isIncoming)
  const outgoing = entries.filter((e) => e.status === "PENDING" && !e.isIncoming)

  const act = (fn: () => Promise<void>) => startTransition(fn)

  return (
    <div className="space-y-6">

      {/* Añadir amigo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className={tx.sectionTitle}>Añadir amigo</CardTitle>
          <p className={tx.caption}>Introduce el email de otro usuario registrado.</p>
        </CardHeader>
        <CardContent>
          <AddFriendForm />
        </CardContent>
      </Card>

      {/* Solicitudes recibidas */}
      {incoming.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <CardTitle className={tx.sectionTitle}>Solicitudes recibidas</CardTitle>
              <Badge variant="secondary">{incoming.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {incoming.map((e) => (
              <UserRow
                key={e.id}
                user={e.other}
                actions={
                  <>
                    <ActionButton onClick={() => act(() => acceptFriendRequest(e.id))} disabled={pending}>
                      Aceptar
                    </ActionButton>
                    <ActionButton variant="ghost" onClick={() => act(() => declineFriendRequest(e.id))} disabled={pending}>
                      Rechazar
                    </ActionButton>
                  </>
                }
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Solicitudes enviadas */}
      {outgoing.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className={tx.sectionTitle}>Solicitudes enviadas</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {outgoing.map((e) => (
              <UserRow
                key={e.id}
                user={e.other}
                actions={
                  <ActionButton variant="ghost" onClick={() => act(() => cancelFriendRequest(e.id))} disabled={pending}>
                    Cancelar
                  </ActionButton>
                }
              />
            ))}
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Lista de amigos */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className={tx.sectionTitle}>
            Amigos · <span className="font-normal text-muted-foreground">{accepted.length}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accepted.length === 0 ? (
            <p className={cn(tx.secondary, "py-6 text-center")}>Aún no tienes amigos añadidos.</p>
          ) : (
            <div className="divide-y divide-border">
              {accepted.map((e) => (
                <UserRow
                  key={e.id}
                  user={e.other}
                  actions={
                    <ActionButton
                      variant="destructive"
                      onClick={() => act(() => removeFriend(e.id))}
                      disabled={pending}
                    >
                      Eliminar
                    </ActionButton>
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
