/**
 * Lógica del tablero (kanban) de demostración (spec 012). Funciones puras, sin DOM.
 * @module demo/tablero
 */

/** Columnas del tablero, en orden. */
export const COLUMNAS = ['nuevas', 'revision', 'aprobadas'];

/**
 * @typedef {object} Tarjeta
 * @property {string} id Identificador.
 * @property {string} columna Columna a la que pertenece.
 */

/**
 * Agrupa las tarjetas por columna conservando su orden.
 * @template {Tarjeta} T
 * @param {T[]} cards Tarjetas.
 * @returns {Record<string, T[]>} Tarjetas de cada columna.
 */
export function agrupar(cards) {
  return Object.fromEntries(COLUMNAS.map((c) => [c, cards.filter((t) => t.columna === c)]));
}

/**
 * Cuenta las tarjetas de cada columna.
 * @param {Tarjeta[]} cards Tarjetas.
 * @returns {Record<string, number>} Cantidad por columna.
 */
export function contar(cards) {
  return Object.fromEntries(COLUMNAS.map((c) => [c, cards.filter((t) => t.columna === c).length]));
}

/**
 * Mueve una tarjeta a una columna, opcionalmente a una posición dentro de ella.
 * @template {Tarjeta} T
 * @param {T[]} cards Tarjetas (no se modifica).
 * @param {string} id Tarjeta que se mueve.
 * @param {string} columna Columna de destino.
 * @param {number} [indice] Posición dentro de la columna de destino; por defecto, al final.
 * @returns {T[]} Tarjetas nuevas. Si `id` no existe, una copia sin cambios.
 * @throws {RangeError} Si la columna no existe.
 */
export function mover(cards, id, columna, indice) {
  if (!COLUMNAS.includes(columna)) throw new RangeError(`Columna desconocida: ${columna}`);
  const from = cards.findIndex((t) => t.id === id);
  if (from < 0) return cards.map((t) => ({ ...t }));
  const moved = { ...cards[from], columna };
  const rest = cards.filter((_, i) => i !== from).map((t) => ({ ...t }));
  const group = rest.map((t, i) => (t.columna === columna ? i : -1)).filter((i) => i >= 0);
  let at = rest.length;
  if (group.length) at = indice !== undefined && indice < group.length ? group[indice] : group[group.length - 1] + 1;
  rest.splice(at, 0, /** @type {T} */ (moved));
  return rest;
}
