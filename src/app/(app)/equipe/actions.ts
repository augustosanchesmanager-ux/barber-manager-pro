'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function getTeam() {
    const session = await auth()
    if (!session) return []

    return prisma.user.findMany({
        where: {
            barbershopId: session.user.barbershopId
        },
        orderBy: {
            name: 'asc'
        }
    })
}

export async function upsertTeamMember(formData: FormData) {
    const session = await auth()
    if (!session || session.user.role !== 'MANAGER') {
        throw new Error("Não autorizado.")
    }

    const id = formData.get('id') as string // Se presente, é edição
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as string

    if (!name || !email || (!id && !password) || !role) {
        throw new Error("Campos obrigatórios ausentes.")
    }

    const data: any = {
        name,
        email,
        role,
    }

    if (password) {
        data.password = await bcrypt.hash(password, 10)
    }

    try {
        if (id) {
            await prisma.user.update({
                where: { id },
                data
            })
        } else {
            // Verificar limites do plano
            const barbershop = await prisma.barbershop.findUnique({
                where: { id: session.user.barbershopId },
                select: { maxBarbers: true }
            })

            const currentUsersCount = await prisma.user.count({
                where: { barbershopId: session.user.barbershopId }
            })

            if (barbershop && currentUsersCount >= barbershop.maxBarbers) {
                throw new Error(`Limite do plano atingido (${barbershop.maxBarbers} barbeiros). Faça um upgrade para adicionar mais.`)
            }

            await prisma.user.create({
                data: {
                    ...data,
                    barbershopId: session.user.barbershopId,
                    status: 'ACTIVE' // Membros da equipe criados pelo gestor já nascem ativos
                }
            })
        }

        revalidatePath('/equipe')
        return { success: true }
    } catch (error: any) {
        if (error.code === 'P2002') {
            throw new Error("Este e-mail já está sendo utilizado.")
        }
        throw new Error("Erro ao salvar membro da equipe: " + error.message)
    }
}

export async function deleteTeamMember(id: string) {
    const session = await auth()
    if (!session || session.user.role !== 'MANAGER') {
        throw new Error("Não autorizado.")
    }

    if (id === session.user.id) {
        throw new Error("Você não pode excluir a si mesmo.")
    }

    await prisma.user.delete({
        where: { id }
    })

    revalidatePath('/equipe')
    return { success: true }
}
