import { auth } from "@/auth"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { getAtendimentosHistory } from "./actions"
import { getBarbershopTeam } from "@/app/(app)/agenda/actions"
import { HistoryFilters } from "@/components/atendimentos/history-filters"

export default async function AtendimentosPage(props: {
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const searchParams = await props.searchParams
    const session = await auth()

    const startDate = searchParams.startDate
    const endDate = searchParams.endDate
    const barberId = searchParams.barberId

    const [appointments, team] = await Promise.all([
        getAtendimentosHistory(startDate, endDate, barberId),
        getBarbershopTeam()
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Histórico de Atendimentos</h2>
            </div>

            <HistoryFilters team={team} />

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="bg-muted/50 border-b">
                            <tr>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Data</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Cliente</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Barbeiro</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Serviços</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Total</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {appointments.map(app => (
                                <tr key={app.id} className="transition-colors hover:bg-muted/30">
                                    <td className="p-4 align-middle font-medium">
                                        {new Date(app.date).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </td>
                                    <td className="p-4 align-middle">{app.customer.name}</td>
                                    <td className="p-4 align-middle">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-primary" />
                                            {app.barber.name}
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-muted-foreground">
                                        {app.services.map(s => s.service.name).join(", ")}
                                    </td>
                                    <td className="p-4 align-middle font-bold text-emerald-600">
                                        {formatCurrency(Number(app.totalPrice))}
                                    </td>
                                    <td className="p-4 align-middle">
                                        <Badge variant={app.status === 'COMPLETED' ? 'default' : 'destructive'} className="rounded-md px-2 py-0.5">
                                            {app.status === 'COMPLETED' ? 'Pago' : 'Cancelado'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                            {appointments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="h-24 text-center text-muted-foreground italic">
                                        Nenhum atendimento encontrado para o filtro selecionado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
