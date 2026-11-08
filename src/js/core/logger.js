/**
 * Logger con niveles y destino intercambiable (portado del kernel de la Fase 4).
 *
 * - Nivel por defecto `warn`; con `<meta name="au-config" content='{"debug":true}'>` baja a `debug`.
 * - Nunca registra credenciales, tokens ni cuerpos de solicitud/respuesta: `sanitize()`
 *   redacta claves sensibles antes de escribir.
 * - El destino (`sink`) se reemplaza en pruebas o para enviar a un servicio externo.
 *
 * ```js
 * import { logger } from './core/logger.js';
 * const log = logger.child('pagos');
 * log.debug('pago.registrado', { id: 12 });
 * ```
 * @module core/logger
 */

/**
 * @typedef {'debug' | 'info' | 'warn' | 'error'} LogLevel
 */

/**
 * @typedef {object} LogSink
 * @property {(...args: unknown[]) => void} debug Escribe nivel debug.
 * @property {(...args: unknown[]) => void} info Escribe nivel info.
 * @property {(...args: unknown[]) => void} warn Escribe nivel warn.
 * @property {(...args: unknown[]) => void} error Escribe nivel error.
 */

/** @type {Readonly<Record<LogLevel, number>>} */
const LEVELS = Object.freeze({ debug: 10, info: 20, warn: 30, error: 40 });
const SENSITIVE_TEXT = /(token|password|contrase|secret|credential|authorization|cookie|bearer)/i;
const SENSITIVE_KEY = /(token|password|contrase|secret|credential|authorization|cookie|body|data|raw)/i;

/** Logger estructurado. */
export class Logger {
  /** @type {LogLevel} */
  #level;
  /** @type {LogSink | undefined} */
  #sink;
  /** @type {string} */
  #context;

  /**
   * @param {object} [options] Opciones.
   * @param {LogLevel} [options.level='warn'] Nivel mínimo.
   * @param {LogSink} [options.sink] Destino (por defecto `console`).
   * @param {string} [options.context] Prefijo de contexto.
   */
  constructor({ level = 'warn', sink, context = '' } = {}) {
    if (LEVELS[level] === undefined) throw new TypeError('[AU] Nivel de log no válido.');
    this.#level = level;
    this.#sink = sink ?? (typeof console === 'undefined' ? undefined : console);
    this.#context = context;
  }

  /** @returns {LogLevel} Nivel actual. */
  get level() {
    return this.#level;
  }

  /**
   * Cambia el nivel mínimo.
   * @param {LogLevel} level Nivel.
   * @returns {void}
   */
  setLevel(level) {
    if (LEVELS[level] === undefined) throw new TypeError('[AU] Nivel de log no válido.');
    this.#level = level;
  }

  /**
   * Reemplaza el destino.
   * @param {LogSink} sink Destino con debug/info/warn/error.
   * @returns {void}
   */
  setSink(sink) {
    this.#sink = sink;
  }

  /**
   * Logger hijo con otro contexto y el mismo destino.
   * @param {string} context Contexto (p. ej. el módulo).
   * @returns {Logger} Hijo.
   */
  child(context) {
    return new Logger({ level: this.#level, sink: this.#sink, context: context || this.#context });
  }

  /**
   * Convierte un valor en texto seguro para registrar.
   * @param {unknown} value Valor.
   * @returns {string} Texto (con `[redacted]` donde haga falta).
   */
  sanitize(value) {
    if (typeof value === 'string') return SENSITIVE_TEXT.test(value) ? '[redacted]' : value;
    if (value instanceof Error) return `${value.name}: ${value.message}`;
    if (value && typeof value === 'object') {
      try {
        return JSON.stringify(value, (key, entry) => (key && SENSITIVE_KEY.test(key) ? '[redacted]' : entry));
      } catch {
        return '[objeto no serializable]';
      }
    }
    return String(value ?? '');
  }

  /**
   * @param {LogLevel} level Nivel.
   * @param {string} message Mensaje.
   * @param {unknown[]} args Datos.
   * @returns {void}
   */
  #emit(level, message, args) {
    if (LEVELS[level] < LEVELS[this.#level] || !this.#sink) return;
    const prefix = `[AU${this.#context ? ` · ${this.#context}` : ''}]`;
    this.#sink[level](prefix, this.sanitize(message), ...args.map((a) => this.sanitize(a)));
  }

  /**
   * @param {string} message Mensaje.
   * @param {...unknown} args Datos.
   * @returns {void}
   */
  debug(message, ...args) {
    this.#emit('debug', message, args);
  }

  /**
   * @param {string} message Mensaje.
   * @param {...unknown} args Datos.
   * @returns {void}
   */
  info(message, ...args) {
    this.#emit('info', message, args);
  }

  /**
   * @param {string} message Mensaje.
   * @param {...unknown} args Datos.
   * @returns {void}
   */
  warn(message, ...args) {
    this.#emit('warn', message, args);
  }

  /**
   * @param {string} message Mensaje.
   * @param {...unknown} args Datos.
   * @returns {void}
   */
  error(message, ...args) {
    this.#emit('error', message, args);
  }
}

/** Logger compartido de la aplicación. */
export const logger = new Logger();
