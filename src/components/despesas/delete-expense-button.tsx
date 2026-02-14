'use client'

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteExpense } from "@/app/(app)/despesas/actions"
import { useState } from "react"

export function DeleteExpenseButton({ id }: { id: string }) {
    const [loading, setLoading] = useState(false)

    async function handleDelete() {
        if (!confirm("Tem certeza que deseja excluir este registro de despesa?")) return

        setLoading(true)
        try {
            await deleteExpense(id)
        } catch {
            alert("Erro ao excluir")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-red-600"
            onClick={handleDelete}
            disabled={loading}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
