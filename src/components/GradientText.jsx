// GradientText.jsx  –  cero dependencias raras, solo Framer‑Motion (nuevo "motion")
import { useEffect, useRef } from 'react'
import { animate } from 'motion'          // npm i motion

export default function GradientText({
  children,
  colors = ['#40ffaa', '#4079ff', '#40ffaa', '#4079ff', '#40ffaa'],
  animationSpeed = 3,          // seg por ciclo completo
  showBorder = false,
  className = '',
}) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    const el = ref.current
    const gradient = `linear-gradient(90deg, ${colors.join(',')})`
    el.style.backgroundImage = gradient
    el.style.backgroundSize = `${colors.length * 100}%`
    el.style.color = 'transparent'
    el.style.backgroundClip = 'text'
    el.style.webkitBackgroundClip = 'text'

    // animación infinita ↔
    const controls = animate(
      el,
      { backgroundPositionX: [`0%`, `-${colors.length * 100 - 100}%`] },
      { duration: animationSpeed, repeat: Infinity, easing: 'linear' }
    )
    return () => controls.stop()
  }, [colors, animationSpeed])

  return (
    <span
      ref={ref}
      className={`inline-block font-extrabold ${className} ${
        showBorder ? 'relative after:absolute after:inset-0 after:rounded-md after:ring-2 after:ring-current' : ''
      }`}
    >
      {children}
    </span>
  )
}
