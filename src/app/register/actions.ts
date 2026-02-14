'use server'

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
        .trim()
        .replace(/\s+/g, "-") // Substitui espaços por hífens
        .replace(/-+/g, "-") // Remove hífens duplicados
}

export async function registerBarbershop(formData: FormData) {
    try {
        console.log("Iniciando registro de barbearia...", Object.fromEntries(formData.entries()))
        const barbershopName = formData.get('barbershopName') as string
        const address = formData.get('address') as string
        const phone = formData.get('phone') as string

        const managerName = formData.get('managerName') as string
        const managerEmail = formData.get('managerEmail') as string
        const managerPassword = formData.get('managerPassword') as string

        if (!barbershopName || !managerName || !managerEmail || !managerPassword) {
            throw new Error("Preencha todos os campos obrigatórios.")
        }

        // Gerar slug único
        let slug = generateSlug(barbershopName)
        const existingSlug = await prisma.barbershop.findUnique({ where: { slug } })

        if (existingSlug) {
            // Se existir, adiciona um número aleatório
            slug = `${slug}-${Math.floor(Math.random() * 10000)}`
        }

        // Verificar se email já existe
        const existingUser = await prisma.user.findUnique({ where: { email: managerEmail } })
        if (existingUser) {
            throw new Error("Este e-mail já está cadastrado.")
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(managerPassword, 10)

        // Criar barbearia e primeiro gestor em uma transação
        const barbershop = await prisma.barbershop.create({
            data: {
                name: barbershopName,
                slug,
                address: address || null,
                phone: phone || null,
                users: {
                    create: {
                        name: managerName,
                        email: managerEmail,
                        password: hashedPassword,
                        role: 'MANAGER'
                    }
                }
            },
            include: {
                users: true
            }
        })

        console.log("Barbearia criada com sucesso:", barbershop.slug)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro desconhecido'
        console.error("ERRO NO REGISTRO:", message)
        throw error // Repassa para o Next.js lidar (ou mostrar no erro)
    }

    redirect('/waiting-approval')
}
