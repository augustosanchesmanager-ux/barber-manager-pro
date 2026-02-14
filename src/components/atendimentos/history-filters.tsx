'use client'

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Calendar, Users } from "lucide-react"

interface HistoryFiltersProps {
    team: Array<{ id: string; name: string }>
}

export function HistoryFilters({ team }: HistoryFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [startDate, setStartDate] = useState(searchParams.get('startDate') || '')
    const [endDate, setEndDate] = useState(searchParams.get('endDate') || '')
    const [barberId, setBarberId] = useState(searchParams.get('barberId') || 'ALL')

    function handleFilter() {
        const params = new URLSearchParams()
        if (startDate) params.set('startDate', startDate)
        if (endDate) params.set('endDate', endDate)
        if (barberId && barberId !== 'ALL') params.set('barberId', barberId)

        router.push(`/atendimentos?${params.toString()}`)
    }

    function handleClear() {
        setStartDate('')
        setEndDate('')
        setBarberId('ALL')
        router.push('/atendimentos')
    }

    return (
        <div className="flex flex-col md:flex-row items-end gap-4 bg-muted/20 p-4 rounded-xl border border-border/50 mb-6">
            <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Início
                </Label>
                <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-[160px]"
                />
            </div>
            <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Fim
                </Label>
                <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-[160px]"
                />
            </div>
            <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" /> Barbeiro
                </Label>
                <Select value={barberId} onValueChange={setBarberId}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos os Barbeiros</SelectItem>
                        {team.map(b => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex gap-2">
                <Button onClick={handleFilter} className="gap-2">
                    <Filter className="h-4 w-4" /> Filtrar
                </Button>
                <Button variant="outline" onClick={handleClear}>
                    Limpar
                </Button>
            </div>
        </div>
    )
}
