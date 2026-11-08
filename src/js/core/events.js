/**
 * Bus de eventos de aplicación sobre `CustomEvent` (sin librería).
 *
 * Patrón de nombres: `au:<ámbito>:<evento>` (heredado del `ar:<ámbito>:<evento>`
 * de la Fase 3, con el prefijo de la nueva fachada). Se pueden escuchar desde
 * cualquier script, también fuera del bundle:
 *
 * ```js
 * document.addEventListener('au:theme:changed', (e) => console.log(e.detail.theme));
 * AU.events.on(AU.events.names.SESSION_EXPIRED, () => …);
 * ```
 * @module core/events
 */

/**
 * Nombres de eventos públicos.
 * @readonly
 * @enum {string}
 */
export const EVENTS = Object.freeze({
  /** Arranque terminado (sesión e institución resueltas). detail: `{ portal }` */
  APP_READY: 'au:app:ready',
  /** Error no controlado reportado al manejador central. detail: `{ code, status }` */
  APP_ERROR: 'au:app:error',
  /** Se inicializaron componentes con `AU.init()`. detail: `{ root, count }` */
  COMPONENTS_READY: 'au:components:ready',
  /** Cambió el tema. detail: `{ theme, preference }` */
  THEME_CHANGED: 'au:theme:changed',
  /** La sidebar se colapsó/expandió. detail: `{ collapsed }` */
  SIDEBAR_TOGGLE: 'au:sidebar:toggle',
  /** Formulario válido con `data-au-submit="event"`. detail: `{ form, data }` */
  FORM_SUBMIT: 'au:form:submit',
  /** Envío AJAX exitoso. detail: `{ form, data, response }` */
  FORM_SUCCESS: 'au:form:success',
  /** Envío AJAX fallido. detail: `{ form, error }` (`error` es un `AppError`) */
  FORM_ERROR: 'au:form:error',
  /** Se pintó una plantilla `data-au-render`. detail: `{ data }` */
  RENDER_DONE: 'au:render:done',
  /** Cambió el estado de la sesión. detail: `{ from, to }` */
  SESSION_CHANGED: 'au:session:changed',
  /** El servidor respondió 401. detail: `{}` */
  SESSION_EXPIRED: 'au:session:expired',
  /** Cambió la institución activa. detail: `{ id }` */
  INSTITUTION_CHANGED: 'au:institution:changed',
  /** Cambió una barra con `AU.progress()`. detail: `{ value, max, percent }` (en el `.progress`) */
  PROGRESS_CHANGE: 'au:progress:change',
  /** Se mostró una pestaña de `data-au-tabs`. detail: `{ tab, previous }` (en el contenedor) */
  TABS_CHANGE: 'au:tabs:change',
  /** Cambió el contexto visible (usuario, institución, permisos). detail: `{ context }` */
  CONTEXT_CHANGED: 'au:context:changed',
});

/**
 * Bus mínimo ligado a un `EventTarget` (por defecto `document`).
 * Recuerda sus propios handlers para poder retirarlos todos con `clear()`.
 */
export class EventBus {
  /** @type {EventTarget} */
  #target;
  /** @type {Map<string, Set<EventListener>>} */
  #handlers = new Map();

  /**
   * @param {EventTarget} [target] Destino de los eventos (por defecto `document`).
   */
  constructor(target) {
    if (target && typeof target.addEventListener !== 'function') {
      throw new TypeError('[AU] EventBus necesita un EventTarget.');
    }
    this.#target = target ?? document;
  }

  /**
   * Registra un handler.
   * @param {string} name Nombre del evento.
   * @param {(event: CustomEvent) => void} handler Manejador.
   * @returns {() => void} Función para retirarlo.
   */
  on(name, handler) {
    if (typeof name !== 'string' || !name) throw new TypeError('[AU] events.on necesita un nombre.');
    if (typeof handler !== 'function') throw new TypeError('[AU] events.on necesita un handler.');
    const listener = /** @type {EventListener} */ (handler);
    if (!this.#handlers.has(name)) this.#handlers.set(name, new Set());
    /** @type {Set<EventListener>} */ (this.#handlers.get(name)).add(listener);
    this.#target.addEventListener(name, listener);
    return () => this.off(name, handler);
  }

  /**
   * Registra un handler que se retira tras la primera llamada.
   * @param {string} name Nombre del evento.
   * @param {(event: CustomEvent) => void} handler Manejador.
   * @returns {() => void} Función para retirarlo antes de que se dispare.
   */
  once(name, handler) {
    /** @param {CustomEvent} event Evento. */
    const wrapped = (event) => {
      this.off(name, wrapped);
      handler(event);
    };
    return this.on(name, wrapped);
  }

  /**
   * Retira un handler.
   * @param {string} name Nombre del evento.
   * @param {(event: CustomEvent) => void} handler Manejador.
   * @returns {void}
   */
  off(name, handler) {
    const listener = /** @type {EventListener} */ (handler);
    const set = this.#handlers.get(name);
    if (set) {
      set.delete(listener);
      if (!set.size) this.#handlers.delete(name);
    }
    this.#target.removeEventListener(name, listener);
  }

  /**
   * Retira todos los handlers registrados por este bus.
   * @returns {void}
   */
  clear() {
    for (const [name, set] of [...this.#handlers]) {
      for (const listener of [...set]) this.#target.removeEventListener(name, listener);
    }
    this.#handlers.clear();
  }

  /**
   * Despacha un evento de aplicación.
   * @param {string} name Nombre del evento.
   * @param {object} [detail] Datos.
   * @returns {boolean} `false` si algún listener llamó `preventDefault()`.
   */
  emit(name, detail = {}) {
    return emit(name, detail, this.#target);
  }
}

/** Bus compartido de la aplicación (sobre `document`). */
export const bus = new EventBus();

/**
 * Emite un evento `au:*` en un destino concreto (burbujea hasta `document`).
 * Úselo para eventos ligados a un elemento (formularios, plantillas).
 * @param {string} name Nombre del evento (use {@link EVENTS}).
 * @param {object} [detail] Datos del evento.
 * @param {EventTarget} [target=document] Dónde se despacha.
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
  return bus.on(name, handler);
}
