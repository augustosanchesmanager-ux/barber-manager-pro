'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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
            data: existingClose
        }
    }

    // 2. Se não fechou, buscar transações do dia (Entradas e Saídas)
    const transactions = await prisma.transaction.findMany({
        where: {
            barbershopId: session.user.barbershopId,
            date: { gte: startOfDay, lte: endOfDay },
        },
        include: { appointment: { include: { customer: true } } },
        orderBy: { date: 'desc' }
    })

    let totalCash = 0
    let totalCard = 0
    let totalPix = 0

    for (const t of transactions) {
        const amount = Number(t.amount)
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
            userId: (session.user as any).id,
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
