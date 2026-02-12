import { getCustomers, deleteCustomer } from "./actions"
import { CustomerModal } from "@/components/clientes/customer-modal"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Mail, Phone, Calendar as CalendarIcon, User, Edit2, Trash2 } from "lucide-react"

export default async function ClientesPage() {
    const customers = await getCustomers()

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
                    <p className="text-muted-foreground">Gerencie seus clientes e capte novos leads.</p>
                </div>
                <CustomerModal />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {customers.map((customer) => (
                    <div key={customer.id} className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <User className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">{customer.name}</h3>
                                    <p className="text-xs text-muted-foreground">Desde: {format(new Date(customer.createdAt), 'dd MMM yyyy', { locale: ptBR })}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <CustomerModal
                                    customer={customer}
                                    trigger={
                                        <button className="p-1.5 hover:bg-muted rounded-md text-primary transition-colors" title="Editar">
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                    }
                                />
                                <button
                                    onClick={async () => {
                                        if (confirm(`Tem certeza que deseja excluir ${customer.name}?`)) {
                                            await deleteCustomer(customer.id)
                                        }
                                    }}
                                    className="p-1.5 hover:bg-muted rounded-md text-destructive transition-colors"
                                    title="Excluir"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-foreground/80">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                {customer.email || "Sem e-mail cadastrado"}
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {customer.phone || "Sem telefone"}
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                {customer.birthDate
                                    ? format(new Date(customer.birthDate), "dd 'de' MMMM", { locale: ptBR })
                                    : "Data de nascimento não informada"}
                            </div>
                        </div>

                        {customer.email && (
                            <div className="mt-4 pt-4 border-t">
                                <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase py-0.5 px-2 rounded-full">
                                    Lead Ativo
                                </span>
                            </div>
                        )}
                    </div>
                ))}

                {customers.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                        Nenhum cliente cadastrado ainda. Comece adicionando o primeiro!
                    </div>
                )}
            </div>
        </div>
    )
}
