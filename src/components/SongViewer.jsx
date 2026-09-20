import { useState, useEffect, useMemo, useRef } from 'react'
import { useCanto } from '../hooks/useCanto'
import BodyViewer from './BodyViewer'
import AudioPlayer from './AudioPlayer'
import {
    PrinterIcon,
    ArrowDownTrayIcon,
    ChevronRightIcon,
    ChevronLeftIcon,
    XMarkIcon
} from '@heroicons/react/24/outline'
import { FaFilePdf, FaYoutube, FaSpotify, FaHistory, FaBookOpen } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import transposeBody from '../utils/transposeBody'
import parseLyrics from '../utils/legacyParser'

// Helper to convert YouTube URL to embed format
function getYoutubeEmbedUrl(url) {
    if (!url) return ''
    let videoId = ''
    const watchMatch = url.match(/[?&]v=([^&#]+)/)
    if (watchMatch) videoId = watchMatch[1]
    const shortMatch = url.match(/youtu\.be\/([^?&#]+)/)
    if (shortMatch) videoId = shortMatch[1]
    const embedMatch = url.match(/youtube\.com\/embed\/([^?&#]+)/)
    if (embedMatch) return url
    if (videoId) return `https://www.youtube.com/embed/${videoId}`
    return url
}

export default function SongViewer({ song: initialSong }) {
    const [isPanelOpen, setIsPanelOpen] = useState(false)
    const printRef = useRef(null)

    const song = useCanto(initialSong)

    useEffect(() => {
        if (song?.titulo && song.titulo !== 'Cargando...') {
            document.title = `${song.titulo} - Salterio`;
        }
    }, [song?.titulo]);

    const printableBody = useMemo(() => {
        const transposed = transposeBody(song.cuerpo || '', 0)
        const parsed = parseLyrics(transposed)
        if (parsed.includes('<b class="titulo">')) {
            const parts = parsed.split(/(?=<b class="titulo">)/g)
            return parts
                .map(p => p.trim())
                .filter(Boolean)
                .map(p => `<div class="song-section">${p}</div>`)
                .join('\n')
        } else {
            const parts = parsed.split(/<p class="[^"]*">\s*<\/p>/g)
            return parts
                .map(p => p.trim())
                .filter(Boolean)
                .map(p => `<div class="song-section">${p}</div>`)
                .join('\n')
        }
    }, [song.cuerpo])

    const getCategoriesString = () => {
        if (!song.categorias) return ''
        if (Array.isArray(song.categorias)) return song.categorias.join(', ')
        return String(song.categorias)
    }

    const getPrintStyles = () => `
        @page {
            size: letter portrait;
            margin: 0.45in 0.55in 0.45in 0.55in;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body, .pdf-root {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            font-size: 9pt;
            line-height: 1.35;
            color: #0f172a;
            background: #ffffff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .print-header {
            margin-bottom: 12pt;
            padding-bottom: 8pt;
            border-bottom: 1.5pt solid #0f172a;
        }
        .print-top-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 3pt;
        }
        .print-brand {
            font-size: 7.5pt;
            font-weight: 800;
            letter-spacing: 1.5px;
            color: #0284c7;
            text-transform: uppercase;
        }
        .print-scripture {
            font-size: 8pt;
            font-style: italic;
            color: #475569;
            font-weight: 500;
        }
        .print-title {
            font-size: 19pt;
            font-weight: 800;
            font-family: Georgia, 'Times New Roman', serif;
            color: #0f172a;
            margin-bottom: 5pt;
            line-height: 1.15;
        }
        .print-meta-grid {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 5pt 14pt;
            padding: 4pt 8pt;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 4pt;
        }
        .print-meta-item {
            display: inline-flex;
            align-items: baseline;
            gap: 3.5pt;
        }
        .print-meta-label {
            font-size: 6.8pt;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            color: #64748b;
        }
        .print-meta-value {
            font-size: 9.5pt;
            font-weight: 700;
            color: #0f172a;
        }
        .print-meta-value.accent {
            color: #0284c7;
            font-size: 10.5pt;
        }
        .print-meta-value small {
            font-size: 7pt;
            font-weight: 600;
            color: #64748b;
        }
        .print-body {
            column-count: 2;
            column-gap: 22pt;
            column-rule: 1px solid #f1f5f9;
            width: 100%;
        }
        .song-section {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 10pt;
            display: inline-block;
            width: 100%;
        }
        .print-body .titulo, .print-body b.titulo {
            display: block;
            font-weight: 800;
            font-size: 8.5pt;
            color: #334155;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            margin-bottom: 2pt;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 1.5pt;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        }
        .print-body p, .print-body .verso {
            margin-bottom: 2.5pt;
            line-height: 2.15;
            padding-left: 2pt;
            font-family: 'Courier New', Courier, monospace;
            font-size: 9.5pt;
            color: #0f172a;
            white-space: pre-wrap;
            word-break: break-word;
        }
        .invisible {
            visibility: hidden;
        }
        nota.note, .note {
            position: relative;
            color: #0284c7;
            line-height: 2.15;
        }
        nota.note::after, .note::after {
            content: attr(data-content);
            position: absolute;
            top: -9.5pt;
            left: 0;
            color: #0284c7;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            font-size: 9.5pt;
            font-weight: 800;
            line-height: 1;
            white-space: nowrap;
        }
        .note-single {
            color: #0284c7;
            font-weight: 800;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            font-size: 9.5pt;
        }
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    `

    const getPrintContentHtml = () => {
        const categoriesText = getCategoriesString()
        return `
            <div class="print-header">
                <div class="print-top-bar">
                    <span class="print-brand">Salterio</span>
                    ${song.fundamento_biblico ? `<span class="print-scripture">${song.fundamento_biblico}</span>` : ''}
                </div>
                <div class="print-title">${song.titulo || 'Sin título'}</div>
                <div class="print-meta-grid">
                    <div class="print-meta-item">
                        <span class="print-meta-label">Tono</span>
                        <span class="print-meta-value accent">${song.tono || '—'}</span>
                    </div>
                    <div class="print-meta-item">
                        <span class="print-meta-label">Autor</span>
                        <span class="print-meta-value">${song.autor || 'Desconocido'}</span>
                    </div>
                    ${song.tempo ? `
                    <div class="print-meta-item">
                        <span class="print-meta-label">Tempo</span>
                        <span class="print-meta-value">${song.tempo} <small>BPM</small></span>
                    </div>` : ''}
                    ${song.ritmo ? `
                    <div class="print-meta-item">
                        <span class="print-meta-label">Ritmo</span>
                        <span class="print-meta-value">${song.ritmo}</span>
                    </div>` : ''}
                    ${categoriesText ? `
                    <div class="print-meta-item">
                        <span class="print-meta-label">Categoría</span>
                        <span class="print-meta-value">${categoriesText}</span>
                    </div>` : ''}
                    ${song.version ? `
                    <div class="print-meta-item">
                        <span class="print-meta-label">Versión</span>
                        <span class="print-meta-value">${song.version}</span>
                    </div>` : ''}
                </div>
            </div>
            <div class="print-body">${printableBody}</div>
        `
    }

    const handlePrint = () => {
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
            alert('Por favor permite las ventanas emergentes para imprimir')
            return
        }

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${song.titulo || 'Canto'} - Salterio</title>
                <style>${getPrintStyles()}</style>
            </head>
            <body>
                <div class="pdf-root" style="padding: 0.1in;">
                    ${getPrintContentHtml()}
                </div>
                <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };</script>
            </body>
            </html>
        `
        printWindow.document.write(printContent)
        printWindow.document.close()
    }

    const handleDownload = async () => {
        const html2pdf = (await import('html2pdf.js')).default

        // Create a temporary container with print-ready content
        const container = document.createElement('div')
        container.className = 'pdf-root'
        container.style.cssText = 'width: 7.5in; background: #ffffff; padding: 0.1in; box-sizing: border-box;'
        container.innerHTML = getPrintContentHtml()

        const style = document.createElement('style')
        style.textContent = getPrintStyles()
        document.head.appendChild(style)

        const wrapper = document.createElement('div')
        wrapper.className = 'pdf-temp-container'
        wrapper.style.cssText = 'position: absolute; left: -9999px; top: 0; width: 8.5in;'
        wrapper.appendChild(container)
        document.body.appendChild(wrapper)

        const opt = {
            margin:       [0.4, 0.5, 0.4, 0.5],
            filename:     `${song.titulo || 'Canto'}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true, logging: false },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        }

        try {
            await html2pdf().set(opt).from(container).save()
        } finally {
            document.body.removeChild(wrapper)
            document.head.removeChild(style)
        }
    }

    return (
        <div className="relative min-h-screen pb-24">
            {/* Main Layout Container */}
            <div className={`flex transition-all duration-300 ${isPanelOpen ? 'lg:pr-80' : ''}`}>
                {/* Lyrics Content */}
                <div className="flex-1 transition-all duration-300" ref={printRef}>
                    <BodyViewer raw={song.cuerpo} transport={0} />
                </div>
            </div>

            {/* Toggle Button - Always visible on right edge */}
            <button
                onClick={() => setIsPanelOpen(!isPanelOpen)}
                className={`fixed top-1/2 -translate-y-1/2 z-40 p-2 bg-gradient-to-r from-blue-500 to-purple-500 
                           text-white rounded-l-xl shadow-lg hover:scale-105 transition-all
                           ${isPanelOpen ? 'right-80 lg:right-80' : 'right-0'}`}
                title={isPanelOpen ? 'Cerrar panel' : 'Abrir panel de detalles'}
            >
                {isPanelOpen ? (
                    <ChevronRightIcon className="w-5 h-5" />
                ) : (
                    <ChevronLeftIcon className="w-5 h-5" />
                )}
            </button>

            {/* Side Panel - Fixed on right, pushes content */}
            <AnimatePresence>
                {isPanelOpen && (
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-16 right-0 bottom-0 w-80 bg-white shadow-2xl z-30 overflow-y-auto border-l border-gray-200"
                    >
                        {/* Panel Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-sm border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Detalles</h3>
                            <button
                                onClick={() => setIsPanelOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-5">
                            {/* Quick Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-sm font-medium border border-green-200"
                                >
                                    <PrinterIcon className="w-4 h-4" />
                                    Imprimir
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium border border-blue-200"
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                    Descargar
                                </button>
                            </div>

                            {/* Audio Section */}
                            {song.mp3s && song.mp3s.length > 0 && (
                                <section>
                                    <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                                        <FaSpotify className="text-green-500" />
                                        Audios
                                    </h4>
                                    <div className="space-y-3">
                                        {song.mp3s.map((mp3, idx) => (
                                            <div key={idx} className="flex flex-col gap-1">
                                                {mp3.titulo && <span className="text-xs font-medium text-gray-700">{mp3.titulo}</span>}
                                                <audio
                                                    controls
                                                    className="w-full h-10 rounded-lg"
                                                    src={mp3.url}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* YouTube Video */}
                            {song.youtube_url && (
                                <section>
                                    <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                                        <FaYoutube className="text-red-500" />
                                        Video
                                    </h4>
                                    <div className="relative w-full rounded-lg overflow-hidden shadow border border-gray-200 bg-gray-100" style={{ paddingBottom: '56.25%' }}>
                                        <iframe
                                            src={getYoutubeEmbedUrl(song.youtube_url)}
                                            title={song.titulo || 'Video'}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                            className="absolute top-0 left-0 w-full h-full"
                                        />
                                    </div>
                                </section>
                            )}

                            {/* PDF Links */}
                            {song.pdfs && song.pdfs.length > 0 && (
                                <section>
                                    <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                                        <FaFilePdf className="text-red-500" />
                                        Documentos PDF
                                    </h4>
                                    <div className="flex flex-col gap-2">
                                        {song.pdfs.map((pdf, idx) => (
                                            <a
                                                key={idx}
                                                href={pdf.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <FaFilePdf />
                                                    {pdf.titulo || 'Ver PDF'}
                                                </div>
                                                <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                            </a>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Info Grid */}
                            <section className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100">
                                <div>
                                    <span className="block text-xs text-gray-400 uppercase tracking-wider">Tono</span>
                                    <span className="font-bold text-gray-900">{song.tono || '—'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs text-gray-400 uppercase tracking-wider">Autor</span>
                                    <span className="font-medium text-gray-900 text-sm">{song.autor || 'Desconocido'}</span>
                                </div>
                                {song.tempo ? (
                                    <div>
                                        <span className="block text-xs text-gray-400 uppercase tracking-wider">Tempo</span>
                                        <span className="font-medium text-gray-900 text-sm">{song.tempo} BPM</span>
                                    </div>
                                ) : null}
                                {song.ritmo ? (
                                    <div>
                                        <span className="block text-xs text-gray-400 uppercase tracking-wider">Ritmo / Compás</span>
                                        <span className="font-medium text-gray-900 text-sm">{song.ritmo}</span>
                                    </div>
                                ) : null}
                                {song.categorias && song.categorias.length > 0 && (
                                    <div className="col-span-2">
                                        <span className="block text-xs text-gray-400 uppercase tracking-wider">Categoría</span>
                                        <span className="font-medium text-gray-900 text-sm">
                                            {Array.isArray(song.categorias) ? song.categorias.join(', ') : song.categorias}
                                        </span>
                                    </div>
                                )}
                                {song.version && (
                                    <div className="col-span-2">
                                        <span className="block text-xs text-gray-400 uppercase tracking-wider">Versión</span>
                                        <span className="font-medium text-gray-900 text-sm">{song.version}</span>
                                    </div>
                                )}
                            </section>

                            {/* Historia / Blog */}
                            {song.blog ? (
                                <section>
                                    <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                                        <FaHistory className="text-blue-500" />
                                        {song.blog.titulo}
                                    </h4>
                                    {song.blog.cover_img && (
                                        <img src={song.blog.cover_img} alt={song.blog.titulo} className="w-full h-32 object-cover rounded-lg mb-3 shadow-sm border border-gray-100" />
                                    )}
                                    <p className="text-sm text-gray-600 leading-relaxed bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        {song.blog.resumen || "Descubre más sobre la historia de este canto."}
                                    </p>
                                    <a href={`/blogs/${song.historia}`} target="_blank" rel="noopener noreferrer" className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1">
                                        Leer artículo completo
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                    </a>
                                </section>
                            ) : song.historia ? (
                                <section>
                                    <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                                        <FaHistory className="text-blue-500" />
                                        Historia
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-blue-50 p-3 rounded-lg border border-blue-100 italic">
                                        {song.historia}
                                    </p>
                                </section>
                            ) : null}

                            {/* Fundamento Bíblico */}
                            {song.fundamento_biblico && (
                                <section>
                                    <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                                        <FaBookOpen className="text-amber-500" />
                                        Fundamento Bíblico
                                    </h4>
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line bg-amber-50 p-3 rounded-lg border border-amber-100 italic">
                                        "{song.fundamento_biblico}"
                                    </p>
                                </section>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Audio Player */}
            <AudioPlayer
                mp3s={song.mp3s}
                title={song.titulo}
                author={song.autor}
            />
        </div>
    )
}
