/**
 * Ayudas para modales de Bootstrap: abrir/cerrar por id y pasar datos.
 *
 * ```js
 * AU.openModal('#modal-estudiante', { id: 42 });
 * AU.onModalOpen('#modal-estudiante', (data) => …);
 * const datos = AU.getModalData('#modal-estudiante');
 * ```
 * @module components/modal
 */
import { Modal } from 'bootstrap';
import { resolveElement } from '../core/errors.js';
import { sanitize } from '../helpers/sanitize.js';

/** @type {WeakMap<Element, unknown>} */
const payloads = new WeakMap();

/**
 * Abre un modal.
 * @param {string | HTMLElement} target Selector o elemento `.modal`.
 * @param {unknown} [data] Datos asociados (se leen con {@link getModalData}).
 * @returns {Modal} Instancia de Bootstrap.
 */
export function openModal(target, data) {
  const el = resolveElement(target, 'el modal');
  if (data !== undefined) payloads.set(el, data);
  const m = Modal.getOrCreateInstance(el);
  m.show();
  return m;
}

/**
 * Cierra un modal.
 * @param {string | HTMLElement} target Selector o elemento.
 * @returns {void}
 */
export function closeModal(target) {
  Modal.getInstance(resolveElement(target, 'el modal'))?.hide();
}

/**
 * Datos pasados al abrir.
 * @param {string | HTMLElement} target Selector o elemento.
 * @returns {unknown} Datos o `undefined`.
 */
export function getModalData(target) {
  return payloads.get(resolveElement(target, 'el modal'));
}

/**
 * Cambia el título (texto plano).
 * @param {string | HTMLElement} target Modal.
 * @param {string} title Título.
 * @returns {void}
 */
export function setModalTitle(target, title) {
  const t = resolveElement(target, 'el modal').querySelector('.modal-title');
  if (t) t.textContent = title;
}

/**
 * Cambia el cuerpo (HTML sanitizado).
 * @param {string | HTMLElement} target Modal.
 * @param {string} html HTML.
 * @returns {void}
 */
export function setModalBody(target, html) {
  const b = resolveElement(target, 'el modal').querySelector('.modal-body');
  if (b) b.innerHTML = sanitize(html);
}

/**
 * Ejecuta `fn(datos)` cada vez que el modal se muestra.
 * @param {string | HTMLElement} target Modal.
 * @param {(data: unknown, el: HTMLElement) => void} fn Callback.
 * @returns {() => void} Para dejar de escuchar.
 */
export function onModalOpen(target, fn) {
  const el = /** @type {HTMLElement} */ (resolveElement(target, 'el modal'));
  const h = () => fn(payloads.get(el), el);
  el.addEventListener('shown.bs.modal', h);
  return () => el.removeEventListener('shown.bs.modal', h);
}

/**
 * Ejecuta `fn()` cada vez que el modal se oculta.
 * @param {string | HTMLElement} target Modal.
 * @param {(el: HTMLElement) => void} fn Callback.
 * @returns {() => void} Para dejar de escuchar.
 */
export function onModalClose(target, fn) {
  const el = /** @type {HTMLElement} */ (resolveElement(target, 'el modal'));
  const h = () => fn(el);
  el.addEventListener('hidden.bs.modal', h);
  return () => el.removeEventListener('hidden.bs.modal', h);
}

/**
 * Abre o cierra un modal según su estado.
 * @param {string | HTMLElement} target Modal.
 * @param {unknown} [data] Datos (solo si se abre).
 * @returns {Modal} Instancia.
 */
export function toggleModal(target, data) {
  const el = resolveElement(target, 'el modal');
  if (data !== undefined) payloads.set(el, data);
  const m = Modal.getOrCreateInstance(el);
  m.toggle();
  return m;
}

/**
 * Instancia de Bootstrap del modal (la crea si no existe).
 * @param {string | HTMLElement} target Modal.
 * @returns {Modal} Instancia.
 */
export function getModal(target) {
  return Modal.getOrCreateInstance(resolveElement(target, 'el modal'));
}

/**
 * Destruye la instancia de Bootstrap y olvida los datos asociados (el HTML queda).
 * @param {string | HTMLElement} target Modal.
 * @returns {void}
 */
export function destroyModal(target) {
  const el = resolveElement(target, 'el modal');
  Modal.getInstance(el)?.dispose();
  payloads.delete(el);
}

/**
 * Cambia título y cuerpo de una vez.
 * @param {string | HTMLElement} target Modal.
 * @param {{ title?: string, body?: string }} content Título (texto) y cuerpo (HTML sanitizado).
 * @returns {void}
 */
export function setModalContent(target, { title, body } = {}) {
  if (title !== undefined) setModalTitle(target, title);
  if (body !== undefined) setModalBody(target, body);
}
