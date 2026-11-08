/**
 * Configuración centralizada (se lee una vez al arrancar). Sin secretos ni endpoints de negocio.
 *
 * El backend puede sobrescribir valores sin recompilar, con un `<meta>`:
 * `<meta name="au-config" content='{"apiBaseUrl":"/api/v1","locale":"es-DO"}'>`
 * @module config
 */

/**
 * @typedef {'super-admin' | 'institution-admin' | 'teacher' | 'student-guardian'} PortalId
 */

/**
 * @typedef {object} AppConfig
 * @property {string} name Nombre de la aplicación.
 * @property {string} version Versión de la plantilla.
 * @property {string} locale Locale de formato.
 * @property {'light' | 'dark' | 'system'} defaultTheme Tema inicial si el usuario no eligió.
 * @property {string} apiBaseUrl URL base del API (vacía = mismo origen).
 * @property {number} apiTimeoutMs Tiempo máximo de las peticiones.
 * @property {number} apiRetries Reintentos de lecturas (GET) ante red caída o 5xx. Nunca reintenta escrituras.
 * @property {string} loginUrl Ruta del login (mismo origen) a la que se redirige tras un 401. Vacía = no redirige.
 * @property {string} assetBaseUrl Base para `AU.assetUrl()` (p. ej. un CDN). Vacía = rutas tal cual.
 * @property {boolean} debug `true` baja el logger a nivel `debug` (solo desarrollo).
 */

/** @type {AppConfig} */
const DEFAULTS = {
  name: 'Aula RD',
  version: __AU_VERSION__,
  locale: 'es-DO',
  defaultTheme: 'system',
  apiBaseUrl: '',
  apiTimeoutMs: 20000,
  apiRetries: 0,
  loginUrl: '',
  assetBaseUrl: '',
  debug: false,
};

/** Portales de la plataforma (constitución 4.4). */
export const PORTALS = Object.freeze({
  'super-admin': { scope: 'global', label: 'Superadmin' },
  'institution-admin': { scope: 'institution', label: 'Administración' },
  teacher: { scope: 'institution', label: 'Docente' },
  'student-guardian': { scope: 'institution', label: 'Estudiante / tutor' },
});

/** Puntos de quiebre (iguales a Bootstrap). */
export const BREAKPOINTS = Object.freeze({ xs: 0, sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1400 });

/**
 * Lee la configuración combinando los valores por defecto con `<meta name="au-config">`.
 * @returns {Readonly<AppConfig>} Configuración inmutable.
 */
export function loadConfig() {
  let overrides = {};
  const meta = document.querySelector('meta[name="au-config"]')?.getAttribute('content');
  if (meta) {
    try {
      overrides = JSON.parse(meta);
    } catch {
      console.error('[AU] <meta name="au-config"> no contiene JSON válido.');
    }
  }
  return Object.freeze({ ...DEFAULTS, ...overrides, version: DEFAULTS.version });
}
