import { useState } from 'react'
import { HeartIcon, PlayIcon } from '@heroicons/react/24/solid'

// Quita acentos y normaliza mayúsculas/minúsculas
function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")   // Descompone letras con acento
    .replace(/[\u0300-\u036f]/g, "") // Quita acentos
}

export default function SongTable({ songs = [] }) {
  const [filter, setFilter] = useState('')

  const query = normalize(filter)
  const filteredSongs = songs.filter(song => (
    normalize(song.title).includes(query) ||
    normalize(song.key).includes(query) ||
    normalize(song.author).includes(query) ||
    song.categories.some(cat => normalize(cat).includes(query))
  ))

  return (
    <div className="w-full overflow-x-auto rounded-xl shadow-md ring-1 ring-gray-200">
      {/* Buscador arriba de la tabla */}
      <div className="p-4 text-center">
        <input
          type="text"
          placeholder="Buscar canción, tono, autor o categoría..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        {/*  CABECERA  */}
        <thead className="bg-gray-100 text-gray-600 uppercase tracking-wide text-xs">
          <tr>
            <th className="px-4 py-3 text-left">Título</th>
            <th className="px-4 py-3 text-left">Tono</th>
            <th className="px-4 py-3 text-left">Autor</th>
            <th className="px-4 py-3 text-left">Categoría</th>
            <th className="px-4 py-3 text-center">Acción</th>
          </tr>
        </thead>
        {/* ...el resto igual... */}
        <tbody className="divide-y divide-gray-100 bg-white">
          {filteredSongs.map((song) => (
            <tr
              key={song.id}
              onClick={() => window.location.href = `/music/${song.id}`}
              className="cursor-pointer hover:bg-gray-50"
            >
              <td className="whitespace-nowrap px-4 py-4">
                <p className="font-medium text-gray-900">
                  {song.title}
                </p>
                {song.version && (
                  <p className="text-xs text-gray-500">
                    {song.version}
                  </p>
                )}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                {song.key}
              </td>
              <td className="whitespace-nowrap px-4 py-4 font-medium text-gray-800">
                {song.author}
              </td>
              <td className="px-4 py-4">
                <ul className="flex flex-wrap gap-2">
                  {song.categories.map((cat) => (
                    <li
                      key={cat}
                      className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700"
                    >
                      {cat}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={e => { e.stopPropagation(); console.log('like', song.id) }}
                    className="rounded-full p-2 text-gray-500 hover:bg-pink-100 hover:text-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    <HeartIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); console.log('play', song.id) }}
                    className="rounded-full p-2 text-gray-500 hover:bg-green-100 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                  >
                    <PlayIcon className="h-5 w-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {filteredSongs.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center p-8 text-gray-400 italic">
                No se encontraron canciones con ese criterio.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
