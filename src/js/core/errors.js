/**
 * Error tipado de Aula RD. Todos los errores que la fachada lanza o rechaza
 * son `AppError`, con un `code` estable para decidir qué hacer.
 *
 * | code                | Cuándo |
 * |---------------------|--------|
 * | `LIB_LOAD_FAILED`   | No se pudo descargar una librería diferida (red, CSP). |
 * | `INVALID_ARGUMENT`  | Argumento inválido en una llamada a `AU.*`. |
 * | `NOT_FOUND`         | Elemento, plantilla o modal inexistente. |
 * | `HTTP_ERROR`        | Error de API (ver `details` con {@link ApiErrorShape}). |
 * @module core/errors
 */

/** Error de la aplicación con `code` estable y datos opcionales. */
export class AppError extends Error {
  /**
   * @param {string} message Mensaje para el desarrollador (o el usuario, si es legible).
   * @param {object} [options] Opciones.
   * @param {string} [options.code='APP_ERROR'] Código estable.
   * @param {unknown} [options.cause] Error original.
   * @param {unknown} [options.details] Datos adicionales.
   */
  constructor(message, { code = 'APP_ERROR', cause, details } = {}) {
    super(message, { cause });
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Lanza `AppError(INVALID_ARGUMENT)` si la condición es falsa.
 * @param {unknown} condition Condición que debe cumplirse.
 * @param {string} message Mensaje.
 * @returns {asserts condition} Nada.
 */
export function assert(condition, message) {
  if (!condition) throw new AppError(message, { code: 'INVALID_ARGUMENT' });
}

/**
 * Resuelve un elemento a partir de un selector o del propio elemento.
 * @template {Element} T
 * @param {string | T | null | undefined} target Selector CSS o elemento.
 * @param {string} what Descripción para el mensaje de error.
 * @returns {T} El elemento.
 */
export function resolveElement(target, what) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) throw new AppError(`[AU] No se encontró ${what}: ${String(target)}`, { code: 'NOT_FOUND' });
  return /** @type {T} */ (el);
}
