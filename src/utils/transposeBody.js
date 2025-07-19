// src/utils/transposeBody.js
/* ─────────── tabla de notas ─────────── */
const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const ENHARMONIC = { Db:'C#', Eb:'D#', Gb:'F#', Ab:'G#', Bb:'A#' };
const NOTE_RE = /^([A-G](?:#|b)?)(.*)$/;

function transposeRoot(root, Δ){
  const sharp = ENHARMONIC[root] || root;
  const idx   = NOTES.indexOf(sharp);
  return idx === -1 ? root : NOTES[(idx + Δ + 12) % 12];
}
function transposeChord(chord, Δ){
  const m = chord.match(NOTE_RE);
  return m ? transposeRoot(m[1],Δ) + m[2] : chord;
}

/* ─────────── principal ─────────── */
export default function transposeBody(body='', Δ=0){
  if(!Δ) return body;

  /* 1 · acordes dobles {{Am}} */
  body = body.replace(/\{\{([^}]+)\}\}/g,
    (_,ch)=>`{{${transposeChord(ch,Δ)}}}`);

  /* 2 · acordes simples {Am} pero             *
   *     que NO estén dentro de {{…}}          */
  body = body.replace(/(?<!\{)\{([^}{]+)\}(?!\})/g,
    (_,ch)=>`{${transposeChord(ch,Δ)}}`);

  return body;
}
