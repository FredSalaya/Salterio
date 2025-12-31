import { useState, useEffect, useRef } from 'react'
import {
  HeartIcon as HeartSolid,
  PlayIcon,
  PauseIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ArrowsUpDownIcon,
  BackwardIcon,
  ForwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/solid'
import { HeartIcon as HeartOutline, MusicalNoteIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

// Quita acentos y normaliza mayúsculas/minúsculas
function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

// Formatear tiempo en mm:ss
function formatTime(seconds) {
  if (isNaN(seconds) || seconds === Infinity) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function SongTable({ songs = [] }) {
  const [filter, setFilter] = useState('')
  const [viewMode, setViewMode] = useState('table') // 'table' | 'grid'
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' })
  const [favorites, setFavorites] = useState([])
  const [currentSong, setCurrentSong] = useState(null)
  const [currentSongIndex, setCurrentSongIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const audioRef = useRef(null)
  const progressRef = useRef(null)

  // Cargar favoritos del localStorage al inicio
  useEffect(() => {
    const storedFavs = localStorage.getItem('salterio_favorites')
    if (storedFavs) {
      setFavorites(JSON.parse(storedFavs))
    }
    const storedVolume = localStorage.getItem('salterio_volume')
    if (storedVolume) {
      setVolume(parseFloat(storedVolume))
    }
  }, [])

  // Guardar favoritos cuando cambien
  useEffect(() => {
    localStorage.setItem('salterio_favorites', JSON.stringify(favorites))
  }, [favorites])

  // Guardar volumen cuando cambie
  useEffect(() => {
    localStorage.setItem('salterio_volume', volume.toString())
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  // Manejar reproducción del audio
  useEffect(() => {
    if (!audioRef.current) return

    const audio = audioRef.current

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }

    const handleEnded = () => {
      handleNext()
    }

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
  }, [currentSong])

  // Reproducir/Pausar cuando cambia isPlaying
  useEffect(() => {
    if (!audioRef.current || !currentSong) return

    if (isPlaying) {
      audioRef.current.play().catch(e => console.log('Playback error:', e))
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, currentSong])

  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    )
  }

  const handleSort = (key) => {
    let direction = 'ascending'
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key, direction })
  }

  const handlePlay = (song, index) => {
    if (!song.mp3_urls || song.mp3_urls.length === 0) {
      // No hay audio disponible
      return
    }

    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying)
    } else {
      setCurrentSong(song)
      setCurrentSongIndex(index)
      setCurrentTime(0)
      setDuration(0)
      setIsLoading(true)
      setIsPlaying(true)
    }
  }

  const handlePrevious = () => {
    if (currentSongIndex > 0) {
      const prevIndex = currentSongIndex - 1
      const prevSong = processedSongs[prevIndex]
      if (prevSong.mp3_urls && prevSong.mp3_urls.length > 0) {
        setCurrentSong(prevSong)
        setCurrentSongIndex(prevIndex)
        setCurrentTime(0)
        setIsPlaying(true)
      }
    }
  }

  const handleNext = () => {
    if (currentSongIndex < processedSongs.length - 1) {
      const nextIndex = currentSongIndex + 1
      const nextSong = processedSongs[nextIndex]
      if (nextSong.mp3_urls && nextSong.mp3_urls.length > 0) {
        setCurrentSong(nextSong)
        setCurrentSongIndex(nextIndex)
        setCurrentTime(0)
        setIsPlaying(true)
      }
    } else {
      setIsPlaying(false)
    }
  }

  const handleProgressClick = (e) => {
    if (!progressRef.current || !audioRef.current || duration === 0) return
    const rect = progressRef.current.getBoundingClientRect()
    // Soporte para touch y click
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

  // Filtrado
  const query = normalize(filter)
  let processedSongs = songs.filter(song => (
    normalize(song.title).includes(query) ||
    normalize(song.key).includes(query) ||
    normalize(song.author).includes(query) ||
    song.categories.some(cat => normalize(cat).includes(query))
  ))

  // Ordenamiento
  if (sortConfig.key) {
    processedSongs.sort((a, b) => {
      let aValue = a[sortConfig.key] || ''
      let bValue = b[sortConfig.key] || ''

      // Caso especial para categorías (usamos la primera)
      if (sortConfig.key === 'categories') {
        aValue = a.categories[0] || ''
        bValue = b.categories[0] || ''
      }

      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1
      return 0
    })
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const hasAudio = currentSong?.mp3_urls && currentSong.mp3_urls.length > 0

  return (
    <div className="w-full space-y-4">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={currentSong?.mp3_urls?.[0] || ''}
        preload="metadata"
      />

      {/* Controles Superiores */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm ring-1 ring-gray-200">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Buscar canción, tono, autor..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            title="Vista de Tabla"
          >
            <TableCellsIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            title="Vista de Tarjetas"
          >
            <Squares2X2Icon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <AnimatePresence mode="wait">
        {processedSongs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center p-12 text-gray-400 italic bg-gray-50 rounded-xl border border-dashed border-gray-300"
          >
            No se encontraron canciones.
          </motion.div>
        ) : viewMode === 'table' ? (
          <TableView
            songs={processedSongs}
            sortConfig={sortConfig}
            onSort={handleSort}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlay={handlePlay}
          />
        ) : (
          <GridView
            songs={processedSongs}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlay={handlePlay}
          />
        )}
      </AnimatePresence>

      {/* Premium Sticky Player */}
      <AnimatePresence>
        {currentSong && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            {/* Glassmorphism Background */}
            <div className="mx-auto max-w-4xl px-4 pb-4">
              <div className="relative bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />

                {/* Progress Bar - Clickable */}
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
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white truncate text-lg">{currentSong.title}</h4>
                      <p className="text-sm text-gray-400 truncate">{currentSong.author}</p>
                    </div>

                    {/* Time Display - Mobile Hidden */}
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

                      {/* Previous */}
                      <button
                        onClick={handlePrevious}
                        disabled={currentSongIndex <= 0}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                        title="Anterior"
                      >
                        <BackwardIcon className="w-5 h-5" />
                      </button>

                      {/* Play/Pause */}
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        disabled={!hasAudio}
                        className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                        title={isPlaying ? 'Pausar' : 'Reproducir'}
                      >
                        {isPlaying ? (
                          <PauseIcon className="w-6 h-6" />
                        ) : (
                          <PlayIcon className="w-6 h-6" />
                        )}
                      </button>

                      {/* Next */}
                      <button
                        onClick={handleNext}
                        disabled={currentSongIndex >= processedSongs.length - 1}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                        title="Siguiente"
                      >
                        <ForwardIcon className="w-5 h-5" />
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
                          setCurrentSong(null)
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
    </div>
  )
}

function TableView({ songs, sortConfig, onSort, favorites, onToggleFavorite, currentSong, isPlaying, onPlay }) {
  const SortIcon = ({ colKey }) => {
    if (sortConfig.key !== colKey) return <ArrowsUpDownIcon className="w-4 h-4 text-gray-300 inline ml-1" />
    return (
      <span className="inline-block ml-1 text-blue-500">
        {sortConfig.direction === 'ascending' ? '↑' : '↓'}
      </span>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="overflow-hidden rounded-xl shadow-md ring-1 ring-gray-200 bg-white"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase tracking-wide text-xs font-semibold">
            <tr>
              <th onClick={() => onSort('title')} className="px-3 sm:px-4 py-3 text-left cursor-pointer hover:bg-gray-100 transition-colors">
                Título <SortIcon colKey="title" />
              </th>
              <th onClick={() => onSort('key')} className="px-2 sm:px-4 py-3 text-left cursor-pointer hover:bg-gray-100 transition-colors w-16 sm:w-auto">
                Tono <SortIcon colKey="key" />
              </th>
              {/* Ocultar en móvil */}
              <th onClick={() => onSort('author')} className="hidden md:table-cell px-4 py-3 text-left cursor-pointer hover:bg-gray-100 transition-colors">
                Autor <SortIcon colKey="author" />
              </th>
              <th className="hidden lg:table-cell px-4 py-3 text-left">Categoría</th>
              <th className="px-2 sm:px-4 py-3 text-center w-20 sm:w-auto">Acc.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {songs.map((song, idx) => {
              const hasAudio = song.mp3_urls && song.mp3_urls.length > 0
              return (
                <motion.tr
                  key={song.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  onClick={() => window.location.href = `/music/${song.id}`}
                  className={`cursor-pointer hover:bg-blue-50/50 transition-colors ${currentSong?.id === song.id ? 'bg-blue-50' : ''}`}
                >
                  {/* Título + Autor (en móvil) */}
                  <td className="px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {hasAudio && (
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${currentSong?.id === song.id && isPlaying ? 'bg-green-500 animate-pulse' : 'bg-blue-400'}`} />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate max-w-[150px] sm:max-w-none">{song.title}</div>
                        {/* Mostrar autor en móvil debajo del título */}
                        <div className="md:hidden text-xs text-gray-500 truncate">{song.author}</div>
                        {song.version && <div className="text-xs text-gray-400">{song.version}</div>}
                      </div>
                    </div>
                  </td>

                  {/* Tono */}
                  <td className="px-2 sm:px-4 py-3 sm:py-4">
                    <span className="inline-block px-2 py-0.5 bg-gray-100 rounded text-xs sm:text-sm font-mono text-gray-700 font-bold border border-gray-200">
                      {song.key}
                    </span>
                  </td>

                  {/* Autor - solo desktop */}
                  <td className="hidden md:table-cell px-4 py-4 text-gray-600 truncate max-w-[120px]">{song.author}</td>

                  {/* Categorías - solo desktop grande */}
                  <td className="hidden lg:table-cell px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {song.categories.slice(0, 2).map(cat => (
                        <span key={cat} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs border border-gray-200">
                          {cat}
                        </span>
                      ))}
                      {song.categories.length > 2 && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 text-xs">
                          +{song.categories.length - 2}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="px-2 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleFavorite(song.id) }}
                        className="p-1.5 sm:p-2 rounded-full hover:bg-pink-50 transition-colors group"
                      >
                        {favorites.includes(song.id) ? (
                          <HeartSolid className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
                        ) : (
                          <HeartOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-pink-400" />
                        )}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onPlay(song, idx) }}
                        disabled={!hasAudio}
                        className={`p-1.5 sm:p-2 rounded-full transition-colors group ${hasAudio ? 'hover:bg-blue-50' : 'opacity-30 cursor-not-allowed'}`}
                        title={hasAudio ? 'Reproducir' : 'Sin audio'}
                      >
                        {currentSong?.id === song.id && isPlaying ? (
                          <PauseIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        ) : (
                          <PlayIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${hasAudio ? 'text-gray-400 group-hover:text-blue-500' : 'text-gray-300'}`} />
                        )}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

function GridView({ songs, favorites, onToggleFavorite, currentSong, isPlaying, onPlay }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {songs.map((song, idx) => {
        const hasAudio = song.mp3_urls && song.mp3_urls.length > 0
        return (
          <motion.div
            key={song.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => window.location.href = `/music/${song.id}`}
            className={`bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative group ${currentSong?.id === song.id ? 'ring-2 ring-blue-400' : ''}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{song.title}</h3>
                <p className="text-sm text-gray-500">{song.author}</p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFavorite(song.id) }}
                  className="p-1.5 rounded-full hover:bg-pink-50 transition-colors"
                >
                  {favorites.includes(song.id) ? (
                    <HeartSolid className="w-5 h-5 text-pink-500" />
                  ) : (
                    <HeartOutline className="w-5 h-5 text-gray-400 hover:text-pink-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-700 font-bold border border-gray-200">
                {song.key}
              </span>
              {song.version && (
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-100">
                  {song.version}
                </span>
              )}
              {hasAudio && (
                <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded border border-green-100 flex items-center gap-1">
                  <MusicalNoteIcon className="w-3 h-3" />
                  Audio
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {song.categories.map(cat => (
                <span key={cat} className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                  #{cat}
                </span>
              ))}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onPlay(song, idx) }}
              disabled={!hasAudio}
              className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm
                ${!hasAudio
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : currentSong?.id === song.id && isPlaying
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white'
                }`}
            >
              {!hasAudio ? (
                <> Sin audio </>
              ) : currentSong?.id === song.id && isPlaying ? (
                <> <PauseIcon className="w-4 h-4" /> Reproduciendo </>
              ) : (
                <> <PlayIcon className="w-4 h-4" /> Escuchar </>
              )}
            </button>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

