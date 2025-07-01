// src/components/CardBits.jsx
import PixelTransition from './ArDacityUi/PixelTransition'

/**
 * CardBits – versión React con props al estilo <Card />
 */
export default function CardBits({
  href = '#',
  imgSrc = '',
  imgAlt = '',
  title = '',
  subtitle = '',
  body = '',
  gridSize = 12,
  pixelColor = '#ffffff',
  animationStepDuration = 0.4,
}) {
  return (
    <a
      href={href}
      className="relative w-full aspect-square rounded-2xl overflow-hidden group"
    >
      <PixelTransition
        firstContent={
          <img
            src={imgSrc}
            alt={imgAlt}
            className="absolute inset-0 h-full w-full object-cover opacity-75 transition-opacity group-hover:opacity-50"
          />
        }
        secondContent={
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-[#111] text-center px-4">
            <p className="text-sm font-medium tracking-widest text-pink-500 uppercase">
              {subtitle}
            </p>
            <p className="text-xl font-bold text-white sm:text-2xl">
              {title}
            </p>
            <p className="text-sm text-white">{body}</p>
          </div>
        }
        gridSize={gridSize}
        pixelColor={pixelColor}
        animationStepDuration={animationStepDuration}
      />
    </a>
  )
}
