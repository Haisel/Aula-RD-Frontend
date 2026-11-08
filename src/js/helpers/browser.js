/**
 * Utilidades del navegador portadas de la Fase 4: pantalla completa, iframes
 * seguros, URLs de recursos, eventos delegados y un registro simple de funciones.
 * @module helpers/browser
 */
import { ValidationError } from '../core/errors.js';

const IFRAME_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Entra o sale de pantalla completa. Si el navegador lo rechaza (p. ej. sin gesto
 * del usuario) devuelve `false` en lugar de lanzar.
 * @param {Element} [element=document.documentElement] Elemento.
 * @returns {Promise<boolean>} `true` si quedó en pantalla completa.
 */
export async function toggleFullscreen(element = document.documentElement) {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen?.();
      return false;
    }
    await element.requestFullscreen?.();
    return Boolean(document.fullscreenElement);
  } catch {
    return false;
  }
}

/**
 * @returns {boolean} `true` si hay un elemento en pantalla completa.
 */
export function isFullscreen() {
  return Boolean(document.fullscreenElement);
}

/**
 * @typedef {object} IframeOptions
 * @property {string} [title] Título accesible (obligatorio en la práctica para lectores de pantalla).
 * @property {string | number} [width='100%'] Ancho.
 * @property {string | number} [height='100%'] Alto.
 * @property {string} [sandbox] Restricciones (`'allow-scripts allow-same-origin'`…). Sin él no hay sandbox.
 * @property {'lazy' | 'eager'} [loading='lazy'] Carga.
 */

/**
 * Crea un `<iframe>` sin insertarlo. Solo admite `http:`, `https:` o rutas relativas:
 * un `javascript:` o `data:` se ejecutaría con el origen de la página.
 * @param {string} src Dirección.
 * @param {IframeOptions} [options] Opciones.
 * @returns {HTMLIFrameElement} Iframe.
 * @throws {ValidationError} `IFRAME_SRC_INVALID` si la dirección no es segura.
 */
export function createIframe(src, options = {}) {
  /** @type {URL} */
  let url;
  try {
    url = new URL(String(src ?? ''), window.location.href);
  } catch (cause) {
    throw new ValidationError('La dirección del iframe no es válida.', { code: 'IFRAME_SRC_INVALID', cause });
  }
  if (!IFRAME_PROTOCOLS.has(url.protocol)) {
    throw new ValidationError('El iframe solo admite direcciones http, https o relativas.', {
      code: 'IFRAME_SRC_INVALID',
    });
  }
  const frame = document.createElement('iframe');
  frame.src = url.href;
  frame.title = options.title ?? '';
  frame.width = String(options.width ?? '100%');
  frame.height = String(options.height ?? '100%');
  frame.loading = options.loading ?? 'lazy';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  if (typeof options.sandbox === 'string') frame.setAttribute('sandbox', options.sandbox);
  return frame;
}

/**
 * URL de un recurso anteponiendo `assetBaseUrl` de `au-config` (p. ej. un CDN).
 * Las URLs absolutas se devuelven sin cambios.
 * @param {string} path Ruta (`/img/brand/logo.svg` o `img/brand/logo.svg`).
 * @param {string} [base=''] Base configurada.
 * @returns {string} URL.
 */
export function assetUrl(path, base = '') {
  const p = String(path ?? '');
  if (/^[a-z][a-z0-9+.-]*:/i.test(p) || p.startsWith('//')) return p;
  if (!base) return p;
  return `${base.replace(/\/$/, '')}/${p.replace(/^\//, '')}`;
}

/**
 * Registra un listener y devuelve la función para retirarlo. Con `options.delegate`
 * (selector CSS) escucha en el contenedor y llama `handler(event, coincidencia)` solo
 * si el evento nace dentro de un elemento que cumple el selector: sirve para tablas
 * y listas que cambian.
 *
 * ```js
 * AU.on('#tabla-estudiantes', 'click', (e, btn) => editar(btn.dataset.id), { delegate: '[data-editar]' });
 * ```
 * @param {EventTarget} target Destino.
 * @param {string} type Tipo de evento.
 * @param {(event: Event, match?: Element) => void} handler Manejador.
 * @param {AddEventListenerOptions & { delegate?: string }} [options] Opciones.
 * @returns {() => void} Para retirarlo.
 */
export function listen(target, type, handler, options = {}) {
  const { delegate, ...opts } = options;
  /** @type {EventListener} */
  const listener = delegate
    ? (event) => {
        const origin = event.target instanceof Element ? event.target : null;
        const match = origin?.closest(delegate);
        if (match && (!(target instanceof Node) || target.contains(match))) handler(event, match);
      }
    : (event) => handler(event);
  target.addEventListener(type, listener, opts);
  return () => target.removeEventListener(type, listener, opts);
}

/** @typedef {(...args: any[]) => unknown} AnyFunction */

/** @type {Map<string, AnyFunction>} */
const custom = new Map();

/**
 * Registra una función por nombre (registro simple en memoria, por ejemplo para
 * que el HTML llame acciones con `data-au-action`).
 * @param {string} name Nombre.
 * @param {AnyFunction} fn Función.
 * @returns {void}
 */
export function customSet(name, fn) {
  if (typeof name === 'string' && name && typeof fn === 'function') custom.set(name, fn);
}

/**
 * Función registrada con ese nombre.
 * @param {string} name Nombre.
 * @returns {AnyFunction | null} Función o `null`.
 */
export function customGet(name) {
  return custom.get(name) ?? null;
}
