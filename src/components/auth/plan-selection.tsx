'use client'

import { useState } from "react"
import { Check, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

const plans = [
    {
        id: "BASIC",
        name: "Essencial",
        limit: "1 barbeiro",
        priceMonthly: 59,
        features: ["Agenda Digital", "Gestão de Clientes", "Relatórios Básicos"]
    },
    {
        id: "PROFESSIONAL",
        name: "Profissional",
        limit: "5 barbeiros",
        priceMonthly: 129,
        featured: true,
        features: ["Tudo no Essencial", "Gestão de Produtos", "Controle de Caixa", "Equipe completa"]
    },
    {
        id: "ENTERPRISE",
        name: "Enterprise",
        limit: "30 barbeiros",
        priceMonthly: 299,
        features: ["Tudo no Profissional", "Suporte Prioritário", "Relatórios Avançados", "Multi-unidades (em breve)"]
    }
]

export function PlanSelection() {
    const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY")
    const [selectedPlan, setSelectedPlan] = useState("BASIC")

    const getPrice = (priceMonthly: number) => {
        if (billingCycle === "ANNUAL") {
            // 50% de desconto
            return (priceMonthly / 2).toFixed(2)
        }
        return priceMonthly.toFixed(2)
    }

    return (
        <div className="space-y-6">
            <div className="border-b pb-2 flex items-center justify-between">
                <h3 className="font-semibold text-lg">Escolha seu Plano</h3>
                <div className="flex items-center space-x-2">
                    <Label htmlFor="billing-cycle" className={cn("text-sm", billingCycle === "MONTHLY" ? "font-bold" : "text-muted-foreground")}>Mensal</Label>
                    <Switch
                        id="billing-cycle"
                        checked={billingCycle === "ANNUAL"}
                        onCheckedChange={(checked) => setBillingCycle(checked ? "ANNUAL" : "MONTHLY")}
                    />
                    <Label htmlFor="billing-cycle" className={cn("text-sm", billingCycle === "ANNUAL" ? "font-bold text-emerald-600" : "text-muted-foreground")}>
                        Anual <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1 rounded">-50% OFF</span>
                    </Label>
                </div>
            </div>

            <input type="hidden" name="planType" value={selectedPlan} />
            <input type="hidden" name="billingCycle" value={billingCycle} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={cn(
                            "relative flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer hover:border-primary/50",
                            selectedPlan === plan.id ? "border-primary bg-primary/5 shadow-md" : "border-muted bg-card",
                            plan.featured && selectedPlan !== plan.id ? "border-amber-200" : ""
                        )}
                    >
                        {plan.featured && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                                Mais Popular
                            </div>
                        )}

                        <div className="mb-2">
                            <h4 className="font-bold text-base">{plan.name}</h4>
                            <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                <Info className="h-3 w-3" />
                                {plan.limit}
                            </p>
                        </div>

                        <div className="mb-4">
                            <span className="text-2xl font-black">R$ {getPrice(plan.priceMonthly)}</span>
                            <span className="text-xs text-muted-foreground">/mês</span>
                            {billingCycle === "ANNUAL" && (
                                <p className="text-[10px] text-emerald-600 font-bold">Cobrado anualmente</p>
                            )}
                        </div>

                        <ul className="space-y-2 flex-1">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start text-[11px] gap-2">
                                    <Check className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        {selectedPlan === plan.id && (
                            <div className="absolute top-2 right-2">
                                <Check className="h-5 w-5 text-primary" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
