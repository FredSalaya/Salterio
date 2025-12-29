/**
 * Detecta si la aplicación está corriendo en modo "Standalone" (instalada).
 */
export function isPWA(): boolean {
    if (typeof window === 'undefined') return false;

    // 1. Check standard display-mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // 2. Check iOS standalone
    // @ts-ignore
    const isIOS = window.navigator.standalone === true;

    // 3. Check Android/Chrome heuristic (sometimes useful as fallback)
    // const isAndroid = document.referrer.includes('android-app://');

    return isStandalone || isIOS;
}

/**
 * Hook opcionial para reactividad si cambia el modo (raro, pero posible en desktop)
 */
import { useEffect, useState } from "react";

export function useIsPWA() {
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        setIsStandalone(isPWA());

        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handleChange = (e: MediaQueryListEvent) => setIsStandalone(e.matches);

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return isStandalone;
}
