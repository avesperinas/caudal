import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { tx, layout } from "@/lib/styles"
import { cn } from "@/lib/utils"
import { FriendsView, type FriendEntry } from "@/components/finance/FriendsView"

export default async function FriendsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const friendships = await prisma.friendship.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    include: {
      sender:   { select: { id: true, name: true, email: true, image: true } },
      receiver: { select: { id: true, name: true, email: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const entries: FriendEntry[] = friendships.map((f) => ({
    id: f.id,
    status: f.status as "PENDING" | "ACCEPTED",
    isIncoming: f.receiverId === userId,
    other: f.senderId === userId ? f.receiver : f.sender,
  }))

  return (
    <div className={cn(layout.page, layout.pageSections)}>
      <div>
        <h1 className={tx.pageTitle}>Amigos</h1>
        <p className={tx.secondary}>
          {entries.filter((e) => e.status === "ACCEPTED").length} amigo
          {entries.filter((e) => e.status === "ACCEPTED").length !== 1 ? "s" : ""}
        </p>
      </div>
      <FriendsView entries={entries} />
    </div>
  )
}
