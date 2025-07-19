// src/utils/lyricsParser.js
// -----------------------------------------------------------
//  PARSER DE LETRAS CON ACORDES  {Am}  y  {{Am}}               
// -----------------------------------------------------------

/* ─── helpers simples ─── */
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

const ACORDE_DOBLE_RE =
  /\{\{([A-G]b?#?(?:m|sus|maj|add)?\d*)(\/[A-G]b?#?)?\}\}/g
export const reemplazarAcordesDobles = (txt) =>
  txt.replace(ACORDE_DOBLE_RE, (_, ac, bajo) => {
    const nota = bajo ? `${ac}${bajo}` : ac
    return `<b class="note-single">${nota}</b>`
  })

const ACORDE_RE =
  /\{([A-G]b?#?(?:m|sus|maj|add)?\d*)(\/[A-G]b?#?)?\}(\s*)(\S*)(\.?)/g
export const traducirAcordes = (txt) =>
  txt.replace(
    ACORDE_RE,
    (_, ac, bajo, spc, resto, punto) => {
      const sil = primeraSilaba(resto)
      const tienePunto = punto && resto.trim() && !sil.includes('.')
      const nota = sil && !tienePunto ? sil : ''
      const tail = resto.slice(nota.length)
      const contenido = bajo ? `${ac}${bajo}` : ac
      const htmlNota = nota
        ? `<nota class="note" data-content="${contenido}">${nota}</nota>`
        : `<nota class="note" data-content="${contenido}"> </nota>`
      return `${spc}${htmlNota}${tail}${tienePunto ? '.' : ''}`
    }
  )

export const ocultarPunto = (txt) =>
  txt.replace(
    /(<nota class='note'[^>]*> <\/nota>)\./g,
    `$1<span class="invisible">.</span>`
  )

/* ─── pipeline principal ─── */
export function parseLyrics(raw = '') {
  let t = agregarEtiquetasP(raw)
  t = reemplazarTitulos(t)
  t = reemplazarAcordesDobles(t)
  t = traducirAcordes(t)      // 1ª pasada
  t = traducirAcordes(t)      // 2ª pasada para rezagados
  t = ocultarPunto(t)
  return t
}

/* ─── util opcional para leer archivo remoto ─── */
export async function fetchText(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`)
  return res.text()
}
