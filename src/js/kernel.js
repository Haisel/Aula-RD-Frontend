/**
 * Raíz de composición del núcleo (portada del `app.js` de la Fase 4).
 *
 * Único módulo que conoce todas las piezas del kernel: crea los servicios,
 * los registra en el contenedor y cablea sus reacciones. La fachada `AU`
 * expone solo lo necesario; el contenedor y el cliente HTTP no salen de aquí.
 *
 * Reacciones cableadas (sin inventar identidad ni mecanismo de contexto):
 *
 * | Evento                                   | Reacción |
 * |------------------------------------------|----------|
 * | Cambia la sesión                         | Sincroniza la política de acceso y vuelve a aplicar `data-au-can`. |
 * | `authenticated` → `unauthenticated`      | Limpia la institución y las preferencias no sensibles (conserva tema y sidebar). |
 * | `au:session:expired` (HTTP 401)          | Avisa y, si hay `loginUrl` en `au-config`, redirige (misma origen). |
 * | Cambia de una institución a otra         | Limpia preferencias no sensibles y avisa que se actualizaron los permisos. |
 * | `au:app:error`                           | Aviso genérico, como máximo uno cada 2 s. |
 * @module kernel
 */
import { bus, EVENTS } from './core/events.js';
import { logger } from './core/logger.js';
import { ErrorHandler } from './core/error-handler.js';
import { Scope } from './core/scope.js';
import { ServiceContainer } from './core/container.js';
import { ModuleLoader } from './core/module-loader.js';
import { storage } from './core/storage.js';
import { client } from './core/http.js';
import { SessionService } from './services/session-service.js';
import { InstitutionContext } from './services/institution-context.js';
import { AccessPolicy } from './services/access-policy.js';

export { bus, logger, storage, client };

/** Manejador central de errores. */
export const errorHandler = new ErrorHandler({ logger, bus });
/** Scope de la página: se destruye en `pagehide`. */
export const appScope = new Scope();
/** Sesión (puertos hacia el backend). */
export const session = new SessionService({ logger: logger.child('session'), bus });
/** Institución activa (puertos hacia el backend). */
export const institution = new InstitutionContext({ logger: logger.child('institution'), bus });
/** Autorización visual. */
export const access = new AccessPolicy();
/** Cargador de módulos de negocio. */
export const modules = new ModuleLoader({ logger: logger.child('modules') });
/** Contenedor (solo para la raíz de composición y pruebas). */
export const container = new ServiceContainer()
  .provideValue('logger', logger)
  .provideValue('bus', bus)
  .provideValue('errors', errorHandler)
  .provideValue('storage', storage)
  .provideValue('http', client)
  .provideValue('session', session)
  .provideValue('institution', institution)
  .provideValue('access', access)
  .provideValue('modules', modules)
  .freeze();

// La capa HTTP lee la sesión y la institución de forma diferida, sin importarlas.
client.configure({ session, getInstitution: () => institution.current() });

/**
 * Comprueba que una ruta es del mismo origen (evita redirecciones abiertas).
 * @param {unknown} value Ruta.
 * @returns {string | null} Ruta segura o `null`.
 */
export function safeSameOriginPath(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return null;
  // eslint-disable-next-line no-control-regex
  if (value.includes('\\') || /[\u0000-\u001f\u007f]/.test(value)) return null;
  return value;
}

/**
 * @typedef {object} WireOptions
 * @property {import('./config/index.js').AppConfig} config Configuración.
 * @property {(message: string, type: 'success' | 'error' | 'warning' | 'info') => unknown} notify Aviso no bloqueante (toast).
 */

let wired = false;

/**
 * Cablea las reacciones del núcleo. Idempotente.
 * @param {WireOptions} options Opciones.
 * @returns {void}
 */
export function wireKernel({ config, notify }) {
  if (wired) return;
  wired = true;
  if (config.debug) logger.setLevel('debug');

  const say = (/** @type {string} */ msg, /** @type {'success' | 'error' | 'warning' | 'info'} */ type) => {
    try {
      void Promise.resolve(notify(msg, type)).catch(() => {});
    } catch {
      /* un aviso nunca debe romper el flujo */
    }
  };

  const syncAccess = () => {
    access.syncFromUser(session.user());
    access.applyTo(document);
  };
  session.subscribe(syncAccess);

  bus.on(EVENTS.SESSION_CHANGED, (event) => {
    const { from, to } = event.detail ?? {};
    if (from === 'authenticated' && to === 'unauthenticated') {
      institution.clear();
      storage.clear();
    }
  });

  bus.on(EVENTS.SESSION_EXPIRED, () => {
    const login = safeSameOriginPath(config.loginUrl);
    if (login && window.location.pathname === login) return;
    say('Su sesión expiró. Inicie sesión de nuevo.', 'warning');
    if (login) window.location.assign(login);
  });

  bus.on(EVENTS.INSTITUTION_CHANGED, (event) => {
    const { id, previous } = event.detail ?? {};
    if (previous && previous !== id) {
      storage.clear();
      if (id) say('Cambió la institución activa. Se actualizaron sus permisos.', 'info');
    }
  });

  let lastErrorAt = 0;
  bus.on(EVENTS.APP_ERROR, () => {
    const now = Date.now();
    if (now - lastErrorAt < 2000) return;
    lastErrorAt = now;
    say('Ocurrió un error inesperado. Intente de nuevo.', 'error');
  });

  window.addEventListener('pagehide', () => appScope.destroy(), { once: true });
}

/**
 * Arranca el núcleo: instala el manejador de errores y resuelve sesión e
 * institución con los puertos conectados. Sin puertos, quedan en estados
 * seguros (`unauthenticated` / `none`); nunca se inventa una identidad.
 * @returns {Promise<void>} Nada.
 */
export async function bootKernel() {
  errorHandler.install();
  try {
    await session.resolve();
  } catch (error) {
    errorHandler.report(error, { context: 'session.resolve' });
  }
  try {
    await institution.resolve();
  } catch (error) {
    errorHandler.report(error, { context: 'institution.resolve' });
  }
  access.syncFromUser(session.user());
  access.applyTo(document);
}
