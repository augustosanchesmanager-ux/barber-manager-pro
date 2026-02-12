'use client'

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getDayAppointments, cancelAppointment } from "@/app/(app)/agenda/actions"
import { AppointmentModal } from "./appointment-modal"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Trash2, DollarSign, Filter, Users, Edit2, CheckCircle2, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface AgendaViewProps {
    initialServices: any[]
    initialTeam: any[]
    initialCustomers: any[]
    userRole?: string
}

// Horários de funcionamento (08:00 as 20:00)
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8)

export function AgendaView({ initialServices, initialTeam, initialCustomers, userRole }: AgendaViewProps) {
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [appointments, setAppointments] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedBarber, setSelectedBarber] = useState<string>("ALL")

    const fetchAppointments = async (selectedDate: Date, barberId: string) => {
        setLoading(true)
        try {
            const data = await getDayAppointments(selectedDate, barberId)
            setAppointments(data)
        } catch (error) {
            console.error("Erro ao buscar agendamentos", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (date) {
            fetchAppointments(date, selectedBarber)
        }
    }, [date, selectedBarber])

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return

        try {
            await cancelAppointment(id)
            if (date) fetchAppointments(date, selectedBarber) // Recarregar com filtro
        } catch (error) {
            alert("Erro ao cancelar: " + error)
        }
    }

    const handleSuccess = () => {
        if (date) fetchAppointments(date, selectedBarber)
    }

    return (
        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
            <div className="space-y-4">
                <Card>
                    <CardContent className="p-0">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                            locale={ptBR}
                        />
                    </CardContent>
                </Card>

                <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2 border">
                    <div className="font-semibold mb-2">Legenda</div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Pendente (Em débito)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Aguardando Atendimento</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Pago / Concluído</span>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                    <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        <h3 className="text-xl font-bold tracking-tight">
                            {date ? format(date, "EEEE, d 'de' MMMM", { locale: ptBR }) : "Selecione uma data"}
                        </h3>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-background border border-input px-3 py-1.5 rounded-lg shadow-sm">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                                <SelectTrigger className="w-[180px] border-none shadow-none focus:ring-0 h-8">
                                    <SelectValue placeholder="Filtrar por Barbeiro" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Visão Geral (Todos)</SelectItem>
                                    {initialTeam.map(barber => (
                                        <SelectItem key={barber.id} value={barber.id}>
                                            {barber.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <AppointmentModal
                            services={initialServices}
                            team={initialTeam}
                            customers={initialCustomers}
                            selectedDate={date}
                            onSuccess={handleSuccess}
                        />
                    </div>
                </div>

                <div className="border rounded-xl bg-card bg-white min-h-[500px] shadow-sm overflow-hidden">
                    {HOURS.map(hour => {
                        const hourAppointments = appointments.filter(app => {
                            const appDate = new Date(app.date)
                            return appDate.getHours() === hour && app.status !== 'CANCELLED'
                        })

                        return (
                            <div key={hour} className="flex border-b last:border-0 min-h-[100px] group">
                                <div className="w-20 p-4 border-r bg-muted/5 text-sm text-muted-foreground font-semibold text-center flex items-start justify-center pt-4">
                                    {hour}:00
                                </div>
                                <div className="flex-1 p-2 relative bg-background group-hover:bg-muted/5 transition-colors">
                                    {hourAppointments.map(app => (
                                        <AppointmentModal
                                            key={app.id}
                                            services={initialServices}
                                            team={initialTeam}
                                            customers={initialCustomers}
                                            appointment={app}
                                            onSuccess={handleSuccess}
                                            trigger={
                                                <div
                                                    className={cn(
                                                        "mb-3 p-4 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition-all flex justify-between items-center group/card",
                                                        app.paymentStatus === 'PAID'
                                                            ? "bg-emerald-50/50 border-emerald-200"
                                                            : app.paymentStatus === 'WAITING'
                                                                ? "bg-blue-50/50 border-blue-200"
                                                                : "bg-red-50/50 border-red-200"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "p-2 rounded-full",
                                                            app.paymentStatus === 'PAID' ? "bg-emerald-100" :
                                                                app.paymentStatus === 'WAITING' ? "bg-blue-100" : "bg-red-100"
                                                        )}>
                                                            {app.paymentStatus === 'PAID'
                                                                ? <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                                                : app.paymentStatus === 'WAITING'
                                                                    ? <Users className="h-5 w-5 text-blue-600" />
                                                                    : <Clock className="h-5 w-5 text-red-600" />
                                                            }
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-base">{app.customer.name}</div>
                                                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                                <span className="font-semibold text-foreground/80">
                                                                    {app.services.map((s: any) => s.service.name).join(", ")}
                                                                </span>
                                                                <span>•</span>
                                                                <span className="flex items-center gap-1">
                                                                    <Users className="h-3 w-3" /> {app.barber.name}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right mr-2">
                                                            <div className={cn(
                                                                "font-black text-lg",
                                                                app.paymentStatus === 'PAID' ? "text-emerald-700" :
                                                                    app.paymentStatus === 'WAITING' ? "text-blue-700" : "text-red-700"
                                                            )}>
                                                                R$ {Number(app.totalPrice || 0).toFixed(2)}
                                                            </div>
                                                            <Badge variant={app.paymentStatus === 'PAID' ? 'default' : 'outline'} className={cn(
                                                                "text-[10px] uppercase",
                                                                app.paymentStatus === 'PAID' ? "bg-emerald-600" :
                                                                    app.paymentStatus === 'WAITING' ? "text-blue-600 border-blue-200" : "text-red-600 border-red-200"
                                                            )}>
                                                                {app.paymentStatus === 'PAID' ? 'Pago' :
                                                                    app.paymentStatus === 'WAITING' ? 'Aguardando' : 'Pendente'}
                                                            </Badge>
                                                        </div>

                                                        <div className="flex flex-col gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-primary hover:bg-primary/10"
                                                                title="Editar Agendamento"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            {userRole === 'MANAGER' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                                                    onClick={(e) => handleDelete(e, app.id)}
                                                                    title="Cancelar"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
