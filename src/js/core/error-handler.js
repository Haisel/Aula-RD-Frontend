/**
 * Manejador central de errores (portado de la Fase 4).
 *
 * Punto único para errores no capturados: los normaliza a la taxonomía, los
 * registra con el {@link module:core/logger} (sin datos personales) y emite
 * `au:app:error`. Nunca decide reglas de negocio. Las cancelaciones
 * (`CancelledError`) se ignoran: no son fallos.
 * @module core/error-handler
 */
import { toAppError, isAbortError } from './errors.js';
import { EVENTS } from './events.js';

/** Instala los ganchos globales y expone `report()`. */
export class ErrorHandler {
  /** @type {import('./logger.js').Logger} */
  #logger;
  /** @type {import('./events.js').EventBus} */
  #bus;
  /** @type {(() => void) | null} */
  #uninstall = null;

  /**
   * @param {object} deps Dependencias.
   * @param {import('./logger.js').Logger} deps.logger Logger.
   * @param {import('./events.js').EventBus} deps.bus Bus de eventos.
   */
  constructor({ logger, bus }) {
    if (typeof logger?.error !== 'function' || typeof bus?.emit !== 'function') {
      throw new TypeError('[AU] ErrorHandler necesita { logger, bus }.');
    }
    this.#logger = logger;
    this.#bus = bus;
  }

  /**
   * Normaliza, registra y emite `au:app:error`.
   * @param {unknown} error Error.
   * @param {{ context?: string }} [options] Contexto técnico (no sensible).
   * @returns {import('./errors.js').AppError} Error tipado.
   */
  report(error, { context } = {}) {
    const appError = toAppError(error);
    if (isAbortError(error)) return appError;
    try {
      this.#logger.error(`[${appError.code}] ${appError.message}`, context ? { context } : '');
    } catch {
      /* el logger nunca tumba el manejador */
    }
    try {
      this.#bus.emit(EVENTS.APP_ERROR, { code: appError.code, status: appError.status });
    } catch {
      /* el bus tampoco */
    }
    return appError;
  }

  /**
   * Escucha `error` y `unhandledrejection` en `window`. Idempotente.
   * @returns {() => void} Función para desinstalar.
   */
  install() {
    if (this.#uninstall) return this.#uninstall;
    /**
     * @param {ErrorEvent} event Evento.
     * @returns {void}
     */
    const onError = (event) => void this.report(event.error ?? event.message, { context: 'window.error' });
    /** @param {PromiseRejectionEvent} event Evento. */
    const onRejection = (event) => {
      if (!isAbortError(event.reason)) this.report(event.reason, { context: 'unhandledrejection' });
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    this.#uninstall = () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      this.#uninstall = null;
    };
    return this.#uninstall;
  }
}
