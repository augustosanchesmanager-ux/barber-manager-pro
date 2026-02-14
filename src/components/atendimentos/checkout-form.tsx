'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { finishCheckout } from "@/app/(app)/atendimentos/actions"
import { formatCurrency } from "@/lib/utils"

interface CheckoutFormProps {
    appointment: {
        id: string;
        customer: { name: string };
        barber: { name: string };
        date: string;
        services: Array<{ price: number }>;
    }
    products: Array<{ id: string; name: string; price: number }>
}

export function CheckoutForm({ appointment, products }: CheckoutFormProps) {
    const [paymentMethod, setPaymentMethod] = useState("CASH")
    const [selectedProducts, setSelectedProducts] = useState<Array<{ id: string; name: string; price: number; quantity: number }>>([])
    const [loading, setLoading] = useState(false)

    // Calcular totais
    const servicesTotal = appointment.services.reduce((acc: number, curr) => acc + Number(curr.price), 0)
    const productsTotal = selectedProducts.reduce((acc: number, curr) => acc + (Number(curr.price) * curr.quantity), 0)
    const totalAmount = servicesTotal + productsTotal

    const handleAddProduct = (productId: string) => {
        const product = products.find(p => p.id === productId)
        if (!product) return

        const existing = selectedProducts.find(p => p.id === productId)
        if (existing) {
            setSelectedProducts(selectedProducts.map(p =>
                p.id === productId ? { ...p, quantity: p.quantity + 1 } : p
            ))
        } else {
            setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }])
        }
    }

    const handleFinish = async () => {
        if (!confirm(`Confirmar pagamento de ${formatCurrency(totalAmount)}?`)) return

        setLoading(true)
        try {
            await finishCheckout(
                appointment.id,
                paymentMethod,
                totalAmount,
                selectedProducts.map(p => ({ productId: p.id, quantity: p.quantity, price: Number(p.price) }))
            )
        } catch (error) {
            alert("Erro ao finalizar: " + error)
            setLoading(false)
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
                {/* Detalhes do Agendamento */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detalhes do Agendamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Cliente</span>
                            <span className="font-medium">{appointment.customer.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Barbeiro</span>
                            <span className="font-medium">{appointment.barber.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Data</span>
                            <span className="font-medium">{new Date(appointment.date).toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Adicionar Produtos */}
                <Card>
                    <CardHeader>
                        <CardTitle>Adicionar Produtos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select onValueChange={handleAddProduct}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um produto..." />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map(p => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name} - {formatCurrency(Number(p.price))}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="mt-4 space-y-2">
                            {selectedProducts.map(item => (
                                <div key={item.id} className="flex justify-between items-center text-sm border p-2 rounded">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span>{formatCurrency(Number(item.price) * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                {/* Resumo e Pagamento */}
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        <RadioGroup defaultValue="CASH" onValueChange={setPaymentMethod} className="grid grid-cols-2 gap-4">
                            <div>
                                <RadioGroupItem value="CASH" id="cash" className="peer sr-only" />
                                <Label
                                    htmlFor="cash"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    Dinheiro
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="card" id="card" className="peer sr-only" />
                                <Label
                                    htmlFor="card"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    Cartão
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="pix" id="pix" className="peer sr-only" />
                                <Label
                                    htmlFor="pix"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                    PIX
                                </Label>
                            </div>
                        </RadioGroup>

                        <Separator />

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Serviços</span>
                                <span>{formatCurrency(servicesTotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Produtos</span>
                                <span>{formatCurrency(productsTotal)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                <span>Total a Pagar</span>
                                <span>{formatCurrency(totalAmount)}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" size="lg" onClick={handleFinish} disabled={loading}>
                            {loading ? "Processando..." : "Finalizar Venda"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
