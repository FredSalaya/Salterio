// src/components/AudioPlayer.jsx
import { useState, useEffect, useRef } from 'react'
import {
    PlayIcon,
    PauseIcon,
    BackwardIcon,
    ForwardIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
} from '@heroicons/react/24/solid'
import { MusicalNoteIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

// Formatear tiempo en mm:ss
function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function AudioPlayer({
    mp3_urls = [],
    title = 'Sin título',
    author = 'Desconocido',
    showTitle = true
}) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isVisible, setIsVisible] = useState(false)

    const audioRef = useRef(null)
    const progressRef = useRef(null)

    const hasAudio = mp3_urls && mp3_urls.length > 0

    // Cargar volumen del localStorage
    useEffect(() => {
        const storedVolume = localStorage.getItem('salterio_volume')
        if (storedVolume) {
            setVolume(parseFloat(storedVolume))
        }
    }, [])

    // Guardar volumen cuando cambie
    useEffect(() => {
        localStorage.setItem('salterio_volume', volume.toString())
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume
        }
    }, [volume, isMuted])

    // Manejar eventos del audio
    useEffect(() => {
        if (!audioRef.current) return

        const audio = audioRef.current

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
        const handleLoadedMetadata = () => {
            setDuration(audio.duration)
            setIsLoading(false)
        }
        const handleEnded = () => setIsPlaying(false)
        const handlePlay = () => setIsPlaying(true)
        const handlePause = () => setIsPlaying(false)
        const handleWaiting = () => setIsLoading(true)
        const handleCanPlay = () => setIsLoading(false)

        audio.addEventListener('timeupdate', handleTimeUpdate)
        audio.addEventListener('loadedmetadata', handleLoadedMetadata)
        audio.addEventListener('ended', handleEnded)
        audio.addEventListener('play', handlePlay)
        audio.addEventListener('pause', handlePause)
        audio.addEventListener('waiting', handleWaiting)
        audio.addEventListener('canplay', handleCanPlay)

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate)
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
            audio.removeEventListener('ended', handleEnded)
            audio.removeEventListener('play', handlePlay)
            audio.removeEventListener('pause', handlePause)
            audio.removeEventListener('waiting', handleWaiting)
            audio.removeEventListener('canplay', handleCanPlay)
        }
    }, [])

    // Reproducir/Pausar
    useEffect(() => {
        if (!audioRef.current) return

        if (isPlaying) {
            audioRef.current.play().catch(e => console.log('Playback error:', e))
        } else {
            audioRef.current.pause()
        }
    }, [isPlaying])

    const handlePlayPause = () => {
        if (!hasAudio) return
        if (!isVisible) {
            setIsVisible(true)
            setIsPlaying(true)
        } else {
            setIsPlaying(!isPlaying)
        }
    }

    const handleProgressClick = (e) => {
        if (!progressRef.current || !audioRef.current || duration === 0) return
        const rect = progressRef.current.getBoundingClientRect()
        const clientX = e.touches ? e.touches[0].clientX : e.clientX
        const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
        const newTime = pos * duration
        audioRef.current.currentTime = newTime
        setCurrentTime(newTime)
    }

    const handleSeek = (delta) => {
        if (!audioRef.current) return
        const newTime = Math.max(0, Math.min(duration, currentTime + delta))
        audioRef.current.currentTime = newTime
        setCurrentTime(newTime)
    }

    const toggleMute = () => {
        setIsMuted(!isMuted)
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? volume : 0
        }
    }

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    if (!hasAudio) return null

    return (
        <>
            {/* Audio Element */}
            <audio
                ref={audioRef}
                src={mp3_urls[0] || ''}
                preload="metadata"
            />

            {/* Botón flotante para mostrar el reproductor */}
            {!isVisible && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={handlePlayPause}
                    className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-2xl hover:scale-110 transition-transform"
                    title="Reproducir audio"
                >
                    <PlayIcon className="w-8 h-8" />
                </motion.button>
            )}

            {/* Premium Sticky Player */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-0 left-0 right-0 z-50"
                    >
                        <div className="mx-auto max-w-4xl px-4 pb-4">
                            <div className="relative bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                                {/* Animated Background */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />

                                {/* Progress Bar */}
                                <div
                                    ref={progressRef}
                                    onClick={handleProgressClick}
                                    onTouchStart={handleProgressClick}
                                    className="absolute top-0 left-0 right-0 h-4 bg-white/20 cursor-pointer group z-10"
                                    style={{ touchAction: 'none' }}
                                >
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 relative pointer-events-none"
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg transition-opacity pointer-events-none" />
                                    </div>
                                </div>

                                <div className="relative p-4 pt-5">
                                    <div className="flex items-center gap-4">
                                        {/* Album Art / Icon */}
                                        <div className="relative flex-shrink-0">
                                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg ${isPlaying ? 'animate-pulse' : ''}`}>
                                                <MusicalNoteIcon className="w-7 h-7 text-white" />
                                            </div>
                                            {isLoading && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Song Info */}
                                        {showTitle && (
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-white truncate text-lg">{title}</h4>
                                                <p className="text-sm text-gray-400 truncate">{author}</p>
                                            </div>
                                        )}

                                        {/* Time Display */}
                                        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 font-mono">
                                            <span>{formatTime(currentTime)}</span>
                                            <span>/</span>
                                            <span>{formatTime(duration)}</span>
                                        </div>

                                        {/* Controls */}
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            {/* Skip Back 10s */}
                                            <button
                                                onClick={() => handleSeek(-10)}
                                                className="p-2 text-gray-400 hover:text-white transition-colors hidden sm:block"
                                                title="Retroceder 10s"
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M12.5 3c4.65 0 8.58 3.03 9.97 7.22l-2.1.77C19.32 7.87 16.18 5.5 12.5 5.5a7.997 7.997 0 00-8 8c0 4.42 3.58 8 8 8 3.69 0 6.83-2.47 7.87-5.85l2.1.77C21.08 19.97 17.15 23 12.5 23c-5.52 0-10-4.48-10-10s4.48-10 10-10z" />
                                                    <text x="9" y="15" fontSize="7" fontWeight="bold">10</text>
                                                </svg>
                                            </button>

                                            {/* Play/Pause */}
                                            <button
                                                onClick={handlePlayPause}
                                                className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                                                title={isPlaying ? 'Pausar' : 'Reproducir'}
                                            >
                                                {isPlaying ? (
                                                    <PauseIcon className="w-6 h-6" />
                                                ) : (
                                                    <PlayIcon className="w-6 h-6" />
                                                )}
                                            </button>

                                            {/* Skip Forward 10s */}
                                            <button
                                                onClick={() => handleSeek(10)}
                                                className="p-2 text-gray-400 hover:text-white transition-colors hidden sm:block"
                                                title="Adelantar 10s"
                                            >
                                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M11.5 3c-4.65 0-8.58 3.03-9.97 7.22l2.1.77C4.68 7.87 7.82 5.5 11.5 5.5a7.997 7.997 0 018 8c0 4.42-3.58 8-8 8-3.69 0-6.83-2.47-7.87-5.85l-2.1.77C2.92 19.97 6.85 23 11.5 23c5.52 0 10-4.48 10-10s-4.48-10-10-10z" />
                                                    <text x="8.5" y="15" fontSize="7" fontWeight="bold">10</text>
                                                </svg>
                                            </button>

                                            {/* Volume - Desktop Only */}
                                            <div className="hidden md:flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
                                                <button
                                                    onClick={toggleMute}
                                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                                >
                                                    {isMuted || volume === 0 ? (
                                                        <SpeakerXMarkIcon className="w-5 h-5" />
                                                    ) : (
                                                        <SpeakerWaveIcon className="w-5 h-5" />
                                                    )}
                                                </button>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="1"
                                                    step="0.01"
                                                    value={isMuted ? 0 : volume}
                                                    onChange={(e) => {
                                                        setVolume(parseFloat(e.target.value))
                                                        setIsMuted(false)
                                                    }}
                                                    className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                                />
                                            </div>

                                            {/* Close */}
                                            <button
                                                onClick={() => {
                                                    setIsVisible(false)
                                                    setIsPlaying(false)
                                                }}
                                                className="p-2 text-gray-400 hover:text-white transition-colors ml-1"
                                                title="Cerrar"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Mobile Time Display */}
                                    <div className="sm:hidden flex justify-between text-xs text-gray-400 font-mono mt-2 px-1">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
