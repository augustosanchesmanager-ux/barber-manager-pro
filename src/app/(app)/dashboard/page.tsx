import { auth } from "@/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardMetrics } from "@/app/(app)/dashboard/actions"
import { formatCurrency } from "@/lib/utils"
import { CalendarDays, DollarSign, Users, TrendingDown } from "lucide-react"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { TopServicesChart } from "@/components/dashboard/top-services-chart"

export default async function DashboardPage() {
    const session = await auth()
    const metrics = await getDashboardMetrics()

    if (!metrics) return null

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    {session?.user && (
                        <p className="text-muted-foreground">
                            Bem-vindo de volta, {session.user.name ?? "Usuário"}!
                        </p>
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Faturamento Bruto Hoje</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(metrics.grossRevenueToday)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Entradas totais de hoje
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saldo Líquido Hoje</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metrics.revenueToday >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {formatCurrency(metrics.revenueToday)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Entradas - despesas hoje
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lucro Líquido Mês</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${metrics.revenueMonth >= 0 ? "text-emerald-600" : "text-red-900"}`}>
                            {formatCurrency(metrics.revenueMonth)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Acumulado líquido do mês
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saídas Hoje</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(metrics.expensesToday)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Total de despesas hoje
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {metrics.appointmentsCount}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Para hoje
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Agendamentos do Dia (Destaque) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        Agendamentos de Hoje
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {metrics.todayAppointments.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
                                Nenhum agendamento para hoje.
                            </p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {metrics.todayAppointments.map((app: any) => (
                                    <div key={app.id} className="flex flex-col p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-lg font-bold">
                                                {new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${app.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {app.paymentStatus === 'PAID' ? 'Pago' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium text-primary">{app.customer.name}</p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Users className="h-3 w-3" />
                                                Barbeiro: {app.barber.name}
                                            </p>
                                            <div className="pt-2 flex flex-wrap gap-1">
                                                {app.services.map((s: any) => (
                                                    <span key={s.id} className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                                                        {s.service.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="mt-auto pt-4 flex justify-between items-center border-t">
                                            <span className="text-sm font-semibold">{formatCurrency(Number(app.totalPrice))}</span>
                                            <a href={`/atendimentos/${app.id}/checkout`} className="text-xs text-blue-600 hover:underline">
                                                Ver detalhes
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Gráficos e Rankings */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <RevenueChart data={metrics.revenueByDay} />
                <TopServicesChart data={metrics.topServices} />
            </div>

            {/* Próximos Agendamentos (Omitido ou integrado acima se preferir, mantendo para históricos futuros se sobrar) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Agendamentos Futuros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {metrics.nextAppointments.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    Nenhum agendamento futuro.
                                </p>
                            ) : (
                                metrics.nextAppointments.map((app: any) => (
                                    <div key={app.id} className="flex items-center">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">{app.customer.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(app.date).toLocaleString('pt-BR')}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium text-sm">
                                            {formatCurrency(Number(app.totalPrice))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
