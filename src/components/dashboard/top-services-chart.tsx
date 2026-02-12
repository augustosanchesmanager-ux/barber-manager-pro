"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TopServicesChartProps {
    data: { name: string; count: number }[]
}

export function TopServicesChart({ data }: TopServicesChartProps) {
    const maxCount = Math.max(...data.map(d => d.count), 1)

    return (
        <Card className="col-span-3">
            <CardHeader>
                <CardTitle>Serviços mais Populares</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {data.map((item) => (
                        <div key={item.name} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-muted-foreground">{item.count} atendimentos</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary"
                                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                    {data.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Nenhum dado disponível.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
