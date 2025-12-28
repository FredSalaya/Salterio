import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { FaFilePdf, FaYoutube, FaSpotify, FaHistory, FaBookOpen } from 'react-icons/fa'

export default function SongDrawer({
    isOpen,
    onClose,
    song
}) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-colors"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Detalles del Canto</h3>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Audio Player Section */}
                            {song.mp3_urls && song.mp3_urls.length > 0 && (
                                <section>
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                                        <FaSpotify className="text-green-500" />
                                        Audio
                                    </h4>
                                    <div className="space-y-3">
                                        {song.mp3_urls.map((url, idx) => (
                                            <audio
                                                key={idx}
                                                controls
                                                className="w-full h-10 rounded-lg"
                                                src={url}
                                            >
                                                Tu navegador no soporta el elemento de audio.
                                            </audio>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Quick Actions */}
                            <section className="grid grid-cols-2 gap-3">
                                {song.pdf && (
                                    <a
                                        href={song.pdf}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium border border-red-100"
                                    >
                                        <FaFilePdf />
                                        Ver PDF
                                    </a>
                                )}
                                {song.youtube_url && (
                                    <a
                                        href={song.youtube_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors font-medium border border-red-100"
                                    >
                                        <FaYoutube />
                                        Ver Video
                                    </a>
                                )}
                            </section>

                            {/* Info Grid */}
                            <section className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100">
                                <div>
                                    <span className="block text-xs text-gray-500 uppercase tracking-wider">Tono Original</span>
                                    <span className="font-bold text-gray-900 text-lg">{song.tono || '—'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-500 uppercase tracking-wider">Autor</span>
                                    <span className="font-medium text-gray-900">{song.autor || 'Desconocido'}</span>
                                </div>
                                {song.version && (
                                    <div className="col-span-2">
                                        <span className="block text-xs text-gray-500 uppercase tracking-wider">Versión</span>
                                        <span className="font-medium text-gray-900">{song.version}</span>
                                    </div>
                                )}
                            </section>

                            {/* Long Text Sections */}
                            {song.historia && (
                                <section>
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                                        <FaHistory className="text-blue-500" />
                                        Historia
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                        {song.historia}
                                    </p>
                                </section>
                            )}

                            {song.fundamento_biblico && (
                                <section>
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                                        <FaBookOpen className="text-amber-500" />
                                        Fundamento Bíblico
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-amber-50 p-4 rounded-xl border border-amber-100 italic">
                                        "{song.fundamento_biblico}"
                                    </p>
                                </section>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
