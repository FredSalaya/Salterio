import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { isPWA } from '../utils/pwaEnv';
import { useState, useEffect } from 'react';

/**
 * Facade Hook para obtener datos de cantos.
 * @param {Object} initialData - Datos que vienen del servidor (SSR)
 * @param {string} id - ID del canto (opcional, si es para detalle)
 * @returns {Object} El canto (o lista) final a renderizar
 */
export function useCanto(initialData, id) {
    // Estado para detectar PWA (ya que isPWA() puede cambiar o necesitar window)
    const [isApp, setIsApp] = useState(false);

    useEffect(() => {
        setIsApp(isPWA());
    }, []);

    // 1. Escenario PWA: Intentamos leer de Dexie
    const localData = useLiveQuery(
        () => {
            if (!isApp || !id) return undefined;
            return db.cantos.get(id);
        },
        [id, isApp]
    );

    // 2. Selección de Fuente
    // Si estamos en app Y tenemos dato local, úsalo. Si no, fallback al server data.
    if (isApp && localData) {
        return localData;
    }

    // Escenario Web: Usamos lo que vino por props (fetch directo o SSR)
    return initialData;
}
