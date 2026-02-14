export const dynamic = 'force-dynamic'

import { AgendaView } from "@/components/agenda/agenda-view"
import { getBarbershopServices, getBarbershopTeam, getBarbershopCustomers } from "@/app/(app)/agenda/actions"
import { auth } from "@/auth"

export default async function AgendaPage() {
    const session = await auth()

    // Buscar dados iniciais para os modais e filtros
    const [services, team, customers] = await Promise.all([
        getBarbershopServices(),
        getBarbershopTeam(),
        getBarbershopCustomers()
    ])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Agenda</h2>
            </div>

            <AgendaView
                initialServices={services}
                initialTeam={team}
                initialCustomers={customers}
                userRole={session?.user?.role} // Passar role para controle de UI
            />
        </div>
    )
}
