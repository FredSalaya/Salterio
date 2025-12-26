// src/utils/legacyParser.js
// src/utils/legacyParser.js
import {
  agregarEtiquetasP,
  reemplazarTitulos,
  reemplazarAcordesDobles,
  traducirAcordes,
} from './traductor.js';          // ruta correcta

export default function parseLyrics(text){
  let t = agregarEtiquetasP(text)
  t = reemplazarTitulos(t)
  t = reemplazarAcordesDobles(t)
  t = traducirAcordes(t)
  t = traducirAcordes(t)          // 2ª pasada
  return t
}
