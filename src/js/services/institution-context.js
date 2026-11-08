/**
 * Contexto institucional: puerto neutral (portado de la Fase 4, SPEC-004 §11).
 *
 * Transporta, muestra y respeta la institución activa que **decide el backend**.
 * Nunca la elige ni la afirma por su cuenta. El mecanismo para enviarla en cada
 * petición (cabecera, ruta, cuerpo) sigue pendiente (D-02) y se conecta con
 * `AU.configureApi({ contextStrategy })`.
 *
 * Puertos:
 * - `resolveCurrent()` → institución activa.
 * - `available()` → instituciones a las que el usuario tiene acceso.
 * - `select(id)` → pide al backend cambiar de institución.
 * @module services/institution-context
 */
import { EVENTS } from '../core/events.js';

/**
 * @typedef {object} InstitutionRef
 * @property {string} id Identificador opaco.
 * @property {string} displayName Nombre para mostrar.
 */

/**
 * @typedef {object} InstitutionPorts
 * @property {() => Promise<Record<string, unknown> | null>} [resolveCurrent] Institución activa.
 * @property {() => Promise<Record<string, unknown>[]>} [available] Instituciones accesibles.
 * @property {(id: string) => Promise<void>} [select] Cambiar institución en el backend.
 */

/**
 * Normaliza una institución (acepta `name` o `displayName`). Conserva campos extra
 * (`plan`, `logo`…) para `data-au-bind="institution.*"`.
 * @param {Record<string, unknown> | null | undefined} raw Institución recibida.
 * @returns {(InstitutionRef & Record<string, unknown>) | null} Institución o `null`.
 */
export function normalizeInstitution(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const r = /** @type {Record<string, any>} */ (raw);
  const id = r.id ?? r.slug ?? r.name;
  if (id === undefined || id === null || id === '') return null;
  return { ...r, id: String(id), displayName: String(r.displayName ?? r.name ?? id) };
}

/** Puerto de contexto institucional. */
export class InstitutionContext {
  /** @type {import('../core/logger.js').Logger} */
  #logger;
  /** @type {import('../core/events.js').EventBus} */
  #bus;
  /** @type {InstitutionPorts} */
  #ports;
  /** @type {(InstitutionRef & Record<string, unknown>) | null} */
  #current = null;
  /** @type {'unknown' | 'none' | 'selected'} */
  #status = 'unknown';
  /** @type {Set<(context: InstitutionRef | null) => void>} */
  #listeners = new Set();

  /**
   * @param {object} deps Dependencias.
   * @param {import('../core/logger.js').Logger} deps.logger Logger.
   * @param {import('../core/events.js').EventBus} deps.bus Bus de eventos.
   * @param {InstitutionPorts} [deps.ports] Puertos.
   */
  constructor({ logger, bus, ports = {} }) {
    if (typeof logger?.debug !== 'function' || typeof bus?.emit !== 'function') {
      throw new TypeError('[AU] InstitutionContext necesita { logger, bus }.');
    }
    this.#logger = logger;
    this.#bus = bus;
    this.#ports = ports;
  }

  /** @returns {'unknown' | 'none' | 'selected'} Estado. */
  status() {
    return this.#status;
  }

  /** @returns {(InstitutionRef & Record<string, unknown>) | null} Institución activa (copia). */
  current() {
    return this.#current ? { ...this.#current } : null;
  }

  /**
   * Conecta (o reemplaza) los puertos.
   * @param {InstitutionPorts} ports Puertos.
   * @returns {void}
   */
  setPorts(ports) {
    this.#ports = { ...this.#ports, ...ports };
  }

  /**
   * @param {Record<string, unknown> | null} raw Institución.
   * @returns {void}
   */
  #set(raw) {
    const next = normalizeInstitution(raw);
    const previousId = this.#current?.id ?? null;
    this.#current = next;
    this.#status = next ? 'selected' : 'none';
    if (previousId !== (next?.id ?? null)) {
      this.#logger.debug('institution.changed', { id: next?.id ?? null });
      this.#bus.emit(EVENTS.INSTITUTION_CHANGED, { id: next?.id ?? null, previous: previousId });
    }
    for (const listener of [...this.#listeners]) {
      try {
        listener(this.current());
      } catch {
        /* aislado */
      }
    }
  }

  /**
   * Se suscribe a los cambios.
   * @param {(context: InstitutionRef | null) => void} listener Función.
   * @returns {() => void} Para cancelar.
   */
  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  /**
   * Aplica una institución que YA viene del backend (p. ej. de `#au-context`).
   * @param {Record<string, unknown> | null} raw Institución.
   * @returns {InstitutionRef | null} Institución aplicada.
   */
  apply(raw) {
    this.#set(raw);
    return this.current();
  }

  /**
   * Pregunta al backend la institución activa.
   * @returns {Promise<InstitutionRef | null>} Institución o `null`.
   */
  async resolve() {
    if (typeof this.#ports.resolveCurrent !== 'function') {
      if (this.#status === 'unknown') this.#set(null);
      return this.current();
    }
    this.#set((await this.#ports.resolveCurrent()) ?? null);
    return this.current();
  }

  /**
   * Instituciones a las que el backend dice que hay acceso.
   * @returns {Promise<InstitutionRef[]>} Lista (vacía sin puerto).
   */
  async available() {
    if (typeof this.#ports.available !== 'function') return [];
    const list = await this.#ports.available();
    return Array.isArray(list)
      ? /** @type {InstitutionRef[]} */ (list.map(normalizeInstitution).filter(Boolean))
      : [];
  }

  /**
   * Pide al backend cambiar de institución y vuelve a leer la activa.
   * Sin puerto `select`, lanza error: el frontend no cambia de institución por su cuenta.
   * @param {string} id Institución.
   * @returns {Promise<InstitutionRef | null>} Institución activa tras el cambio.
   */
  async select(id) {
    if (typeof id !== 'string' || !id) throw new TypeError('[AU] institution.select necesita un id.');
    if (typeof this.#ports.select !== 'function') {
      throw new Error('[AU] No hay puerto "select": conecte el backend con AU.configurePorts().');
    }
    await this.#ports.select(id);
    return this.resolve();
  }

  /**
   * Limpia el contexto en memoria (cierre de sesión).
   * @returns {void}
   */
  clear() {
    this.#set(null);
  }
}
