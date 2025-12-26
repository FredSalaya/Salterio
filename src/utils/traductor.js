/* ─── helpers simples ─── */
// (Mantenemos tu regex de sílabas, funciona bien)
const SILABA_RE =
  /[bcdfghjklmnñpqrstvwxyz]*(?:(?<!ch|ll|qu|rr)[aeiouáéíóú]|[auáéíóú]h|[bcdfghjklmnñpqrstvwxyz]{0,2}[aeiouáéíóú]h?)/i

function primeraSilaba(str = '') {
  const m = str.match(SILABA_RE)
  return m ? m[0] : ''
}

/* ─── transformación por pasos ─── */

export const agregarEtiquetasP = (txt) =>
  txt
    .split('\n')
    .map((ln) =>
      ln.startsWith('[')
        ? ln
        : `<p class="verso lh-lg text-wrap fs-6">${ln}</p>`
    )
    .join('\n')

export const reemplazarTitulos = (txt) =>
  txt.replace(/\[(.*?)\:\]/g, `<b class="titulo">$1:</b>`)

// Mantenemos Acordes Dobles {{Am}} igual, eso está bien
const ACORDE_DOBLE_RE =
  /\{\{([A-G]b?#?(?:m|sus|maj|add)?\d*)(\/[A-G]b?#?)?\}\}/g
export const reemplazarAcordesDobles = (txt) =>
  txt.replace(ACORDE_DOBLE_RE, (_, ac, bajo) => {
    const nota = bajo ? `${ac}${bajo}` : ac
    return `<b class="note-single">${nota}</b>`
  })

// -----------------------------------------------------------
//  AQUI ESTÁ LA MAGIA (CAMBIO PRINCIPAL)
// -----------------------------------------------------------

// 1. Regex mejorada:
//    - Mantenemos la validación de notas (A-G...)
//    - Cambiamos el final: (\s*) ([^\s\{]*)
//      Esto captura espacios y luego texto que NO sea espacio NI otro corchete '{'.
//      Así evitamos que se "coma" el siguiente acorde si están juntos.
const ACORDE_RE =
  /\{([A-G]b?#?(?:m|sus|maj|add)?\d*)(\/[A-G]b?#?)?\}(\s*)([^\s\{]*)/g

export const traducirAcordes = (txt) =>
  txt.replace(
    ACORDE_RE,
    (_, ac, bajo, spc, resto) => {
      const sil = primeraSilaba(resto)
      const contenido = bajo ? `${ac}${bajo}` : ac

      let htmlNota
      let tail

      if (sil) {
        // CASO 1: Hay sílaba (Ej: {C}Hola)
        // El acorde se ancla a la sílaba visible.
        htmlNota = `<nota class="note" data-content="${contenido}">${sil}</nota>`
        tail = resto.slice(sil.length)
      } else {
        // CASO 2: Acorde flotante (Ej: {C} {D})
        // TRUCO: Usamos el propio nombre del acorde dentro de un span invisible.
        // Esto obliga al navegador a reservar el ancho exacto del acorde.
        // Agregamos un &nbsp; extra al final para dar un poco de aire entre acordes.
        htmlNota = `<nota class="note" data-content="${contenido}"><span class="invisible">${contenido}</span>&nbsp;</nota>`
        tail = resto
      }

      return `${spc}${htmlNota}${tail}`
    }
  )

/* ─── pipeline principal ─── */
export function parseLyrics(raw = '') {
  let t = agregarEtiquetasP(raw)
  t = reemplazarTitulos(t)
  t = reemplazarAcordesDobles(t)
  
  // Como mejoramos la Regex para no comerse el '{' siguiente, 
  // a veces una sola pasada basta, pero mantenemos dos por seguridad con acordes anidados/pegados.
  t = traducirAcordes(t)      
  t = traducirAcordes(t)
  
  // YA NO NECESITAS ocultarPunto, lo eliminamos del pipeline
  return t
}