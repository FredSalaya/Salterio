// src/components/TransportControls.jsx
import { useState, useEffect, useRef } from 'react'

export default function TransportControls({ onDelta }) {
  const [scrollOn, setScrollOn] = useState(false)
  const timer = useRef(null)

  /* autoscroll */
  useEffect(() => {
    if (!scrollOn) { clearInterval(timer.current); return }
    timer.current = setInterval(() => {
      window.scrollBy({ top: 1, behavior: 'smooth' })
    }, 20)
    return () => clearInterval(timer.current)
  }, [scrollOn])

  /* color + icon dinámicos */
  const playStopClasses = scrollOn
    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-400'
    : 'bg-green-600 hover:bg-green-700 focus:ring-green-400'
  const iconSrc = scrollOn ? '/icons/stop.svg' : '/icons/play.svg'
  const iconAlt = scrollOn ? 'Stop' : 'Play'

  return (
    <div className="fixed bottom-5 inset-x-0 flex justify-center gap-4 pointer-events-none">
      {/* - semitono */}
      <button
        onClick={() => onDelta(-1)}
        aria-label="Bajar semitono"
        className="transport-btn pointer-events-auto"
      >
        &minus;
      </button>

      {/* Play / Stop autoscroll */}
      <button
        onClick={() => setScrollOn(p => !p)}
        aria-label={iconAlt}
        className={`transport-btn pointer-events-auto ${playStopClasses}`}
      >
        <img src={iconSrc} alt={iconAlt} className="w-5 h-5" />
      </button>

      {/* + semitono */}
      <button
        onClick={() => onDelta(+1)}
        aria-label="Subir semitono"
        className="transport-btn pointer-events-auto"
      >
        ＋
      </button>
    </div>
  )
}

