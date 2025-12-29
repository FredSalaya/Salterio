import { useState } from 'react'
import { useCanto } from '../hooks/useCanto'
import BodyViewer from './BodyViewer'
import SongDrawer from './SongDrawer'
import { Bars3BottomRightIcon, CloudIcon } from '@heroicons/react/24/outline'

export default function SongViewer({ song: initialSong }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    // Hook adaptativo: Usa Dexie si es PWA, sino usa initialSong
    const song = useCanto(initialSong, initialSong.id)

    return (
        <div className="relative min-h-screen pb-24">
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
