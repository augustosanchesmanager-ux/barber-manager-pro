import { getProducts, deleteProduct } from "@/app/(app)/produtos/actions"
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
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { NewProductModal } from "@/components/gestao/new-product-modal"
import { Trash2 } from "lucide-react"

export default async function ProdutosPage() {
    const session = await auth()
    const products = await getProducts()
    const isManager = session?.user.role === 'MANAGER'

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Produtos & Estoque</h2>
                {isManager && <NewProductModal />}
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead>Estoque</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.category || '-'}</TableCell>
                                <TableCell>{formatCurrency(Number(product.price))}</TableCell>
                                <TableCell>
                                    <Badge variant={product.quantity < 5 ? 'destructive' : 'secondary'}>
                                        {product.quantity} un
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {isManager && (
                                        <form action={async () => {
                                            'use server'
                                            await deleteProduct(product.id)
                                        }}>
                                            <Button variant="ghost" size="icon" className="text-destructive h-8 w-8">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {products.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                    Nenhum produto cadastrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
