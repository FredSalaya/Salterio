import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BlogCard from './CardBlog.jsx'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'

export default function BlogGrid({ blogs = [] }) {
    const [search, setSearch] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('Todos')

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = new Set(blogs.map(b => b.tipo_blog?.tipo).filter(Boolean))
        return ['Todos', ...Array.from(cats)]
    }, [blogs])

    // Filter blogs
    const filteredBlogs = useMemo(() => {
        return blogs.filter(blog => {
            const matchesSearch = (
                blog.titulo?.toLowerCase().includes(search.toLowerCase()) ||
                blog.resumen?.toLowerCase().includes(search.toLowerCase()) ||
                blog.autor?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
                blog.autor?.apodo?.toLowerCase().includes(search.toLowerCase())
            )
            const matchesCategory = selectedCategory === 'Todos' || blog.tipo_blog?.tipo === selectedCategory

            return matchesSearch && matchesCategory
        })
    }, [blogs, search, selectedCategory])

    return (
        <div className="w-full space-y-8">
            {/* Controls Section */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">

                {/* Search */}
                <div className="relative w-full md:w-96 group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por título, resumen o autor..."
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 no-scrollbar">
                    <FunnelIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div className="flex gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`
                  px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                  ${selectedCategory === cat
                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 transform scale-105'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                    }
                `}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <motion.div
                layout
                className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
            >
                <AnimatePresence mode='popLayout'>
                    {filteredBlogs.map((blog) => (
                        <motion.div
                            key={blog.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <BlogCard
                                titulo={blog.titulo}
                                tipo_blog={blog.tipo_blog?.tipo}
                                resumen={blog.resumen}
                                fecha={blog.fecha_publicacion}
                                imagen_url={blog.cover_img}
                                blog_url={`/blogs/${blog.id}`}
                                podcast_url={blog.podcast_url}
                                video_url={blog.video_url}
                                autor_nombre={
                                    blog.autor?.apodo
                                        ? `${blog.autor.apodo} ${blog.autor.nombre}`
                                        : blog.autor?.nombre
                                }
                                autor_foto={blog.autor?.foto_url}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Empty State */}
            {filteredBlogs.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No se encontraron resultados</h3>
                    <p className="text-gray-500 mt-1">Intenta ajustar tu búsqueda o filtros.</p>
                </motion.div>
            )}
        </div>
    )
}
