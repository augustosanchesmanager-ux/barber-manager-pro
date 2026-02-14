'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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
    const barberIdRaw = formData.get('barberId')
    const barberId = (typeof barberIdRaw === 'string' && barberIdRaw) ? barberIdRaw : session.user.id
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
                barbershopId: session.user.barbershopId
            }
        })
        customerId = newCustomer.id
    }

    if (!customerId) throw new Error("Cliente não selecionado ou nome não informado.")

    const appointmentData = {
        date,
        barbershopId: session.user.barbershopId,
        customerId,
        barberId,
        totalPrice: parseFloat(totalPrice) || 0,
        paymentMethod: paymentMethod || null,
        paymentStatus: paymentStatus || 'PENDING',
        status: (paymentStatus === 'PAID' ? 'COMPLETED' : 'SCHEDULED') as 'COMPLETED' | 'SCHEDULED'
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
                amount: Number(appointment.totalPrice),
                paymentMethod: appointment.paymentMethod || 'CASH',
                date: appointment.date,
            },
            create: {
                appointmentId: appointment.id,
                barbershopId: session.user.barbershopId,
                amount: Number(appointment.totalPrice),
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
    const services = await prisma.service.findMany({
        where: { barbershopId: session.user.barbershopId }
    })
    
    return services.map(service => ({
        ...service,
        price: service.price.toNumber()
    }))
}

export async function getBarbershopTeam() {
    const session = await auth()
    if (!session) return []
    const users = await prisma.user.findMany({
        where: { barbershopId: session.user.barbershopId }
    })
    
    return users.map(user => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
    }))
}

export async function getBarbershopCustomers() {
    const session = await auth()
    if (!session) return []
    const customers = await prisma.customer.findMany({
        where: { barbershopId: session.user.barbershopId }
    })
    
    return customers.map(customer => ({
        ...customer,
        birthDate: customer.birthDate?.toISOString() || null,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString()
    }))
}
