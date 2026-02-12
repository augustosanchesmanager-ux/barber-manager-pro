'use server'

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function getAllBarbershops() {
    const session = await auth()

    // Verificar se é SUPER_ADMIN
    if (!session || session.user.role !== 'SUPER_ADMIN') {
        redirect('/dashboard')
    }

    const barbershops = await prisma.barbershop.findMany({
        include: {
            _count: {
                select: {
                    users: true,
                    customers: true,
                    appointments: true,
                    transactions: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return barbershops
}
