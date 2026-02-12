import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Verificar autenticação
    const session = await auth()
    if (!session) redirect('/login')

    return (
        <div className="flex h-screen overflow-hidden">
            <div className="hidden md:flex md:w-64 md:flex-col">
                <Sidebar session={session} className="border-r bg-background" />
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                <Header session={session} />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
