import { useEffect } from 'react';
import { db } from '../lib/db';
import supabase from '../lib/supabase';

const SYNC_INTERVAL = 1000 * 60 * 5; // 5 minutos

export function useSyncCantos() {
    useEffect(() => {
        const sync = async () => {
            try {
                // 1. Obtener última sincronización
                const lastSync = localStorage.getItem('last_sync_timestamp');

                // 2. Query a Supabase (buscar nuevos o actualizados)
                // Nota: Si no existe 'updated_at' en tu DB, usaremos 'creado_en' como fallback
                // Idealmente deberías agregar 'updated_at' a tu tabla 'cantos'
                let query = supabase.from('cantos').select('*');

                if (lastSync) {
                    query = query.gt('creado_en', lastSync);
                }

                const { data, error } = await query;

                if (error) {
                    console.error('Error syncing:', error);
                    return;
                }

                if (data && data.length > 0) {
                    // 3. Guardar en local
                    await db.cantos.bulkPut(data);
                    console.log(`Synced ${data.length} songs`);
                }

                // Actualizar timestamp
                localStorage.setItem('last_sync_timestamp', new Date().toISOString());

            } catch (err) {
                console.error('Sync failed:', err);
            }
        };

        // Ejecutar al montar
        sync();

        // Loop de sync (si está online)
        const interval = setInterval(() => {
            if (navigator.onLine) sync();
        }, SYNC_INTERVAL);

        return () => clearInterval(interval);
    }, []);
}
