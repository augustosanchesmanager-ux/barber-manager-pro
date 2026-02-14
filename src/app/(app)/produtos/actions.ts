'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

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

    const result = await prisma.product.updateMany({
        where: { 
            id,
            barbershopId: session.user.barbershopId
        },
        data: {
            name,
            price,
            quantity
        }
    })
    
    if (result.count === 0) {
        throw new Error("Produto não encontrado ou não pertence à sua barbearia")
    }

    revalidatePath('/produtos')
}

export async function deleteProduct(id: string) {
    const session = await auth()
    if (!session || session.user.role !== 'MANAGER') throw new Error("Acesso negado")

    const result = await prisma.product.deleteMany({ 
        where: { 
            id,
            barbershopId: session.user.barbershopId
        } 
    })
    
    if (result.count === 0) {
        throw new Error("Produto não encontrado ou não pertence à sua barbearia")
    }
    
    revalidatePath('/produtos')
}

export async function getProducts() {
    const session = await auth()
    if (!session) return []

    const products = await prisma.product.findMany({
        where: { barbershopId: session.user.barbershopId },
        orderBy: { name: 'asc' }
    })

    return products.map(p => ({
        ...p,
        price: p.price.toNumber()
    }))
}
