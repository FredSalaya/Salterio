import React, { useEffect, useRef, useState } from "react";

/**
 * TooltipButton — listo para usarse en MDX/React
 *
 * Uso básico en .mdx:
 * import TooltipButton from "../components/TooltipButton";
 *
 * <TooltipButton tip="Esta es una frase completa explicando el botón" placement="top">
 *   Ver detalle
 * </TooltipButton>
 *
 * Props:
 * - tip: string (contenido del tooltip) — requerido
 * - placement: "top" | "bottom" | "left" | "right" (por defecto "top")
 * - btnStyle: React.CSSProperties para personalizar el botón (opcional)
 * - tipStyle: React.CSSProperties para personalizar el tooltip (opcional)
 * - as: "button" | "a" (por defecto "button")
 * - className: clases para el botón si las necesitas (opcional)
 */
export default function TooltipButton({
  children,
  tip,
  placement = "top",
  btnStyle,
  tipStyle,
  as = "button",
  className = "",
  ...props
}) {
  const [open, setOpen] = useState(false); // click/touch
  const [hover, setHover] = useState(false); // hover/focus
  const rootRef = useRef(null);
  const idRef = useRef("ttb-" + Math.random().toString(36).slice(2, 9));
  const tipId = idRef.current;

  const visible = open || hover;

  // Cerrar con clic fuera o tecla Escape
  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("touchstart", onDocClick, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("touchstart", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const Comp = as === "a" ? "a" : "button";

  const baseButtonStyle = {
    padding: "10px 14px",
    borderRadius: 12,
    fontWeight: 600,
    border: "1px solid rgba(0,0,0,.15)",
    background: "linear-gradient(180deg,#ffffff,#f3f4f6)",
    cursor: "pointer",
    boxShadow: "0 1px 2px rgba(0,0,0,.08)",
    lineHeight: 1.1,
    userSelect: "none",
  };

  const baseTooltipStyle = {
    position: "absolute",
    zIndex: 50,
    background: "rgba(17,24,39,.95)", // gris-900 casi negro
    color: "#fff",
    padding: "10px 12px",
    borderRadius: 10,
    fontSize: 14,
    lineHeight: 1.3,
    maxWidth: 320,
    boxShadow: "0 10px 20px rgba(0,0,0,.20)",
    pointerEvents: "none", // evita interferir con clics
    transition: "opacity 140ms ease, transform 140ms ease",
    wordWrap: "break-word",
  };

  const pos = getPos(placement);

  return (
    <span ref={rootRef} style={{ position: "relative", display: "inline-block" }}>
      <Comp
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={visible ? tipId : undefined}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
        onClick={() => setOpen((v) => !v)}
        style={{ ...baseButtonStyle, ...(btnStyle || {}) }}
        className={className}
        {...props}
      >
        {children}
      </Comp>

      <div
        id={tipId}
        role="tooltip"
        style={{
          ...baseTooltipStyle,
          ...pos.style,
          ...(tipStyle || {}),
          opacity: visible ? 1 : 0,
          transform: `${pos.transform} ${visible ? "scale(1)" : "scale(0.98)"}`,
        }}
      >
        {tip}
      </div>
    </span>
  );
}

function getPos(placement) {
  switch (placement) {
    case "bottom":
      return {
        style: { top: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" },
        transform: "translateX(-50%)",
      };
    case "left":
      return {
        style: { right: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" },
        transform: "translateY(-50%)",
      };
    case "right":
      return {
        style: { left: "calc(100% + 8px)", top: "50%", transform: "translateY(-50%)" },
        transform: "translateY(-50%)",
      };
    case "top":
    default:
      return {
        style: { bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)" },
        transform: "translateX(-50%)",
      };
  }
}
