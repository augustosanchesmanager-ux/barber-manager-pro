import { auth } from "@/auth"
import { getReportTransactions } from "@/app/(app)/financeiro/actions"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ExportCsvButton } from "@/components/relatorios/export-csv-button"
import { ReportFilters } from "@/components/relatorios/report-filters"
import { Badge } from "@/components/ui/badge"

export default async function FinanceiroPage({
    searchParams,
}: {
    searchParams: { start?: string; end?: string }
}) {
    const transactions = await getReportTransactions(searchParams.start, searchParams.end)
    const total = transactions.reduce((acc, curr) => {
        return acc + (curr.type === 'INCOME' ? curr.amount : -curr.amount)
    }, 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
                <ExportCsvButton data={transactions} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Filtros de Período</CardTitle>
                </CardHeader>
                <CardContent>
                    <ReportFilters />
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Entradas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Saídas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Líquido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${total >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {formatCurrency(total)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Qtd. Transações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{transactions.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Detalhamento de Movimentações</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead>Método</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((t: any) => (
                                <TableRow key={t.id}>
                                    <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={t.type === 'INCOME' ? 'default' : 'destructive'}>
                                            {t.type === 'INCOME' ? 'Entrada' : 'Saída'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{t.description}</TableCell>
                                    <TableCell>
                                        {t.category && (
                                            <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                                {t.category === 'FIXED' ? 'Fixo' :
                                                    t.category === 'VARIABLE' ? 'Variável' :
                                                        t.category === 'PERSONAL' ? 'Pessoal' : '-'}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{t.paymentMethod}</Badge>
                                    </TableCell>
                                    <TableCell className={`text-right font-mono font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(t.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {transactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Nenhuma transação encontrada para este período.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
