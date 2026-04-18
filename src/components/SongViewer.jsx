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
        return parseLyrics(transposed)
    }, [song.cuerpo])

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
                <title>${song.titulo || 'Canto'}</title>
                <style>
                    @page { size: letter; margin: 0.6in 0.75in; }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Courier New', Courier, monospace; font-size: 11pt; line-height: 1.4; color: #000; background: #fff; }
                    .print-header { text-align: center; margin-bottom: 16pt; padding-bottom: 8pt; border-bottom: 1.5pt solid #333; }
                    .print-title { font-size: 20pt; font-weight: bold; margin-bottom: 6pt; font-family: Georgia, serif; }
                    .print-meta { display: flex; justify-content: center; gap: 20pt; font-size: 10pt; }
                    .print-meta-item { display: inline-flex; align-items: center; gap: 4pt; }
                    .print-meta-label { font-weight: bold; text-transform: uppercase; font-size: 8pt; color: #555; }
                    .print-meta-value { font-weight: bold; font-size: 12pt; }
                    .print-body { padding-left: 30pt; }
                    .print-body p, .print-body .verso { margin-bottom: 4pt; line-height: 2.2; padding-left: 10pt; }
                    .print-body .titulo, .print-body b.titulo { display: block; font-weight: bold; font-size: 10pt; margin-top: 12pt; margin-bottom: 2pt; color: #333; padding-left: 0; font-family: Arial, sans-serif; }
                    .invisible { visibility: hidden; }
                    nota.note, .note { position: relative; color: #09A8FA; line-height: 2.2; }
                    nota.note::after, .note::after { content: attr(data-content); position: absolute; top: -10pt; left: 0; color: #09A8FA; font-family: Arial, Helvetica, sans-serif; font-size: 10pt; font-weight: bold; line-height: 1; white-space: nowrap; }
                    .note-single { color: #09A8FA; font-weight: bold; font-family: Arial, sans-serif; font-size: 10pt; }
                    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <div class="print-title">${song.titulo || 'Sin título'}</div>
                    <div class="print-meta">
                        <span class="print-meta-item"><span class="print-meta-label">Tono:</span><span class="print-meta-value">${song.tono || '—'}</span></span>
                        <span class="print-meta-item"><span class="print-meta-label">Autor:</span><span class="print-meta-value">${song.autor || 'Desconocido'}</span></span>
                    </div>
                </div>
                <div class="print-body">${printableBody}</div>
                <script>window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };</script>
            </body>
            </html>
        `
        printWindow.document.write(printContent)
        printWindow.document.close()
    }

    const handleDownload = () => {
        const downloadContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${song.titulo || 'Canto'}</title>
                <style>
                    body { font-family: 'Courier New', Courier, monospace; font-size: 11pt; line-height: 1.4; color: #000; background: #fff; padding: 20px; }
                    .print-header { text-align: center; margin-bottom: 16pt; padding-bottom: 8pt; border-bottom: 1.5pt solid #333; }
                    .print-title { font-size: 20pt; font-weight: bold; margin-bottom: 6pt; font-family: Georgia, serif; }
                    .print-meta { display: flex; justify-content: center; gap: 20pt; font-size: 10pt; }
                    .print-meta-item { display: inline-flex; align-items: center; gap: 4pt; }
                    .print-meta-label { font-weight: bold; text-transform: uppercase; font-size: 8pt; color: #555; }
                    .print-meta-value { font-weight: bold; font-size: 12pt; }
                    .print-body { padding-left: 10pt; max-width: 800px; margin: 0 auto; }
                    .print-body p, .print-body .verso { margin-bottom: 4pt; line-height: 2.2; }
                    .print-body .titulo, .print-body b.titulo { display: block; font-weight: bold; font-size: 10pt; margin-top: 12pt; margin-bottom: 2pt; color: #333; padding-left: 0; font-family: Arial, sans-serif; }
                    .invisible { visibility: hidden; }
                    nota.note, .note { position: relative; color: #09A8FA; line-height: 2.2; }
                    nota.note::after, .note::after { content: attr(data-content); position: absolute; top: -10pt; left: 0; color: #09A8FA; font-family: Arial, Helvetica, sans-serif; font-size: 10pt; font-weight: bold; line-height: 1; white-space: nowrap; }
                    .note-single { color: #09A8FA; font-weight: bold; font-family: Arial, sans-serif; font-size: 10pt; }
                </style>
            </head>
            <body>
                <div class="print-header" style="max-width: 800px; margin: 0 auto 16pt auto;">
                    <div class="print-title">${song.titulo || 'Sin título'}</div>
                    <div class="print-meta">
                        <span class="print-meta-item"><span class="print-meta-label">Tono:</span><span class="print-meta-value">${song.tono || '—'}</span></span>
                        <span class="print-meta-item"><span class="print-meta-label">Autor:</span><span class="print-meta-value">${song.autor || 'Desconocido'}</span></span>
                    </div>
                </div>
                <div class="print-body">${printableBody}</div>
            </body>
            </html>
        `
        const blob = new Blob([downloadContent], { type: 'text/html;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${song.titulo || 'Canto'}.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
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
