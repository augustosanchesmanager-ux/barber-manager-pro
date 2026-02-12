'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createExpense } from "@/app/(app)/despesas/actions"
import { Plus } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function NewExpenseModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        const amount = Number(formData.get('amount'))
        const description = formData.get('description') as string
        const category = formData.get('category') as string
        const paymentMethod = formData.get('paymentMethod') as string
        const dateInput = formData.get('date') as string

        try {
            await createExpense({
                amount,
                description,
                category,
                paymentMethod,
                date: dateInput ? new Date(dateInput) : new Date()
            })
            setOpen(false)
        } catch (e) {
            alert("Erro ao salvar despesa")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Despesa
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form action={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Registrar Nova Saída</DialogTitle>
                        <DialogDescription>
                            Insira os detalhes do gasto para controle financeiro.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Input id="description" name="description" placeholder="Ex: Conta de Luz, Aluguel, Compra de Toalhas" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="amount">Valor (R$)</Label>
                                <Input id="amount" name="amount" type="number" step="0.01" required placeholder="0,00" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category">Categoria</Label>
                                <Select name="category" defaultValue="VARIABLE">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FIXED">Fixo</SelectItem>
                                        <SelectItem value="VARIABLE">Variável</SelectItem>
                                        <SelectItem value="PERSONAL">Pessoal</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                                <Select name="paymentMethod" defaultValue="CASH">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASH">Dinheiro (Caixa)</SelectItem>
                                        <SelectItem value="PIX">PIX</SelectItem>
                                        <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                                        <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">Data do Pagamento</Label>
                                <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={loading}>
                            {loading ? "Salvando..." : "Registrar Saída"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
