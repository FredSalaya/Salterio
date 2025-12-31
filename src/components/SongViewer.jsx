import { useState, useEffect, useMemo, useRef } from 'react'
import { useCanto } from '../hooks/useCanto'
import BodyViewer from './BodyViewer'
import SongDrawer from './SongDrawer'
import AudioPlayer from './AudioPlayer'
import { Bars3BottomRightIcon, PrinterIcon } from '@heroicons/react/24/outline'
import transposeBody from '../utils/transposeBody'
import parseLyrics from '../utils/legacyParser'

export default function SongViewer({ song: initialSong }) {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const printRef = useRef(null)

    // Obtener datos del servidor
    const song = useCanto(initialSong)

    // Actualizar título del documento cuando se carga la canción
    useEffect(() => {
        if (song?.titulo && song.titulo !== 'Cargando...') {
            document.title = `${song.titulo} - Salterio`;
        }
    }, [song?.titulo]);

    // Parsear el cuerpo para impresión (sin transposición)
    const printableBody = useMemo(() => {
        const transposed = transposeBody(song.cuerpo || '', 0)
        return parseLyrics(transposed)
    }, [song.cuerpo])

    // Función de impresión
    const handlePrint = () => {
        // Crear una ventana de impresión
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
                    @page {
                        size: letter;
                        margin: 0.75in;
                    }
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Georgia', 'Times New Roman', serif;
                        font-size: 12pt;
                        line-height: 1.6;
                        color: #000;
                        background: #fff;
                    }
                    
                    .print-header {
                        text-align: center;
                        margin-bottom: 24pt;
                        padding-bottom: 12pt;
                        border-bottom: 2pt solid #333;
                    }
                    
                    .print-title {
                        font-size: 24pt;
                        font-weight: bold;
                        margin-bottom: 8pt;
                        letter-spacing: -0.5pt;
                    }
                    
                    .print-meta {
                        display: flex;
                        justify-content: center;
                        gap: 24pt;
                        font-size: 11pt;
                        color: #444;
                    }
                    
                    .print-meta-item {
                        display: flex;
                        align-items: center;
                        gap: 6pt;
                    }
                    
                    .print-meta-label {
                        font-weight: bold;
                        text-transform: uppercase;
                        font-size: 9pt;
                        color: #666;
                    }
                    
                    .print-meta-value {
                        font-weight: bold;
                        font-size: 14pt;
                    }
                    
                    .print-body {
                        column-count: 1;
                    }
                    
                    /* Estilos para las letras y acordes */
                    .print-body p {
                        margin-bottom: 6pt;
                        text-indent: 0;
                    }
                    
                    .print-body .chord {
                        font-family: 'Arial', sans-serif;
                        font-weight: bold;
                        color: #1a56db;
                        font-size: 10pt;
                        position: relative;
                        top: -2pt;
                    }
                    
                    .print-body .section-title,
                    .print-body h3,
                    .print-body strong {
                        font-weight: bold;
                        text-transform: uppercase;
                        font-size: 10pt;
                        margin-top: 14pt;
                        margin-bottom: 4pt;
                        color: #333;
                        letter-spacing: 1pt;
                    }
                    
                    .print-body .verse {
                        margin-bottom: 12pt;
                    }
                    
                    .print-footer {
                        margin-top: 24pt;
                        padding-top: 12pt;
                        border-top: 1pt solid #ccc;
                        text-align: center;
                        font-size: 9pt;
                        color: #888;
                    }
                    
                    @media print {
                        body {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <div class="print-title">${song.titulo || 'Sin título'}</div>
                    <div class="print-meta">
                        <div class="print-meta-item">
                            <span class="print-meta-label">Tono:</span>
                            <span class="print-meta-value">${song.tono || '—'}</span>
                        </div>
                        <div class="print-meta-item">
                            <span class="print-meta-label">Autor:</span>
                            <span class="print-meta-value">${song.autor || 'Desconocido'}</span>
                        </div>
                        ${song.version ? `
                        <div class="print-meta-item">
                            <span class="print-meta-label">Versión:</span>
                            <span class="print-meta-value">${song.version}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="print-body">
                    ${printableBody}
                </div>
                
                <div class="print-footer">
                    Salterio • Impreso el ${new Date().toLocaleDateString('es-MX')}
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        };
                    };
                </script>
            </body>
            </html>
        `

        printWindow.document.write(printContent)
        printWindow.document.close()
    }

    return (
        <div className="relative min-h-screen pb-24">
            {/* Main Content: Lyrics & Chords */}
            <div className="transition-all duration-300" ref={printRef}>
                <BodyViewer raw={song.cuerpo} transport={0} />
            </div>

            {/* Floating Action Buttons */}
            <div className="fixed top-24 right-4 z-30 flex flex-col gap-2">
                {/* Print Button */}
                <button
                    onClick={handlePrint}
                    className="p-3 bg-white/80 backdrop-blur-md shadow-lg rounded-full 
                               text-gray-600 hover:text-green-600 hover:scale-110 transition-all border border-gray-100 group"
                    title="Imprimir canto"
                >
                    <PrinterIcon className="w-6 h-6" />
                    <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2 py-1 
                                     bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 
                                     transition-opacity whitespace-nowrap pointer-events-none">
                        Imprimir
                    </span>
                </button>

                {/* Menu Button */}
                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="p-3 bg-white/80 backdrop-blur-md shadow-lg rounded-full 
                               text-gray-600 hover:text-blue-600 hover:scale-110 transition-all border border-gray-100 group"
                    title="Ver detalles y opciones"
                >
                    <Bars3BottomRightIcon className="w-6 h-6" />
                    <span className="absolute right-full top-1/2 -translate-y-1/2 mr-3 px-2 py-1 
                                     bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 
                                     transition-opacity whitespace-nowrap pointer-events-none">
                        Menú
                    </span>
                </button>
            </div>

            {/* Slide-over Drawer */}
            <SongDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                song={song}
            />

            {/* Audio Player */}
            <AudioPlayer
                mp3_urls={song.mp3_urls}
                title={song.titulo}
                author={song.autor}
            />
        </div>
    )
}
