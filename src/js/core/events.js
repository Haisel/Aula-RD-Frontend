/**
 * Bus de eventos basado en `CustomEvent` sobre `document`.
 * Todos los eventos de Aula RD usan el prefijo `au:` y se pueden escuchar
 * desde cualquier script, también fuera del bundle:
 *
 * ```js
 * document.addEventListener('au:theme-change', (e) => console.log(e.detail.theme));
 * ```
 * @module core/events
 */

/**
 * Nombres de eventos públicos.
 * @readonly
 * @enum {string}
 */
export const EVENTS = Object.freeze({
  /** Cambió el tema. detail: `{ theme: ThemeName, preference: ThemePreference }` */
  THEME_CHANGE: 'au:theme-change',
  /** Formulario válido con `data-au-submit="event"`. detail: `{ form, data }` */
  SUBMIT: 'au:submit',
  /** Envío AJAX exitoso. detail: `{ form, data, response }` */
  FORM_SUCCESS: 'au:form-success',
  /** Envío AJAX fallido. detail: `{ form, error }` */
  FORM_ERROR: 'au:form-error',
  /** La sidebar se colapsó/expandió. detail: `{ collapsed: boolean }` */
  SIDEBAR_TOGGLE: 'au:sidebar-toggle',
  /** Se inicializó un contenedor con `AU.init()`. detail: `{ root }` */
  READY: 'au:ready',
});

/**
 * Emite un evento `au:*`.
 * @param {string} name Nombre del evento (use {@link EVENTS}).
 * @param {object} [detail] Datos del evento.
 * @param {EventTarget} [target=document] Dónde se despacha (burbujea hasta document).
 * @returns {boolean} `false` si algún listener llamó `preventDefault()`.
 */
export function emit(name, detail = {}, target = document) {
  return target.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, cancelable: true }));
}

/**
 * Escucha un evento `au:*` en `document`.
 * @param {string} name Nombre del evento.
 * @param {(event: CustomEvent) => void} handler Manejador.
 * @returns {() => void} Función para dejar de escuchar.
 */
export function on(name, handler) {
  const listener = /** @type {EventListener} */ (handler);
  document.addEventListener(name, listener);
  return () => document.removeEventListener(name, listener);
}
