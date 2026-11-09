/**
 * Capa HTTP compartida: instancia de axios + cliente de aplicación.
 *
 * - Envía el token CSRF si existe `<meta name="csrf-token" content="…">`
 *   (cabeceras `X-CSRF-TOKEN` y `X-XSRF-TOKEN`), válido para Laravel, Django, Rails, ASP.NET, etc.
 * - Todas las solicitudes pasan por {@link module:services/http-client~HttpClient}:
 *   estrategia de contexto institucional, reintentos seguros y errores tipados.
 * - `AU.api.*` devuelve directamente `data`; `AU.request(spec)` devuelve `{ data, meta }`.
 *
 * ```js
 * AU.configureApi({ baseURL: '/api/v1', endpoints: { 'estudiante.ver': '/estudiantes/:id' } });
 * const estudiantes = await AU.api.get('/estudiantes', { params: { grado: '4S' } });
 * const { data } = await AU.request({ endpointKey: 'estudiante.ver', pathParams: { id: 42 } });
 * ```
 * @module core/http
 */
import axios from 'axios';
import {
  HttpClient,
  parseErrorResponse,
  toHttpError,
  headerContextStrategy,
} from '../services/http-client.js';

export { headerContextStrategy };
import { logger } from './logger.js';

/** @typedef {import('../types.js').ApiErrorShape} ApiErrorShape */
/** @typedef {import('../services/http-client.js').RequestSpec} RequestSpec */

/** Instancia de axios compartida (solo la usa el cliente). */
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

/** Cliente de aplicación compartido. */
export const client = new HttpClient({ axios: http, logger: logger.child('http') });

/**
 * @typedef {object} HttpOptions
 * @property {string} [baseURL] URL base del API.
 * @property {number} [timeout] Tiempo máximo en ms.
 * @property {number} [retries] Reintentos de lecturas idempotentes ante red caída o 5xx.
 * @property {Record<string, string>} [headers] Cabeceras fijas adicionales.
 * @property {Record<string, string>} [endpoints] Registro clave → ruta (`/estudiantes/:id`).
 * @property {import('../services/http-client.js').ContextStrategy | null} [contextStrategy] Cómo enviar la institución activa
 *   (por defecto, cabecera `X-Institution-Id`; `null` la desactiva).
 * @property {(error: import('./errors.js').AppError) => void} [onUnauthorized] Se llama ante un 401.
 */

/**
 * Configura la capa HTTP.
 * @param {HttpOptions} [options] Opciones.
 * @returns {HttpClient} El cliente configurado.
 */
export function configureHttp({
  baseURL,
  timeout,
  retries,
  headers,
  endpoints,
  contextStrategy,
  onUnauthorized,
} = {}) {
  if (headers) Object.entries(headers).forEach(([k, v]) => (http.defaults.headers.common[k] = v));
  client.configure({ baseURL, timeout, retries, endpoints, contextStrategy, onUnauthorized });
  return client;
}

/**
 * Convierte cualquier error en un {@link ApiErrorShape} (`status`, `message`, `fieldErrors`, `raw`).
 * Se conserva por compatibilidad: los errores que rechaza `AU.api` ya son `AppError`
 * con esas mismas propiedades.
 * @param {unknown} error Error recibido.
 * @returns {ApiErrorShape} Error normalizado.
 */
export function normalizeError(error) {
  const typed = toHttpError(error);
  const parsed = parseErrorResponse(error);
  return { status: parsed.status, message: typed.message, fieldErrors: typed.fieldErrors, raw: parsed.raw };
}

/**
 * Traduce opciones al estilo axios (`params`, `headers`, `signal`) a un {@link RequestSpec}.
 * @param {string} method Método.
 * @param {string} url Ruta.
 * @param {unknown} body Cuerpo.
 * @param {{ params?: Record<string, unknown>, headers?: Record<string, string>, signal?: AbortSignal, retries?: number }} [config] Opciones.
 * @returns {RequestSpec} Solicitud.
 */
function spec(method, url, body, config = {}) {
  return {
    method,
    url,
    body,
    query: config.params,
    headers: config.headers,
    signal: config.signal,
    policy: config.retries === undefined ? undefined : { retries: config.retries },
  };
}

/**
 * @typedef {{ params?: Record<string, unknown>, headers?: Record<string, string>, signal?: AbortSignal, retries?: number }} ApiOptions
 */

/**
 * Atajos que devuelven directamente `data`. Rechazan con un `AppError` tipado
 * (`ValidationError` trae `fieldErrors`).
 *
 * ```js
 * const estudiantes = await AU.api.get('/estudiantes', { params: { grado: '4S' } });
 * await AU.api.post('/pagos', { estudiante: 12, monto: 12500 });
 * ```
 */
export const api = Object.freeze({
  /**
   * @param {string} url Ruta.
   * @param {ApiOptions} [config] Opciones.
   * @returns {Promise<any>} Datos.
   */
  get: async (url, config) => (await client.request(spec('GET', url, undefined, config))).data,
  /**
   * @param {string} url Ruta.
   * @param {unknown} [data] Cuerpo.
   * @param {ApiOptions} [config] Opciones.
   * @returns {Promise<any>} Datos.
   */
  post: async (url, data, config) => (await client.request(spec('POST', url, data, config))).data,
  /**
   * @param {string} url Ruta.
   * @param {unknown} [data] Cuerpo.
   * @param {ApiOptions} [config] Opciones.
   * @returns {Promise<any>} Datos.
   */
  put: async (url, data, config) => (await client.request(spec('PUT', url, data, config))).data,
  /**
   * @param {string} url Ruta.
   * @param {unknown} [data] Cuerpo.
   * @param {ApiOptions} [config] Opciones.
   * @returns {Promise<any>} Datos.
   */
  patch: async (url, data, config) => (await client.request(spec('PATCH', url, data, config))).data,
  /**
   * @param {string} url Ruta.
   * @param {ApiOptions} [config] Opciones.
   * @returns {Promise<any>} Datos.
   */
  delete: async (url, config) => (await client.request(spec('DELETE', url, undefined, config))).data,
});

/**
 * Solicitud completa con `endpointKey`, `pathParams`, `signal`, etc.
 * @param {RequestSpec} requestSpec Solicitud.
 * @returns {Promise<import('../services/http-client.js').Result>} `{ data, meta }`.
 */
export function request(requestSpec) {
  return client.request(requestSpec);
}
