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
      // Intentamos extraer la sílaba del texto siguiente ('resto')
      const sil = primeraSilaba(resto)
      
      // Definimos el contenido del acorde (Ej: C/G)
      const contenido = bajo ? `${ac}${bajo}` : ac

      // LÓGICA INTELIGENTE:
      // Si encontramos una sílaba, la usamos como base.
      // Si NO hay sílaba (resto vacío o signos de puntuación raros), usamos un espacio duro (&nbsp;)
      // Esto hace que el acorde tenga "cuerpo" sin necesitar texto ni puntos.
      
      let htmlNota;
      let tail; // Lo que sobra del texto después de usar la sílaba

      if (sil) {
        // CASO 1: Acorde sobre texto (Ej: {C}Hola)
        htmlNota = `<nota class="note" data-content="${contenido}">${sil}</nota>`
        tail = resto.slice(sil.length)
      } else {
        // CASO 2: Acorde flotante solo (Ej: {C} o {C} ... )
        // Usamos &nbsp; para que el navegador dibuje el bloque aunque esté vacío
        htmlNota = `<nota class="note" data-content="${contenido}">&nbsp;</nota>`
        tail = resto // Devolvemos el resto intacto (por si era un signo de puntuación)
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