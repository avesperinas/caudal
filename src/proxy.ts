import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  if (pathname === "/login") {
    if (isLoggedIn) return NextResponse.redirect(new URL("/home", req.nextUrl))
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }
})

export const config = {
  // Excluir rutas de API, archivos estáticos y style-test (solo desarrollo)
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|style-test).*)"],
}
