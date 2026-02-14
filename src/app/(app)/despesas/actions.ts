'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createExpense(data: {
    amount: number
    description: string
    category?: string
    paymentMethod?: string
    date?: Date
}) {
    const session = await auth()
    if (!session) throw new Error("Não autenticado")

    await prisma.transaction.create({
        data: {
            barbershopId: session.user.barbershopId,
            amount: data.amount,
            type: 'EXPENSE',
            category: data.category,
            paymentMethod: data.paymentMethod || 'CASH',
            description: data.description,
            date: data.date || new Date(),
        }
    })

    revalidatePath('/despesas')
    revalidatePath('/dashboard')
    revalidatePath('/financeiro')
}

export async function deleteExpense(id: string) {
    const session = await auth()
    if (!session || session.user.role !== 'MANAGER') throw new Error("Acesso negado")

    await prisma.transaction.delete({
        where: {
            id,
            barbershopId: session.user.barbershopId
        }
    })

    revalidatePath('/despesas')
    revalidatePath('/dashboard')
}

export async function getExpenses() {
    const session = await auth()
    if (!session) return []

    // Pegar despesas do mês atual por padrão
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const expenses = await prisma.transaction.findMany({
        where: {
            barbershopId: session.user.barbershopId,
            type: 'EXPENSE',
            date: { gte: startOfMonth }
        },
        orderBy: { date: 'desc' }
    })

    return expenses.map(expense => ({
        ...expense,
        amount: expense.amount.toNumber(),
        date: expense.date.toISOString(),
        createdAt: expense.createdAt.toISOString(),
        updatedAt: expense.updatedAt.toISOString()
    }))
}
