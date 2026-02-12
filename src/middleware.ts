import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")
    const isOnLogin = req.nextUrl.pathname.startsWith("/login")
    const isOnRegister = req.nextUrl.pathname.startsWith("/register")
    const isOnAdmin = req.nextUrl.pathname.startsWith("/admin")

    // Proteção para rotas /admin (apenas SUPER_ADMIN)
    if (isOnAdmin) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", req.nextUrl))
        }
        if (req.auth?.user?.role !== 'SUPER_ADMIN') {
            return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
        }
        return NextResponse.next()
    }

    if (isOnDashboard) {
        if (isLoggedIn) return NextResponse.next()
        return NextResponse.redirect(new URL("/login", req.nextUrl))
    }

    if (isOnLogin) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/dashboard", req.nextUrl))
        }
        return NextResponse.next()
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
