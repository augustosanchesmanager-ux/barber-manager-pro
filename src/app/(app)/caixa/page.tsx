import { auth } from "@/auth"
import { getTodayData } from "@/app/(app)/caixa/actions"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CloseRegisterButton } from "@/components/caixa/close-register-button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function CaixaPage() {
    const session = await auth()
    const data = await getTodayData()
    const isManager = session?.user.role === 'MANAGER'

    if (!data) return null

    if (data.status === 'CLOSED') {
        const closed = data.data!
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Caixa Diário</h2>
                    <Badge variant="outline" className="text-green-600 border-green-600">Fechado</Badge>
                </div>

                <Card className="bg-muted/50">
                    <CardHeader>
                        <CardTitle>Resumo do Fechamento - {new Date(closed.date).toLocaleDateString()}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div className="p-4 bg-white rounded-lg shadow-sm">
                                <div className="text-sm text-muted-foreground">Dinheiro</div>
                                <div className="text-xl font-bold text-emerald-600">{formatCurrency(Number(closed.totalCash))}</div>
                            </div>
                            <div className="p-4 bg-white rounded-lg shadow-sm">
                                <div className="text-sm text-muted-foreground">Cartão</div>
                                <div className="text-xl font-bold text-blue-600">{formatCurrency(Number(closed.totalCard))}</div>
                            </div>
                            <div className="p-4 bg-white rounded-lg shadow-sm">
                                <div className="text-sm text-muted-foreground">PIX</div>
                                <div className="text-xl font-bold text-teal-600">{formatCurrency(Number(closed.totalPix))}</div>
                            </div>
                            <div className="p-4 bg-slate-900 text-white rounded-lg shadow-sm">
                                <div className="text-sm text-slate-300">Total Geral</div>
                                <div className="text-xl font-bold">{formatCurrency(Number(closed.totalAmount))}</div>
                            </div>
                        </div>

                        {closed.observations && (
                            <div className="mt-4 p-4 border rounded bg-white">
                                <p className="text-sm font-medium">Observações:</p>
                                <p className="text-muted-foreground">{closed.observations}</p>
                            </div>
                        )}

                        <div className="text-xs text-muted-foreground mt-4">
                            Fechado por: {closed.user.name} em {new Date(closed.createdAt).toLocaleTimeString()}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Caixa ABERTO
    const { summary } = data

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Caixa Diário</h2>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Aberto</Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Resumo Atual */}
                <Card>
                    <CardHeader>
                        <CardTitle>Movimento do Dia</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span>Dinheiro</span>
                            <span className="font-mono font-bold">{formatCurrency(summary!.totalCash)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span>Cartão</span>
                            <span className="font-mono font-bold">{formatCurrency(summary!.totalCard)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span>PIX</span>
                            <span className="font-mono font-bold">{formatCurrency(summary!.totalPix)}</span>
                        </div>
                        <div className="flex justify-between items-center py-4 text-lg bg-muted/20 -mx-6 px-6 mt-4">
                            <span className="font-bold">Total em Caixa</span>
                            <span className="font-mono font-bold text-primary">{formatCurrency(summary!.totalAmount)}</span>
                        </div>
                    </CardContent>
                    {isManager && (
                        <CardFooter>
                            <CloseRegisterButton />
                        </CardFooter>
                    )}
                </Card>

                {/* Últimas Transações */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Hora</TableHead>
                                    <TableHead>Cliente</TableHead>
                                    <TableHead className="text-right">Valor</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {summary!.transactions.map((t: { id: string; createdAt: string; appointment?: { customer: { name: string } } | null; amount: number }) => (
                                    <TableRow key={t.id}>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </TableCell>
                                        <TableCell className="font-medium text-sm">
                                            {t.appointment?.customer.name || "Avulso"}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-sm">
                                            {formatCurrency(Number(t.amount))}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {summary!.transactions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                                            Nenhuma venda hoje.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
