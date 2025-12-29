import { useEffect, useState } from 'react';
import { db } from '../lib/db';
import supabase from '../lib/supabase';

const SYNC_INTERVAL = 1000 * 60 * 5; // 5 minutos

export function useSyncCantos() {
    const [status, setStatus] = useState('idle'); // idle, syncing, error
    const [lastSyncTime, setLastSyncTime] = useState(null);

    useEffect(() => {
        // [ALWAYS SYNC]
        // Sincronizamos siempre que haya conexión - los textos son ligeros
        // y queremos que el usuario tenga acceso offline sin importar
        // si instaló la PWA o no.

        setLastSyncTime(localStorage.getItem('last_sync_timestamp'));

        const sync = async () => {
            try {
                console.log('[SYNC] Starting sync...');
                setStatus('syncing');

                // 0. Verificar si IndexedDB está vacío (forzar sync completo)
                const localCount = await db.cantos.count();
                console.log('[SYNC] Local records count:', localCount);

                // 1. Obtener última sincronización
                let lastSync = localStorage.getItem('last_sync_timestamp');

                // Si la DB local está vacía, ignoramos el timestamp y forzamos sync completo
                if (localCount === 0) {
                    console.log('[SYNC] IndexedDB is empty! Forcing full sync...');
                    lastSync = null; // Esto ignora el filtro .gt()
                }

                console.log('[SYNC] Last sync timestamp:', lastSync);

                // 2. Query a Supabase
                let query = supabase.from('cantos').select('id, titulo, tono, autor, version, cuerpo, historia, pdf, fundamento_biblico, youtube_url, mp3_urls, creado_en');

                if (lastSync) {
                    query = query.gt('creado_en', lastSync);
                }

                console.log('[SYNC] Fetching from Supabase...');
                const { data, error } = await query;

                if (error) {
                    console.error('[SYNC] Supabase error:', error);
                    setStatus('error');
                    return;
                }

                console.log('[SYNC] Received data:', data ? data.length : 0, 'records');

                if (data && data.length > 0) {
                    // 3. Guardar en local
                    console.log('[SYNC] Writing to IndexedDB...');
                    await db.cantos.bulkPut(data);
                    console.log(`[SYNC] Successfully synced ${data.length} songs to IndexedDB!`);
                } else {
                    console.log('[SYNC] No new data to sync (or already up to date).');
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
