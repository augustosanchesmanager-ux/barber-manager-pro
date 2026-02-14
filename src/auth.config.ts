import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
            const isOnApp = nextUrl.pathname.startsWith("/(app)")
            const isOnAdmin = nextUrl.pathname.startsWith("/admin")
            const isOnLogin = nextUrl.pathname.startsWith("/login")

            if (isOnAdmin) {
                if (!isLoggedIn) return false
                return auth?.user?.role === 'SUPER_ADMIN'
            }

            if (isOnDashboard || isOnApp) {
                if (isLoggedIn) return true
                return false
            }

            if (isOnLogin && isLoggedIn) {
                return Response.redirect(new URL("/dashboard", nextUrl))
            }

            return true
        },
    },
    providers: [],
} satisfies NextAuthConfig
