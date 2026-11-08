/**
 * Taxonomía cerrada de errores de Aula RD (fusión de la SPEC-004 §14 con la plantilla).
 *
 * Todo lo que `AU.*` lanza o rechaza es un {@link AppError} (o una subclase) con un
 * `code` estable. Use `instanceof` con las clases de `AU.errors` o compare `error.code`:
 *
 * ```js
 * try { await AU.api.post('/pagos', datos); }
 * catch (e) {
 *   if (e instanceof AU.errors.ValidationError) AU.showErrors(form, e.fieldErrors);
 *   else AU.toastError(e.message);
 * }
 * ```
 *
 * | Clase               | code                | Cuándo |
 * |---------------------|---------------------|--------|
 * | `AppError`          | `APP_ERROR` u otro  | Base. También `INVALID_ARGUMENT`, `NOT_FOUND` (DOM), `LIB_LOAD_FAILED`. |
 * | `NetworkError`      | `NETWORK_ERROR`     | Sin respuesta del servidor (red caída, CORS). |
 * | `TimeoutError`      | `TIMEOUT_ERROR`     | Se agotó `apiTimeoutMs`. |
 * | `CancelledError`    | `CANCELLED_ERROR`   | Se abortó con un `AbortSignal` (por ejemplo, de un `Scope`). |
 * | `UnauthorizedError` | `UNAUTHORIZED`      | HTTP 401: sesión vencida. |
 * | `ForbiddenError`    | `FORBIDDEN`         | HTTP 403. |
 * | `NotFoundError`     | `NOT_FOUND`         | HTTP 404. |
 * | `ValidationError`   | `VALIDATION_ERROR`  | HTTP 400/422 (con `fieldErrors`) o validación local. |
 * | `ConflictError`     | `CONFLICT`          | HTTP 409. |
 * | `ExpiredPageError`  | `PAGE_EXPIRED`      | HTTP 419 (CSRF vencido en Laravel). |
 * | `ServerError`       | `SERVER_ERROR`      | HTTP 5xx. |
 * | `UnknownError`      | `UNKNOWN_ERROR`     | Cualquier otra cosa. |
 *
 * Ningún error transporta credenciales, tokens ni datos personales en `message`.
 * `raw` conserva el cuerpo de la respuesta del servidor para depurar: no lo registre.
 *
 * Nota: cada clase fija `name` de forma explícita; `constructor.name` no sirve porque
 * el minificador renombra las clases en el build.
 * @module core/errors
 */

/**
 * @typedef {object} AppErrorOptions
 * @property {string} [code] Código estable (por defecto el de la clase).
 * @property {number} [status] Código HTTP si aplica.
 * @property {unknown} [cause] Error original.
 * @property {unknown} [details] Datos adicionales no sensibles.
 * @property {Record<string, string[]>} [fieldErrors] Errores por campo (validación del servidor).
 * @property {unknown} [raw] Cuerpo de la respuesta HTTP (solo depuración).
 */

/** Error base de la aplicación con `code` estable. */
export class AppError extends Error {
  /**
   * @param {string} [message] Mensaje claro en español.
   * @param {AppErrorOptions} [options] Opciones.
   */
  constructor(message, options = {}) {
    super(message ?? 'Ocurrió un error inesperado.', { cause: options.cause });
    this.name = 'AppError';
    /** @type {string} */
    this.code = options.code || 'APP_ERROR';
    /** @type {number | undefined} */
    this.status = Number.isInteger(options.status) ? options.status : undefined;
    /** @type {unknown} */
    this.details = options.details;
    /** @type {Record<string, string[]>} */
    this.fieldErrors = options.fieldErrors ?? {};
    /** @type {unknown} */
    this.raw = options.raw;
  }
}

/**
 * Crea una subclase con nombre, código y mensaje por defecto.
 * @param {string} name Nombre de la clase.
 * @param {string} code Código por defecto.
 * @param {string} defaultMessage Mensaje por defecto.
 * @param {number} [status] Estado HTTP fijo.
 * @returns {typeof AppError} Subclase.
 */
function defineError(name, code, defaultMessage, status) {
  const Sub = class extends AppError {
    /**
     * @param {string} [message] Mensaje (por defecto, uno genérico en español).
     * @param {AppErrorOptions} [options] Opciones.
     */
    constructor(message, options = {}) {
      super(message || defaultMessage, { status, ...options, code: options.code || code });
      this.name = name;
    }
  };
  Object.defineProperty(Sub, 'name', { value: name });
  return Sub;
}

export const NetworkError = defineError(
  'NetworkError',
  'NETWORK_ERROR',
  'No se pudo conectar con el servidor. Verifique su conexión e intente de nuevo.',
);
export const TimeoutError = defineError(
  'TimeoutError',
  'TIMEOUT_ERROR',
  'La solicitud tardó demasiado. Intente de nuevo.',
);
export const CancelledError = defineError('CancelledError', 'CANCELLED_ERROR', 'La solicitud fue cancelada.');
export const UnauthorizedError = defineError(
  'UnauthorizedError',
  'UNAUTHORIZED',
  'Su sesión expiró. Inicie sesión de nuevo.',
  401,
);
export const ForbiddenError = defineError(
  'ForbiddenError',
  'FORBIDDEN',
  'No tiene permiso para realizar esta acción.',
  403,
);
export const NotFoundError = defineError('NotFoundError', 'NOT_FOUND', 'No encontramos lo que busca.', 404);
export const ValidationError = defineError(
  'ValidationError',
  'VALIDATION_ERROR',
  'Revise los datos marcados en el formulario.',
);
export const ConflictError = defineError(
  'ConflictError',
  'CONFLICT',
  'La acción entra en conflicto con el estado actual.',
  409,
);
export const ExpiredPageError = defineError(
  'ExpiredPageError',
  'PAGE_EXPIRED',
  'La página expiró. Recárguela e intente de nuevo.',
  419,
);
export const ServerError = defineError(
  'ServerError',
  'SERVER_ERROR',
  'Ocurrió un error en el servidor. Intente de nuevo en unos minutos.',
);
export const UnknownError = defineError('UnknownError', 'UNKNOWN_ERROR', 'Ocurrió un error inesperado.');

/** Clases públicas (se exponen como `AU.errors`). */
export const ERRORS = Object.freeze({
  AppError,
  NetworkError,
  TimeoutError,
  CancelledError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
  ExpiredPageError,
  ServerError,
  UnknownError,
});

/**
 * ¿El error proviene de un `AbortSignal` (fetch, axios o propio)?
 * @param {unknown} error Error.
 * @returns {boolean} Resultado.
 */
export function isAbortError(error) {
  if (!error || typeof error !== 'object') return false;
  const e = /** @type {any} */ (error);
  if (e instanceof CancelledError) return true;
  return e.name === 'AbortError' || e.name === 'CanceledError' || e.code === 'ERR_CANCELED';
}

/**
 * Normaliza cualquier excepción a la taxonomía.
 * @param {unknown} error Error recibido.
 * @returns {AppError} Error tipado (el mismo si ya lo era).
 */
export function toAppError(error) {
  if (error instanceof AppError) return error;
  if (isAbortError(error)) return new CancelledError(undefined, { cause: error });
  return new UnknownError(undefined, { cause: error });
}

/**
 * Devuelve la clase que corresponde a un estado HTTP.
 * @param {number} status Estado HTTP (0 = sin respuesta).
 * @returns {typeof AppError} Clase.
 */
export function errorClassForStatus(status) {
  if (status === 0) return NetworkError;
  if (status === 401) return UnauthorizedError;
  if (status === 403) return ForbiddenError;
  if (status === 404) return NotFoundError;
  if (status === 409) return ConflictError;
  if (status === 419) return ExpiredPageError;
  if (status === 400 || status === 422) return ValidationError;
  if (status >= 500) return ServerError;
  return UnknownError;
}

/**
 * Crea el error tipado de un estado HTTP.
 * @param {number} status Estado HTTP.
 * @param {AppErrorOptions & { message?: string }} [options] Mensaje y datos.
 * @returns {AppError} Error.
 */
export function fromHttpStatus(status, { message, ...options } = {}) {
  const Cls = errorClassForStatus(status);
  return new Cls(message || undefined, { ...options, status: status || undefined });
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
