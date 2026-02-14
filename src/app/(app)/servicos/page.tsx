export const dynamic = 'force-dynamic'

import { getServices, deleteService } from "@/app/(app)/servicos/actions"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { NewServiceModal } from "@/components/gestao/new-service-modal"
import { Trash2 } from "lucide-react"

export default async function ServicosPage() {
    const session = await auth()
    const services = await getServices()
    const isManager = session?.user.role === 'MANAGER'

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Catálogo de Serviços</h2>
                {isManager && <NewServiceModal />}
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Serviço</TableHead>
                            <TableHead>Duração</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services.map((service) => (
                            <TableRow key={service.id}>
                                <TableCell className="font-medium">{service.name}</TableCell>
                                <TableCell>{service.duration} min</TableCell>
                                <TableCell>{formatCurrency(Number(service.price))}</TableCell>
                                <TableCell>
                                    {isManager && (
                                        <form action={async () => {
                                            'use server'
                                            await deleteService(service.id)
                                        }}>
                                            <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {services.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                    Nenhum serviço cadastrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
