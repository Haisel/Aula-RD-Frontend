/**
 * Contenedor de servicios con factorías perezosas (portado de la Fase 4).
 *
 * Solo lo usa la raíz de composición (`kernel.js`). Los servicios reciben sus
 * dependencias por constructor y nunca importan el contenedor. La fachada `AU`
 * no lo expone (SPEC-004 §5).
 * @module core/container
 */

/** Registro de servicios con singletons por nombre y sustituciones para pruebas. */
export class ServiceContainer {
  /** @type {Map<string, () => unknown>} */
  #factories = new Map();
  /** @type {Map<string, unknown>} */
  #singletons = new Map();
  /** @type {Map<string, unknown>} */
  #overrides = new Map();
  #frozen = false;

  /**
   * Registra una factoría perezosa.
   * @param {string} name Nombre.
   * @param {() => unknown} factory Factoría (se llama una vez, al primer `resolve`).
   * @returns {this} El contenedor.
   */
  provide(name, factory) {
    if (typeof name !== 'string' || !name) throw new TypeError('[AU] provide necesita un nombre.');
    if (typeof factory !== 'function') throw new TypeError('[AU] provide necesita una factoría.');
    if (this.#frozen) throw new Error('[AU] El contenedor está congelado.');
    if (this.#factories.has(name)) throw new Error(`[AU] El servicio "${name}" ya está registrado.`);
    this.#factories.set(name, factory);
    return this;
  }

  /**
   * Registra una instancia ya construida.
   * @param {string} name Nombre.
   * @param {unknown} value Instancia.
   * @returns {this} El contenedor.
   */
  provideValue(name, value) {
    return this.provide(name, () => value);
  }

  /**
   * @param {string} name Nombre.
   * @returns {boolean} `true` si está registrado.
   */
  has(name) {
    return this.#factories.has(name) || this.#overrides.has(name);
  }

  /**
   * Resuelve un servicio (lo construye la primera vez).
   * @template T
   * @param {string} name Nombre.
   * @returns {T} Instancia.
   */
  resolve(name) {
    if (this.#overrides.has(name)) return /** @type {T} */ (this.#overrides.get(name));
    if (this.#singletons.has(name)) return /** @type {T} */ (this.#singletons.get(name));
    const factory = this.#factories.get(name);
    if (!factory) throw new Error(`[AU] Servicio no registrado: "${name}".`);
    const instance = factory();
    this.#singletons.set(name, instance);
    return /** @type {T} */ (instance);
  }

  /**
   * Sustituye un servicio (pruebas o cambio de fuente de datos).
   * @param {string} name Nombre.
   * @param {unknown} value Sustituto.
   * @returns {this} El contenedor.
   */
  override(name, value) {
    this.#overrides.set(name, value);
    return this;
  }

  /**
   * Quita todas las sustituciones.
   * @returns {void}
   */
  clearOverrides() {
    this.#overrides.clear();
  }

  /**
   * Impide nuevos `provide()`.
   * @returns {this} El contenedor.
   */
  freeze() {
    this.#frozen = true;
    return this;
  }

  /** @returns {string[]} Nombres registrados. */
  keys() {
    return [...new Set([...this.#factories.keys(), ...this.#overrides.keys()])];
  }
}
