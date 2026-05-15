import { prisma } from "@/lib/prisma"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { tx, layout, interactive } from "@/lib/styles"
import { cn } from "@/lib/utils"
import { formatDateLong } from "@/lib/format"

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  })

  return (
    <div className={cn(layout.page, layout.pageSections)}>
      <div>
        <h1 className={tx.pageTitle}>Usuarios</h1>
        <p className={tx.secondary}>{users.length} cuenta{users.length !== 1 ? "s" : ""} registrada{users.length !== 1 ? "s" : ""}</p>
      </div>

      <Separator />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className={tx.sectionTitle}>Cuentas</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className={cn(tx.secondary, "py-4 text-center")}>No hay usuarios registrados.</p>
          ) : (
            <div>
              {users.map((user) => (
                <div key={user.id} className={interactive.listRow}>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
                      <AvatarFallback className="text-xs">
                        {user.name?.[0]?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className={tx.label}>{user.name ?? "Sin nombre"}</p>
                      <p className={tx.caption}>{user.email}</p>
                    </div>
                  </div>
                  <p className={tx.caption}>
                    {formatDateLong(user.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
