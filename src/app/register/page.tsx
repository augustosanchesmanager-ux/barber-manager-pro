'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { registerBarbershop } from "./actions"
import Link from "next/link"
import { Scissors } from "lucide-react"
import { PlanSelection } from "@/components/auth/plan-selection"

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 py-12">
            <Card className="w-full max-w-3xl shadow-2xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="bg-black p-2 rounded-2xl border border-amber-500/30 shadow-2xl">
                            <img src="/icons/icon-512.png" alt="Logo" className="h-16 w-16 object-contain" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold">Cadastre sua Barbearia</CardTitle>
                    <CardDescription>
                        Escolha seu plano e gerencie sua barbearia de forma profissional
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={registerBarbershop} className="space-y-8">
                        {/* Dados da Barbearia */}
                        <div className="space-y-4">
                            <div className="border-b pb-2">
                                <h3 className="font-semibold text-lg">Dados da Barbearia</h3>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="barbershopName">Nome da Barbearia *</Label>
                                <Input
                                    id="barbershopName"
                                    name="barbershopName"
                                    placeholder="Ex: Kings Barber Shop"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Telefone</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="address">Endereço</Label>
                                    <Input
                                        id="address"
                                        name="address"
                                        placeholder="Rua Exemplo, 123"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Seleção de Plano */}
                        <PlanSelection />

                        {/* Dados do Gestor */}
                        <div className="space-y-4">
                            <div className="border-b pb-2">
                                <h3 className="font-semibold text-lg">Seus Dados (Primeiro Gestor)</h3>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="managerName">Nome Completo *</Label>
                                <Input
                                    id="managerName"
                                    name="managerName"
                                    placeholder="Seu nome completo"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="managerEmail">E-mail *</Label>
                                <Input
                                    id="managerEmail"
                                    name="managerEmail"
                                    type="email"
                                    placeholder="seu@email.com"
                                    required
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="managerPassword">Senha *</Label>
                                <Input
                                    id="managerPassword"
                                    name="managerPassword"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    minLength={6}
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg">
                            Criar Conta e Aguardar Aprovação
                        </Button>

                        <div className="text-center text-sm text-muted-foreground">
                            Já tem uma conta?{" "}
                            <Link href="/login" className="text-primary hover:underline font-medium">
                                Fazer Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
