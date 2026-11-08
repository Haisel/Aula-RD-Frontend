/**
 * Cliente HTTP (axios) neutro respecto al backend.
 *
 * - Envía el token CSRF si existe `<meta name="csrf-token" content="…">`
 *   (cabeceras `X-CSRF-TOKEN` y `X-XSRF-TOKEN`), válido para Laravel, Django, Rails, ASP.NET, etc.
 * - Normaliza los errores a {@link ApiErrorShape} entendiendo los formatos más comunes:
 *   `{ message, errors: { campo: [..] } }` (Laravel/Express),
 *   ProblemDetails `{ title, detail, errors }` (ASP.NET), `{ detail }` (Django REST),
 *   `{ error: "…" }` y texto plano.
 *
 * ```js
 * AU.configureHttp({ baseURL: '/api/v1' });
 * const { data } = await AU.http.get('/estudiantes');
 * ```
 * @module core/http
 */
import axios from 'axios';

/** @typedef {import('../types.js').ApiErrorShape} ApiErrorShape */

/** Instancia compartida. */
export const http = axios.create({
  timeout: 20000,
  headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (token) {
    config.headers.set('X-CSRF-TOKEN', token);
    config.headers.set('X-XSRF-TOKEN', token);
  }
  return config;
});

/** @type {((error: ApiErrorShape) => void) | null} */
let unauthorizedHandler = null;

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalized = normalizeError(error);
    if (normalized.status === 401 && unauthorizedHandler) unauthorizedHandler(normalized);
    return Promise.reject(normalized);
  },
);

/**
 * Configura la instancia HTTP.
 * @param {object} options Opciones.
 * @param {string} [options.baseURL] URL base del API.
 * @param {number} [options.timeout] Tiempo máximo en ms.
 * @param {Record<string, string>} [options.headers] Cabeceras adicionales.
 * @param {(error: ApiErrorShape) => void} [options.onUnauthorized] Se llama ante un 401 (p. ej. redirigir al login).
 * @returns {import('axios').AxiosInstance} La instancia configurada.
 */
export function configureHttp({ baseURL, timeout, headers, onUnauthorized } = {}) {
  if (baseURL !== undefined) http.defaults.baseURL = baseURL;
  if (timeout !== undefined) http.defaults.timeout = timeout;
  if (headers) Object.entries(headers).forEach(([k, v]) => (http.defaults.headers.common[k] = v));
  if (onUnauthorized) unauthorizedHandler = onUnauthorized;
  return http;
}

/**
 * Convierte cualquier error (axios, red, desconocido) en un {@link ApiErrorShape}.
 * Es una función pura y está probada en `tests/http.test.js`.
 * @param {unknown} error Error recibido.
 * @returns {ApiErrorShape} Error normalizado.
 */
export function normalizeError(error) {
  const err = /** @type {any} */ (error);
  const status = err?.response?.status ?? 0;
  const data = err?.response?.data;

  /** @type {Record<string, string[]>} */
  const fieldErrors = {};
  const rawErrors = data && typeof data === 'object' ? data.errors : undefined;
  if (rawErrors && typeof rawErrors === 'object' && !Array.isArray(rawErrors)) {
    for (const [field, msgs] of Object.entries(rawErrors)) {
      const key = field.charAt(0).toLowerCase() + field.slice(1);
      fieldErrors[key] = Array.isArray(msgs) ? msgs.map(String) : [String(msgs)];
    }
  }

  let message = '';
  if (typeof data === 'string' && data.trim() && !data.trim().startsWith('<')) message = data.trim();
  else if (data && typeof data === 'object')
    message = data.message ?? data.detail ?? data.title ?? data.error ?? '';

  if (!message) {
    if (status === 0)
      message = 'No se pudo conectar con el servidor. Verifique su conexión e intente de nuevo.';
    else if (status === 401) message = 'Su sesión expiró. Inicie sesión de nuevo.';
    else if (status === 403) message = 'No tiene permiso para realizar esta acción.';
    else if (status === 404) message = 'No encontramos lo que busca.';
    else if (status === 419) message = 'La página expiró. Recárguela e intente de nuevo.';
    else if (status === 422 || status === 400) message = 'Revise los datos marcados en el formulario.';
    else if (status >= 500) message = 'Ocurrió un error en el servidor. Intente de nuevo en unos minutos.';
    else message = 'Ocurrió un error inesperado.';
  }

  return { status, message: String(message), fieldErrors, raw: data };
}

/**
 * Atajos que devuelven directamente `response.data`. Los errores llegan normalizados
 * ({@link ApiErrorShape}).
 *
 * ```js
 * const estudiantes = await AU.api.get('/estudiantes', { params: { grado: '4S' } });
 * await AU.api.post('/pagos', { estudiante: 12, monto: 12500 });
 * ```
 */
export const api = Object.freeze({
  /**
   * @param {string} url Ruta.
   * @param {import('axios').AxiosRequestConfig} [config] Configuración (params, headers…).
   * @returns {Promise<any>} Datos.
   */
  get: async (url, config) => (await http.get(url, config)).data,
  /**
   * @param {string} url Ruta.
   * @param {unknown} [data] Cuerpo.
   * @param {import('axios').AxiosRequestConfig} [config] Configuración.
   * @returns {Promise<any>} Datos.
   */
  post: async (url, data, config) => (await http.post(url, data, config)).data,
  /**
   * @param {string} url Ruta.
   * @param {unknown} [data] Cuerpo.
   * @param {import('axios').AxiosRequestConfig} [config] Configuración.
   * @returns {Promise<any>} Datos.
   */
  put: async (url, data, config) => (await http.put(url, data, config)).data,
  /**
   * @param {string} url Ruta.
   * @param {unknown} [data] Cuerpo.
   * @param {import('axios').AxiosRequestConfig} [config] Configuración.
   * @returns {Promise<any>} Datos.
   */
  patch: async (url, data, config) => (await http.patch(url, data, config)).data,
  /**
   * @param {string} url Ruta.
   * @param {import('axios').AxiosRequestConfig} [config] Configuración.
   * @returns {Promise<any>} Datos.
   */
  delete: async (url, config) => (await http.delete(url, config)).data,
});
