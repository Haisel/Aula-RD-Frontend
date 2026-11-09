/**
 * Punto de entrada del código de demostración de la galería (spec 012, T-13).
 *
 * Es una entrada de Vite aparte (`dist/js/demo.js`): solo la cargan las páginas que lo piden con
 * la variable de contexto `demo`, y no forma parte de `app.js` (RF-13). Usa únicamente la fachada
 * `window.AU`; no importa librerías de terceros ni guarda nada (RN-02).
 *
 * Cada página declara su demostración con `data-demo="<nombre>"` en un contenedor; aquí se
 * activa la que corresponda.
 * @module demo/galeria
 */
import { crud } from './crud.js';
import { reporte } from './reporte-page.js';
import { tablero } from './tablero-page.js';
import { tablas } from './tablas-page.js';

/**
 * Activa una demostración sobre su contenedor.
 * @callback Demo
 * @param {HTMLElement} root Contenedor con `data-demo`.
 * @param {any} au Fachada `window.AU`.
 * @returns {void | Promise<void>}
 */

/** @type {Record<string, Demo>} */
export const demos = { crud, reporte, tablero, tablas };

/**
 * Busca los contenedores `[data-demo]` de la página y activa su demostración.
 * @param {Record<string, Demo>} [registry] Demostraciones disponibles (por defecto, las del módulo).
 * @returns {Promise<number>} Cantidad de demostraciones activadas.
 */
export async function startDemos(registry = demos) {
  const au = /** @type {any} */ (window).AU;
  if (!au) {
    console.error('Galería: window.AU no está disponible; la demostración no se activó.');
    return 0;
  }
  let started = 0;
  for (const root of /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('[data-demo]'))) {
    const name = root.dataset.demo ?? '';
    const demo = registry[name];
    if (!demo) {
      console.warn(`Galería: no existe la demostración "${name}".`);
      continue;
    }
    await demo(root, au);
    started += 1;
  }
  return started;
}

if (typeof document !== 'undefined') {
  const au = /** @type {any} */ (window).AU;
  if (au?.ready) au.ready(() => void startDemos());
  else document.addEventListener('DOMContentLoaded', () => void startDemos());
}
