import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getPendingRequests, approveRequest, rejectRequest } from "./actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Check, X, Clock, Building2, Mail, Phone, ArrowLeft } from "lucide-react"

export default async function AdminRequestsPage() {
    const session = await auth()

    if (!session || session.user.role !== 'SUPER_ADMIN') {
        redirect('/dashboard')
    }

    const pendingRequests = await getPendingRequests()

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Solicitações de Acesso</h1>
                        <p className="text-muted-foreground">Aprove ou rejeite novas barbearias que desejam usar o sistema</p>
                    </div>
                </div>
                <Badge variant="secondary" className="px-4 py-1">
                    <Clock className="mr-2 h-4 w-4" />
                    {pendingRequests.length} Pendentes
                </Badge>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Novos Cadastros</CardTitle>
                    <CardDescription>Barbearias aguardando liberação para acessar a plataforma.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Barbearia</TableHead>
                                <TableHead>Responsável</TableHead>
                                <TableHead>Contato</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pendingRequests.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                {request.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground ml-6">{request.slug}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm">{request.users[0]?.name || 'N/A'}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-xs space-y-1">
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {request.users[0]?.email}
                                            </span>
                                            {request.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {request.phone}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant="outline" className="w-fit">
                                                {request.planType}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold">
                                                {request.billingCycle === 'ANNUAL' ? 'Anual' : 'Mensal'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm text-muted-foreground">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <form action={approveRequest.bind(null, request.id)}>
                                                <Button size="sm" variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Aprovar
                                                </Button>
                                            </form>
                                            <form action={rejectRequest.bind(null, request.id)}>
                                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                                    <X className="h-4 w-4 mr-1" />
                                                    Recusar
                                                </Button>
                                            </form>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {pendingRequests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                        Nenhuma solicitação pendente no momento.
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
