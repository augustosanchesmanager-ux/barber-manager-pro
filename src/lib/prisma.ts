import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const prismaClientSingleton = () => {
    if (process.env.TURSO_AUTH_TOKEN) {
        const adapter = new PrismaLibSql({
            url: process.env.DATABASE_URL!,
            authToken: process.env.TURSO_AUTH_TOKEN,
        })
        return new PrismaClient({ adapter } as any)
    }

    return new PrismaClient()
}

declare const globalThis: {
    prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
