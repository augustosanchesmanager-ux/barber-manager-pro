'use client'

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, DollarSign, Wallet } from "lucide-react"
import { upsertAppointment } from "@/app/(app)/agenda/actions"
import { format } from "date-fns"

interface AppointmentModalProps {
    services: Array<{ id: string; name: string; price: number }>
    team: Array<{ id: string; name: string }>
    customers?: Array<{ id: string; name: string }>
    selectedDate?: Date
    appointment?: {
        id: string;
        date: string;
        customerId: string;
        barberId: string;
        paymentStatus: string;
        paymentMethod?: string | null;
        totalPrice: number;
        services?: Array<{ serviceId: string }>;
    }
    onSuccess: () => void
    trigger?: React.ReactNode
}

export function AppointmentModal({ services, team, customers, selectedDate, appointment, onSuccess, trigger }: AppointmentModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedServiceId, setSelectedServiceId] = useState(appointment?.services?.[0]?.serviceId || "")
    const [price, setPrice] = useState(appointment ? Number(appointment.totalPrice).toString() : "")
    const [paymentStatus, setPaymentStatus] = useState(appointment?.paymentStatus || "PENDING")

    // Atualizar preço quando serviço muda na criação
    useEffect(() => {
        if (!appointment && selectedServiceId) {
            const service = services.find(s => s.id === selectedServiceId)
            if (service) setPrice(Number(service.price).toString())
        }
    }, [selectedServiceId, services, appointment])

    const defaultDateStr = appointment
        ? format(new Date(appointment.date), 'yyyy-MM-dd')
        : (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '')

    const defaultTimeStr = appointment
        ? format(new Date(appointment.date), 'HH:mm')
        : ''

    async function onSubmit(formData: FormData) {
        setLoading(true)
        try {
            await upsertAppointment(formData)
            setOpen(false)
            onSuccess()
        } catch (e) {
            alert('Erro ao processar agendamento: ' + e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Agendamento
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{appointment ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
                    <DialogDescription>
                        Gerencie os detalhes do atendimento e pagamento.
                    </DialogDescription>
                </DialogHeader>

                <form action={onSubmit} className="grid gap-5 py-4">
                    {appointment && <input type="hidden" name="id" value={appointment.id} />}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Data</Label>
                            <Input id="date" name="date" type="date" defaultValue={defaultDateStr} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Hora</Label>
                            <Input id="time" name="time" type="time" defaultValue={defaultTimeStr} step="1800" required />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Cliente</Label>
                        <Select
                            defaultValue={appointment?.customerId}
                            onValueChange={(val) => {
                                const input = document.getElementById('customerId') as HTMLInputElement
                                const nameInput = document.getElementById('customerName') as HTMLInputElement
                                if (val === 'NEW') {
                                    input.value = ''
                                    nameInput.value = ''
                                    nameInput.focus()
                                } else {
                                    input.value = val
                                    nameInput.value = ''
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pesquisar cliente..." />
                            </SelectTrigger>
                            <SelectContent>
                                {!appointment && <SelectItem value="NEW" className="font-bold text-primary">+ Novo Cliente (Não cadastrado)</SelectItem>}
                                {customers?.map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Input
                            id="customerName"
                            name="customerName"
                            placeholder="Nome do novo cliente"
                            className={appointment ? "hidden" : "h-8 text-xs mt-2"}
                        />
                        <input type="hidden" name="customerId" id="customerId" defaultValue={appointment?.customerId} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Serviço Principal</Label>
                            <Select
                                name="serviceId"
                                defaultValue={selectedServiceId}
                                onValueChange={setSelectedServiceId}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Barbeiro</Label>
                            <Select name="barberId" defaultValue={appointment?.barberId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {team.map(u => (
                                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-lg border border-border/50 space-y-4">
                        <div className="flex items-center gap-2 mb-2 text-primary font-bold text-sm">
                            <DollarSign className="h-4 w-4" /> Detalhes Financeiros
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Valor do Serviço (R$)</Label>
                                <Input
                                    name="totalPrice"
                                    type="number"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    className="font-bold text-emerald-600"
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label>Status do Atendimento</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'PENDING', label: 'Pendente', color: 'bg-red-500', border: 'border-red-200', text: 'text-red-700', bg: 'bg-red-50' },
                                        { id: 'WAITING', label: 'Aguardando', color: 'bg-blue-500', border: 'border-blue-200', text: 'text-blue-700', bg: 'bg-blue-50' },
                                        { id: 'PAID', label: 'Concluído', color: 'bg-emerald-500', border: 'border-emerald-200', text: 'text-emerald-700', bg: 'bg-emerald-50' },
                                    ].map((status) => (
                                        <button
                                            key={status.id}
                                            type="button"
                                            onClick={() => setPaymentStatus(status.id)}
                                            className={cn(
                                                "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1.5",
                                                paymentStatus === status.id
                                                    ? `${status.border} ${status.bg} ring-2 ring-primary ring-offset-1`
                                                    : "border-transparent bg-muted/50 hover:bg-muted"
                                            )}
                                        >
                                            <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", status.color)} />
                                            <span className={cn("text-[11px] font-bold uppercase tracking-tight", paymentStatus === status.id ? status.text : "text-muted-foreground")}>
                                                {status.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <input type="hidden" name="paymentStatus" value={paymentStatus} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Wallet className="h-3 w-3" /> Forma de Pagamento
                            </Label>
                            <Select name="paymentMethod" defaultValue={appointment?.paymentMethod || ""}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o método" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">Dinheiro</SelectItem>
                                    <SelectItem value="PIX">PIX</SelectItem>
                                    <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                                    <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Processando..." : (appointment ? "Salvar Alterações" : "Confirmar Agendamento")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
