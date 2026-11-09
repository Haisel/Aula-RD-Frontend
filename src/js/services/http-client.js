/**
 * Cliente HTTP de aplicación (fusión del `HttpClient` de la Fase 4 con la capa
 * de errores de la plantilla). Puerta única de salida HTTP.
 *
 * Qué hace en cada solicitud, en este orden:
 * 1. Resuelve la URL: una clave del registro de endpoints (`endpointKey` + `pathParams`)
 *    o una ruta relativa. Rechaza URLs absolutas fuera de `baseURL` (evita enviar
 *    cookies/CSRF a terceros).
 * 2. Aplica los interceptores de solicitud y la **estrategia de contexto institucional**,
 *    que lee la institución vigente en ese momento (`getInstitution`). Por defecto no
 *    añade nada (decisión D-02 pendiente).
 * 3. Envía con axios. Solo reintenta lecturas idempotentes (GET/HEAD/OPTIONS) ante
 *    fallos de red o 5xx; nunca un 4xx ni una escritura.
 * 4. Con JWT (decisión 015) añade `Authorization: Bearer …`. Ante un 401 renueva el
 *    token **una vez** (compartida entre solicitudes simultáneas) y reintenta. Si la
 *    renovación falla, avisa a la sesión (`handleUnauthorized`) y llama `onUnauthorized`.
 * 5. Convierte cualquier fallo en la taxonomía de {@link module:core/errors} con
 *    `message` legible y `fieldErrors` por campo.
 * @module services/http-client
 */
import {
  AppError,
  CancelledError,
  NetworkError,
  TimeoutError,
  fromHttpStatus,
  isAbortError,
  toAppError,
} from '../core/errors.js';

/**
 * @typedef {object} RequestSpec
 * @property {string} [method='GET'] Método HTTP.
 * @property {string} [url] Ruta relativa (o absoluta bajo `baseURL`).
 * @property {string} [endpointKey] Clave del registro de endpoints (alternativa a `url`).
 * @property {Record<string, string | number>} [pathParams] Valores para `:param` en el endpoint.
 * @property {Record<string, unknown>} [query] Parámetros de consulta.
 * @property {unknown} [body] Cuerpo.
 * @property {Record<string, string>} [headers] Cabeceras adicionales.
 * @property {AbortSignal} [signal] Señal de cancelación (p. ej. `scope.signal`).
 * @property {{ retries?: number }} [policy] Política por solicitud.
 * @property {boolean} [auth=true] `false` para no enviar `Authorization` (endpoints públicos).
 */

/**
 * @typedef {object} AuthPort
 * @property {() => boolean} isEnabled ¿Hay autenticación configurada?
 * @property {() => Promise<string | null>} getToken Token válido (renueva si está por vencer).
 * @property {() => string | null} peek Token actual sin renovar.
 * @property {() => Promise<string>} refresh Renovación única (single-flight).
 */

/**
 * @typedef {object} Result
 * @property {any} data Cuerpo de la respuesta.
 * @property {{ source: 'api', status: number }} meta Metadatos.
 */

/**
 * @typedef {object} ContextStrategy
 * @property {(request: AxiosLikeRequest, institution: import('./institution-context.js').InstitutionRef | null) => AxiosLikeRequest | void} apply
 *   Recibe la solicitud y la institución vigente; puede añadir cabeceras, parámetros, etc.
 */

/**
 * @typedef {object} AxiosLikeRequest
 * @property {string} url URL.
 * @property {string} method Método en mayúsculas.
 * @property {Record<string, unknown> | undefined} params Consulta.
 * @property {unknown} data Cuerpo.
 * @property {Record<string, string>} headers Cabeceras.
 * @property {AbortSignal | undefined} signal Señal.
 * @property {number} timeout Tiempo máximo.
 */

/**
 * @typedef {object} HttpClientConfig
 * @property {string} baseURL URL base.
 * @property {number} timeout Tiempo máximo (ms).
 * @property {number} retries Reintentos para lecturas idempotentes.
 * @property {Record<string, string>} endpoints Registro clave → ruta (`/estudiantes/:id`).
 * @property {ContextStrategy | null} contextStrategy Estrategia de contexto institucional.
 * @property {(() => import('./institution-context.js').InstitutionRef | null) | null} getInstitution Lector diferido.
 * @property {{ handleUnauthorized?: () => void } | null} session Servicio de sesión.
 * @property {((error: AppError) => void) | null} onUnauthorized Callback ante 401.
 * @property {AuthPort | null} auth Autenticación JWT (decisión 015).
 */

const IDEMPOTENT = new Set(['GET', 'HEAD', 'OPTIONS']);
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Extrae mensaje y errores por campo de una respuesta de error. Entiende:
 * `{ message, errors: { campo: [..] } }` (Laravel/Express), ProblemDetails
 * `{ title, detail, errors }` (ASP.NET), `{ detail }` (Django REST), `{ error }` y texto plano.
 * Función pura (probada en `tests/http.test.js`).
 * @param {unknown} error Error de axios u otro.
 * @returns {{ status: number, message: string, fieldErrors: Record<string, string[]>, raw: unknown }} Datos normalizados.
 */
export function parseErrorResponse(error) {
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

  return { status, message: String(message ?? ''), fieldErrors, raw: data };
}

/**
 * Convierte un fallo de axios en un error tipado.
 * @param {unknown} error Error.
 * @returns {AppError} Error tipado.
 */
export function toHttpError(error) {
  if (error instanceof AppError) return error;
  if (isAbortError(error)) return new CancelledError(undefined, { cause: error });
  const err = /** @type {any} */ (error);
  if (
    !err?.response &&
    (err?.code === 'ECONNABORTED' || err?.code === 'ETIMEDOUT' || /timeout/i.test(String(err?.message)))
  ) {
    return new TimeoutError(undefined, { cause: error });
  }
  if (!err?.response && (err?.code === 'ERR_NETWORK' || /network/i.test(String(err?.message)))) {
    return new NetworkError(undefined, { cause: error });
  }
  if (!err?.response && !err?.request && !err?.isAxiosError) return toAppError(error);
  const { status, message, fieldErrors, raw } = parseErrorResponse(error);
  return fromHttpStatus(status, { message, fieldErrors, raw, cause: error });
}

/**
 * ¿Es seguro enviar a esta URL? Rutas relativas sí; absolutas solo bajo `baseURL`.
 * Rechaza `//host`, barras invertidas y caracteres de control (el navegador los
 * elimina y `/\t/evil.com` se convertiría en `//evil.com`).
 * @param {string} url URL.
 * @param {string} baseURL URL base.
 * @returns {boolean} Resultado.
 */
export function isAllowedUrl(url, baseURL) {
  if (typeof url !== 'string') return false;
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(url) || url.includes('\\')) return false;
  if (url.startsWith('//')) return false;
  if (!SCHEME.test(url)) return true;
  const base = baseURL.replace(/\/$/, '');
  return Boolean(base) && SCHEME.test(base) && (url === base || url.startsWith(`${base}/`));
}

const HEADER_NAME = /^[A-Za-z][A-Za-z0-9-]*$/;

/**
 * Estrategia de contexto por **cabecera** (decisión 014, D-02 resuelta).
 * Añade `<headerName>: <id de la institución activa>` a cada solicitud. Si no hay
 * institución activa (p. ej. el superadmin en vista global), no añade nada: el
 * frontend nunca inventa una institución.
 *
 * ⚠ El backend debe comprobar en cada solicitud que el usuario autenticado pertenece
 * a esa institución. La cabecera es una indicación del cliente, no una autorización.
 * @param {string} [headerName='X-Institution-Id'] Nombre de la cabecera.
 * @returns {ContextStrategy} Estrategia.
 * @throws {AppError} `INVALID_ARGUMENT` si el nombre no es un token de cabecera válido.
 */
export function headerContextStrategy(headerName = 'X-Institution-Id') {
  if (typeof headerName !== 'string' || !HEADER_NAME.test(headerName)) {
    throw new AppError(`[AU] Nombre de cabecera de institución no válido: "${String(headerName)}".`, {
      code: 'INVALID_ARGUMENT',
    });
  }
  return Object.freeze({
    headerName,
    /**
     * @param {AxiosLikeRequest} request Solicitud.
     * @param {import('./institution-context.js').InstitutionRef | null} institution Institución vigente.
     * @returns {AxiosLikeRequest} Solicitud con la cabecera (o sin cambios).
     */
    apply(request, institution) {
      if (!institution?.id) return request;
      return { ...request, headers: { ...request.headers, [headerName]: String(institution.id) } };
    },
  });
}

/** Cliente HTTP con estrategia de contexto, reintentos y errores tipados. */
export class HttpClient {
  /** @type {import('axios').AxiosInstance} */
  #axios;
  /** @type {import('../core/logger.js').Logger} */
  #logger;
  /** @type {HttpClientConfig} */
  #config;
  /** @type {Array<(request: AxiosLikeRequest) => AxiosLikeRequest | void>} */
  #requestInterceptors = [];
  /** @type {Array<(result: Result) => Result | void>} */
  #responseInterceptors = [];

  /**
   * @param {object} deps Dependencias.
   * @param {import('axios').AxiosInstance} deps.axios Instancia de axios (con CSRF ya configurado).
   * @param {import('../core/logger.js').Logger} deps.logger Logger.
   * @param {Partial<HttpClientConfig>} [deps.config] Configuración inicial.
   */
  constructor({ axios, logger, config = {} }) {
    if (!axios || typeof axios.request !== 'function')
      throw new TypeError('[AU] HttpClient necesita { axios }.');
    if (typeof logger?.debug !== 'function') throw new TypeError('[AU] HttpClient necesita { logger }.');
    this.#axios = axios;
    this.#logger = logger;
    this.#config = {
      baseURL: '',
      timeout: 20000,
      retries: 0,
      endpoints: {},
      contextStrategy: null,
      getInstitution: null,
      session: null,
      onUnauthorized: null,
      auth: null,
    };
    this.configure(config);
  }

  /**
   * Cambia la configuración (se puede llamar varias veces).
   * @param {Partial<HttpClientConfig>} partial Valores a cambiar.
   * @returns {void}
   */
  configure(partial) {
    for (const [key, value] of Object.entries(partial)) {
      if (value !== undefined) /** @type {any} */ (this.#config)[key] = value;
    }
    if (partial.baseURL !== undefined) this.#axios.defaults.baseURL = partial.baseURL;
    if (partial.timeout !== undefined) this.#axios.defaults.timeout = partial.timeout;
  }

  /**
   * Agrega un interceptor de solicitud (se aplica antes de la estrategia de contexto).
   * @param {(request: AxiosLikeRequest) => AxiosLikeRequest | void} fn Interceptor.
   * @returns {() => void} Para retirarlo.
   */
  addRequestInterceptor(fn) {
    this.#requestInterceptors.push(fn);
    return () => {
      const i = this.#requestInterceptors.indexOf(fn);
      if (i >= 0) this.#requestInterceptors.splice(i, 1);
    };
  }

  /**
   * Agrega un interceptor de respuesta.
   * @param {(result: Result) => Result | void} fn Interceptor.
   * @returns {() => void} Para retirarlo.
   */
  addResponseInterceptor(fn) {
    this.#responseInterceptors.push(fn);
    return () => {
      const i = this.#responseInterceptors.indexOf(fn);
      if (i >= 0) this.#responseInterceptors.splice(i, 1);
    };
  }

  /**
   * Resuelve la URL de una solicitud.
   * @param {RequestSpec} spec Solicitud.
   * @returns {string} URL (relativa a `baseURL` salvo que sea absoluta).
   */
  resolveUrl(spec) {
    if (spec.endpointKey) {
      const template = this.#config.endpoints[spec.endpointKey];
      if (typeof template !== 'string') {
        throw new AppError(`[AU] El endpoint "${spec.endpointKey}" no está registrado.`, {
          code: 'INVALID_ARGUMENT',
        });
      }
      let url = template;
      for (const [k, v] of Object.entries(spec.pathParams ?? {})) {
        url = url.replaceAll(`:${k}`, encodeURIComponent(String(v)));
      }
      if (/:[a-zA-Z_]\w*/.test(url.replace(SCHEME, ''))) {
        throw new AppError(`[AU] Faltan parámetros para "${spec.endpointKey}": ${url}`, {
          code: 'INVALID_ARGUMENT',
        });
      }
      return url;
    }
    if (typeof spec.url === 'string') {
      if (!isAllowedUrl(spec.url, this.#config.baseURL)) {
        throw new AppError('[AU] URL fuera del origen permitido: use una ruta relativa o un endpointKey.', {
          code: 'INVALID_ARGUMENT',
        });
      }
      return spec.url;
    }
    throw new AppError('[AU] La solicitud necesita url o endpointKey.', { code: 'INVALID_ARGUMENT' });
  }

  /**
   * Ejecuta una solicitud.
   * @param {RequestSpec} spec Solicitud.
   * @returns {Promise<Result>} `{ data, meta }`.
   */
  async request(spec = {}) {
    /** @type {AxiosLikeRequest} */
    let request = {
      url: this.resolveUrl(spec),
      method: (spec.method || 'GET').toUpperCase(),
      params: spec.query,
      data: spec.body,
      headers: { ...(spec.headers ?? {}) },
      signal: spec.signal,
      timeout: this.#config.timeout,
    };

    for (const fn of this.#requestInterceptors) request = fn(request) || request;
    const strategy = this.#config.contextStrategy;
    if (strategy && typeof strategy.apply === 'function') {
      const institution = this.#config.getInstitution ? this.#config.getInstitution() : null;
      request = strategy.apply(request, institution) || request;
    }

    const auth =
      this.#config.auth && spec.auth !== false && this.#config.auth.isEnabled() ? this.#config.auth : null;
    /** @type {string | null} */
    let usedToken = null;
    if (auth) {
      usedToken = await auth.getToken();
      if (usedToken)
        request = { ...request, headers: { ...request.headers, Authorization: `Bearer ${usedToken}` } };
    }

    const retries = Math.max(0, spec.policy?.retries ?? this.#config.retries);
    const attempts = IDEMPOTENT.has(request.method) ? 1 + retries : 1;
    let authRetried = false;

    for (let attempt = 1; ; attempt += 1) {
      try {
        const response = await this.#axios.request(request);
        /** @type {Result} */
        let result = { data: response?.data, meta: { source: 'api', status: response?.status ?? 200 } };
        for (const fn of this.#responseInterceptors) result = fn(result) || result;
        this.#logger.debug('http.ok', { method: request.method, status: result.meta.status });
        return result;
      } catch (raw) {
        const error = toHttpError(raw);
        if (error.code === 'CANCELLED_ERROR') throw error;
        // Solo se renueva si la solicitud llevaba token: un visitante sin sesión no "expira".
        if (error.status === 401 && auth && usedToken && !authRetried) {
          authRetried = true;
          try {
            // Si otra solicitud ya renovó, basta con reintentar con el token nuevo.
            const current = auth.peek();
            const fresh = current && current !== usedToken ? current : await auth.refresh();
            usedToken = fresh;
            request = { ...request, headers: { ...request.headers, Authorization: `Bearer ${fresh}` } };
            this.#logger.debug('http.auth.retry', { method: request.method });
            continue;
          } catch {
            /* la renovación falló: se trata como sesión expirada */
          }
        }
        if (error.status === 401) {
          try {
            this.#config.session?.handleUnauthorized?.();
            this.#config.onUnauthorized?.(error);
          } catch {
            /* no ocultar el error original */
          }
          throw error;
        }
        const deterministic = error.status !== undefined && error.status >= 400 && error.status < 500;
        if (deterministic || attempt >= attempts) throw error;
        this.#logger.debug('http.retry', { method: request.method, attempt });
      }
    }
  }
}
