'use server'

import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function getPendingRequests() {
    const session = await auth()
    if (!session || session.user.role !== 'SUPER_ADMIN') {
        throw new Error("Não autorizado")
    }

    // Buscar barbearias inativas (solicitações pendentes)
    const pendingBarbershops = await prisma.barbershop.findMany({
        where: { isActive: false },
        include: {
            users: {
                where: { role: 'MANAGER' },
                take: 1
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return pendingBarbershops.map(barbershop => ({
        ...barbershop,
        createdAt: barbershop.createdAt.toISOString(),
        updatedAt: barbershop.updatedAt.toISOString(),
        users: barbershop.users.map(user => ({
            ...user,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString()
        }))
    }))
}

export async function approveRequest(barbershopId: string) {
    const session = await auth()
    if (!session || session.user.role !== 'SUPER_ADMIN') {
        throw new Error("Não autorizado")
    }

    await prisma.$transaction([
        // Ativar a barbearia
        prisma.barbershop.update({
            where: { id: barbershopId },
            data: { isActive: true }
        }),
        // Ativar o gestor principal
        prisma.user.updateMany({
            where: {
                barbershopId,
                role: 'MANAGER'
            },
            data: { status: 'ACTIVE' }
        })
    ])

    revalidatePath('/admin/requests')
    revalidatePath('/admin/barbershops')
}

export async function rejectRequest(barbershopId: string) {
    const session = await auth()
    if (!session || session.user.role !== 'SUPER_ADMIN') {
        throw new Error("Não autorizado")
    }

    // Para rejeitar, podemos simplesmente deletar ou marcar como rejeitado. 
    // Por simplicidade neste MVP, vamos deletar para limpar o banco.
    await prisma.barbershop.delete({
        where: { id: barbershopId }
    })

    revalidatePath('/admin/requests')
}
