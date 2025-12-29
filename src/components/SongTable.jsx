import { useState, useEffect } from 'react'
import {
  HeartIcon as HeartSolid,
  PlayIcon,
  PauseIcon,
  Squares2X2Icon,
  TableCellsIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/solid'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db'

// Quita acentos y normaliza mayúsculas/minúsculas
function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export default function SongTable({ songs: propSongs = [] }) {
  const [filter, setFilter] = useState('')
  const [viewMode, setViewMode] = useState('table') // 'table' | 'grid'
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' })
  const [favorites, setFavorites] = useState([])
  const [currentSong, setCurrentSong] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  // Fallback a Dexie si no hay datos del servidor (modo offline)
  const localSongs = useLiveQuery(
    async () => {
      if (propSongs.length > 0) return null; // No necesitamos Dexie si hay datos del server
      const all = await db.cantos.toArray();
      return all.map(r => ({
        id: r.id,
        title: r.titulo,
        version: r.version,
        key: r.tono,
        author: r.autor,
        categories: [] // Las categorías no están en la tabla principal, las omitimos por ahora
      }));
    },
    [propSongs.length]
  );

  // Usar datos locales si el server falló
  const songs = propSongs.length > 0 ? propSongs : (localSongs || []);

  // Cargar favoritos del localStorage al inicio
  useEffect(() => {
    const storedFavs = localStorage.getItem('salterio_favorites')
    if (storedFavs) {
      setFavorites(JSON.parse(storedFavs))
    }
  }, [])

  // Guardar favoritos cuando cambien
  useEffect(() => {
    localStorage.setItem('salterio_favorites', JSON.stringify(favorites))
  }, [favorites])

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

  const handlePlay = (song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying)
    } else {
      setCurrentSong(song)
      setIsPlaying(true)
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

  // Priorizar favoritos si no hay ordenamiento explícito? 
  // Opcional, por ahora dejémoslo simple.

  return (
    <div className="w-full space-y-4">
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

      {/* Player Sticky */}
      <AnimatePresence>
        {currentSong && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-2xl p-4 z-50 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <span className="text-xs font-bold">♫</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 line-clamp-1">{currentSong.title}</h4>
                <p className="text-xs text-gray-500">{currentSong.author}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-gray-900 text-white rounded-full hover:scale-105 transition-transform active:scale-95"
              >
                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
              </button>
              <button
                onClick={() => setCurrentSong(null)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {/* Progress Bar Fake */}
            <div className="absolute bottom-0 left-0 h-1 bg-gray-100 w-full rounded-b-2xl overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: "0%" }}
                animate={{ width: isPlaying ? "100%" : "0%" }}
                transition={{ duration: 30, ease: "linear", repeat: isPlaying ? Infinity : 0 }}
              />
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
              <th onClick={() => onSort('title')} className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100 transition-colors">
                Título <SortIcon colKey="title" />
              </th>
              <th onClick={() => onSort('key')} className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100 transition-colors">
                Tono <SortIcon colKey="key" />
              </th>
              <th onClick={() => onSort('author')} className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100 transition-colors">
                Autor <SortIcon colKey="author" />
              </th>
              <th className="px-4 py-3 text-left">Categoría</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {songs.map((song, idx) => (
              <motion.tr
                key={song.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => window.location.href = `/music/${song.id}`}
                className={`cursor-pointer hover:bg-blue-50/50 transition-colors ${currentSong?.id === song.id ? 'bg-blue-50' : ''}`}
              >
                <td className="px-4 py-4">
                  <div className="font-medium text-gray-900">{song.title}</div>
                  {song.version && <div className="text-xs text-gray-500">{song.version}</div>}
                </td>
                <td className="px-4 py-4 text-gray-700 font-mono">{song.key}</td>
                <td className="px-4 py-4 text-gray-600">{song.author}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {song.categories.map(cat => (
                      <span key={cat} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs border border-gray-200">
                        {cat}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleFavorite(song.id) }}
                      className="p-2 rounded-full hover:bg-pink-50 transition-colors group"
                    >
                      {favorites.includes(song.id) ? (
                        <HeartSolid className="w-5 h-5 text-pink-500" />
                      ) : (
                        <HeartOutline className="w-5 h-5 text-gray-400 group-hover:text-pink-400" />
                      )}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onPlay(song) }}
                      className="p-2 rounded-full hover:bg-blue-50 transition-colors group"
                    >
                      {currentSong?.id === song.id && isPlaying ? (
                        <PauseIcon className="w-5 h-5 text-blue-600" />
                      ) : (
                        <PlayIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                      )}
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
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
      {songs.map((song, idx) => (
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
          </div>

          <div className="flex flex-wrap gap-1 mb-4">
            {song.categories.map(cat => (
              <span key={cat} className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                #{cat}
              </span>
            ))}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onPlay(song) }}
            className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium text-sm
              ${currentSong?.id === song.id && isPlaying
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-50 text-gray-600 hover:bg-blue-500 hover:text-white'
              }`}
          >
            {currentSong?.id === song.id && isPlaying ? (
              <> <PauseIcon className="w-4 h-4" /> Reproduciendo </>
            ) : (
              <> <PlayIcon className="w-4 h-4" /> Escuchar Demo </>
            )}
          </button>
        </motion.div>
      ))}
    </motion.div>
  )
}
