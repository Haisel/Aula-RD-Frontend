/**
 * Sidebar de los dashboards.
 *
 * - ≥ lg: `[data-au-sidebar-toggle]` colapsa/expande (`.au-app.is-collapsed`), se recuerda en `localStorage`.
 * - < lg: la sidebar es un `offcanvas-lg` de Bootstrap; ábrala con
 *   `<button data-bs-toggle="offcanvas" data-bs-target="#au-sidebar">`.
 * - Marca como activo el enlace cuyo `href` coincide con la página actual
 *   si ninguno tiene `.active` (útil cuando el backend no lo marca).
 * @module components/sidebar
 */
import { getItem, setItem } from '../core/storage.js';
import { emit, EVENTS } from '../core/events.js';

/**
 * Colapsa o expande la sidebar.
 * @param {boolean} [force] Estado deseado; si se omite, alterna.
 * @returns {boolean} `true` si quedó colapsada.
 */
export function toggleSidebar(force) {
  const app = document.querySelector('[data-au-app]');
  if (!app) return false;
  const collapsed = app.classList.toggle('is-collapsed', force);
  setItem('sidebar-collapsed', collapsed);
  document
    .querySelectorAll('[data-au-sidebar-toggle]')
    .forEach((b) => b.setAttribute('aria-expanded', String(!collapsed)));
  emit(EVENTS.SIDEBAR_TOGGLE, { collapsed });
  return collapsed;
}

/** @type {import('../types.js').ComponentDefinition} */
export const appShellComponent = {
  name: 'app',
  selector: '[data-au-app]',
  init(app) {
    if (getItem('sidebar-collapsed', false)) app.classList.add('is-collapsed');
    const links = /** @type {HTMLAnchorElement[]} */ (
      Array.from(app.querySelectorAll('.au-sidebar .nav-link'))
    );
    if (!links.some((a) => a.classList.contains('active'))) {
      const here = window.location.pathname.split('/').pop() || 'index.html';
      const match = links.find((a) => a.getAttribute('href')?.split('/').pop() === here);
      if (match) {
        match.classList.add('active');
        match.setAttribute('aria-current', 'page');
      }
    }
    const onClick = (/** @type {Event} */ e) => {
      if (/** @type {HTMLElement} */ (e.target).closest('[data-au-sidebar-toggle]')) toggleSidebar();
    };
    app.addEventListener('click', onClick);
    return () => app.removeEventListener('click', onClick);
  },
};
