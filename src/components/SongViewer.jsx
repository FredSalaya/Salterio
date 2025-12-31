import { useState, useEffect, useMemo, useRef } from 'react'
import { useCanto } from '../hooks/useCanto'
import BodyViewer from './BodyViewer'
import SongDrawer from './SongDrawer'
import AudioPlayer from './AudioPlayer'
import { Bars3BottomRightIcon, PrinterIcon, Cog6ToothIcon, XMarkIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import transposeBody from '../utils/transposeBody'
import parseLyrics from '../utils/legacyParser'

export default function SongViewer({ song: initialSong }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isFabOpen, setIsFabOpen] = useState(false)
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
        setIsFabOpen(false)
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
                    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .print-body { page-break-inside: auto; } }
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

    const handleOpenDetails = () => {
        setIsFabOpen(false)
        setIsDrawerOpen(true)
    }

    const handleOpenPanel = () => {
        setIsFabOpen(false)
        window.open(`https://dashboard.salterio.site/cantos/${song.id}`, '_blank')
    }

    const fabOptions = [
        { icon: PrinterIcon, label: 'Imprimir', onClick: handlePrint, color: 'hover:bg-green-500 hover:text-white' },
        { icon: Bars3BottomRightIcon, label: 'Detalles', onClick: handleOpenDetails, color: 'hover:bg-blue-500 hover:text-white' },
        { icon: PencilSquareIcon, label: 'Ver en panel', onClick: handleOpenPanel, color: 'hover:bg-purple-500 hover:text-white' },
    ]

    return (
        <div className="relative min-h-screen pb-24">
            {/* Main Content */}
            <div className="transition-all duration-300" ref={printRef}>
                <BodyViewer raw={song.cuerpo} transport={0} />
            </div>

            {/* FAB Menu - Top on desktop, bottom on mobile */}
            <div className="fixed bottom-36 sm:bottom-auto sm:top-24 right-4 z-40">
                <AnimatePresence>
                    {isFabOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/20"
                            onClick={() => setIsFabOpen(false)}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {isFabOpen && (
                        <motion.div
                            className="absolute bottom-16 sm:bottom-auto sm:top-16 right-0 flex flex-col gap-2 items-end"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                        >
                            {fabOptions.map((option, index) => (
                                <motion.button
                                    key={option.label}
                                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 20, scale: 0.8 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={option.onClick}
                                    className={`flex items-center gap-3 px-4 py-2.5 bg-white rounded-full shadow-lg border border-gray-200 text-gray-700 transition-all ${option.color}`}
                                >
                                    <option.icon className="w-5 h-5" />
                                    <span className="text-sm font-medium whitespace-nowrap">{option.label}</span>
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    onClick={() => setIsFabOpen(!isFabOpen)}
                    className={`p-2.5 sm:p-3.5 rounded-full shadow-xl transition-all border-2
                               ${isFabOpen
                            ? 'bg-gray-800 text-white border-gray-700'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-white/20 hover:scale-110'}`}
                    animate={{ rotate: isFabOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {isFabOpen ? <XMarkIcon className="w-6 h-6" /> : <Cog6ToothIcon className="w-6 h-6" />}
                </motion.button>
            </div>

            <SongDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} song={song} />
            <AudioPlayer mp3_urls={song.mp3_urls} title={song.titulo} author={song.autor} />
        </div>
    )
}
