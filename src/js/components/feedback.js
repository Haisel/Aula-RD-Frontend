/**
 * Retroalimentación en la página (portada de la Fase 4): región ocupada,
 * barra de progreso accesible y alertas en línea.
 *
 * ```js
 * AU.busy('#tabla-cursos', true, { label: 'Cargando cursos…' });
 * AU.busy('#tabla-cursos', false);
 * AU.progress('#avance', 72, { label: '72 %' });
 * AU.inlineAlert('No hay períodos abiertos.', { variant: 'warning', container: '#avisos' });
 * ```
 * @module components/feedback
 */
import { Alert } from 'bootstrap';
import { resolveElement } from '../core/errors.js';
import { emit, EVENTS } from '../core/events.js';

/** @type {WeakMap<Element, string | null>} */
const previousBusy = new WeakMap();

/**
 * Marca una región como ocupada: atenúa el contenido, superpone un spinner con
 * texto para lectores de pantalla y pone `aria-busy`. Al terminar restaura el estado.
 * @param {string | HTMLElement} target Región.
 * @param {boolean} busy `true` para marcar, `false` para liberar.
 * @param {{ label?: string }} [options] Texto anunciado.
 * @returns {HTMLElement} La región.
 */
export function setBusy(target, busy, { label = 'Cargando…' } = {}) {
  const region = /** @type {HTMLElement} */ (resolveElement(target, 'la región'));
  const existing = region.querySelector(':scope > .au-busy-overlay');
  if (busy) {
    if (existing) return region;
    previousBusy.set(region, region.getAttribute('aria-busy'));
    region.classList.add('au-busy');
    region.setAttribute('aria-busy', 'true');
    const overlay = document.createElement('div');
    overlay.className = 'au-busy-overlay';
    overlay.setAttribute('role', 'status');
    const spinner = document.createElement('span');
    spinner.className = 'spinner-border spinner-border-sm';
    spinner.setAttribute('aria-hidden', 'true');
    const text = document.createElement('span');
    text.className = 'visually-hidden';
    text.textContent = label;
    overlay.append(spinner, text);
    region.append(overlay);
    return region;
  }
  existing?.remove();
  region.classList.remove('au-busy');
  const old = previousBusy.get(region);
  if (old === null || old === undefined) region.removeAttribute('aria-busy');
  else region.setAttribute('aria-busy', old);
  previousBusy.delete(region);
  return region;
}

/**
 * @param {string | HTMLElement} target Región.
 * @returns {boolean} `true` si está marcada como ocupada.
 */
export function isBusy(target) {
  return resolveElement(target, 'la región').getAttribute('aria-busy') === 'true';
}

/**
 * Actualiza una barra `.progress` de Bootstrap y su semántica ARIA.
 * El ancho se aplica con la variable `--au-progress` (sin estilos en línea arbitrarios).
 * Emite `au:progress:change` con `{ value, max, percent }`.
 * @param {string | HTMLElement} target Contenedor `.progress` o `.progress-bar`.
 * @param {number} value Valor.
 * @param {{ max?: number, label?: string }} [options] Máximo (100) y texto.
 * @returns {number} Valor aplicado (acotado entre 0 y `max`).
 */
export function setProgress(target, value, { max = 100, label } = {}) {
  const root = /** @type {HTMLElement} */ (resolveElement(target, 'la barra de progreso'));
  const bar = /** @type {HTMLElement | null} */ (
    root.classList.contains('progress-bar') ? root : root.querySelector('.progress-bar')
  );
  if (!bar) throw new Error('[AU] progress: no se encontró .progress-bar.');
  const maxValue = Number(max) > 0 ? Number(max) : 100;
  const n = Number(value);
  const clamped = Math.min(Math.max(Number.isFinite(n) ? n : 0, 0), maxValue);
  const percent = (clamped / maxValue) * 100;
  bar.style.setProperty('--au-progress', `${percent}%`);
  bar.classList.add('au-progress-bar');
  if (label !== undefined) bar.textContent = label;
  const progress = /** @type {HTMLElement | null} */ (
    root.classList.contains('progress') ? root : root.closest('.progress')
  );
  if (progress) {
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-valuemin', '0');
    progress.setAttribute('aria-valuemax', String(maxValue));
    progress.setAttribute('aria-valuenow', String(clamped));
    progress.setAttribute('aria-valuetext', label === undefined ? `${Math.round(percent)} %` : String(label));
    emit(EVENTS.PROGRESS_CHANGE, { value: clamped, max: maxValue, percent }, progress);
  }
  return clamped;
}

const ALERT_VARIANTS = new Set(['primary', 'secondary', 'success', 'warning', 'danger', 'info']);

/**
 * @typedef {object} InlineAlertOptions
 * @property {'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'error' | 'info'} [variant='info'] Variante (`error` = `danger`).
 * @property {string} [title] Título en negrita.
 * @property {boolean} [dismissible=true] Con botón de cierre.
 * @property {string | HTMLElement} [container] Dónde insertar (por defecto `[data-au-alerts]`, `main` o `body`).
 * @property {boolean} [prepend=true] Insertar al inicio.
 */

/**
 * Crea una alerta de Bootstrap en la página. El texto se inserta como texto plano.
 * @param {string | Node} message Mensaje.
 * @param {InlineAlertOptions} [options] Opciones.
 * @returns {HTMLElement} La alerta.
 */
export function showInlineAlert(message, options = {}) {
  const raw = options.variant === 'error' ? 'danger' : (options.variant ?? 'info');
  const variant = ALERT_VARIANTS.has(raw) ? raw : 'info';
  const container = options.container
    ? resolveElement(options.container, 'el contenedor de alertas')
    : (document.querySelector('[data-au-alerts]') ?? document.querySelector('main') ?? document.body);
  const dismissible = options.dismissible !== false;

  const alert = document.createElement('div');
  alert.className = `alert alert-${variant}${dismissible ? ' alert-dismissible fade show' : ''}`;
  alert.setAttribute('role', variant === 'danger' || variant === 'warning' ? 'alert' : 'status');
  if (options.title) {
    const title = document.createElement('strong');
    title.textContent = options.title;
    alert.append(title, document.createTextNode(' '));
  }
  alert.append(message instanceof Node ? message : document.createTextNode(String(message ?? '')));
  if (dismissible) {
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'btn-close';
    close.setAttribute('data-bs-dismiss', 'alert');
    close.setAttribute('aria-label', 'Cerrar alerta');
    alert.append(close);
    Alert.getOrCreateInstance(alert);
  }
  if (options.prepend === false) container.append(alert);
  else container.prepend(alert);
  return alert;
}

/**
 * Cierra (con animación) y elimina una alerta.
 * @param {string | HTMLElement} target Alerta.
 * @returns {void}
 */
export function dismissInlineAlert(target) {
  Alert.getOrCreateInstance(resolveElement(target, 'la alerta')).close();
}
