'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getTodayData() {
    const session = await auth()
    if (!session) return null

    const today = new Date()
    const startOfDay = new Date(today)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(today)
    endOfDay.setHours(23, 59, 59, 999)

    // 1. Verificar se já existe fechamento hoje
    const existingClose = await prisma.dailyClose.findFirst({
        where: {
            barbershopId: session.user.barbershopId,
            date: { gte: startOfDay, lte: endOfDay }
        },
        include: { user: true }
    })

    if (existingClose) {
        return {
            status: 'CLOSED',
            data: {
                ...existingClose,
                date: existingClose.date.toISOString(),
                createdAt: existingClose.createdAt.toISOString(),
                updatedAt: existingClose.updatedAt.toISOString(),
                totalCash: existingClose.totalCash.toNumber(),
                totalCard: existingClose.totalCard.toNumber(),
                totalPix: existingClose.totalPix.toNumber(),
                totalAmount: existingClose.totalAmount.toNumber(),
                user: {
                    ...existingClose.user,
                    createdAt: existingClose.user.createdAt.toISOString(),
                    updatedAt: existingClose.user.updatedAt.toISOString()
                }
            }
        }
    }

    // 2. Se não fechou, buscar transações do dia (Entradas e Saídas)
    const transactionsRaw = await prisma.transaction.findMany({
        where: {
            barbershopId: session.user.barbershopId,
            date: { gte: startOfDay, lte: endOfDay },
        },
        include: { appointment: { include: { customer: true } } },
        orderBy: { date: 'desc' }
    })

    // Converter Decimal para number e serializar Date
    const transactions = transactionsRaw.map(t => ({
        id: t.id,
        createdAt: t.createdAt.toISOString(),
        date: t.date.toISOString(),
        type: t.type,
        paymentMethod: t.paymentMethod,
        amount: t.amount.toNumber(),
        appointment: t.appointment ? {
            customer: {
                name: t.appointment.customer.name
            }
        } : null
    }))

    let totalCash = 0
    let totalCard = 0
    let totalPix = 0

    for (const t of transactions) {
        const amount = t.amount
        const method = t.paymentMethod || 'CASH'
        const multiplier = t.type === 'INCOME' ? 1 : -1

        if (method === 'CASH') totalCash += (amount * multiplier)
        else if (method === 'PIX') totalPix += (amount * multiplier)
        else totalCard += (amount * multiplier)
    }

    return {
        status: 'OPEN',
        summary: {
            totalCash,
            totalCard,
            totalPix,
            totalAmount: totalCash + totalCard + totalPix,
            transactions
        }
    }
}

export async function performDailyClose(observations: string) {
    const session = await auth()
    if (!session || session.user.role !== 'MANAGER') throw new Error("Acesso negado")

    const data = await getTodayData()

    if (!data || data.status === 'CLOSED') {
        throw new Error("Caixa já fechado ou dados inválidos")
    }

    const { totalCash, totalCard, totalPix, totalAmount } = data.summary!

    await prisma.dailyClose.create({
        data: {
            barbershopId: session.user.barbershopId,
            userId: session.user.id,
            date: new Date(),
            totalCash,
            totalCard,
            totalPix,
            totalAmount,
            observations
        }
    })

    revalidatePath('/caixa')
}
