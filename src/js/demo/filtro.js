/**
 * Lógica pura de búsqueda y filtro para las páginas de aplicaciones de la galería (spec 013, T-19).
 * @module demo/filtro
 */

/**
 * Pasa a minúsculas y quita acentos para comparar sin distinguirlos.
 * @param {string} text Texto original.
 * @returns {string} Texto normalizado.
 */
export function normalizar(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Indica si un texto contiene todas las palabras de la consulta (sin acentos ni mayúsculas).
 * @param {string} texto Texto donde buscar.
 * @param {string} consulta Palabras buscadas; vacía coincide con todo.
 * @returns {boolean} `true` si coincide.
 */
export function coincide(texto, consulta) {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
  const base = normalizar(texto);
  return palabras.every((p) => base.includes(p));
}

/**
 * Filtra elementos por consulta y categoría.
 * @template {{ texto: string, categoria?: string }} T
 * @param {T[]} items Elementos con su texto y categoría.
 * @param {string} consulta Palabras buscadas.
 * @param {string} [categoria] Categoría exigida; vacía admite todas.
 * @returns {T[]} Elementos que cumplen ambas condiciones.
 */
export function filtrar(items, consulta, categoria = '') {
  return items.filter((i) => (!categoria || i.categoria === categoria) && coincide(i.texto, consulta));
}
