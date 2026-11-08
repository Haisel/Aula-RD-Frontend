/**
 * Registro de componentes auto-inicializables.
 *
 * Cada componente declara un selector `[data-au-*]`. `initAll(root)` busca esos
 * elementos dentro de `root`, los inicializa una sola vez y los marca con
 * `data-au-ready="nombre"`. Llame `AU.init(contenedor)` después de insertar
 * HTML dinámico (por ejemplo, tras una respuesta AJAX).
 * @module core/registry
 */
import { emit, EVENTS } from './events.js';

/** @typedef {import('../types.js').ComponentDefinition} ComponentDefinition */

/** @type {ComponentDefinition[]} */
const components = [];

/** @type {WeakMap<HTMLElement, Map<string, () => void>>} */
const cleanups = new WeakMap();

/**
 * Registra un componente. Si ya existe uno con el mismo nombre, lo reemplaza.
 * @param {ComponentDefinition} definition Definición del componente.
 * @returns {void}
 */
export function register(definition) {
  const i = components.findIndex((c) => c.name === definition.name);
  if (i >= 0) components.splice(i, 1, definition);
  else components.push(definition);
}

/**
 * Lista de nombres registrados (útil para depurar).
 * @returns {string[]} Nombres de componentes.
 */
export function registered() {
  return components.map((c) => c.name);
}

/**
 * Inicializa todos los componentes dentro de `root`.
 * @param {ParentNode} [root=document] Contenedor.
 * @returns {number} Cantidad de elementos inicializados.
 */
export function initAll(root = document) {
  let count = 0;
  for (const def of components) {
    const nodes = /** @type {HTMLElement[]} */ (Array.from(root.querySelectorAll(def.selector)));
    if (root instanceof HTMLElement && root.matches(def.selector)) nodes.unshift(root);
    for (const el of nodes) {
      const ready = (el.dataset.auReady ?? '').split(' ');
      if (ready.includes(def.name)) continue;
      try {
        const cleanup = def.init(el);
        el.dataset.auReady = [...ready.filter(Boolean), def.name].join(' ');
        if (typeof cleanup === 'function') {
          const map = cleanups.get(el) ?? new Map();
          map.set(def.name, cleanup);
          cleanups.set(el, map);
        }
        count += 1;
      } catch (error) {
        console.error(`[AU] Falló la inicialización de "${def.name}"`, el, error);
      }
    }
  }
  emit(EVENTS.READY, { root, count });
  return count;
}

/**
 * Destruye los componentes de un elemento (llama sus funciones de limpieza).
 * @param {HTMLElement} el Elemento inicializado.
 * @returns {void}
 */
export function destroy(el) {
  cleanups.get(el)?.forEach((fn) => fn());
  cleanups.delete(el);
  delete el.dataset.auReady;
}
