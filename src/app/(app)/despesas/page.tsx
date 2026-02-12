import { auth } from "@/auth"
import { getExpenses } from "@/app/(app)/despesas/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { NewExpenseModal } from "@/components/despesas/new-expense-modal"
import { DeleteExpenseButton } from "@/components/despesas/delete-expense-button"
import { TrendingDown } from "lucide-react"

export default async function DespesasPage() {
    const session = await auth()
    const expenses = await getExpenses()
    const isManager = session?.user.role === 'MANAGER'
    const totalMonth = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Despesas (Saídas)</h2>
                    <p className="text-muted-foreground">Gerencie os gastos e saídas de caixa da barbearia</p>
                </div>
                {isManager && <NewExpenseModal />}
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-red-100 bg-red-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-800">Total Pago (Mês)</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-700">{formatCurrency(totalMonth)}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Gastos Recentes</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                {isManager && <TableHead className="w-[50px]"></TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {expenses.map((expense) => (
                                <TableRow key={expense.id}>
                                    <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium">{expense.description}</TableCell>
                                    <TableCell>
                                        <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                            {expense.category === 'FIXED' ? 'Fixo' :
                                                expense.category === 'VARIABLE' ? 'Variável' :
                                                    expense.category === 'PERSONAL' ? 'Pessoal' : 'N/A'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right text-red-600 font-bold">
                                        - {formatCurrency(Number(expense.amount))}
                                    </TableCell>
                                    {isManager && (
                                        <TableCell>
                                            <DeleteExpenseButton id={expense.id} />
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                            {expenses.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={isManager ? 4 : 3} className="text-center py-8 text-muted-foreground">
                                        Nenhuma despesa registrada este mês.
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
