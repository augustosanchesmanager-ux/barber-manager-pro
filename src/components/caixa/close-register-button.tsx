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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { performDailyClose } from "@/app/(app)/caixa/actions"
import { LockKeyhole } from "lucide-react"

export function CloseRegisterButton() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [notes, setNotes] = useState("")

    async function handleClose() {
        if (!confirm("Tem certeza que deseja fechar o caixa hoje? Esta ação é irreversível.")) return

        setLoading(true)
        try {
            await performDailyClose(notes)
            setOpen(false)
        } catch (e) {
            alert('Erro ao fechar caixa: ' + e)
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full" variant="destructive">
                    <LockKeyhole className="mr-2 h-4 w-4" />
                    Fechar Caixa
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Fechar Caixa Diário</DialogTitle>
                    <DialogDescription>
                        Confira os valores antes de fechar. Após o fechamento, não será possível adicionar novas vendas para o dia de hoje neste relatório.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Observações (Opcional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Ex: Diferença de R$ 2,00 no caixa..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button type="submit" variant="destructive" onClick={handleClose} disabled={loading}>
                        {loading ? "Fechando..." : "Confirmar Fechamento"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
