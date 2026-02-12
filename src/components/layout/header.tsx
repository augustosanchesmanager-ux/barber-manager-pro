'use client'

import { MobileSidebar } from './sidebar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

import { signOut } from 'next-auth/react'

export function Header({ session }: { session: any }) {
    const user = session?.user

    return (
        <header className="flex h-16 items-center border-b px-4 lg:px-6">
            <MobileSidebar />
            <div className="ml-auto flex items-center space-x-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Bem-vindo, <b>{user?.name?.split(' ')[0] || 'Usuário'}</b></span>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                    {user?.name?.substring(0, 2).toUpperCase() || 'U'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            Perfil
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Configurações
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-red-500 cursor-pointer"
                            onClick={() => signOut({ callbackUrl: '/login' })}
                        >
                            Sair
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
