// src/components/Tooltip.jsx
export default function Tooltip({ chord, children }) {
  return (
    <span className="relative inline-block font-semibold text-blue-700">
      {/* acorde arriba */}
      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs text-blue-600">
        {chord}
      </span>
      {children}
    </span>
  )
}
