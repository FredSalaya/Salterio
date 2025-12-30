/**
 * Hook simple para obtener datos de cantos.
 * @param {Object} initialData - Datos que vienen del servidor (SSR)
 * @returns {Object} El canto a renderizar
 */
export function useCanto(initialData) {
    // Simplemente retornamos los datos del servidor
    return initialData || { titulo: 'Cargando...', cuerpo: '' };
}
