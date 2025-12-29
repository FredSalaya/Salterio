import { useState, useEffect } from 'react';

const CACHE_NAME = 'user-assets';

/**
 * Hook para gestionar la descaga/cacheo manual de archivos estáticos.
 */
export function useAssetCache(url) {
    const [status, setStatus] = useState('idle'); // idle, checking, cached, downloading, error
    const [isCached, setIsCached] = useState(false);

    // 1. Verificar si ya existe en cache al montar
    useEffect(() => {
        if (!url) return;

        const checkCache = async () => {
            try {
                setStatus('checking');
                const cache = await caches.open(CACHE_NAME);
                const response = await cache.match(url);
                if (response) {
                    setIsCached(true);
                    setStatus('cached');
                } else {
                    setStatus('idle');
                }
            } catch (e) {
                console.error(e);
                setStatus('idle');
            }
        };
        checkCache();
    }, [url]);

    // 2. Acción para descargar
    const cacheAsset = async () => {
        if (!url) return;
        try {
            setStatus('downloading');
            const cache = await caches.open(CACHE_NAME);
            await cache.add(url);
            setIsCached(true);
            setStatus('cached');
        } catch (e) {
            console.error("Error caching asset:", e);
            setStatus('error');
        }
    };

    return { status, isCached, cacheAsset };
}
