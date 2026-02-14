import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getAllBarbershops } from "./actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, Calendar } from "lucide-react"

export default async function AdminBarbershopsPage() {
    const session = await auth()

    if (!session || session.user.role !== 'SUPER_ADMIN') {
        redirect('/dashboard')
    }

    const barbershops = await getAllBarbershops()

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Painel Administrativo</h1>
                    <p className="text-muted-foreground">Gerencie todas as barbearias cadastradas no sistema</p>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                    <Building2 className="mr-2 h-4 w-4" />
                    {barbershops.length} Barbearias
                </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Barbearias</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{barbershops.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {barbershops.reduce((acc, b) => acc + b._count.users, 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {barbershops.reduce((acc, b) => acc + b._count.customers, 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Agendamentos</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {barbershops.reduce((acc, b) => acc + b._count.appointments, 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Barbearias Cadastradas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead className="text-center">Usuários</TableHead>
                                <TableHead className="text-center">Clientes</TableHead>
                                <TableHead className="text-center">Agendamentos</TableHead>
                                <TableHead>Cadastro</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {barbershops.map((barbershop) => (
                                <TableRow key={barbershop.id}>
                                    <TableCell className="font-medium">{barbershop.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{barbershop.slug}</Badge>
                                    </TableCell>
                                    <TableCell>{barbershop.phone || '-'}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant={barbershop.planType === 'ENTERPRISE' ? 'default' : barbershop.planType === 'PROFESSIONAL' ? 'secondary' : 'outline'} className="w-fit">
                                                {barbershop.planType}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold">
                                                {barbershop.billingCycle === 'ANNUAL' ? 'Anual (-50%)' : 'Mensal'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">{barbershop._count.users}</TableCell>
                                    <TableCell className="text-center">{barbershop._count.customers}</TableCell>
                                    <TableCell className="text-center">{barbershop._count.appointments}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(barbershop.createdAt).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {barbershops.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Nenhuma barbearia cadastrada ainda.
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
