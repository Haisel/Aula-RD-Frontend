/**
 * Lógica pura de la selección de filas de la tabla de demostración (spec 012, T-15). Sin DOM.
 * @module demo/seleccion
 */

/**
 * Estado de la casilla «seleccionar todo» según cuántas filas visibles están marcadas.
 * @param {number} marcadas Filas marcadas entre las que coinciden con los filtros.
 * @param {number} total Filas que coinciden con los filtros (todas las páginas).
 * @returns {'ninguna' | 'algunas' | 'todas'} `todas` solo si hay filas y todas están marcadas.
 */
export function estadoMarca(marcadas, total) {
  if (marcadas <= 0 || total <= 0) return 'ninguna';
  return marcadas >= total ? 'todas' : 'algunas';
}
