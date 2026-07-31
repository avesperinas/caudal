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
    return NextResponse.json(
      {
        status: "error",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 503 },
    )
  }
}
