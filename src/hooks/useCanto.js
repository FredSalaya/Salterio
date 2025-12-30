import { useState, useEffect } from 'react';

/**
 * Facade Hook para obtener datos de cantos.
 * Si no hay datos del servidor, busca en el JSON API cacheado.
 * @param {Object} initialData - Datos que vienen del servidor (SSR)
 * @param {string} id - ID del canto
 * @returns {Object} El canto final a renderizar
 */
export function useCanto(initialData, id) {
    const [song, setSong] = useState(initialData);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Si ya tenemos datos completos del servidor, no hacemos nada
        if (initialData?.cuerpo) {
            setSong(initialData);
            return;
        }

        // Si no hay datos o faltan campos importantes, buscamos en el JSON cacheado
        const fetchFromCache = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/songs.json');
                if (!response.ok) throw new Error('Failed to fetch');

                const allSongs = await response.json();
                const found = allSongs.find(s => s.id === id || s.id === parseInt(id));

                if (found) {
                    setSong(found);
                }
            } catch (e) {
                console.error('Error fetching song from cache:', e);
                // Mantener initialData como fallback
            } finally {
                setLoading(false);
            }
        };

        fetchFromCache();
    }, [initialData, id]);

    return song || initialData || { titulo: 'Cargando...', cuerpo: '' };
}

