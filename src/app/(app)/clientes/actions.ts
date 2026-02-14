'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getCustomers() {
    const session = await auth()
    if (!session) return []

    const customers = await prisma.customer.findMany({
        where: { barbershopId: session.user.barbershopId },
        orderBy: { name: 'asc' }
    })

    return customers.map(customer => ({
        ...customer,
        birthDate: customer.birthDate?.toISOString() || null,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString()
    }))
}

export async function createCustomer(formData: FormData) {
    const session = await auth()
    if (!session) throw new Error("Não autorizado")

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const birthDateStr = formData.get('birthDate') as string

    if (!name) throw new Error("Nome é obrigatório")

    await prisma.customer.create({
        data: {
            name,
            email: email || null,
            phone: phone || null,
            birthDate: birthDateStr ? new Date(birthDateStr) : null,
            barbershopId: session.user.barbershopId
        }
    })

    revalidatePath('/clientes')
    return { success: true }
}

export async function updateCustomer(id: string, formData: FormData) {
    const session = await auth()
    if (!session) throw new Error("Não autorizado")

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const birthDateStr = formData.get('birthDate') as string

    if (!name) throw new Error("Nome é obrigatório")

    await prisma.customer.update({
        where: { id },
        data: {
            name,
            email: email || null,
            phone: phone || null,
            birthDate: birthDateStr ? new Date(birthDateStr) : null,
        }
    })

    revalidatePath('/clientes')
    return { success: true }
}

export async function deleteCustomer(id: string) {
    const session = await auth()
    if (!session || session.user.role !== 'MANAGER') {
        throw new Error("Apenas gestores podem excluir clientes")
    }

    // Nota: Em um sistema real, você deve lidar com agendamentos vinculados (excluir ou setar null)
    await prisma.customer.delete({
        where: { id }
    })

    revalidatePath('/clientes')
    return { success: true }
}
