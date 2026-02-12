import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import Link from "next/link"

export default function WaitingApprovalPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-md flex-col gap-6">
                <Card className="text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <Clock className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl">Cadastro Recebido!</CardTitle>
                        <CardDescription>
                            Sua solicitação está em análise.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>
                            Para garantir a segurança e qualidade da plataforma, todas as novas barbearias passam por uma rápida análise da nossa equipe administrativa.
                        </p>
                        <p>
                            Você receberá um e-mail assim que seu acesso for liberado. Isso geralmente acontece em menos de 24 horas.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Button asChild variant="outline">
                            <Link href="/login">Voltar para o Login</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
