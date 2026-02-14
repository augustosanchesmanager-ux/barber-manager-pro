'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function getDashboardMetrics() {
    const session = await auth()
    if (!session) return null

    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    // 1. Faturamento Hoje e Despesas Hoje
    const todayTransactions = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
            barbershopId: session.user.barbershopId,
            type: 'INCOME',
            date: { gte: startOfDay, lte: endOfDay }
        }
    })

    const todayExpenses = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
            barbershopId: session.user.barbershopId,
            type: 'EXPENSE',
            date: { gte: startOfDay, lte: endOfDay }
        }
    })

    // 2. Faturamento Mês e Despesas Mês
    const monthTransactions = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
            barbershopId: session.user.barbershopId,
            type: 'INCOME',
            date: { gte: startOfMonth, lte: endOfMonth }
        }
    })

    const monthExpenses = await prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
            barbershopId: session.user.barbershopId,
            type: 'EXPENSE',
            date: { gte: startOfMonth, lte: endOfMonth }
        }
    })

    // 3. Atendimentos Hoje
    const todayAppointmentsRaw = await prisma.appointment.findMany({
        where: {
            barbershopId: session.user.barbershopId,
            date: { gte: startOfDay, lte: endOfDay },
            status: { not: 'CANCELLED' }
        },
        include: {
            customer: true,
            services: { include: { service: true } },
            barber: true
        },
        orderBy: { date: 'asc' }
    })

    const todayAppointments = todayAppointmentsRaw.map(app => ({
        ...app,
        date: app.date.toISOString(),
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
        totalPrice: app.totalPrice.toNumber(),
        customer: {
            ...app.customer,
            birthDate: app.customer.birthDate?.toISOString() || null,
            createdAt: app.customer.createdAt.toISOString(),
            updatedAt: app.customer.updatedAt.toISOString()
        },
        barber: {
            ...app.barber,
            createdAt: app.barber.createdAt.toISOString(),
            updatedAt: app.barber.updatedAt.toISOString()
        },
        services: app.services.map(s => ({
            ...s,
            price: s.price.toNumber(),
            service: {
                ...s.service,
                price: s.service.price.toNumber()
            }
        }))
    }))

    const appointmentsTodayCount = todayAppointments.length

    // 4. Próximos Agendamentos (Top 5)
    const nextAppointmentsRaw = await prisma.appointment.findMany({
        where: {
            barbershopId: session.user.barbershopId,
            date: { gte: new Date() }, // Futuros
            status: 'SCHEDULED'
        },
        take: 5,
        orderBy: { date: 'asc' },
        include: {
            customer: true,
            services: { include: { service: true } },
            barber: true
        }
    })

    const nextAppointments = nextAppointmentsRaw.map(app => ({
        ...app,
        date: app.date.toISOString(),
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
        totalPrice: app.totalPrice.toNumber(),
        customer: {
            ...app.customer,
            birthDate: app.customer.birthDate?.toISOString() || null,
            createdAt: app.customer.createdAt.toISOString(),
            updatedAt: app.customer.updatedAt.toISOString()
        },
        barber: {
            ...app.barber,
            createdAt: app.barber.createdAt.toISOString(),
            updatedAt: app.barber.updatedAt.toISOString()
        },
        services: app.services.map(s => ({
            ...s,
            price: s.price.toNumber(),
            service: {
                ...s.service,
                price: s.service.price.toNumber()
            }
        }))
    }))

    // 5. Gráfico de Faturamento (Últimos 7 dias)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - i)
        d.setHours(0, 0, 0, 0)
        return d
    }).reverse()

    const revenueByDay = await Promise.all(last7Days.map(async (date) => {
        const end = new Date(date)
        end.setHours(23, 59, 59, 999)

        const sum = await prisma.transaction.aggregate({
            _sum: { amount: true },
            where: {
                barbershopId: session.user.barbershopId,
                type: 'INCOME',
                date: { gte: date, lte: end }
            }
        })

        return {
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            total: Number(sum._sum.amount || 0)
        }
    }))

    // 6. Ranking de Serviços (Top 5)
    // Como são relações separadas, vamos agregar no JS ou usar GroupBy (SQLite limita um pouco)
    const topServicesData = await prisma.appointmentService.groupBy({
        by: ['serviceId'],
        where: {
            appointment: {
                barbershopId: session.user.barbershopId,
                status: 'COMPLETED'
            }
        },
        _count: { serviceId: true },
        orderBy: { _count: { serviceId: 'desc' } },
        take: 5
    })

    const topServices = await Promise.all(topServicesData.map(async (item) => {
        const service = await prisma.service.findUnique({ where: { id: item.serviceId } })
        return {
            name: service?.name || 'Desconhecido',
            count: item._count.serviceId
        }
    }))

    return {
        revenueToday: Number(todayTransactions._sum.amount || 0) - Number(todayExpenses._sum.amount || 0),
        grossRevenueToday: Number(todayTransactions._sum.amount || 0),
        revenueMonth: Number(monthTransactions._sum.amount || 0) - Number(monthExpenses._sum.amount || 0),
        expensesToday: Number(todayExpenses._sum.amount || 0),
        appointmentsCount: appointmentsTodayCount,
        todayAppointments,
        nextAppointments,
        revenueByDay,
        topServices
    }
}
