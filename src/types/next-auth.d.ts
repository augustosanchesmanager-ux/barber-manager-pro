import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            role: string
            barbershopId: string
        } & DefaultSession["user"]
    }

    interface User {
        role: string
        barbershopId: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string
        barbershopId: string
    }
}
