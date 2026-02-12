'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getAtendimentosHistory(startDate?: string, endDate?: string, barberId?: string) {
    const session = await auth()
    if (!session) return []

    const where: any = {
        barbershopId: session.user.barbershopId,
        status: { in: ['COMPLETED', 'CANCELLED'] }
    }

    if (startDate || endDate) {
        where.date = {}
        if (startDate) where.date.gte = new Date(startDate)
        if (endDate) {
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)
            where.date.lte = end
        }
    }

    if (barberId && barberId !== 'ALL') {
        where.barberId = barberId
    }

    return prisma.appointment.findMany({
        where,
        include: {
            customer: true,
            barber: true,
            services: { include: { service: true } }
        },
        orderBy: { date: 'desc' }
    })
}

export async function finishCheckout(
    appointmentId: string,
    paymentMethod: string,
    totalAmount: number,
    products: { productId: string, quantity: number, price: number }[]
) {
    const session = await auth()
    if (!session) throw new Error("Não autenticado")

    // 1. Atualizar Agendamento
    const appointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
            status: 'COMPLETED',
            paymentStatus: 'PAID',
            paymentMethod: paymentMethod,
            totalPrice: totalAmount
        }
    })

    // 2. Registrar Produtos (se houver)
    if (products.length > 0) {
        await prisma.appointmentProduct.createMany({
            data: products.map(p => ({
                appointmentId,
                productId: p.productId,
                quantity: p.quantity,
                price: p.price
            }))
        })
    }

    // 3. Criar Transação Financeira
    await prisma.transaction.create({
        data: {
            appointmentId: appointment.id,
            barbershopId: session.user.barbershopId,
            amount: totalAmount,
            type: 'INCOME',
            paymentMethod: paymentMethod,
            description: `Atendimento finalizado - ID: ${appointment.id.substring(0, 8)}`,
            date: new Date()
        }
    })

    revalidatePath('/agenda')
    revalidatePath('/atendimentos')
    revalidatePath('/caixa')
    revalidatePath('/dashboard')

    redirect('/agenda')
}
