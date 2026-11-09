/**
 * Pestañas accesibles (portado de la Fase 4).
 *
 * Bootstrap ya resuelve el comportamiento; este componente completa lo que el
 * marcado manual suele olvidar: `role=tablist/tab/tabpanel`, `aria-controls`,
 * `aria-labelledby`, `tabindex` del panel, y emite `au:tabs:change`.
 *
 * ```html
 * <div data-au-tabs>
 *   <ul class="nav nav-tabs">
 *     <li class="nav-item"><button class="nav-link active" data-bs-target="#t-datos">Datos</button></li>
 *     <li class="nav-item"><button class="nav-link" data-bs-target="#t-pagos">Pagos</button></li>
 *   </ul>
 *   <div class="tab-content">
 *     <div class="tab-pane fade show active" id="t-datos">…</div>
 *     <div class="tab-pane fade" id="t-pagos">…</div>
 *   </div>
 * </div>
 * ```
 * @module components/tabs
 */
import { Tab } from 'bootstrap';
import { emit, EVENTS } from '../core/events.js';

let uid = 0;

/** @type {import('../types.js').ComponentDefinition} */
export const tabsComponent = {
  name: 'tabs',
  selector: '[data-au-tabs]',
  init(root) {
    const nav = /** @type {HTMLElement | null} */ (root.matches('.nav') ? root : root.querySelector('.nav'));
    if (!nav) {
      console.error('[AU] data-au-tabs necesita un elemento .nav.');
      return () => {};
    }
    uid += 1;
    const links = /** @type {HTMLElement[]} */ ([
      ...nav.querySelectorAll(
        '[data-bs-toggle="tab"], [data-bs-toggle="pill"], [data-bs-target], [role="tab"]',
      ),
    ]);
    if (links.length && !nav.hasAttribute('role')) nav.setAttribute('role', 'tablist');
    links.forEach((link, index) => {
      if (!link.id) link.id = `au-tab-${uid}-${index}`;
      link.setAttribute('role', 'tab');
      if (!link.hasAttribute('data-bs-toggle')) link.setAttribute('data-bs-toggle', 'tab');
      if (link.tagName === 'BUTTON' && !link.hasAttribute('type')) link.setAttribute('type', 'button');
      link.setAttribute('aria-selected', String(link.classList.contains('active')));
      const target = link.getAttribute('data-bs-target') ?? link.getAttribute('href');
      if (target?.startsWith('#')) {
        const pane = document.getElementById(target.slice(1));
        if (pane) {
          link.setAttribute('aria-controls', pane.id);
          pane.setAttribute('role', 'tabpanel');
          pane.setAttribute('aria-labelledby', link.id);
          if (!pane.hasAttribute('tabindex')) pane.setAttribute('tabindex', '0');
        }
      }
      Tab.getOrCreateInstance(link);
    });
    /** @param {Event} event Evento de Bootstrap. */
    const onShown = (event) => {
      const e = /** @type {Event & { relatedTarget?: Element }} */ (event);
      emit(EVENTS.TABS_CHANGE, { tab: e.target, previous: e.relatedTarget ?? null }, root);
    };
    nav.addEventListener('shown.bs.tab', onShown);
    /**
     * Botones "Siguiente/Anterior" de un asistente: `data-au-tab-go="#panel"` activa ese paso.
     * @param {Event} event Clic.
     */
    const onGo = (event) => {
      const btn = /** @type {HTMLElement | null} */ (event.target)?.closest?.('[data-au-tab-go]');
      if (!btn || !root.contains(btn)) return;
      const dest = btn.getAttribute('data-au-tab-go');
      const link = links.find((l) => (l.getAttribute('data-bs-target') ?? l.getAttribute('href')) === dest);
      if (link) Tab.getOrCreateInstance(link).show();
    };
    root.addEventListener('click', onGo);
    return () => {
      root.removeEventListener('click', onGo);
      nav.removeEventListener('shown.bs.tab', onShown);
      links.forEach((link) => Tab.getInstance(link)?.dispose());
    };
  },
};
