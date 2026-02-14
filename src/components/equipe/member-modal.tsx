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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { UserPlus, Shield, User as UserIcon } from "lucide-react"
import { upsertTeamMember } from "@/app/(app)/equipe/actions"

interface MemberModalProps {
    member?: {
        id: string;
        name: string;
        email: string;
        role: string;
    }
    trigger?: React.ReactNode
}

export function MemberModal({ member, trigger }: MemberModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        try {
            const result = await upsertTeamMember(formData)
            if (result.success) {
                setOpen(false)
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : 'Erro desconhecido'
            alert(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Novo Operador
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{member ? "Editar Membro" : "Cadastrar na Equipe"}</DialogTitle>
                    <DialogDescription>
                        {member ? "Atualize os dados e a função do colaborador." : "Crie um acesso para um novo barbeiro ou gestor."}
                    </DialogDescription>
                </DialogHeader>

                <form action={handleSubmit} className="grid gap-4 py-4">
                    {member && <input type="hidden" name="id" value={member.id} />}

                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input id="name" name="name" defaultValue={member?.name} placeholder="Ex: Lucas Barbeiro" required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">E-mail (Login)</Label>
                        <Input id="email" name="email" type="email" defaultValue={member?.email} placeholder="lucas@barbearia.com" required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            {member ? "Alterar Senha (Deixe em branco para manter)" : "Senha Inicial"}
                        </Label>
                        <Input id="password" name="password" type="password" placeholder="******" required={!member} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role">Cargo / Permissão</Label>
                        <Select name="role" defaultValue={member?.role || "BARBER"}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a função" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BARBER">
                                    <div className="flex items-center gap-2">
                                        <UserIcon className="h-4 w-4" />
                                        <span>Barbeiro (Acesso Limitado)</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="MANAGER">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-primary" />
                                        <span>Gestor (Acesso Total)</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Salvando..." : (member ? "Salvar Alterações" : "Cadastrar Operador")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
