import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { ProductList } from "@/components/finance/ProductList"

export default async function ProductosPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [products, entities] = await Promise.all([
    prisma.product.findMany({
      where: { userId: session.user.id },
      include: { entity: true },
      orderBy: { openedAt: "desc" },
    }),
    prisma.entity.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    }),
  ])

  return <ProductList products={products} entities={entities} />
}
