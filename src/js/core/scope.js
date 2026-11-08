/**
 * Scope: ciclo de vida de una página, módulo o servicio (portado de la Fase 4).
 *
 * Al destruirlo se abortan sus solicitudes (`signal`) y se retiran sus listeners
 * y limpiezas. Los componentes `data-au-*` no lo necesitan: ya limpian con su
 * función de retorno.
 *
 * ```js
 * const scope = AU.createScope();
 * scope.on(window, 'resize', ajustar);
 * const datos = await AU.api.get('/cursos', { signal: scope.signal });
 * // al salir de la vista:
 * scope.destroy();   // cancela la petición (CancelledError) y retira el listener
 * ```
 * @module core/scope
 */

/** Objeto de vida con un `AbortController` y limpiezas. */
export class Scope {
  #controller = new AbortController();
  /** @type {Set<() => unknown>} */
  #cleanups = new Set();
  #destroyed = false;

  /** @returns {AbortSignal} Señal que se aborta al destruir. */
  get signal() {
    return this.#controller.signal;
  }

  /** @returns {boolean} `true` si ya se destruyó. */
  get destroyed() {
    return this.#destroyed;
  }

  /**
   * Registra una limpieza. Si el scope ya se destruyó, se ejecuta en el siguiente microtask.
   * @param {() => unknown} cleanup Función de limpieza.
   * @returns {() => void} Función para retirarla sin ejecutarla.
   */
  addCleanup(cleanup) {
    if (typeof cleanup !== 'function') throw new TypeError('[AU] Scope.addCleanup esperaba una función.');
    if (this.#destroyed) {
      queueMicrotask(() => {
        try {
          cleanup();
        } catch {
          /* limpieza aislada */
        }
      });
      return () => {};
    }
    this.#cleanups.add(cleanup);
    return () => this.#cleanups.delete(cleanup);
  }

  /**
   * Registra un listener que se retira al destruir el scope.
   * @param {EventTarget} target Destino.
   * @param {string} type Tipo de evento.
   * @param {EventListener} listener Listener.
   * @param {AddEventListenerOptions | boolean} [options] Opciones.
   * @returns {() => void} Función para retirar solo este listener.
   */
  on(target, type, listener, options = {}) {
    if (!target || typeof target.addEventListener !== 'function') {
      throw new TypeError('[AU] Scope.on necesita un EventTarget.');
    }
    if (this.#destroyed) return () => {};
    const opts = typeof options === 'boolean' ? { capture: options } : { ...options };
    const own = new AbortController();
    const abortOwn = () => own.abort();
    this.signal.addEventListener('abort', abortOwn, { once: true });
    target.addEventListener(type, listener, { ...opts, signal: own.signal });
    return () => {
      own.abort();
      this.signal.removeEventListener('abort', abortOwn);
    };
  }

  /**
   * Scope hijo que se destruye cuando este se destruye.
   * @returns {Scope} Hijo.
   */
  child() {
    const child = new Scope();
    if (this.#destroyed) child.destroy();
    else this.addCleanup(() => child.destroy());
    return child;
  }

  /**
   * Aborta la señal y ejecuta las limpiezas. Idempotente.
   * @param {unknown} [reason] Motivo del aborto.
   * @returns {void}
   */
  destroy(reason) {
    if (this.#destroyed) return;
    this.#destroyed = true;
    this.#controller.abort(reason);
    const cleanups = [...this.#cleanups];
    this.#cleanups.clear();
    for (const cleanup of cleanups) {
      try {
        const result = /** @type {any} */ (cleanup());
        if (result && typeof result.catch === 'function') result.catch(() => {});
      } catch {
        /* un fallo no impide destruir el resto */
      }
    }
  }

  /**
   * Alias de {@link Scope#destroy} (compatibilidad con la Fase 4).
   * @param {unknown} [reason] Motivo.
   * @returns {void}
   */
  abort(reason) {
    this.destroy(reason);
  }
}
