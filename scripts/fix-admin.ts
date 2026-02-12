import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const pass = 'Admin@123456'
    const hash = await bcrypt.hash(pass, 10)

    // 1. Ativar barbearia administrativa
    const barbershop = await prisma.barbershop.upsert({
        where: { slug: 'admin-system' },
        update: { isActive: true },
        create: {
            name: 'Sistema Administrativo',
            slug: 'admin-system',
            isActive: true
        }
    })

    // 2. Ativar usuário super admin
    await prisma.user.upsert({
        where: { email: 'admin@barberpro.com' },
        update: {
            status: 'ACTIVE',
            password: hash,
            role: 'SUPER_ADMIN',
            barbershopId: barbershop.id
        },
        create: {
            name: 'Super Administrador',
            email: 'admin@barberpro.com',
            password: hash,
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
            barbershopId: barbershop.id
        }
    })

    console.log('🚀 Super Admin resetado e ativado com sucesso!')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
