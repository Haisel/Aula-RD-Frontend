/**
 * Demostración del calendario con agenda filtrable (spec 012, T-26 · RF-15).
 *
 * El calendario lo pinta el componente declarativo `data-au-calendar` con `data/eventos.json`; este
 * código añade la agenda en lista (accesible, sin ratón) con un filtro por categoría. Nada se guarda
 * (RN-02). Usa solo la fachada `window.AU`.
 * @module demo/calendario-page
 */

/** Categoría visible de cada clase de color de evento. */
const CATEGORIAS = /** @type {Record<string, string>} */ ({
  'au-event-navy': 'Reuniones',
  'au-event-danger': 'Cierres',
  'au-event-gold': 'Entregas',
  'au-event-accent': 'Evaluaciones',
});

/**
 * @typedef {object} Evento
 * @property {string} title Título.
 * @property {string} start Inicio (ISO).
 * @property {string} [className] Clase de color.
 * @property {boolean} [allDay] Evento de todo el día.
 */

/**
 * Categoría de un evento.
 * @param {Evento} e Evento.
 * @returns {string} Nombre de la categoría.
 */
export const categoriaDe = (e) => CATEGORIAS[e.className ?? ''] ?? 'Otros';

/**
 * Activa la agenda sobre su contenedor.
 * @param {HTMLElement} root Contenedor `[data-demo="calendario"]`.
 * @param {any} au Fachada `window.AU`.
 * @returns {Promise<void>}
 */
export async function calendario(root, au) {
  const list = /** @type {HTMLElement} */ (root.querySelector('[data-cal="lista"]'));
  const filter = /** @type {HTMLSelectElement} */ (root.querySelector('[data-cal="categoria"]'));
  const live = /** @type {HTMLElement} */ (root.querySelector('[data-cal="anuncio"]'));

  /** @type {Evento[]} */
  let events;
  try {
    events = /** @type {Evento[]} */ (await au.api.get('data/eventos.json'));
  } catch {
    list.innerHTML = '<li class="list-group-item text-danger">No se pudo cargar la agenda de ejemplo.</li>';
    return;
  }
  events = [...events].sort((a, b) => a.start.localeCompare(b.start));
  for (const c of new Set(events.map(categoriaDe))) filter.add(new Option(c, c));

  /**
   * Pinta la agenda con el filtro actual.
   * @returns {void}
   */
  const paint = () => {
    const shown = events.filter((e) => !filter.value || categoriaDe(e) === filter.value);
    list.innerHTML = shown.length
      ? shown
          .map(
            (e) =>
              `<li class="list-group-item d-flex flex-wrap gap-2"><strong class="au-tabular">${au.escapeHtml(au.formatDate(e.start))}</strong><span class="flex-grow-1">${au.escapeHtml(e.title)}</span><span class="au-status au-status-info">${au.escapeHtml(categoriaDe(e))}</span></li>`,
          )
          .join('')
      : '<li class="list-group-item text-body-secondary">No hay eventos en esta categoría.</li>';
    live.textContent = `${shown.length} eventos en la agenda.`;
  };

  filter.addEventListener('change', paint);
  paint();
}
