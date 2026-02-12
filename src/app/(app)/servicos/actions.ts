'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createService(formData: FormData) {
    const session = await auth()
    if (!session || session.user.role !== 'MANAGER') throw new Error("Acesso negado")

    const name = formData.get('name') as string
    const price = Number(formData.get('price'))
    const duration = Number(formData.get('duration')) // em minutos

    await prisma.service.create({
        data: {
            name,
            price,
            duration,
            barbershopId: session.user.barbershopId
        }
    })

    revalidatePath('/produtos') // Meio confuso, mas produtos agora é Serviços & Produtos na sidebar?
    // O link na sidebar é /produtos, mas o label é "Serviços & Produtos". 
    // Seria ideal ter uma página unificada ou abas. 
    // Vou assumir que o usuário vai navegar entre abas ou sub-paginas se eu criar.
    // Por ora, vou revalidar o path correto.
    revalidatePath('/servicos')
    return { success: true }
}

export async function deleteService(id: string) {
    const session = await auth()
    if (!session || session.user.role !== 'MANAGER') throw new Error("Acesso negado")

    await prisma.service.delete({ where: { id } })
    revalidatePath('/servicos')
}

export async function getServices() {
    const session = await auth()
    if (!session) return []

    return prisma.service.findMany({
        where: { barbershopId: session.user.barbershopId },
        orderBy: { name: 'asc' }
    })
}
