'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getAtendimentosHistory(startDate?: string, endDate?: string, barberId?: string) {
    const session = await auth()
    if (!session) return []

    const where: Record<string, unknown> = {
        barbershopId: session.user.barbershopId,
        status: { in: ['COMPLETED', 'CANCELLED'] }
    }

    if (startDate || endDate) {
        where.date = {}
        if (startDate) (where.date as Record<string, Date>).gte = new Date(startDate)
        if (endDate) {
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999);
            (where.date as Record<string, Date>).lte = end
        }
    }

    if (barberId && barberId !== 'ALL') {
        where.barberId = barberId
    }

    const appointments = await prisma.appointment.findMany({
        where,
        include: {
            customer: true,
            barber: true,
            services: { include: { service: true } }
        },
        orderBy: { date: 'desc' }
    })

    // Converter Decimal para number e Date para ISO string
    return appointments.map(app => ({
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
}

export async function finishCheckout(
    appointmentId: string,
    paymentMethod: string,
    totalAmount: number,
    products: { productId: string, quantity: number, price: number }[]
) {
    const session = await auth()
    if (!session) throw new Error("Não autenticado")

    // 1. Atualizar Agendamento (com verificação de barbershopId para segurança)
    const appointment = await prisma.appointment.updateMany({
        where: { 
            id: appointmentId,
            barbershopId: session.user.barbershopId
        },
        data: {
            status: 'COMPLETED',
            paymentStatus: 'PAID',
            paymentMethod: paymentMethod,
            totalPrice: totalAmount
        }
    })

    if (appointment.count === 0) {
        throw new Error("Agendamento não encontrado ou não pertence à sua barbearia")
    }

    // Buscar o appointment atualizado
    const updatedAppointment = await prisma.appointment.findFirst({
        where: { 
            id: appointmentId,
            barbershopId: session.user.barbershopId
        }
    })

    if (!updatedAppointment) {
        throw new Error("Erro ao buscar agendamento atualizado")
    }

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
            appointmentId: updatedAppointment.id,
            barbershopId: session.user.barbershopId,
            amount: totalAmount,
            type: 'INCOME',
            paymentMethod: paymentMethod,
            description: `Atendimento finalizado - ID: ${updatedAppointment.id.substring(0, 8)}`,
            date: new Date()
        }
    })

    revalidatePath('/agenda')
    revalidatePath('/atendimentos')
    revalidatePath('/caixa')
    revalidatePath('/dashboard')

    redirect('/agenda')
}
