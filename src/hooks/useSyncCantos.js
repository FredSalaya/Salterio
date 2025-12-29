import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import supabase from '../lib/supabase';
import { isPWA } from '../utils/pwaEnv';

const SYNC_INTERVAL = 1000 * 60 * 5; // 5 minutos

export function useSyncCantos() {
    const [status, setStatus] = useState('idle'); // idle, syncing, error
    const [lastSyncTime, setLastSyncTime] = useState(null);

    useEffect(() => {
        // [ADAPTIVE STRATEGY]
        // Si NO es PWA, no saturamos el dispositivo con descargas masivas.
        // El usuario web usará fetch directo (SSR/Client) bajo demanda.
        // EXCEPCIÓN: En modo DEV siempre permitimos sync para testear.
        if (!isPWA() && !import.meta.env.DEV) {
            console.log("Web Mode detected: Background sync disabled.");
            return;
        }

        setLastSyncTime(localStorage.getItem('last_sync_timestamp'));

        const sync = async () => {
            try {
                setStatus('syncing');
                // 1. Obtener última sincronización
                const lastSync = localStorage.getItem('last_sync_timestamp');

                // 2. Query a Supabase
                let query = supabase.from('cantos').select('id, titulo, tono, autor, version, cuerpo, historia, pdf, fundamento_biblico, youtube_url, mp3_urls, creado_en');

                if (lastSync) {
                    query = query.gt('creado_en', lastSync);
                }

                const { data, error } = await query;

                if (error) {
                    console.error('Error syncing:', error);
                    setStatus('error');
                    return;
                }

                if (data && data.length > 0) {
                    // 3. Guardar en local
                    await db.cantos.bulkPut(data);
                    console.log(`Synced ${data.length} songs`);
                }

                // Actualizar timestamp
                const now = new Date().toISOString();
                localStorage.setItem('last_sync_timestamp', now);
                setLastSyncTime(now);
                setStatus('idle');

            } catch (err) {
                console.error('Sync failed:', err);
                setStatus('error');
            }
        };

        // Ejecutar al montar
        sync();

        // Loop de sync
        const interval = setInterval(() => {
            if (navigator.onLine) sync();
        }, SYNC_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    return { status, lastSync: lastSyncTime };
}
