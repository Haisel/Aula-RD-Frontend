/**
 * Utilidades puras de texto (portadas de la Fase 4). `escapeHtml` vive en
 * `helpers/sanitize.js` (una sola fuente de verdad).
 * @module helpers/strings
 */

const ELLIPSIS = '…';

/**
 * Recorta un texto a `maxLength` caracteres añadiendo «…». No parte un emoji por la mitad.
 * @param {unknown} value Texto.
 * @param {number} [maxLength=80] Largo máximo (incluida la elipsis).
 * @returns {string} Texto recortado.
 */
export function truncate(value, maxLength = 80) {
  const text = String(value ?? '');
  const max = Number.isFinite(maxLength) ? Math.max(0, Math.trunc(maxLength)) : 80;
  if (text.length <= max) return text;
  if (max <= ELLIPSIS.length) return text.slice(0, max);
  let end = max - ELLIPSIS.length;
  const last = text.charCodeAt(end - 1);
  if (last >= 0xd800 && last <= 0xdbff) end -= 1; // mitad de un par sustituto
  return text.slice(0, end) + ELLIPSIS;
}

/**
 * Colapsa espacios (incluidos saltos de línea y NBSP) y recorta los extremos.
 * @param {unknown} value Texto.
 * @returns {string} Texto normalizado.
 */
export function normalizeSpaces(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}
