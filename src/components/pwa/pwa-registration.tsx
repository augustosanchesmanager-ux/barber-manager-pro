'use client'

import { useEffect } from 'react'

export function PWARegistration() {
    useEffect(() => {
        if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').then((registration) => {
                    console.log('SW registrado com sucesso:', registration.scope);
                }, (err) => {
                    console.log('Falha ao registrar SW:', err);
                });
            });
        }
    }, [])

    return null
}
