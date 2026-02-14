'use client'

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

interface ExportCsvButtonProps {
    data: Array<{ id: string; date: string; description: string; paymentMethod: string; type: string; amount: number }>
}

export function ExportCsvButton({ data }: ExportCsvButtonProps) {
    function exportToCsv() {
        if (data.length === 0) return

        const headers = ["ID", "Data", "Descricao", "Metodo", "Tipo", "Valor"]
        const csvRows = [
            headers.join(','), // Header
            ...data.map(row => {
                const values = [
                    row.id,
                    new Date(row.date).toLocaleDateString(),
                    `"${row.description.replace(/"/g, '""')}"`, // Escape quotes
                    row.paymentMethod,
                    row.type,
                    row.amount.toFixed(2)
                ]
                return values.join(',')
            })
        ]

        const csvString = csvRows.join('\n')
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')

        link.setAttribute('href', url)
        link.setAttribute('download', `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Button onClick={exportToCsv} variant="outline" disabled={data.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
        </Button>
    )
}
