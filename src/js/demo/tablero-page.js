/**
 * Demostración del tablero de solicitudes, tipo kanban (spec 012, T-18 · RF-15).
 *
 * Lee `data/tablero.json` con `AU.api.get`. Las tarjetas se mueven arrastrando (`AU.dragSort`, que
 * carga SortableJS solo al hacer falta) o, sin ratón, con los botones «Mover a…» de cada tarjeta, que
 * también sirven al teclado y a los lectores de pantalla. Cada movimiento se anuncia. Nada se guarda
 * (RN-02). Usa solo la fachada `window.AU`.
 * @module demo/tablero-page
 */
import { COLUMNAS, agrupar, mover } from './tablero.js';

/** Nombre visible de cada columna. */
const NOMBRES = /** @type {Record<string, string>} */ ({
  nuevas: 'Nuevas',
  revision: 'En revisión',
  aprobadas: 'Aprobadas',
});

/** Variante de color de la prioridad. */
const PRIORIDAD = /** @type {Record<string, string>} */ ({ Alta: 'danger', Media: 'warning', Baja: 'info' });

/**
 * @typedef {import('./tablero.js').Tarjeta & {
 *   titulo: string, responsable: string, prioridad: string, fecha: string }} Solicitud
 */

/**
 * Activa la demostración del tablero sobre su contenedor.
 * @param {HTMLElement} root Contenedor `[data-demo="tablero"]`.
 * @param {any} au Fachada `window.AU`.
 * @returns {Promise<void>}
 */
export async function tablero(root, au) {
  /** @type {HTMLElement} */
  const region = /** @type {any} */ (root.querySelector('[data-tab="region"]'));
  /** @type {HTMLElement} */
  const live = /** @type {any} */ (root.querySelector('[data-tab="anuncio"]'));

  /** @type {Solicitud[]} */
  let initial = [];
  /** @type {Solicitud[]} */
  let cards = [];
  /** @type {any[]} */
  let sortables = [];

  /**
   * Anuncia un mensaje a los lectores de pantalla.
   * @param {string} text Mensaje.
   * @returns {void}
   */
  const announce = (text) => {
    live.textContent = text;
  };

  /**
   * Destruye las listas arrastrables antes de volver a pintar.
   * @returns {void}
   */
  const dropSortables = () => {
    for (const s of sortables) s.destroy?.();
    sortables = [];
  };

  /**
   * HTML de una tarjeta, con los botones para moverla a las columnas vecinas.
   * @param {Solicitud} t Solicitud.
   * @param {number} col Posición de su columna.
   * @returns {string} Elemento `<li>`.
   */
  const cardHtml = (t, col) => {
    const title = au.escapeHtml(t.titulo);
    /**
     * Botón de mover hacia una columna vecina.
     * @param {number} to Posición de la columna de destino.
     * @param {string} icon Ícono.
     * @returns {string} Botón o cadena vacía si no hay columna.
     */
    const btn = (to, icon) =>
      COLUMNAS[to]
        ? `<button class="btn btn-outline-primary au-btn-icon btn-sm" type="button" data-tab-move="${COLUMNAS[to]}" aria-label="Mover «${title}» a ${NOMBRES[COLUMNAS[to]]}"><i class="bi bi-${icon}" aria-hidden="true"></i></button>`
        : '';
    return `<li class="card au-kanban-card" data-id="${au.escapeHtml(t.id)}"><div class="card-body">
      <p class="fw-semibold mb-1">${title}</p>
      <p class="text-body-secondary small mb-2">${au.escapeHtml(t.responsable)} · ${au.formatDate(t.fecha)}</p>
      <div class="d-flex align-items-center justify-content-between gap-2">
        <span class="au-status au-status-${PRIORIDAD[t.prioridad] ?? 'info'}">Prioridad ${au.escapeHtml(t.prioridad.toLowerCase())}</span>
        <span class="d-flex gap-1">${btn(col - 1, 'arrow-left')}${btn(col + 1, 'arrow-right')}</span>
      </div></div></li>`;
  };

  /**
   * Pinta las tres columnas y activa el arrastre en cada una.
   * @returns {Promise<void>}
   */
  async function paint() {
    dropSortables();
    const groups = agrupar(cards);
    region.innerHTML = `<div class="row g-3">${COLUMNAS.map(
      (c, i) => `<div class="col-lg-4"><section class="au-kanban-col" aria-labelledby="k-${c}">
        <h2 class="h6 d-flex justify-content-between align-items-center mb-3" id="k-${c}">${NOMBRES[c]}<span class="badge text-bg-secondary">${groups[c].length}<span class="visually-hidden"> solicitudes</span></span></h2>
        <ul class="au-kanban-list list-unstyled mb-0" data-col="${c}">${groups[c].map((t) => cardHtml(/** @type {Solicitud} */ (t), i)).join('')}</ul>
      </section></div>`,
    ).join('')}</div>`;
    for (const list of /** @type {NodeListOf<HTMLElement>} */ (region.querySelectorAll('.au-kanban-list'))) {
      sortables.push(
        await au.dragSort(list, {
          group: 'tablero',
          draggable: '.au-kanban-card',
          onEnd: (/** @type {any} */ evt) => onDrop(evt),
        }),
      );
    }
  }

  /**
   * Registra una tarjeta soltada en otra posición y repinta (los botones dependen de la columna).
   * @param {any} evt Evento `onEnd` de SortableJS.
   * @returns {void}
   */
  function onDrop(evt) {
    if (evt.from === evt.to && evt.oldIndex === evt.newIndex) return;
    const id = evt.item.dataset.id;
    const col = evt.to.dataset.col;
    cards = mover(cards, id, col, evt.newIndex);
    const t = cards.find((c) => c.id === id);
    announce(`«${t?.titulo}» pasó a ${NOMBRES[col]}, posición ${evt.newIndex + 1}.`);
    setTimeout(() => void paint(), 0);
  }

  /**
   * Carga las solicitudes y pinta el tablero.
   * @returns {Promise<void>}
   */
  async function load() {
    region.setAttribute('aria-busy', 'true');
    region.innerHTML =
      '<div class="row g-3">' +
      COLUMNAS.map(
        () =>
          '<div class="col-lg-4"><div class="card"><div class="card-body d-grid gap-2"><span class="au-skeleton w-50"></span><span class="au-skeleton"></span><span class="au-skeleton w-75"></span></div></div></div>',
      ).join('') +
      '</div>';
    try {
      initial = /** @type {Solicitud[]} */ (await au.api.get('data/tablero.json'));
      cards = initial.map((t) => ({ ...t }));
      await paint();
    } catch {
      region.innerHTML =
        '<div class="alert alert-danger" role="alert"><i class="bi bi-x-octagon" aria-hidden="true"></i><div><p class="au-alert-title">No se pudo cargar el tablero</p>Revise su conexión e intente de nuevo.<div class="mt-2"><button class="btn btn-outline-primary btn-sm" type="button" data-tab="reintentar"><i class="bi bi-arrow-clockwise" aria-hidden="true"></i>Reintentar</button></div></div></div>';
    }
    region.removeAttribute('aria-busy');
  }

  root.addEventListener('click', async (event) => {
    const button = /** @type {HTMLElement} */ (event.target).closest('button');
    if (!button) return;
    if (button.matches('[data-tab="reintentar"]')) await load();
    else if (button.matches('[data-tab="reiniciar"]')) {
      cards = initial.map((t) => ({ ...t }));
      await paint();
      announce('El tablero volvió a su estado original.');
    } else if (button.dataset.tabMove) {
      const id = /** @type {HTMLElement} */ (button.closest('[data-id]')).dataset.id ?? '';
      const target = button.dataset.tabMove;
      cards = mover(cards, id, target);
      const t = /** @type {Solicitud} */ (cards.find((c) => c.id === id));
      const pos = agrupar(cards)[target].findIndex((c) => c.id === id) + 1;
      await paint();
      announce(`«${t.titulo}» pasó a ${NOMBRES[target]}, posición ${pos}.`);
      // El botón pulsado ya no existe: el foco va a la misma tarjeta en su nueva columna.
      /** @type {HTMLElement | null} */ (region.querySelector(`[data-id="${id}"] button`))?.focus();
    }
  });

  await load();
}
