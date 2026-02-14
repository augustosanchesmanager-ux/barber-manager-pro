export const dynamic = 'force-dynamic'

import { getTeam, deleteTeamMember } from "./actions"
import { MemberModal } from "@/components/equipe/member-modal"
import { auth } from "@/auth"
import { Trash2, Shield, User, Mail, Calendar, Edit2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"

export default async function EquipePage() {
    const team = await getTeam()
    const session = await auth()
    const isManager = session?.user?.role === 'MANAGER'

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Equipe</h2>
                    <p className="text-muted-foreground">Gerencie os operadores e barbeiros da sua unidade.</p>
                </div>
                {isManager && <MemberModal />}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {team.map((member) => (
                    <div key={member.id} className="bg-card rounded-xl border p-6 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${member.role === 'MANAGER' ? 'bg-primary/10' : 'bg-muted'}`}>
                                        {member.role === 'MANAGER' ?
                                            <Shield className="h-6 w-6 text-primary" /> :
                                            <User className="h-6 w-6 text-muted-foreground" />
                                        }
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">{member.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${member.role === 'MANAGER' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                {member.role === 'MANAGER' ? 'Gestor' : 'Barbeiro'}
                                            </span>

                                            {isManager && (
                                                <MemberModal
                                                    member={member}
                                                    trigger={
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/5">
                                                            <Edit2 className="h-3 w-3" />
                                                        </Button>
                                                    }
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-foreground/80 mt-4">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    {member.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    Entrou em: {format(new Date(member.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                                </div>
                            </div>
                        </div>

                        {isManager && member.id !== session?.user?.id && (
                            <form action={async () => {
                                'use server'
                                await deleteTeamMember(member.id)
                            }} className="mt-6 pt-4 border-t">
                                <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 gap-2 h-9">
                                    <Trash2 className="h-4 w-4" />
                                    Remover Acesso
                                </Button>
                            </form>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
