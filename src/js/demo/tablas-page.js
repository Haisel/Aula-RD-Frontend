/**
 * Demostración de tablas (spec 012, T-15 · RF-06, CA-07).
 *
 * Una tabla de estudiantes con DataTables (`AU.createDataTable`): casillas de selección, acciones
 * masivas que se habilitan según lo marcado, filtros externos por columna, fila de detalle
 * desplegable, avatares con iniciales, píldoras de estado y exportación a Excel de la selección.
 * Los cambios viven en memoria y se pierden al recargar (RN-02). Usa solo la fachada `AU`.
 * @module demo/tablas-page
 */
import { estadoMarca } from './seleccion.js';
import { GRADOS } from './reporte.js';

/** Columnas del archivo de Excel. */
const COLUMNS = [
  { key: 'nombre', label: 'Estudiante' },
  { key: 'matricula', label: 'Matrícula' },
  { key: 'grado', label: 'Grado' },
  { key: 'seccion', label: 'Sección' },
  { key: 'tutor', label: 'Tutor' },
  { key: 'estado', label: 'Estado' },
  { key: 'ingreso', label: 'Ingreso' },
];

/** Posición de las columnas filtrables en la tabla. */
const COL = { grado: 2, estado: 5 };

/**
 * @typedef {object} Estudiante
 * @property {string} id Identificador.
 * @property {string} nombre Nombre.
 * @property {string} grado Grado.
 * @property {string} seccion Sección.
 * @property {string} tutor Tutor.
 * @property {string} estado `Activo`, `Inactivo`, etc.
 * @property {string} matricula Matrícula.
 * @property {string} ingreso Fecha de ingreso (ISO).
 */

/**
 * Activa la demostración de tablas sobre su contenedor.
 * @param {HTMLElement} root Contenedor `[data-demo="tablas"]`.
 * @param {any} au Fachada `window.AU`.
 * @returns {Promise<void>}
 */
export async function tablas(root, au) {
  /**
   * Busca un elemento de la demostración por su marca `data-tbl`.
   * @param {string} name Valor de `data-tbl`.
   * @returns {any} Elemento.
   */
  const el = (name) => root.querySelector(`[data-tbl="${name}"]`);
  /** @type {HTMLSelectElement} */
  const fGrado = el('filtro-grado');
  /** @type {HTMLSelectElement} */
  const fEstado = el('filtro-estado');
  /** @type {HTMLElement} */
  const region = el('region');
  /** @type {HTMLElement} */
  const counter = el('contador');
  /** @type {HTMLElement} */
  const live = el('anuncio');
  /** @type {Record<string, HTMLButtonElement>} */
  const bulk = {
    activar: el('activar'),
    desactivar: el('desactivar'),
    exportar: el('exportar'),
    eliminar: el('eliminar'),
  };

  /** @type {Estudiante[]} */
  let initial = [];
  /** @type {Estudiante[]} */
  let all = [];
  /** Identificadores de las filas marcadas. */
  const selected = new Set(/** @type {string[]} */ ([]));
  /** @type {any} */
  let table = null;
  /** @type {HTMLInputElement | null} */
  let headBox = null;

  for (const g of GRADOS) fGrado.append(new Option(g, g));

  /**
   * Anuncia un mensaje a los lectores de pantalla.
   * @param {string} text Mensaje.
   * @returns {void}
   */
  const announce = (text) => {
    live.textContent = text;
  };

  /**
   * Escapa un texto para usarlo dentro de una expresión regular.
   * @param {string} s Texto.
   * @returns {string} Texto escapado.
   */
  const reEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  /**
   * Iniciales para el avatar.
   * @param {string} name Nombre completo.
   * @returns {string} Hasta dos letras en mayúscula.
   */
  const initials = (name) =>
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0] ?? '')
      .join('')
      .toUpperCase();

  /**
   * HTML de una fila de la tabla (todo el texto va escapado).
   * @param {Estudiante} r Estudiante.
   * @returns {string} Fila `<tr>`.
   */
  const rowHtml = (r) => {
    const name = au.escapeHtml(r.nombre);
    return `<tr data-id="${au.escapeHtml(r.id)}">
      <td><input class="form-check-input" type="checkbox" data-tbl-row aria-label="Seleccionar a ${name}"></td>
      <td><div class="d-flex align-items-center gap-2"><span class="au-avatar" aria-hidden="true">${au.escapeHtml(initials(r.nombre))}</span><div><div class="fw-semibold">${name}</div><div class="small text-body-secondary">${au.escapeHtml(r.matricula)}</div></div></div></td>
      <td>${au.escapeHtml(r.grado)}</td><td>${au.escapeHtml(r.seccion)}</td><td>${au.escapeHtml(r.tutor)}</td>
      <td><span class="au-status au-status-${au.statusVariant(r.estado)}">${au.escapeHtml(r.estado)}</span></td>
      <td>${au.formatDate(r.ingreso)}</td>
      <td class="text-end"><button class="btn btn-outline-primary au-btn-icon btn-sm" type="button" data-tbl-detail aria-expanded="false" aria-label="Ver detalle de ${name}"><i class="bi bi-chevron-down" aria-hidden="true"></i></button></td></tr>`;
  };

  /**
   * HTML del detalle desplegable de un estudiante.
   * @param {Estudiante} r Estudiante.
   * @returns {string} Lista de datos.
   */
  const detailHtml = (r) =>
    `<dl class="row mb-0 py-2 ps-md-5"><dt class="col-sm-3">Matrícula</dt><dd class="col-sm-9">${au.escapeHtml(r.matricula)}</dd>
      <dt class="col-sm-3">Tutor</dt><dd class="col-sm-9">${au.escapeHtml(r.tutor)}</dd>
      <dt class="col-sm-3">Curso</dt><dd class="col-sm-9">${au.escapeHtml(r.grado)}, sección ${au.escapeHtml(r.seccion)}</dd>
      <dt class="col-sm-3">Ingreso</dt><dd class="col-sm-9">${au.formatDate(r.ingreso)}</dd></dl>`;

  /**
   * Identificadores de las filas que coinciden con los filtros y la búsqueda (todas las páginas).
   * @returns {string[]} Identificadores.
   */
  const matchingIds = () =>
    table
      ? table
          .rows({ search: 'applied' })
          .nodes()
          .toArray()
          .map((/** @type {HTMLElement} */ n) => n.dataset.id ?? '')
      : [];

  /**
   * Refleja la selección en las casillas, los botones masivos, el contador y la casilla de cabecera.
   * @returns {void}
   */
  function sync() {
    const visible = new Set(matchingIds());
    for (const id of [...selected]) if (!visible.has(id)) selected.delete(id);
    for (const tr of /** @type {NodeListOf<HTMLElement>} */ (region.querySelectorAll('tbody tr[data-id]'))) {
      const on = selected.has(tr.dataset.id ?? '');
      const box = /** @type {HTMLInputElement | null} */ (tr.querySelector('[data-tbl-row]'));
      if (box) box.checked = on;
      tr.classList.toggle('table-active', on);
    }
    const state = estadoMarca(selected.size, visible.size);
    if (headBox) {
      headBox.checked = state === 'todas';
      headBox.indeterminate = state === 'algunas';
    }
    const n = selected.size;
    counter.textContent =
      n === 0 ? 'Ninguna fila seleccionada' : `${n} ${n === 1 ? 'fila seleccionada' : 'filas seleccionadas'}`;
    for (const b of Object.values(bulk)) b.disabled = n === 0;
  }

  /**
   * Aplica los filtros externos a las columnas de la tabla.
   * @returns {void}
   */
  function applyFilters() {
    if (!table) return;
    for (const [select, col] of /** @type {[HTMLSelectElement, number][]} */ ([
      [fGrado, COL.grado],
      [fEstado, COL.estado],
    ])) {
      table.column(col).search(select.value ? `^${reEscape(select.value)}$` : '', true, false);
    }
    table.draw();
  }

  /**
   * Pinta la tabla (o el estado vacío) y activa DataTables.
   * @returns {Promise<void>}
   */
  async function paint() {
    table?.destroy?.();
    table = null;
    headBox = null;
    if (!all.length) {
      region.innerHTML =
        '<div class="au-empty"><span class="au-stat-icon is-lg"><i class="bi bi-people" aria-hidden="true"></i></span><h3>No quedan estudiantes</h3><p>Use «Restablecer datos» para volver a la lista original.</p></div>';
      sync();
      return;
    }
    region.innerHTML = `<div class="au-table-card"><div class="table-responsive"><table class="table table-hover align-middle w-100" data-au-no-sort="0,7" aria-label="Estudiantes de demostración">
      <thead><tr><th scope="col"><input class="form-check-input" type="checkbox" data-tbl-all aria-label="Seleccionar todas las filas que coinciden con los filtros"></th><th scope="col">Estudiante</th><th scope="col">Grado</th><th scope="col">Sección</th><th scope="col">Tutor</th><th scope="col">Estado</th><th scope="col">Ingreso</th><th scope="col"><span class="visually-hidden">Detalle</span></th></tr></thead>
      <tbody>${all.map(rowHtml).join('')}</tbody></table></div></div>`;
    headBox = region.querySelector('[data-tbl-all]');
    table = await au.createDataTable(region.querySelector('table'), { pageLength: 10 });
    table.on('draw', sync);
    applyFilters();
  }

  /**
   * Carga los estudiantes y pinta la tabla.
   * @returns {Promise<void>}
   */
  async function load() {
    region.setAttribute('aria-busy', 'true');
    region.innerHTML = `<div class="card"><div class="card-body d-grid gap-3">${'<div class="d-flex gap-3 align-items-center"><span class="au-skeleton au-skeleton-circle"></span><span class="au-skeleton w-50"></span></div>'.repeat(4)}</div></div>`;
    try {
      initial = /** @type {Estudiante[]} */ (await au.api.get('data/estudiantes.json'));
      all = initial.map((r) => ({ ...r }));
      await paint();
    } catch {
      region.innerHTML =
        '<div class="alert alert-danger" role="alert"><i class="bi bi-x-octagon" aria-hidden="true"></i><div><p class="au-alert-title">No se pudo cargar la lista</p>Revise su conexión e intente de nuevo.<div class="mt-2"><button class="btn btn-outline-primary btn-sm" type="button" data-tbl="reintentar"><i class="bi bi-arrow-clockwise" aria-hidden="true"></i>Reintentar</button></div></div></div>';
    }
    region.removeAttribute('aria-busy');
    sync();
  }

  for (const select of [fGrado, fEstado]) {
    select.addEventListener('change', () => {
      applyFilters();
      announce(`Se muestran ${matchingIds().length} estudiantes.`);
    });
  }

  // Casillas: la de cabecera marca o desmarca todas las filas que coinciden con los filtros.
  region.addEventListener('change', (event) => {
    const box = /** @type {HTMLInputElement} */ (event.target);
    if (box.matches('[data-tbl-all]')) {
      for (const id of matchingIds()) {
        if (box.checked) selected.add(id);
        else selected.delete(id);
      }
    } else if (box.matches('[data-tbl-row]')) {
      const id = box.closest('tr')?.dataset.id ?? '';
      if (box.checked) selected.add(id);
      else selected.delete(id);
    } else return;
    sync();
    announce(counter.textContent ?? '');
  });

  root.addEventListener('click', async (event) => {
    const button = /** @type {HTMLElement} */ (event.target).closest('button');
    if (!button) return;
    const tr = button.closest('tr');
    if (button.matches('[data-tbl-detail]') && tr && table) {
      const row = table.row(tr);
      const open = row.child.isShown();
      if (open) row.child.hide();
      else row.child(detailHtml(/** @type {Estudiante} */ (all.find((r) => r.id === tr.dataset.id)))).show();
      button.setAttribute('aria-expanded', String(!open));
      button.querySelector('i')?.classList.toggle('bi-chevron-down', open);
      button.querySelector('i')?.classList.toggle('bi-chevron-up', !open);
      return;
    }
    const action = button.dataset.tbl;
    if (action === 'reintentar') await load();
    else if (action === 'restablecer') {
      all = initial.map((r) => ({ ...r }));
      selected.clear();
      await paint();
      announce('Los datos volvieron a su estado original.');
    } else if (action === 'exportar' && selected.size) {
      const rows = all.filter((r) => selected.has(r.id));
      const name = await au.exportRows({
        rows,
        columns: COLUMNS,
        fileName: 'estudiantes-seleccion-demostracion',
        sheetName: 'Estudiantes',
        format: 'xlsx',
      });
      au.toast(`Se descargó ${name} con ${rows.length} filas.`, 'success');
    } else if ((action === 'activar' || action === 'desactivar') && selected.size) {
      const estado = action === 'activar' ? 'Activo' : 'Inactivo';
      const count = selected.size;
      for (const r of all) if (selected.has(r.id)) r.estado = estado;
      selected.clear();
      await paint();
      au.toast(
        `${count} ${count === 1 ? 'estudiante pasó' : 'estudiantes pasaron'} a ${estado.toLowerCase()}.`,
        'success',
      );
    } else if (action === 'eliminar' && selected.size) {
      const count = selected.size;
      const text = `Se eliminarán ${count} ${count === 1 ? 'estudiante' : 'estudiantes'} de esta demostración.`;
      if (await au.confirmDelete(text)) {
        all = all.filter((r) => !selected.has(r.id));
        selected.clear();
        await paint();
        au.toast(`Se eliminaron ${count} registros.`, 'success');
        announce(`Se eliminaron ${count} registros.`);
      }
    }
  });

  await load();
}
