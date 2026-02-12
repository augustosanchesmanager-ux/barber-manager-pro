'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createProduct(formData: FormData) {
    const session = await auth()
    if (!session || session.user.role !== 'MANAGER') {
        throw new Error("Acesso negado")
    }

    const name = formData.get('name') as string
    const price = Number(formData.get('price'))
    const quantity = Number(formData.get('quantity'))
    const category = formData.get('category') as string

    await prisma.product.create({
        data: {
            name,
            price,
            quantity,
            category,
            barbershopId: session.user.barbershopId
        }
    })

    revalidatePath('/produtos')
    return { success: true }
}

export async function updateProduct(id: string, formData: FormData) {
    const session = await auth()
    if (!session || session.user.role !== 'MANAGER') throw new Error("Acesso negado")

    const name = formData.get('name') as string
    const price = Number(formData.get('price'))
    const quantity = Number(formData.get('quantity')) // Estoque Absoluto ou Diferença? Absoluto para simplificar CRUD básico

    await prisma.product.update({
        where: { id },
        data: {
            name,
            price,
            quantity
        }
    })

    revalidatePath('/produtos')
}

export async function deleteProduct(id: string) {
    const session = await auth()
    if (!session || session.user.role !== 'MANAGER') throw new Error("Acesso negado")

    await prisma.product.delete({ where: { id } })
    revalidatePath('/produtos')
}

export async function getProducts() {
    const session = await auth()
    if (!session) return []

    return prisma.product.findMany({
        where: { barbershopId: session.user.barbershopId },
        orderBy: { name: 'asc' }
    })
}
