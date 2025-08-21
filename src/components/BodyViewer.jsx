// src/components/BodyViewer.jsx
import { useMemo, useState } from 'react'
import transposeBody from '../utils/transposeBody'
import parseLyrics   from '../utils/legacyParser'
import TransportControls from './TransportControls'


/**
 * props:
 *   raw        : string  ← letra con {acordes}
 *   transport  : int     ← semitonos (+1, -2…); default 0
 */
export default function BodyViewer({ raw = '', transport = 0 }) {
  const [delta, setDelta] = useState(transport)

  /* transponer + parsear solo cuando cambie  */
  const html = useMemo(() => {
    const t   = transposeBody(raw, delta)
    return parseLyrics(t)
  }, [raw, delta]);

  // justo antes del return
  // console.log('RAW length:', raw?.length)      // ¿llega texto?
  // console.log('HTML preview:', html.slice(0,200)) // primeros 2

  return (
    <>
      <div
        className="mx-auto max-w-prose px-4 py-6 space-y-6 "
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* barra opcional para subir / bajar tono */}
      <TransportControls onDelta={(d)=>setDelta(prev=>prev+d)} />

    </>
  )
}
