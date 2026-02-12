"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFormStatus } from "react-dom"
import { loginAction } from "@/app/login/actions"
import { useActionState } from "react"

export function LoginForm({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"div">) {
    const [state, formAction] = useActionState(loginAction, null)

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Entre com seu email para acessar o painel
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={formAction}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Senha</Label>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Esqueceu a senha?
                                    </a>
                                </div>
                                <Input id="password" name="password" type="password" required />
                            </div>

                            {state?.error && (
                                <p className="text-sm text-red-500">{state.error}</p>
                            )}

                            <SubmitButton />
                        </div>
                    </form>
                </CardContent>
            </Card>
            <div className="text-center text-sm">
                <span className="text-muted-foreground">Não tem uma conta? </span>
                <a href="/register" className="font-medium text-primary hover:underline">
                    Cadastre sua barbearia
                </a>
            </div>
            <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
                Ao clicar em continuar, você concorda com nossos <a href="#">Termos de Serviço</a>{" "}
                e <a href="#">Política de Privacidade</a>.
            </div>
        </div>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Entrando..." : "Login"}
        </Button>
    )
}
