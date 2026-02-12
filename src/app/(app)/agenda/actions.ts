'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// TODO: Definir horário de funcionamento na Barbearia no banco
const BUSINESS_HOURS = { start: 8, end: 20 }

export async function getDayAppointments(date: Date, barberId?: string) {
    const session = await auth()
    if (!session) return []

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const appointments = await prisma.appointment.findMany({
        where: {
            barbershopId: session.user.barbershopId,
            ...(barberId && barberId !== 'ALL' ? { barberId } : {}),
            date: {
                gte: startOfDay,
                lte: endOfDay,
            },
            status: { not: 'CANCELLED' } // Opcional: mostrar cancelados ou não
        },
        include: {
            customer: true,
            services: {
                include: { service: true }
            },
            barber: true
        },
        orderBy: {
            date: 'asc'
        }
    })

    return appointments
}

export async function upsertAppointment(formData: FormData) {
    const session = await auth()
    if (!session) redirect('/login')

    // Extrair dados
    const id = formData.get('id') as string // Se presente, é edição
    const dateStr = formData.get('date') as string
    const timeStr = formData.get('time') as string
    let customerId = formData.get('customerId') as string
    const customerName = formData.get('customerName') as string // Se for um novo cliente
    const serviceId = formData.get('serviceId') as string
    const barberId = formData.get('barberId') as string
    const totalPrice = formData.get('totalPrice') as string
    const paymentMethod = formData.get('paymentMethod') as string
    const paymentStatus = formData.get('paymentStatus') as string

    // Construir Data garantindo que as horas sejam interpretadas no timezone local
    const [hours, minutes] = timeStr.split(':').map(Number)
    // Usamos split e números para evitar o comportamento de parsing de string ISO que assume UTC
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day, hours, minutes, 0, 0)

    // Se não tiver customerId mas tiver customerName, cria o cliente agora
    if (!customerId && customerName) {
        const newCustomer = await prisma.customer.create({
            data: {
                name: customerName,
                barbershopId: (session.user as any).barbershopId
            }
        })
        customerId = newCustomer.id
    }

    if (!customerId) throw new Error("Cliente não selecionado ou nome não informado.")

    const appointmentData: any = {
        date,
        barbershopId: (session.user as any).barbershopId,
        customerId,
        barberId: barberId || (session.user as any).id,
        totalPrice: parseFloat(totalPrice) || 0,
        paymentMethod: paymentMethod || null,
        paymentStatus: paymentStatus || 'PENDING',
        status: paymentStatus === 'PAID' ? 'COMPLETED' : 'SCHEDULED'
    }

    const appointment = id
        ? await prisma.appointment.update({
            where: { id },
            data: appointmentData
        })
        : await prisma.appointment.create({
            data: {
                ...appointmentData,
                services: {
                    create: {
                        serviceId,
                        price: parseFloat(totalPrice) || 0
                    }
                }
            }
        })

    // Sincronizar Transação Financeira (Apenas se estiver pago)
    if (appointment.paymentStatus === 'PAID') {
        await prisma.transaction.upsert({
            where: { appointmentId: appointment.id },
            update: {
                amount: appointment.totalPrice,
                paymentMethod: appointment.paymentMethod || 'CASH',
                date: appointment.date,
            },
            create: {
                appointmentId: appointment.id,
                barbershopId: (session.user as any).barbershopId,
                amount: appointment.totalPrice,
                type: 'INCOME',
                paymentMethod: appointment.paymentMethod || 'CASH',
                date: appointment.date,
            }
        })
    } else {
        // Se não estiver pago, garante que não existe transação pendurada
        await prisma.transaction.deleteMany({
            where: { appointmentId: appointment.id }
        })
    }

    revalidatePath('/agenda')
    return { success: true }
}

export async function cancelAppointment(appointmentId: string) {
    const session = await auth()
    if (!session) redirect('/login')

    // VERIFICAÇÃO DE PERMISSÃO: Apenas MANAGER pode excluir/cancelar
    if (session.user.role !== 'MANAGER') {
        throw new Error("Apenas Gestores podem cancelar agendamentos.")
    }

    await prisma.appointment.update({
        where: {
            id: appointmentId,
            barbershopId: session.user.barbershopId
        },
        data: { status: 'CANCELLED' }
    })

    // Ou delete físico se preferir: await prisma.appointment.delete(...)

    revalidatePath('/agenda')
    return { success: true }
}

// Helpers par Dropdowns
export async function getBarbershopServices() {
    const session = await auth()
    if (!session) return []
    return prisma.service.findMany({
        where: { barbershopId: session.user.barbershopId }
    })
}

export async function getBarbershopTeam() {
    const session = await auth()
    if (!session) return []
    return prisma.user.findMany({
        where: { barbershopId: session.user.barbershopId }
    })
}

export async function getBarbershopCustomers() {
    const session = await auth()
    if (!session) return []
    return prisma.customer.findMany({
        where: { barbershopId: session.user.barbershopId }
    })
}
