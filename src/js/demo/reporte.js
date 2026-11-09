/**
 * Filtros y resumen del reporte de demostración (spec 012). Funciones puras, sin DOM.
 * @module demo/reporte
 */

/** Grados en su orden natural. */
export const GRADOS = [
  ...[1, 2, 3, 4, 5, 6].map((n) => `${n}.º Primaria`),
  ...[1, 2, 3, 4, 5, 6].map((n) => `${n}.º Secundaria`),
];

/**
 * @typedef {object} FilaReporte
 * @property {string} grado Grado.
 * @property {string} estado Estado del estudiante.
 * @property {number} asistencia Porcentaje de asistencia.
 * @property {number} promedio Promedio de calificaciones.
 * @property {string} pagos `Pagado`, `Pendiente` o `Vencido`.
 * @property {number} monto Cuota en RD$.
 */

/**
 * Redondea a un decimal.
 * @param {number} n Número.
 * @returns {number} Número con un decimal.
 */
const round1 = (n) => Math.round(n * 10) / 10;

/**
 * Filtra las filas. Un filtro vacío significa "todos".
 * @param {FilaReporte[]} rows Filas.
 * @param {{ grado: string, estado: string, pagos: string }} filtros Filtros.
 * @returns {FilaReporte[]} Filas que cumplen todos los filtros (el original no se modifica).
 */
export function filtrar(rows, { grado, estado, pagos }) {
  return rows.filter(
    (r) => (!grado || r.grado === grado) && (!estado || r.estado === estado) && (!pagos || r.pagos === pagos),
  );
}

/**
 * Resume las filas: totales, promedios, pagos y monto pendiente de cobro.
 * @param {FilaReporte[]} rows Filas.
 * @returns {{ total: number, asistenciaMedia: number, promedioMedio: number, pagos: Record<string, number>, montoPendiente: number }} Resumen.
 */
export function resumen(rows) {
  const total = rows.length;
  const sum = (/** @type {(r: FilaReporte) => number} */ f) => rows.reduce((s, r) => s + f(r), 0);
  return {
    total,
    asistenciaMedia: total ? round1(sum((r) => r.asistencia) / total) : 0,
    promedioMedio: total ? round1(sum((r) => r.promedio) / total) : 0,
    pagos: {
      Pagado: rows.filter((r) => r.pagos === 'Pagado').length,
      Pendiente: rows.filter((r) => r.pagos === 'Pendiente').length,
      Vencido: rows.filter((r) => r.pagos === 'Vencido').length,
    },
    montoPendiente: sum((r) => (r.pagos === 'Pagado' ? 0 : r.monto)),
  };
}

/**
 * Promedio de calificaciones por grado, en el orden de los grados y solo con los grados presentes.
 * @param {FilaReporte[]} rows Filas.
 * @returns {{ labels: string[], promedio: number[] }} Etiquetas y promedios.
 */
export function porGrado(rows) {
  const labels = GRADOS.filter((g) => rows.some((r) => r.grado === g));
  const promedio = labels.map((g) => {
    const delGrado = rows.filter((r) => r.grado === g);
    return round1(delGrado.reduce((s, r) => s + r.promedio, 0) / delGrado.length);
  });
  return { labels, promedio };
}
