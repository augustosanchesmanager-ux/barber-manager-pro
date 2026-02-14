import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

async function main() {
    const url = process.env.DATABASE_URL
    const authToken = process.env.TURSO_AUTH_TOKEN

    if (!url || !authToken) {
        console.error('DATABASE_URL and TURSO_AUTH_TOKEN must be set')
        return
    }

    const adapter = new PrismaLibSql({ url, authToken })
    const prisma = new PrismaClient({ adapter: adapter as never })

    try {
        console.log('🔧 Conectando ao Turso para criar SUPER_ADMIN...')

        // Buscar ou criar uma barbearia "admin"
        let adminBarbershop = await prisma.barbershop.findUnique({
            where: { slug: 'admin-system' }
        })

        if (!adminBarbershop) {
            adminBarbershop = await prisma.barbershop.create({
                data: {
                    name: 'Sistema Administrativo',
                    slug: 'admin-system',
                    isActive: true,
                    planType: 'ENTERPRISE'
                }
            })
        }

        const email = 'admin@barberpro.com'
        const password = 'Admin@123456'
        const hashedPassword = await bcrypt.hash(password, 10)

        const existing = await prisma.user.findUnique({ where: { email } })
        if (existing) {
            console.log('⚠️  Usuário já existe:', email)
            return
        }

        await prisma.user.create({
            data: {
                name: 'Super Administrador',
                email,
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                status: 'ACTIVE',
                barbershopId: adminBarbershop.id
            }
        })

        console.log('✅ SUPER_ADMIN criado com sucesso no Turso!')
        console.log('📧 Email:', email)
        console.log('🔑 Senha:', password)

    } catch (e) {
        console.error('❌ Erro:', e)
    } finally {
        await prisma.$disconnect()
    }
}

main()
