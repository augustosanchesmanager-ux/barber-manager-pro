import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { CheckoutForm } from "@/components/atendimentos/checkout-form"
import { auth } from "@/auth"

interface CheckoutPageProps {
    params: Promise<{
        id: string
    }>
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
    const { id } = await params
    const session = await auth()

    const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
            customer: true,
            services: { include: { service: true } },
            barber: true,
        },
    })

    if (!appointment) notFound()

    // Buscar produtos disponíveis para adicionar
    const products = await prisma.product.findMany({
        where: { barbershopId: session?.user.barbershopId }
    })

    // Converter Decimal para number para o React
    const productsWithNumberPrice = products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price.toNumber()
    }))

    // Converter preços dos serviços no appointment e serializar Date
    const appointmentWithNumberPrices = {
        id: appointment.id,
        customer: { name: appointment.customer.name },
        barber: { name: appointment.barber.name },
        date: appointment.date.toISOString(),
        services: appointment.services.map(s => ({
            price: s.price.toNumber(),
            service: {
                name: s.service.name
            }
        }))
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Checkout do Atendimento</h2>
            </div>

            <CheckoutForm
                appointment={appointmentWithNumberPrices}
                products={productsWithNumberPrice}
            />
        </div>
    )
}
