'use client'

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"

export function ReportFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [start, setStart] = useState(searchParams.get('start') || "")
    const [end, setEnd] = useState(searchParams.get('end') || "")

    function handleFilter() {
        const params = new URLSearchParams()
        if (start) params.set('start', start)
        if (end) params.set('end', end)

        router.push(`/financeiro?${params.toString()}`)
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="grid gap-2 w-full md:w-auto">
                <Label htmlFor="start">Data Início</Label>
                <Input
                    id="start"
                    type="date"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                />
            </div>
            <div className="grid gap-2 w-full md:w-auto">
                <Label htmlFor="end">Data Fim</Label>
                <Input
                    id="end"
                    type="date"
                    value={end}
                    onChange={(e) => setEnd(e.target.value)}
                />
            </div>
            <Button onClick={handleFilter} className="w-full md:w-auto">
                <Search className="mr-2 h-4 w-4" />
                Filtrar
            </Button>
            <Button
                variant="outline"
                onClick={() => {
                    setStart("")
                    setEnd("")
                    router.push('/financeiro')
                }}
                className="w-full md:w-auto"
            >
                Limpar
            </Button>
        </div>
    )
}
