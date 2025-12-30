// src/hooks/useSongsData.js
// Hook simple para obtener canciones del API con soporte offline automático
// El Service Worker maneja el cache - esto solo hace fetch

import { useState, useEffect } from 'react';

export function useSongsData(initialData = []) {
    const [songs, setSongs] = useState(initialData);
    const [loading, setLoading] = useState(initialData.length === 0);
    const [error, setError] = useState(null);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        // Si ya tenemos datos del servidor (SSR), no re-fetch
        if (initialData.length > 0) {
            setSongs(initialData);
            setLoading(false);
            return;
        }

        const fetchSongs = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/songs.json');

                if (!response.ok) {
                    throw new Error('Failed to fetch songs');
                }

                const data = await response.json();
                setSongs(data);
                setIsOffline(false);
                setError(null);
            } catch (e) {
                console.error('Error fetching songs:', e);
                setError(e.message);
                // Si falla, el SW debería haber servido desde cache
                // Intentamos detectar si estamos offline
                setIsOffline(!navigator.onLine);
            } finally {
                setLoading(false);
            }
        };

        fetchSongs();
    }, [initialData.length]);

    return { songs, loading, error, isOffline };
}
