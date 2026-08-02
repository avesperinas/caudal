import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

// El healthcheck del contenedor consulta esta ruta. Si devuelve != 200 tras un
// despliegue, el server revierte solo a la version anterior, asi que tiene que
// comprobar que la app puede atender trafico real, no solo que el proceso vive.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: "ok" })
  } catch (error) {
    // La ruta es publica (no pasa por el middleware de auth, para que el
    // healthcheck del contenedor pueda consultarla), asi que el detalle del
    // error se queda en los logs: devolverlo filtraria internos de Prisma y de
    // la base de datos a cualquiera que la consulte desde internet.
    console.error("[health] la base de datos no responde:", error)
    return NextResponse.json({ status: "error" }, { status: 503 })
  }
}
