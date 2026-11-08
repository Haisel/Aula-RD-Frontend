/**
 * Exportación de filas a Excel (SheetJS, carga diferida) o CSV (sin librería).
 *
 * ```js
 * await AU.exportRows({ rows, columns: [{ key: 'nombre', label: 'Estudiante' }, { key: 'monto', label: 'Monto' }],
 *                       fileName: 'cobros-noviembre', format: 'xlsx' });
 * ```
 * @module adapters/excel
 */
import { lazy } from './lazy.js';
import { downloadBlob } from '../helpers/files.js';

/**
 * @typedef {object} ExportRequest
 * @property {Record<string, unknown>[]} rows Filas (objetos planos).
 * @property {{ key: string, label: string }[]} [columns] Columnas y su orden (por defecto, las claves de la primera fila).
 * @property {string} [fileName='exportacion'] Nombre sin extensión.
 * @property {string} [sheetName='Datos'] Nombre de la hoja (xlsx).
 * @property {'xlsx' | 'csv'} [format='xlsx'] Formato.
 */

export const loadXlsx = lazy('SheetJS', () => import('xlsx'));

/**
 * Convierte filas a una matriz con encabezados.
 * @param {ExportRequest} req Solicitud.
 * @returns {string[][]} Matriz [encabezados, ...filas].
 */
export function toMatrix({ rows, columns }) {
  const cols = columns ?? Object.keys(rows[0] ?? {}).map((key) => ({ key, label: key }));
  return [cols.map((c) => c.label), ...rows.map((r) => cols.map((c) => String(r[c.key] ?? '')))];
}

/**
 * Genera CSV (UTF-8 con BOM para que Excel respete los acentos).
 * @param {string[][]} matrix Matriz.
 * @returns {string} Texto CSV.
 */
export function toCsv(matrix) {
  const esc = (/** @type {string} */ v) => (/[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return `\uFEFF${matrix.map((row) => row.map(esc).join(',')).join('\r\n')}`;
}

/**
 * Exporta y descarga.
 * @param {ExportRequest} req Solicitud.
 * @returns {Promise<string>} Nombre del archivo descargado.
 */
export async function exportRows(req) {
  const { fileName = 'exportacion', sheetName = 'Datos', format = 'xlsx' } = req;
  const matrix = toMatrix(req);
  if (format === 'csv') {
    const name = `${fileName}.csv`;
    downloadBlob(new Blob([toCsv(matrix)], { type: 'text/csv;charset=utf-8' }), name);
    return name;
  }
  const XLSX = await loadXlsx();
  const ws = XLSX.utils.aoa_to_sheet(matrix);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));
  const name = `${fileName}.xlsx`;
  XLSX.writeFile(wb, name);
  return name;
}
