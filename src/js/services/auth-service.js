/**
 * Autenticación con JWT, opción A (decisión 015).
 *
 * - **Token de acceso solo en memoria**, en un campo privado de esta clase. No se
 *   guarda en `localStorage`, `sessionStorage` ni cookies legibles, y no se expone
 *   en `window.AU`. Un script inyectado no puede leerlo desde el almacenamiento y,
 *   en el peor caso, solo podría usarlo mientras dura (10–15 min recomendados).
 * - **Token de renovación en cookie `httpOnly`**, que pone y lee el backend. El
 *   navegador la envía sola a `refreshUrl` (`withCredentials`). JS nunca la ve.
 * - Al recargar la página la memoria se pierde: `restore()` pide un token nuevo a
 *   `refreshUrl` antes de resolver la sesión.
 * - Renovación **única** aunque fallen varias solicitudes a la vez (single-flight),
 *   y **proactiva** si al token le quedan menos de `refreshMarginMs`.
 *
 * Contrato con la API (detalle en `docs/06-integracion-backend.md` §4):
 * | Endpoint | Envía | Responde |
 * |---|---|---|
 * | `POST loginUrl` | `{ email, password, … }` | `{ accessToken, expiresIn?, user?, roles?, permissions? }` + `Set-Cookie` de renovación |
 * | `POST refreshUrl` | cookie de renovación | `{ accessToken, expiresIn? }` (puede rotar la cookie) · 401 si no hay sesión |
 * | `POST logoutUrl` | `Authorization` + cookie | 204 y borra la cookie |
 * | `GET meUrl` | `Authorization` | `{ user, roles, permissions, institution? }` |
 *
 * Se aceptan `accessToken`, `access_token` o `token`; y `expiresIn` o `expires_in` (segundos).
 * Sin `expiresIn` se lee `exp` del JWT **solo para calcular el vencimiento**: el
 * frontend no verifica firmas ni toma decisiones de seguridad con el contenido.
 * @module services/auth-service
 */
import { AppError, UnauthorizedError } from '../core/errors.js';
import { isAllowedUrl, parseErrorResponse, toHttpError } from './http-client.js';

/**
 * @typedef {object} AuthOptions
 * @property {string} [loginUrl] Ruta de inicio de sesión.
 * @property {string} [refreshUrl] Ruta de renovación (obligatoria para la opción A).
 * @property {string} [logoutUrl] Ruta de cierre de sesión.
 * @property {string} [meUrl] Ruta del usuario actual (alimenta la sesión).
 * @property {number} [refreshMarginMs=30000] Renovar si al token le queda menos que esto.
 * @property {boolean} [apiCookies=false] Enviar cookies también al resto del API (normalmente no hace falta con JWT).
 */

/**
 * Lee `exp` (segundos) de un JWT sin verificarlo. Solo para saber cuándo renovar.
 * @param {string} token JWT.
 * @returns {number} Vencimiento en ms desde época, o 0 si no se puede leer.
 */
export function readJwtExpiry(token) {
  try {
    const part = token.split('.')[1];
    if (!part) return 0;
    const json = atob(
      part
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(part.length / 4) * 4, '='),
    );
    const exp = JSON.parse(json)?.exp;
    return Number.isFinite(exp) ? exp * 1000 : 0;
  } catch {
    return 0;
  }
}

/** Campos que nunca salen del servicio. */
const TOKEN_FIELDS = new Set([
  'accessToken',
  'access_token',
  'token',
  'refreshToken',
  'refresh_token',
  'expiresIn',
  'expires_in',
  'tokenType',
  'token_type',
]);

/** Servicio de autenticación JWT con token en memoria. */
export class AuthService {
  /** @type {import('axios').AxiosInstance} */
  #http;
  /** @type {import('../core/logger.js').Logger} */
  #logger;
  /** @type {Required<AuthOptions>} */
  #options = {
    loginUrl: '',
    refreshUrl: '',
    logoutUrl: '',
    meUrl: '',
    refreshMarginMs: 30000,
    apiCookies: false,
  };
  /** @type {string | null} */
  #token = null;
  #expiresAt = 0;
  #lifetimeMs = 0;
  /** @type {Promise<string> | null} */
  #refreshing = null;
  /** @type {() => number} */
  #now;

  /**
   * @param {object} deps Dependencias.
   * @param {import('axios').AxiosInstance} deps.http Instancia de axios (sin el cliente de app, para no entrar en bucle).
   * @param {import('../core/logger.js').Logger} deps.logger Logger.
   * @param {() => number} [deps.now] Reloj (pruebas).
   */
  constructor({ http, logger, now = () => Date.now() }) {
    if (!http || typeof http.request !== 'function')
      throw new TypeError('[AU] AuthService necesita { http }.');
    if (typeof logger?.debug !== 'function') throw new TypeError('[AU] AuthService necesita { logger }.');
    this.#http = http;
    this.#logger = logger;
    this.#now = now;
  }

  /**
   * Configura los endpoints. Todas las rutas deben ser relativas o estar bajo `baseURL`.
   * @param {AuthOptions} options Opciones.
   * @returns {void}
   */
  configure(options = {}) {
    const base = String(this.#http.defaults?.baseURL ?? '');
    for (const key of /** @type {const} */ (['loginUrl', 'refreshUrl', 'logoutUrl', 'meUrl'])) {
      const value = options[key];
      if (value === undefined) continue;
      if (value !== '' && !isAllowedUrl(value, base)) {
        throw new AppError(`[AU] auth.${key} debe ser una ruta relativa o estar bajo baseURL.`, {
          code: 'INVALID_ARGUMENT',
        });
      }
      this.#options[key] = value;
    }
    if (Number.isFinite(options.refreshMarginMs))
      this.#options.refreshMarginMs = Number(options.refreshMarginMs);
    if (options.apiCookies !== undefined) this.#options.apiCookies = Boolean(options.apiCookies);
    // Con JWT el resto del API no necesita cookies; solo refresh/logout (se fuerzan abajo).
    this.#http.defaults.withCredentials = this.#options.apiCookies;
  }

  /** @returns {boolean} `true` si hay una ruta de login o de renovación configurada. */
  isEnabled() {
    return Boolean(this.#options.loginUrl || this.#options.refreshUrl);
  }

  /** @returns {string} Ruta del usuario actual (vacía si no se configuró). */
  get meUrl() {
    return this.#options.meUrl;
  }

  /** @returns {boolean} `true` si hay un token de acceso en memoria. */
  hasToken() {
    return Boolean(this.#token);
  }

  /**
   * Token actual sin renovar (uso interno del cliente HTTP).
   * @returns {string | null} Token.
   */
  peek() {
    return this.#token;
  }

  /**
   * Token válido: renueva antes si está por vencer. Si la renovación falla, devuelve `null`
   * (la solicitud saldrá sin `Authorization` y el servidor responderá 401).
   * @returns {Promise<string | null>} Token.
   */
  async getToken() {
    // Si hay una renovación en curso (p. ej. restore al cargar), se espera: así las
    // primeras solicitudes de la página no salen sin token.
    if (this.#refreshing) {
      try {
        return await this.#refreshing;
      } catch {
        return null;
      }
    }
    if (!this.#token) return null;
    // Margen acotado a la mitad de la vida del token: con tokens cortos no se renueva en cada solicitud.
    const margin = this.#lifetimeMs
      ? Math.min(this.#options.refreshMarginMs, this.#lifetimeMs / 2)
      : this.#options.refreshMarginMs;
    if (this.#expiresAt && this.#expiresAt - this.#now() < margin && this.#options.refreshUrl) {
      try {
        return await this.refresh();
      } catch {
        return null;
      }
    }
    return this.#token;
  }

  /**
   * Guarda el token de una respuesta. Lanza si no viene.
   * @param {Record<string, any>} body Cuerpo.
   * @returns {void}
   */
  #store(body) {
    const token = body?.accessToken ?? body?.access_token ?? body?.token;
    if (typeof token !== 'string' || !token) {
      this.clear();
      throw new AppError('[AU] La respuesta de autenticación no trae accessToken.', {
        code: 'AUTH_TOKEN_MISSING',
      });
    }
    const seconds = Number(body?.expiresIn ?? body?.expires_in);
    this.#token = token;
    const now = this.#now();
    this.#expiresAt = Number.isFinite(seconds) && seconds > 0 ? now + seconds * 1000 : readJwtExpiry(token);
    this.#lifetimeMs = this.#expiresAt ? Math.max(0, this.#expiresAt - now) : 0;
  }

  /**
   * Cuerpo sin los campos del token (lo que puede ver el resto de la app).
   * @param {Record<string, any>} body Cuerpo.
   * @returns {Record<string, any>} Copia sin token.
   */
  static #withoutToken(body) {
    if (!body || typeof body !== 'object') return {};
    return Object.fromEntries(Object.entries(body).filter(([key]) => !TOKEN_FIELDS.has(key)));
  }

  /**
   * Inicia sesión. El servidor responde el token de acceso y pone la cookie de renovación.
   * @param {Record<string, unknown>} credentials Credenciales (p. ej. `{ email, password }`).
   * @returns {Promise<Record<string, any>>} Cuerpo de la respuesta sin el token (p. ej. `{ user, roles, permissions }`).
   * @throws {Error} AppError con code `UnauthorizedError`: con "Correo o contraseña incorrectos." si el servidor no envía mensaje.
   */
  async login(credentials) {
    if (!this.#options.loginUrl) {
      throw new AppError('[AU] Falta auth.loginUrl (au-config o AU.configureAuth).', {
        code: 'INVALID_ARGUMENT',
      });
    }
    try {
      const response = await this.#http.request({
        url: this.#options.loginUrl,
        method: 'POST',
        data: credentials,
        withCredentials: true,
      });
      this.#store(response?.data);
      this.#logger.debug('auth.login.ok');
      return AuthService.#withoutToken(response?.data);
    } catch (raw) {
      if (raw instanceof AppError) throw raw;
      const error = toHttpError(raw);
      if ((error.status === 401 || error.status === 400) && !parseErrorResponse(raw).message) {
        throw new UnauthorizedError('Correo o contraseña incorrectos.', {
          status: error.status,
          fieldErrors: error.fieldErrors,
          cause: raw,
        });
      }
      throw error;
    }
  }

  /**
   * Pide un token nuevo con la cookie de renovación. Si ya hay una renovación en curso,
   * devuelve la misma promesa (una sola llamada aunque fallen 10 solicitudes a la vez).
   * @returns {Promise<string>} Token nuevo.
   * @throws {Error} AppError con code `UnauthorizedError`: si no hay sesión que renovar.
   */
  refresh() {
    if (this.#refreshing) return this.#refreshing;
    if (!this.#options.refreshUrl) {
      return Promise.reject(
        new AppError('[AU] Falta auth.refreshUrl (au-config o AU.configureAuth).', {
          code: 'INVALID_ARGUMENT',
        }),
      );
    }
    this.#refreshing = (async () => {
      try {
        const response = await this.#http.request({
          url: this.#options.refreshUrl,
          method: 'POST',
          withCredentials: true,
        });
        this.#store(response?.data);
        this.#logger.debug('auth.refresh.ok');
        return /** @type {string} */ (this.#token);
      } catch (raw) {
        this.clear();
        throw raw instanceof AppError ? raw : toHttpError(raw);
      }
    })().finally(() => {
      this.#refreshing = null;
    });
    return this.#refreshing;
  }

  /**
   * Al cargar la página: intenta recuperar la sesión con la cookie de renovación.
   * Nunca lanza.
   * @returns {Promise<boolean>} `true` si obtuvo un token.
   */
  async restore() {
    if (!this.#options.refreshUrl) return false;
    try {
      await this.refresh();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Cierra la sesión en el servidor (borra la cookie) y olvida el token. Nunca lanza.
   * @returns {Promise<void>} Nada.
   */
  async logout() {
    const token = this.#token;
    this.clear();
    if (!this.#options.logoutUrl) return;
    try {
      await this.#http.request({
        url: this.#options.logoutUrl,
        method: 'POST',
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (error) {
      this.#logger.warn('auth.logout.failed', error);
    }
  }

  /**
   * Olvida el token en memoria.
   * @returns {void}
   */
  clear() {
    this.#token = null;
    this.#expiresAt = 0;
    this.#lifetimeMs = 0;
  }
}
