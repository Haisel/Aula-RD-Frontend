/**
 * Cargador de módulos de negocio (portado de la Fase 4; contrato parcial).
 *
 * Cada módulo (estudiantes, cobros, asistencia…) declara un manifiesto con sus
 * portales y navegación, y se carga con `import()` cuando se necesita. No monta
 * componentes: eso lo hace el registro `data-au-*`.
 *
 * ```js
 * import { modules } from './kernel.js';
 * modules.define({ id: 'cobros', portals: ['institution-admin'], load: () => import('./modules/cobros.js') });
 * const cobros = await modules.load('cobros');
 * ```
 * @module core/module-loader
 */

/**
 * @typedef {object} ModuleNavEntry
 * @property {string} portal Portal donde aparece.
 * @property {string} section Sección del menú.
 * @property {string} label Texto.
 * @property {string} icon Ícono Bootstrap Icons (sin el prefijo `bi-`).
 * @property {string} to Ruta.
 * @property {string} [requires] Permiso visual requerido.
 */

/**
 * @typedef {object} ModuleDefinition
 * @property {string} id Identificador kebab-case.
 * @property {string[]} portals Portales donde existe.
 * @property {string[]} [dependsOn] Otros módulos requeridos.
 * @property {ModuleNavEntry[]} [navigation] Entradas de menú.
 * @property {() => Promise<object>} load Carga diferida que devuelve la API pública.
 */

/** Cargador perezoso, idempotente y seguro ante llamadas concurrentes. */
export class ModuleLoader {
  /** @type {Map<string, ModuleDefinition>} */
  #definitions = new Map();
  /** @type {Map<string, object>} */
  #instances = new Map();
  /** @type {Map<string, Promise<object>>} */
  #pending = new Map();
  /** @type {import('./logger.js').Logger} */
  #logger;

  /**
   * @param {object} deps Dependencias.
   * @param {import('./logger.js').Logger} deps.logger Logger.
   */
  constructor({ logger }) {
    if (!logger || typeof logger.debug !== 'function')
      throw new TypeError('[AU] ModuleLoader necesita { logger }.');
    this.#logger = logger;
  }

  /**
   * Registra un manifiesto. Un id repetido lanza error.
   * @param {ModuleDefinition} definition Manifiesto.
   * @returns {void}
   */
  define(definition) {
    if (!definition || typeof definition.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(definition.id)) {
      throw new Error('[AU] ModuleDefinition necesita un id kebab-case.');
    }
    if (this.#definitions.has(definition.id))
      throw new Error(`[AU] El módulo "${definition.id}" ya está registrado.`);
    if (typeof definition.load !== 'function')
      throw new TypeError(`[AU] El módulo "${definition.id}" necesita load().`);
    this.#definitions.set(definition.id, definition);
  }

  /**
   * @param {string} id Identificador.
   * @returns {ModuleDefinition | undefined} Manifiesto.
   */
  get(id) {
    return this.#definitions.get(id);
  }

  /** @returns {string[]} Ids registrados. */
  list() {
    return [...this.#definitions.keys()];
  }

  /**
   * Carga un módulo una sola vez (y antes, sus dependencias).
   * @param {string} id Identificador.
   * @returns {Promise<object>} API pública del módulo.
   */
  async load(id) {
    const done = this.#instances.get(id);
    if (done) return done;
    const pending = this.#pending.get(id);
    if (pending) return pending;
    const definition = this.#definitions.get(id);
    if (!definition) throw new Error(`[AU] Módulo no registrado: "${id}".`);
    const promise = (async () => {
      for (const dep of definition.dependsOn ?? []) await this.load(dep);
      const api = await definition.load();
      this.#instances.set(id, api);
      this.#logger.debug('module.loaded', { id });
      return api;
    })().finally(() => this.#pending.delete(id));
    this.#pending.set(id, promise);
    return promise;
  }

  /**
   * Entradas de navegación de un portal.
   * @param {string} portalId Portal.
   * @returns {ModuleNavEntry[]} Entradas.
   */
  navigationFor(portalId) {
    /** @type {ModuleNavEntry[]} */
    const entries = [];
    for (const def of this.#definitions.values()) {
      if (!def.portals?.includes(portalId)) continue;
      for (const entry of def.navigation ?? []) if (entry.portal === portalId) entries.push(entry);
    }
    return entries;
  }
}
