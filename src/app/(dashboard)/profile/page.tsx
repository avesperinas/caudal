import { redirect } from "next/navigation"
import { auth, signOut } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { tx, layout } from "@/lib/styles"
import { cn } from "@/lib/utils"
import { LogOut } from "lucide-react"
import { FriendsView, type FriendEntry } from "@/components/finance/FriendsView"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const user = session.user

  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ senderId: user.id }, { receiverId: user.id }] },
    include: {
      sender:   { select: { id: true, name: true, email: true, image: true } },
      receiver: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const entries: FriendEntry[] = friendships.map((f) => ({
    id: f.id,
    status: f.status as "PENDING" | "ACCEPTED",
    isIncoming: f.receiverId === user.id,
    other: f.senderId === user.id ? f.receiver : f.sender,
  }))

  return (
    <div className={cn(layout.page, layout.pageSections)}>
      <div>
        <h1 className={tx.pageTitle}>Perfil</h1>
        <p className={tx.secondary}>Tu cuenta y contactos</p>
      </div>

      <Separator />

      {/* Cuenta */}
      <section className={layout.section}>
        <h2 className={tx.sectionLabel}>Cuenta</h2>
        <Card className="max-w-md">
          <CardContent className="pt-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
                <AvatarFallback className="text-lg">
                  {user.name?.[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base font-medium">{user.name}</p>
                <p className={tx.secondary}>{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Amigos */}
      <section className={layout.section}>
        <h2 className={tx.sectionLabel}>Amigos</h2>
        <FriendsView entries={entries} />
      </section>

      <Separator />

      {/* Cerrar sesión */}
      <section className={layout.section}>
        <h2 className={tx.sectionLabel}>Sesión</h2>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}
        >
          <button
            type="submit"
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium",
              "text-destructive border border-destructive/30",
              "hover:bg-destructive/5 transition-colors"
            )}
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </form>
      </section>
    </div>
  )
}
