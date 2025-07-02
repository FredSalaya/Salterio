// src/components/LyricsViewer.jsx
import Tooltip from './Tooltip'
import { useState, useMemo } from 'react'

export default function LyricsViewer({ raw }) {
  const parsed = useMemo(() => parseLyric(raw), [raw])
  return (
    <article className="space-y-4 leading-relaxed">{parsed}</article>
  )
}

/* ---------------- Parser ---------------- */
const CHORD_RE = /\{([^}]+)\}/g      // {Bm}, {A#}, {F#m7}

function parseLyric(text) {
  const lines = text.split(/\r?\n/)
  return lines.map((line, i) => {
    // 1) bloque título [Verso:]
    const matchSection = line.match(/^\s*\[(.+?)\]\s*$/)
    if (matchSection) {
      return (
        <h3 key={i} className="font-bold text-lg">{matchSection[1]}</h3>
      )
    }

    // 2) línea normal con acordes
    if (!line.includes('{')) return <p key={i}>{line}</p>

    const parts = []
    let lastIndex = 0
    let m

    while ((m = CHORD_RE.exec(line)) !== null) {
      // texto antes del acorde
      if (m.index > lastIndex) {
        parts.push(line.slice(lastIndex, m.index))
      }
      const chord = m[1]         // Bm

      // lo que viene después del acorde: buscamos la primera sílaba (letras hasta espacio o {)
      const rest = line.slice(CHORD_RE.lastIndex)
      const syllableMatch = rest.match(/^([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)(.*)$/u)

      if (syllableMatch) {
        const [syllable, remainder] = [syllableMatch[1], syllableMatch[2]]
        parts.push(
          <Tooltip chord={chord} key={parts.length}>{syllable}</Tooltip>
        )
        line = remainder          // procesar lo que quede
        CHORD_RE.lastIndex = 0    // reiniciar búsqueda en la nueva línea
      } else {
        // no hay texto después, mostramos acorde suelto
        parts.push(<Tooltip chord={chord} key={parts.length}> </Tooltip>)
        break
      }
      lastIndex = 0
    }
    // resto de la línea
    if (line) parts.push(line)
    return <p key={i}>{parts}</p>
  })
}
