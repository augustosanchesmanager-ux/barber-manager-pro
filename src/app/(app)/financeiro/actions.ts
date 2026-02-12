'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function getReportTransactions(startDate?: string, endDate?: string) {
    const session = await auth()
    if (!session) return []

    const start = startDate ? new Date(startDate) : new Date()
    if (!startDate) start.setMonth(start.getMonth() - 1) // Default 1 mês
    start.setHours(0, 0, 0, 0)

    const end = endDate ? new Date(endDate) : new Date()
    end.setHours(23, 59, 59, 999)

    const transactions = await prisma.transaction.findMany({
        where: {
            barbershopId: session.user.barbershopId,
            createdAt: { gte: start, lte: end }
        },
        include: {
            appointment: {
                include: {
                    customer: true,
                    services: { include: { service: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return transactions.map(t => ({
        id: t.id,
        amount: Number(t.amount),
        type: t.type,
        category: t.category,
        description: t.description || (t.appointment ? `Serviço: ${t.appointment.customer.name}` : 'Venda Avulsa'),
        date: t.createdAt.toISOString(),
        paymentMethod: t.paymentMethod || t.appointment?.paymentMethod || 'OUTRO'
    }))
}
