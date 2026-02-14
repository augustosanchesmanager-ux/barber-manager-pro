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
import { UserPlus } from "lucide-react"
import { createCustomer, updateCustomer } from "@/app/(app)/clientes/actions"
import { format } from "date-fns"

interface CustomerModalProps {
    customer?: {
        id: string;
        name: string;
        email?: string | null;
        phone?: string | null;
        birthDate?: string | null;
    }
    onSuccess?: () => void
    trigger?: React.ReactNode
}

export function CustomerModal({ customer, onSuccess, trigger }: CustomerModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            const result = customer
                ? await updateCustomer(customer.id, formData)
                : await createCustomer(formData)

            if (result.success) {
                setOpen(false)
                if (onSuccess) onSuccess()
            }
        } catch (e) {
            alert("Erro ao salvar cliente: " + e)
        } finally {
            setLoading(false)
        }
    }

    const defaultBirthDate = customer?.birthDate
        ? format(new Date(customer.birthDate), 'yyyy-MM-dd')
        : ""

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Novo Cliente
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{customer ? "Editar Cliente" : "Cadastrar Cliente"}</DialogTitle>
                    <DialogDescription>
                        {customer
                            ? "Atualize os dados cadastrais do seu cliente."
                            : "Crie um novo cliente/lead no sistema. Informe o máximo de dados possível."
                        }
                    </DialogDescription>
                </DialogHeader>

                <form action={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Ex: João Silva"
                            defaultValue={customer?.name}
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="joao@email.com"
                            defaultValue={customer?.email || ""}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Telefone / WhatsApp</Label>
                        <Input
                            id="phone"
                            name="phone"
                            placeholder="(11) 99999-9999"
                            defaultValue={customer?.phone || ""}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="birthDate">Data de Nascimento</Label>
                        <Input
                            id="birthDate"
                            name="birthDate"
                            type="date"
                            defaultValue={defaultBirthDate}
                        />
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Salvando..." : (customer ? "Salvar Alterações" : "Salvar Cliente")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
