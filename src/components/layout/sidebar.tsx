'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
    Calendar,
    CreditCard,
    Home,
    LayoutDashboard,
    Menu,
    Package,
    BarChart3,
    Scissors,
    Settings,
    TrendingDown,
    Users,
    Wallet,
} from 'lucide-react'
import { useState } from 'react'

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    session?: any
}

export function Sidebar({ className, session }: SidebarProps) {
    const pathname = usePathname()
    const userRole = session?.user?.role

    const topRoutes = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: '/dashboard',
            color: 'text-sky-500',
        },
    ]

    const adminRoutes = [
        {
            label: 'Solicitações',
            icon: Users,
            href: '/admin/requests',
            color: 'text-amber-600',
        },
        {
            label: 'Barbearias',
            icon: Home,
            href: '/admin/barbershops',
            color: 'text-blue-600',
        },
    ]

    const atendimentoRoutes = [
        {
            label: 'Agenda',
            icon: Calendar,
            href: '/agenda',
            color: 'text-violet-500',
        },
        {
            label: 'Atendimento',
            icon: Scissors,
            href: '/atendimentos',
            color: 'text-pink-700',
        },
        {
            label: 'Clientes',
            icon: Users,
            href: '/clientes',
            color: 'text-orange-700',
        },
        {
            label: 'Caixa',
            icon: Wallet,
            href: '/caixa',
            color: 'text-zinc-500',
        },
    ]

    const registrationRoutes = [
        {
            label: 'Equipe',
            icon: Users,
            href: '/equipe',
            color: 'text-yellow-600',
        },
        {
            label: 'Serviços',
            icon: Scissors,
            href: '/servicos',
            color: 'text-pink-600',
        },
        {
            label: 'Produtos',
            icon: Package,
            href: '/produtos',
            color: 'text-emerald-500',
        },
    ]

    const reportRoutes = [
        {
            label: 'Financeiro',
            icon: CreditCard,
            href: '/financeiro',
            color: 'text-green-700',
        },
        {
            label: 'Despesas (Saídas)',
            icon: TrendingDown,
            href: '/despesas',
            color: 'text-red-500',
        },
    ]

    const configRoutes = [
        {
            label: 'Configurações',
            icon: Settings,
            href: '/configuracoes',
        },
    ]

    const RenderRoutes = (items: any[], title?: string) => (
        <div className="mb-4">
            {title && (
                <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight text-muted-foreground uppercase opacity-70">
                    {title}
                </h2>
            )}
            <div className="space-y-1">
                {items.map((route) => (
                    <Button
                        key={route.href}
                        variant={pathname === route.href ? 'secondary' : 'ghost'}
                        className="w-full justify-start h-9"
                        asChild
                    >
                        <Link href={route.href}>
                            <div className="flex items-center w-full">
                                <route.icon className={cn('h-5 w-5 mr-3', route.color)} />
                                <span className="font-medium">{route.label}</span>
                            </div>
                        </Link>
                    </Button>
                ))}
            </div>
        </div>
    )

    return (
        <div className={cn('pb-12 border-r bg-card h-full', className)}>
            <ScrollArea className="h-full">
                <div className="space-y-6 py-6">
                    <div className="px-6">
                        <Link href="/dashboard" className="flex items-center gap-3 mb-8 group">
                            <div className="bg-black p-1 rounded-xl border border-amber-500/30 shadow-xl transition-all group-hover:scale-105 group-hover:border-amber-500/50">
                                <img src="/icons/icon-192.png" alt="Logo" className="h-10 w-10 object-contain rounded-lg" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <h1 className="text-xl font-black tracking-tighter leading-none">
                                    BARBER<span className="text-amber-500 italic">PRO</span>
                                </h1>
                                <span className="text-[10px] uppercase font-bold tracking-[0.22em] text-amber-500/90 -mt-0.5 ml-0.5">
                                    Manager
                                </span>
                            </div>
                        </Link>

                        {RenderRoutes(topRoutes, "Início")}
                        {userRole === 'SUPER_ADMIN' && RenderRoutes(adminRoutes, "Painel Admin")}
                        {RenderRoutes(atendimentoRoutes, "Atendimento")}
                        {RenderRoutes(registrationRoutes, "Cadastros")}
                        {RenderRoutes(reportRoutes, "Financeiro & Relatórios")}
                        {RenderRoutes(configRoutes, "Sistema")}
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}

export function MobileSidebar() {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
                <Sidebar />
            </SheetContent>
        </Sheet>
    )
}
