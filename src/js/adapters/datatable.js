/**
 * Adaptador de DataTables 2 + Bootstrap 5 (carga diferida), en español.
 *
 * ```html
 * <table class="table table-hover align-middle w-100" data-au-datatable data-au-page-length="10">…</table>
 * ```
 * Opciones por atributo: `data-au-page-length`, `data-au-no-sort="5"` (índice de columna sin orden),
 * `data-au-order='[[0,"asc"]]'`. Para datos remotos use `AU.createDataTable(tabla, { ajax: … })`
 * con las opciones nativas de DataTables.
 * @module adapters/datatable
 */
import { lazy } from './lazy.js';

/** Textos en español (sin descargar archivos de idioma). */
export const DATATABLE_ES = {
  decimal: '.',
  thousands: ',',
  emptyTable: 'No hay registros todavía.',
  info: 'Mostrando _START_ a _END_ de _TOTAL_',
  infoEmpty: 'Sin registros',
  infoFiltered: '(filtrado de _MAX_)',
  lengthMenu: '_MENU_ por página',
  loadingRecords: 'Cargando…',
  processing: 'Procesando…',
  search: 'Buscar:',
  searchPlaceholder: 'Buscar…',
  zeroRecords: 'Ningún registro coincide con la búsqueda.',
  paginate: { first: 'Primera', last: 'Última', next: 'Siguiente', previous: 'Anterior' },
  aria: { orderable: 'Ordenar por esta columna', orderableReverse: 'Invertir orden' },
};

export const loadDataTable = lazy('DataTables', async () => {
  const mod = await import('datatables.net-bs5');
  return mod.default;
});

/**
 * Crea una tabla interactiva.
 * @param {HTMLTableElement} table Tabla con `<thead>` y `<tbody>`.
 * @param {object} [options] Opciones nativas de DataTables (se combinan con las de la marca).
 * @returns {Promise<any>} Instancia de DataTable.
 */
export async function createDataTable(table, options = {}) {
  const DataTable = await loadDataTable();
  const noSort = table.dataset.auNoSort;
  const pageLength = Number(table.dataset.auPageLength ?? 10);
  // El menú siempre incluye el tamaño configurado (si no, el <select> queda vacío).
  const lengthMenu = [...new Set([pageLength, 10, 25, 50, 100])].sort((a, b) => a - b);
  return new DataTable(table, {
    language: DATATABLE_ES,
    pageLength,
    lengthMenu,
    order: table.dataset.auOrder ? JSON.parse(table.dataset.auOrder) : [],
    columnDefs: noSort !== undefined ? [{ targets: noSort.split(',').map(Number), orderable: false }] : [],
    autoWidth: false,
    ...options,
  });
}
