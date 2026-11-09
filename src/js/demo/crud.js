/**
 * Demostración del CRUD de estudiantes (spec 012, T-16 · RF-03).
 *
 * Lee `data/estudiantes.json` con `AU.api.get`, lo mantiene en memoria con {@link createStore} y
 * permite crear, editar, borrar y deshacer. Nada se guarda en el navegador ni en un servidor (RN-02):
 * al recargar la página vuelven los datos originales. Usa solo la fachada `window.AU`.
 * @module demo/crud
 */
import { createStore } from './store.js';

/** Cantidad de estudiantes que se cargan (la tabla pagina de 8 en 8). */
const MAX_ROWS = 24;
const GRADOS = [
  ...[1, 2, 3, 4, 5, 6].map((n) => `${n}.º Primaria`),
  ...[1, 2, 3, 4, 5, 6].map((n) => `${n}.º Secundaria`),
];

/**
 * @typedef {object} Estudiante
 * @property {string} id Identificador.
 * @property {string} nombre Nombre.
 * @property {string} grado Grado.
 * @property {string} seccion Sección.
 * @property {string} tutor Tutor.
 * @property {string} estado `Activo` o `Inactivo`.
 */

/**
 * Registra el esquema del formulario. Se hace aquí (y no en `helpers/schemas.js`) para que el
 * código de demostración no aumente `app.js` (RF-13).
 * @param {any} au Fachada `window.AU`.
 * @returns {void}
 */
function registerSchema(au) {
  au.registerSchema('crud-estudiante', (/** @type {any} */ z, /** @type {any} */ f) =>
    z.object({
      nombre: f.nombre('el nombre del estudiante'),
      grado: z.enum(GRADOS, { message: 'Seleccione el grado.' }),
      seccion: z.enum(['A', 'B', 'C'], { message: 'Seleccione la sección.' }),
      tutor: f.nombre('el nombre del tutor'),
      estado: z.enum(['Activo', 'Inactivo'], { message: 'Seleccione el estado.' }),
    }),
  );
}

/**
 * Activa la demostración del CRUD sobre su contenedor.
 * @param {HTMLElement} root Contenedor `[data-demo="crud"]`.
 * @param {any} au Fachada `window.AU`.
 * @returns {Promise<void>}
 */
export async function crud(root, au) {
  registerSchema(au);

  const region = /** @type {HTMLElement} */ (root.querySelector('[data-crud="region"]'));
  const selector = /** @type {HTMLSelectElement} */ (root.querySelector('[data-crud="estado"]'));
  const undoBtn = /** @type {HTMLButtonElement} */ (root.querySelector('[data-crud="deshacer"]'));
  const modal = /** @type {HTMLElement} */ (root.querySelector('[data-crud="modal"]'));
  const form = /** @type {HTMLFormElement} */ (modal.querySelector('form'));
  const title = /** @type {HTMLElement} */ (modal.querySelector('[data-crud="titulo"]'));
  const live = /** @type {HTMLElement} */ (root.querySelector('[data-crud="anuncio"]'));

  /** @type {ReturnType<typeof createStore<Estudiante>> | null} */
  let store = null;
  /** @type {any} */
  let table = null;
  /** Identificador del registro que se edita; `null` = alta. */
  let editingId = /** @type {string | null} */ (null);
  /** Elemento que abrió el modal, para devolverle el foco. */
  let opener = /** @type {HTMLElement | null} */ (null);

  /**
   * Destruye la tabla interactiva (si existe) antes de volver a pintar.
   * @returns {void}
   */
  const destroyTable = () => {
    table?.destroy?.();
    table = null;
  };

  /**
   * Anuncia un mensaje a los lectores de pantalla.
   * @param {string} text Mensaje.
   * @returns {void}
   */
  const announce = (text) => {
    live.textContent = text;
  };

  /**
   * Habilita o deshabilita "Deshacer" según el historial.
   * @returns {void}
   */
  const syncUndo = () => {
    undoBtn.disabled = !store?.canUndo();
  };

  /**
   * HTML de una fila de la tabla (todo el texto va escapado).
   * @param {Estudiante} r Estudiante.
   * @returns {string} Fila `<tr>`.
   */
  const rowHtml = (r) => {
    const name = au.escapeHtml(r.nombre);
    return `<tr>
      <td>${name}</td><td>${au.escapeHtml(r.grado)}</td><td>${au.escapeHtml(r.seccion)}</td>
      <td>${au.escapeHtml(r.tutor)}</td>
      <td><span class="au-status au-status-${au.statusVariant(r.estado)}">${au.escapeHtml(r.estado)}</span></td>
      <td class="text-end text-nowrap">
        <button class="btn btn-outline-primary au-btn-icon btn-sm" type="button" data-crud-edit="${au.escapeHtml(r.id)}" aria-label="Editar: ${name}"><i class="bi bi-pencil" aria-hidden="true"></i></button>
        <button class="btn btn-outline-primary au-btn-icon btn-sm" type="button" data-crud-delete="${au.escapeHtml(r.id)}" aria-label="Eliminar: ${name}"><i class="bi bi-trash3" aria-hidden="true"></i></button>
      </td></tr>`;
  };

  /**
   * Pinta el estado de la región: cargando, error, vacío o la tabla.
   * @param {'normal' | 'vacio' | 'cargando' | 'error'} state Estado a mostrar.
   * @returns {Promise<void>}
   */
  async function paint(state) {
    destroyTable();
    region.removeAttribute('aria-busy');
    const rows = store?.list() ?? [];
    if (state === 'cargando') {
      region.setAttribute('aria-busy', 'true');
      region.innerHTML = `<div class="card" aria-label="Cargando lista"><div class="card-body d-grid gap-3">${[1, 2, 3, 4]
        .map(
          () =>
            '<div class="d-flex gap-3 align-items-center"><span class="au-skeleton au-skeleton-circle"></span><div class="flex-grow-1 d-grid gap-2"><span class="au-skeleton w-50"></span><span class="au-skeleton w-75"></span></div></div>',
        )
        .join('')}</div></div>`;
      return;
    }
    if (state === 'error') {
      region.innerHTML = `<div class="alert alert-danger" role="alert"><i class="bi bi-x-octagon" aria-hidden="true"></i><div><p class="au-alert-title">No se pudo cargar la lista</p>Revise su conexión e intente de nuevo.<div class="mt-2"><button class="btn btn-outline-primary btn-sm" type="button" data-crud="reintentar"><i class="bi bi-arrow-clockwise" aria-hidden="true"></i>Reintentar</button></div></div></div>`;
      return;
    }
    if (state === 'vacio' || rows.length === 0) {
      region.innerHTML = `<div class="au-empty"><span class="au-stat-icon is-lg"><i class="bi bi-people" aria-hidden="true"></i></span><h3>Aún no hay estudiantes</h3><p>Agregue el primero con el botón «Agregar estudiante».</p></div>`;
      return;
    }
    region.innerHTML = `<div class="au-table-card"><div class="table-responsive"><table class="table table-hover align-middle w-100" id="tabla-crud" data-au-no-sort="5" aria-label="Estudiantes de demostración">
      <thead><tr><th scope="col">Nombre</th><th scope="col">Grado</th><th scope="col">Sección</th><th scope="col">Tutor</th><th scope="col">Estado</th><th scope="col"><span class="visually-hidden">Acciones</span></th></tr></thead>
      <tbody>${rows.map(rowHtml).join('')}</tbody></table></div></div>`;
    table = await au.createDataTable(region.querySelector('table'), { pageLength: 8 });
  }

  /**
   * Repinta según el estado elegido en el selector.
   * @returns {Promise<void>}
   */
  const refresh = () => paint(/** @type {'normal' | 'vacio' | 'cargando' | 'error'} */ (selector.value));

  /**
   * Carga los estudiantes desde `data/estudiantes.json` mostrando el esqueleto mientras tanto.
   * @returns {Promise<void>}
   */
  async function load() {
    await paint('cargando');
    try {
      const data = await au.api.get('data/estudiantes.json');
      store = createStore(/** @type {Estudiante[]} */ (data.slice(0, MAX_ROWS)), 'est');
      selector.value = 'normal';
      await refresh();
    } catch {
      selector.value = 'error';
      await paint('error');
    }
    syncUndo();
  }

  /**
   * Abre el modal para crear o editar.
   * @param {string | null} id Registro a editar, o `null` para un alta.
   * @param {HTMLElement | null} from Elemento que lo abrió.
   * @returns {void}
   */
  function openForm(id, from) {
    if (!store) return;
    editingId = id;
    opener = from;
    au.clearErrors(form);
    form.reset();
    const row = id ? store.get(id) : null;
    title.textContent = row ? 'Editar estudiante' : 'Agregar estudiante';
    if (row) {
      for (const key of ['nombre', 'grado', 'seccion', 'tutor', 'estado']) {
        const field = /** @type {HTMLInputElement | null} */ (form.elements.namedItem(key));
        if (field) field.value = String(row[/** @type {keyof Estudiante} */ (key)] ?? '');
      }
    }
    au.openModal(modal);
  }

  selector.addEventListener('change', () => {
    void refresh();
    announce(`Estado simulado: ${selector.selectedOptions[0]?.textContent ?? ''}.`);
  });

  root.addEventListener('click', async (event) => {
    const target = /** @type {HTMLElement} */ (event.target).closest('button');
    if (!target || !store) return;
    if (target.matches('[data-crud="nuevo"]')) openForm(null, target);
    else if (target.matches('[data-crud="deshacer"]')) {
      const undone = store.undo();
      if (undone) {
        await refresh();
        syncUndo();
        au.toast('Se deshizo el último cambio.', 'info');
        announce('Se deshizo el último cambio.');
      }
    } else if (target.matches('[data-crud="reintentar"]')) {
      selector.value = 'normal';
      await refresh();
    } else if (target.dataset.crudEdit) openForm(target.dataset.crudEdit, target);
    else if (target.dataset.crudDelete) {
      const row = store.get(target.dataset.crudDelete);
      if (!row) return;
      if (await au.confirmDeleteByName(row.nombre)) {
        store.remove(row.id);
        await refresh();
        syncUndo();
        au.toast(`Se eliminó a ${row.nombre}. Puede deshacerlo.`, 'success');
        announce(`Se eliminó a ${row.nombre}.`);
        /** @type {HTMLElement | null} */ (root.querySelector('[data-crud="nuevo"]'))?.focus();
      }
    }
  });

  // Alta o edición: el formulario ya se validó con el esquema `crud-estudiante`.
  form.addEventListener('au:form:submit', async (event) => {
    if (!store) return;
    const data = /** @type {CustomEvent} */ (event).detail.data;
    const patch = {
      nombre: data.nombre,
      grado: data.grado,
      seccion: data.seccion,
      tutor: data.tutor,
      estado: data.estado,
    };
    const editing = editingId;
    const saved = editing ? store.update(editing, patch) : store.create(patch);
    if (saved) {
      selector.value = 'normal';
      au.closeModal(modal);
      await refresh();
      syncUndo();
      announce(editing ? 'Estudiante actualizado.' : 'Estudiante agregado.');
    }
  });

  // Al cerrar el modal, el foco vuelve al botón que lo abrió (o al de "Agregar" si ya no existe).
  modal.addEventListener('hidden.bs.modal', () => {
    const back =
      opener && root.contains(opener)
        ? opener
        : (root.querySelector(`[data-crud-edit="${editingId ?? ''}"]`) ??
          root.querySelector('[data-crud="nuevo"]'));
    /** @type {HTMLElement | null} */ (back)?.focus();
  });

  await load();
}
