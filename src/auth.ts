import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                const email = credentials.email as string
                const password = credentials.password as string

                const user = await prisma.user.findUnique({
                    where: { email },
                    include: { barbershop: true }
                })

                if (!user || !user.password) {
                    return null
                }

                // Super Admin sempre pode logar se a conta estiver ativa
                if (user.role === 'SUPER_ADMIN') {
                    if (user.status !== 'ACTIVE') return null
                } else {
                    // Outros usuários precisam que a conta E a barbearia estejam ativas
                    if (user.status !== 'ACTIVE' || !user.barbershop.isActive) {
                        return null
                    }
                }

                const isPasswordValid = await bcrypt.compare(password, user.password)

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    barbershopId: user.barbershopId,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.barbershopId = user.barbershopId
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.barbershopId = token.barbershopId as string
            }
            return session
        },
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
})
