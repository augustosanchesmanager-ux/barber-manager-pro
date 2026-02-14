import 'dotenv/config'
import prisma from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
    console.log('Iniciando seed...')

    const passwordHash = await bcrypt.hash('password123', 10)

    // Criar Barbearia
    const barbershop = await prisma.barbershop.create({
        data: {
            name: 'Vintage Barber',
            slug: 'vintage-barber',
            address: 'Rua das Flores, 123 - Centro',
            phone: '(11) 99999-9999',
        },
    })

    console.log('Barbearia criada:', barbershop.name)

    // Criar Usuários
    const manager = await prisma.user.create({
        data: {
            name: 'Carlos Gestor',
            email: 'gestor@vintage.com',
            password: passwordHash, // Senha hasheada
            role: 'MANAGER',
            barbershopId: barbershop.id,
        },
    })

    const barber = await prisma.user.create({
        data: {
            name: 'João Barbeiro',
            email: 'barbeiro@vintage.com',
            password: passwordHash, // Senha hasheada
            role: 'BARBER',
            barbershopId: barbershop.id,
        },
    })

    console.log('Usuários criados:', manager.email, barber.email)

    // Criar Clientes
    await prisma.customer.create({
        data: {
            name: 'Cliente Exemplo',
            phone: '(11) 98888-8888',
            barbershopId: barbershop.id,
        },
    })

    // Criar Serviços
    await prisma.service.create({
        data: {
            name: 'Corte de Cabelo',
            price: 45.00,
            duration: 30, // minutos
            barbershopId: barbershop.id,
        },
    })

    await prisma.service.create({
        data: {
            name: 'Barba Completa',
            price: 35.00,
            duration: 30,
            barbershopId: barbershop.id,
        },
    })

    console.log('Serviços criados')

    // Criar Produtos
    await prisma.product.create({
        data: {
            name: 'Pomada Matte',
            price: 25.00,
            quantity: 50,
            category: 'Finalizadores',
            barbershopId: barbershop.id,
        },
    })

    console.log('Seed finalizado com sucesso!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
