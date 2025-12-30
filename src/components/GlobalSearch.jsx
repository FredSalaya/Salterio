// src/components/GlobalSearch.jsx
import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlassIcon, XMarkIcon, MusicalNoteIcon, BookOpenIcon } from '@heroicons/react/24/outline'

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState({ songs: [], blogs: [] })
    const [loading, setLoading] = useState(false)
    const inputRef = useRef(null)

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isOpen])

    // Keyboard shortcut: Cmd+K or Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsOpen(true)
            }
            if (e.key === 'Escape') {
                setIsOpen(false)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Search when query changes
    useEffect(() => {
        if (!query.trim()) {
            setResults({ songs: [], blogs: [] })
            return
        }

        const search = async () => {
            setLoading(true)
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
                if (response.ok) {
                    const data = await response.json()
                    setResults(data)
                }
            } catch (e) {
                console.error('Search error:', e)
            } finally {
                setLoading(false)
            }
        }

        const debounce = setTimeout(search, 300)
        return () => clearTimeout(debounce)
    }, [query])

    const handleSelect = (url) => {
        setIsOpen(false)
        setQuery('')
        window.location.href = url
    }

    return (
        <>
            {/* Search Input Trigger */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center max-w-xs w-full bg-gray-100 px-4 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-all cursor-pointer"
            >
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-400 flex-1 text-left">Buscar...</span>
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 bg-white rounded border border-gray-200 text-xs text-gray-400">
                    ⌘K
                </kbd>
            </button>

            {/* Search Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100]">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal */}
                    <div className="relative max-w-2xl mx-auto mt-20 bg-white rounded-xl shadow-2xl overflow-hidden mx-4">
                        {/* Search Input */}
                        <div className="flex items-center px-4 py-3 border-b border-gray-200">
                            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-3" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Buscar cantos, devocionales..."
                                className="flex-1 text-lg outline-none placeholder-gray-400"
                            />
                            {query && (
                                <button onClick={() => setQuery('')} className="p-1 hover:bg-gray-100 rounded">
                                    <XMarkIcon className="w-5 h-5 text-gray-400" />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="ml-2 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded"
                            >
                                ESC
                            </button>
                        </div>

                        {/* Results */}
                        <div className="max-h-[60vh] overflow-y-auto">
                            {loading && (
                                <div className="p-8 text-center text-gray-400">
                                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                </div>
                            )}

                            {!loading && query && results.songs.length === 0 && results.blogs.length === 0 && (
                                <div className="p-8 text-center text-gray-400">
                                    No se encontraron resultados para "{query}"
                                </div>
                            )}

                            {/* Songs */}
                            {results.songs.length > 0 && (
                                <div className="p-2">
                                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Cantos
                                    </div>
                                    {results.songs.map((song) => (
                                        <button
                                            key={song.id}
                                            onClick={() => handleSelect(`/music/${song.id}`)}
                                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors text-left"
                                        >
                                            <MusicalNoteIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                            <div>
                                                <div className="font-medium text-gray-900">{song.titulo}</div>
                                                <div className="text-sm text-gray-500">
                                                    {song.autor} • {song.tono}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Blogs */}
                            {results.blogs.length > 0 && (
                                <div className="p-2 border-t border-gray-100">
                                    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Devocionales
                                    </div>
                                    {results.blogs.map((blog) => (
                                        <button
                                            key={blog.id}
                                            onClick={() => handleSelect(`/blogs/${blog.id}`)}
                                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-purple-50 rounded-lg transition-colors text-left"
                                        >
                                            <BookOpenIcon className="w-5 h-5 text-purple-500 flex-shrink-0" />
                                            <div>
                                                <div className="font-medium text-gray-900">{blog.titulo}</div>
                                                <div className="text-sm text-gray-500 line-clamp-1">
                                                    {blog.resumen}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Quick Actions when empty */}
                            {!query && (
                                <div className="p-4 text-center text-gray-400 text-sm">
                                    Escribe para buscar cantos y devocionales
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
