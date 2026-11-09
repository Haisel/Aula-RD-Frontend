/**
 * Servicio de sesión: máquina de estados (portado de la Fase 4, SPEC-004 §12).
 *
 * No autentica ni guarda credenciales. Solo refleja lo que el backend dice por
 * medio de **puertos**:
 *
 * - `resolve()` → `{ status, user }`: ¿quién es el usuario actual? (p. ej. `GET /api/me`)
 * - `signOut()` → invalida la sesión en el servidor.
 *
 * Sin puerto, `resolve()` queda en `unauthenticated` y **nunca finge identidad**.
 * Los datos del usuario sirven para mostrar y para la autorización VISUAL;
 * el backend valida cada operación.
 *
 * Estados: `unknown` → (`authenticated` | `unauthenticated`) → `expired` (tras un 401).
 * @module services/session-service
 */
import { EVENTS } from '../core/events.js';

/**
 * @typedef {'unknown' | 'unauthenticated' | 'authenticated' | 'expired'} SessionStatus
 */

/**
 * @typedef {object} CurrentUser
 * @property {string} [id] Identificador opaco.
 * @property {string} displayName Nombre para mostrar.
 * @property {string[]} roles Roles (super-admin, institution-admin, teacher, student-guardian).
 * @property {string[]} permissions Permisos opacos definidos por el backend.
 * @property {string} [portal] Portal del usuario.
 */

/**
 * @typedef {object} SessionPorts
 * @property {() => Promise<{ status: SessionStatus, user?: Record<string, unknown> | null }>} [resolve] Consulta al backend.
 * @property {() => Promise<void>} [signOut] Cierra la sesión en el backend.
 */

/**
 * Normaliza el usuario que entrega el backend (acepta `name` o `displayName`).
 * Conserva los campos extra para `data-au-bind="user.*"`.
 * @param {Record<string, unknown> | null | undefined} raw Usuario recibido.
 * @param {{ roles?: unknown[], permissions?: unknown[] }} [extra] Roles/permisos de nivel superior.
 * @returns {CurrentUser | null} Usuario normalizado.
 */
export function normalizeUser(raw, extra = {}) {
  if (!raw && !extra.roles?.length && !extra.permissions?.length) return null;
  const u = /** @type {Record<string, any>} */ (raw ?? {});
  const list = (/** @type {unknown} */ v) => (Array.isArray(v) ? v.map(String) : []);
  return {
    ...u,
    displayName: String(u.displayName ?? u.name ?? ''),
    roles: list(extra.roles ?? u.roles),
    permissions: list(extra.permissions ?? u.permissions),
  };
}

/** Máquina de estados de sesión. */
export class SessionService {
  /** @type {import('../core/logger.js').Logger} */
  #logger;
  /** @type {import('../core/events.js').EventBus} */
  #bus;
  /** @type {SessionPorts} */
  #ports;
  /** @type {SessionStatus} */
  #status = 'unknown';
  /** @type {CurrentUser | null} */
  #user = null;
  /** @type {Set<(status: SessionStatus) => void>} */
  #listeners = new Set();
  /** @type {Promise<SessionStatus> | null} */
  #resolving = null;

  /**
   * @param {object} deps Dependencias.
   * @param {import('../core/logger.js').Logger} deps.logger Logger.
   * @param {import('../core/events.js').EventBus} deps.bus Bus de eventos.
   * @param {SessionPorts} [deps.ports] Puertos hacia el backend.
   */
  constructor({ logger, bus, ports = {} }) {
    if (typeof logger?.debug !== 'function' || typeof bus?.emit !== 'function') {
      throw new TypeError('[AU] SessionService necesita { logger, bus }.');
    }
    this.#logger = logger;
    this.#bus = bus;
    this.#ports = ports;
  }

  /** @returns {SessionStatus} Estado actual. */
  status() {
    return this.#status;
  }

  /** @returns {CurrentUser | null} Usuario actual (copia superficial). */
  user() {
    return this.#user ? { ...this.#user } : null;
  }

  /**
   * Conecta (o reemplaza) los puertos hacia el backend.
   * @param {SessionPorts} ports Puertos.
   * @returns {void}
   */
  setPorts(ports) {
    this.#ports = { ...this.#ports, ...ports };
  }

  /**
   * @param {SessionStatus} next Estado.
   * @param {CurrentUser | null} user Usuario.
   * @returns {void}
   */
  #set(next, user) {
    const previous = this.#status;
    this.#status = next;
    this.#user = next === 'authenticated' ? user : null;
    if (previous !== next) {
      this.#logger.debug('session.status', { from: previous, to: next });
      this.#bus.emit(EVENTS.SESSION_CHANGED, { from: previous, to: next });
    }
    for (const listener of [...this.#listeners]) {
      try {
        listener(next);
      } catch {
        /* un listener roto no impide notificar a los demás */
      }
    }
  }

  /**
   * Se suscribe a los cambios (también se notifica si cambia el usuario sin cambiar el estado).
   * @param {(status: SessionStatus) => void} listener Función.
   * @returns {() => void} Para cancelar.
   */
  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  /**
   * Aplica un resultado que YA viene del backend (p. ej. el JSON `#au-context`
   * que el servidor imprimió en la página). No es un atajo para fingir sesión.
   * @param {{ status?: SessionStatus, user?: Record<string, unknown> | null, roles?: unknown[], permissions?: unknown[] }} result Resultado.
   * @returns {SessionStatus} Estado aplicado.
   */
  apply(result) {
    const user = normalizeUser(result?.user, { roles: result?.roles, permissions: result?.permissions });
    const status = result?.status ?? (user ? 'authenticated' : 'unauthenticated');
    this.#set(status === 'authenticated' && user ? 'authenticated' : 'unauthenticated', user);
    return this.#status;
  }

  /**
   * Pregunta al backend quién es el usuario (vía puerto). Concurrente-seguro.
   * @returns {Promise<SessionStatus>} Estado resultante.
   */
  async resolve() {
    if (this.#resolving) return this.#resolving;
    this.#resolving = (async () => {
      if (typeof this.#ports.resolve !== 'function') {
        if (this.#status === 'unknown') this.#set('unauthenticated', null);
        return this.#status;
      }
      try {
        return this.apply(await this.#ports.resolve());
      } catch (error) {
        this.#logger.error('session.resolve.failed', error);
        this.#set('unauthenticated', null);
        return this.#status;
      }
    })().finally(() => {
      this.#resolving = null;
    });
    return this.#resolving;
  }

  /**
   * Pide al backend cerrar la sesión y limpia el estado en memoria.
   * @returns {Promise<void>} Nada.
   */
  async signOut() {
    try {
      if (typeof this.#ports.signOut === 'function') await this.#ports.signOut();
    } finally {
      this.#set('unauthenticated', null);
    }
  }

  /**
   * Lo llama la capa HTTP ante un 401.
   * - Sesión `authenticated` → `expired` y emite `au:session:expired` (una sola vez).
   * - Cualquier otro estado → `unauthenticated` en silencio: quien nunca inició
   *   sesión no "expira" (sin aviso ni redirección).
   * @returns {void}
   */
  handleUnauthorized() {
    if (this.#status === 'expired') return;
    if (this.#status !== 'authenticated') {
      if (this.#status !== 'unauthenticated') this.#set('unauthenticated', null);
      return;
    }
    this.#set('expired', null);
    this.#bus.emit(EVENTS.SESSION_EXPIRED, {});
  }
}
