import { useState, useEffect } from 'react'
import { useCanto } from '../hooks/useCanto'
import BodyViewer from './BodyViewer'
import SongDrawer from './SongDrawer'
import { Bars3BottomRightIcon, CloudIcon } from '@heroicons/react/24/outline'

// Helper para obtener ID de la URL si estamos en modo offline/fallback
function getUrlId() {
    if (typeof window === 'undefined') return null;
    const parts = window.location.pathname.split('/');
    // Asume ruta /music/[id]
    const id = parts[parts.length - 1];
    return isNaN(parseInt(id)) ? null : parseInt(id);
}

export default function SongViewer({ song: initialSong }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    // Si initialSong no tiene ID válido (ej: fallback), intentamos leer de la URL
    const targetId = initialSong?.id || getUrlId();

    // Hook adaptativo
    const song = useCanto(initialSong, targetId)

    // Actualizar título del documento cuando se carga la canción
    useEffect(() => {
        if (song?.titulo && song.titulo !== 'Cargando...') {
            document.title = `${song.titulo} - Salterio`;
        }
    }, [song?.titulo]);

    return (
        <div className="relative min-h-screen pb-24">
            {/* Dynamic Title - Se actualiza cuando carga de cache */}
            {song?.titulo && song.titulo !== 'Cargando...' && (
                <h1 className="text-center py-6 text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    {song.titulo}
                </h1>
            )}

            {/* Main Content: Lyrics & Chords */}
            <div className="transition-all duration-300">
                <BodyViewer raw={song.cuerpo} transport={0} />
            </div>

            {/* Offline/Sync Indicator (Optional) */}
            {/* Source Indicator (Optional logic could go here) */}

            {/* Floating Action Button for Extras */}
            <button
                onClick={() => setIsDrawerOpen(true)}
                className="fixed top-24 right-4 z-30 p-3 bg-white/80 backdrop-blur-md shadow-lg rounded-full 
                           text-gray-600 hover:text-blue-600 hover:scale-110 transition-all border border-gray-100 group"
                title="Ver detalles y opciones"
            >
                <Bars3BottomRightIcon className="w-6 h-6" />
                <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2 py-1 
                                 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 
                                 transition-opacity whitespace-nowrap pointer-events-none">
                    Menú
                </span>
            </button>

            {/* Slide-over Drawer */}
            <SongDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                song={song}
            />
        </div>
    )
}
