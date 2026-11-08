/**
 * Alertas, toasts, confirmaciones y carga con SweetAlert2 (mismo estilo de llamada que `AR`).
 *
 * ```js
 * AU.success('Estudiante guardado');
 * AU.toast('Pago registrado', 'success');
 * if (await AU.confirmDelete('Se eliminará el estudiante María Peña.')) { … }
 * AU.loading('Importando estudiantes…'); …; AU.close();
 * AU.btnLoading(boton, true);
 * ```
 * Los botones usan las clases de Bootstrap de la marca (`buttonsStyling: false`);
 * colores y tipografía vienen de `scss/vendors/_sweetalert2.scss`.
 * El texto se trata como texto plano; use `options.html` solo con HTML sanitizado.
 * @module components/dialogs
 */
import Swal from 'sweetalert2';
import { sanitize } from '../helpers/sanitize.js';

/** @typedef {'success' | 'error' | 'warning' | 'info' | 'question'} DialogType */

const base = Swal.mixin({
  buttonsStyling: false,
  reverseButtons: true,
  focusCancel: false,
  returnFocus: true,
  customClass: {
    popup: 'au-swal',
    title: 'au-swal-title',
    htmlContainer: 'au-swal-text',
    actions: 'au-swal-actions',
    confirmButton: 'btn btn-primary',
    cancelButton: 'btn btn-outline-primary',
    denyButton: 'btn btn-danger',
  },
  showClass: { popup: 'au-swal-in' },
  hideClass: { popup: 'au-swal-out' },
});

const toaster = Swal.mixin({
  toast: true,
  position: 'bottom-end',
  showConfirmButton: false,
  showCloseButton: true,
  timer: 5000,
  timerProgressBar: true,
  customClass: { popup: 'au-swal-toast', title: 'au-swal-toast-title', closeButton: 'au-swal-toast-close' },
  didOpen: (el) => {
    el.addEventListener('mouseenter', Swal.stopTimer);
    el.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

const TITLES = {
  success: 'Listo',
  error: 'No se pudo completar',
  warning: 'Atención',
  info: 'Información',
  question: '¿Desea continuar?',
};

/**
 * Normaliza `error` → `error` y acepta alias en español.
 * @param {string} type Tipo.
 * @returns {DialogType} Tipo de SweetAlert2.
 */
function normalizeType(type) {
  /** @type {Record<string, DialogType>} */
  const alias = {
    danger: 'error',
    exito: 'success',
    éxito: 'success',
    advertencia: 'warning',
    informacion: 'info',
    información: 'info',
  };
  const t = alias[type] ?? type;
  return /** @type {DialogType} */ (
    ['success', 'error', 'warning', 'info', 'question'].includes(t) ? t : 'info'
  );
}

/**
 * Alerta modal.
 * @param {string} text Mensaje (texto plano).
 * @param {string} [type='info'] success · error · warning · info · question.
 * @param {() => void} [callback] Se ejecuta al cerrar.
 * @param {object} [options] Opciones de SweetAlert2 (`title`, `confirmButtonText`, `html`…).
 * @returns {Promise<any>} Resultado de SweetAlert2.
 */
export async function alert(text, type = 'info', callback, options = {}) {
  const icon = normalizeType(type);
  const { html, ...rest } = /** @type {any} */ (options);
  const result = await base.fire({
    icon,
    title: TITLES[icon],
    ...(html ? { html: sanitize(html) } : { text }),
    confirmButtonText: 'Aceptar',
    ...rest,
  });
  callback?.();
  return result;
}

/**
 * Toast (notificación breve, abajo a la derecha).
 * @param {string} text Mensaje.
 * @param {string} [type='success'] success · error · warning · info.
 * @param {object} [options] Opciones de SweetAlert2 (`timer`, `position`…).
 * @returns {Promise<any>} Resultado.
 */
export function toast(text, type = 'success', options = {}) {
  return toaster.fire({ icon: normalizeType(type), title: text, ...options });
}

/**
 * @typedef {object} ConfirmConfig
 * @property {string} [title='¿Desea continuar?'] Título.
 * @property {string} [text] Explicación (texto plano).
 * @property {string} [confirmText='Confirmar'] Botón de confirmación.
 * @property {string} [cancelText='Cancelar'] Botón de cancelar.
 * @property {'primary' | 'danger'} [variant='primary'] Estilo del botón de confirmación.
 * @property {DialogType} [icon='question'] Ícono.
 */

/**
 * Confirmación. Acepta `(título, pregunta, callback, tipo)` como `AR.confirm` o un objeto.
 * @param {string | ConfirmConfig} titleOrConfig Título o configuración.
 * @param {string} [question] Pregunta (si el primer argumento es el título).
 * @param {(confirmed: boolean) => void} [callback] Se llama con la respuesta.
 * @param {'primary' | 'danger'} [variant='primary'] Estilo.
 * @returns {Promise<boolean>} `true` si confirmó.
 */
export async function confirm(titleOrConfig, question, callback, variant = 'primary') {
  /** @type {ConfirmConfig} */
  const cfg =
    typeof titleOrConfig === 'string' ? { title: titleOrConfig, text: question, variant } : titleOrConfig;
  const danger = cfg.variant === 'danger';
  const { isConfirmed } = await base.fire({
    icon: cfg.icon ?? (danger ? 'warning' : 'question'),
    title: cfg.title ?? TITLES.question,
    text: cfg.text,
    showCancelButton: true,
    confirmButtonText: cfg.confirmText ?? 'Confirmar',
    cancelButtonText: cfg.cancelText ?? 'Cancelar',
    focusCancel: danger,
    customClass: {
      confirmButton: danger ? 'btn btn-danger' : 'btn btn-primary',
      cancelButton: 'btn btn-outline-primary',
      popup: 'au-swal',
      title: 'au-swal-title',
      htmlContainer: 'au-swal-text',
      actions: 'au-swal-actions',
    },
  });
  callback?.(isConfirmed);
  return isConfirmed;
}

/**
 * Confirmación destructiva genérica.
 * @param {string} text Qué pasará.
 * @param {string} [confirmText='Sí, continuar'] Botón.
 * @returns {Promise<boolean>} Respuesta.
 */
export const confirmDanger = (text, confirmText = 'Sí, continuar') =>
  confirm({ title: '¿Está seguro?', text, confirmText, variant: 'danger' });

/**
 * Confirmar registro nuevo.
 * @param {string} [text] Detalle.
 * @returns {Promise<boolean>} Respuesta.
 */
export const confirmInsert = (text = 'Se guardará el nuevo registro.') =>
  confirm({ title: '¿Guardar registro?', text, confirmText: 'Guardar' });

/**
 * Confirmar actualización.
 * @param {string} [text] Detalle.
 * @returns {Promise<boolean>} Respuesta.
 */
export const confirmUpdate = (text = 'Se actualizarán los datos.') =>
  confirm({ title: '¿Guardar cambios?', text, confirmText: 'Guardar cambios' });

/**
 * Confirmar eliminación.
 * @param {string} [text] Detalle.
 * @returns {Promise<boolean>} Respuesta.
 */
export const confirmDelete = (text = 'Esta acción no se puede deshacer.') =>
  confirm({ title: '¿Eliminar registro?', text, confirmText: 'Eliminar', variant: 'danger' });

/**
 * Confirmar eliminación nombrando el registro.
 * @param {string} name Nombre del registro.
 * @returns {Promise<boolean>} Respuesta.
 */
export const confirmDeleteByName = (name) =>
  confirm({
    title: `¿Eliminar «${name}»?`,
    text: 'Esta acción no se puede deshacer.',
    confirmText: 'Eliminar',
    variant: 'danger',
  });

/**
 * Bloquea la página con un indicador de carga. `loading(false)` lo cierra.
 * @param {string | boolean} [textOrShow='Procesando…'] Texto, o `false` para cerrar.
 * @returns {void}
 */
export function loading(textOrShow = 'Procesando…') {
  if (textOrShow === false) {
    Swal.close();
    return;
  }
  base.fire({
    title: typeof textOrShow === 'string' ? textOrShow : 'Procesando…',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading(),
  });
}

/**
 * Cierra cualquier diálogo abierto.
 * @returns {void}
 */
export function close() {
  Swal.close();
}

/**
 * Estado de carga de un botón (spinner, deshabilitado, `aria-busy`).
 * @param {HTMLElement | string} target Botón o selector.
 * @param {boolean} [isLoading=true] Activar o desactivar.
 * @returns {void}
 */
export function btnLoading(target, isLoading = true) {
  const btn = typeof target === 'string' ? document.querySelector(target) : target;
  if (!btn) return;
  btn.classList.toggle('is-loading', isLoading);
  btn.toggleAttribute('disabled', isLoading);
  btn.setAttribute('aria-busy', String(isLoading));
}

/**
 * Componente `[data-au-confirm]`: confirma antes de seguir un enlace o enviar un formulario.
 * Atributos: `data-au-confirm="texto"`, `data-au-confirm-title`, `data-au-confirm-text` (botón),
 * `data-au-confirm-variant="danger"`.
 * @type {import('../types.js').ComponentDefinition}
 */
export const confirmComponent = {
  name: 'confirm',
  selector: '[data-au-confirm]',
  init(el) {
    const onClick = async (/** @type {Event} */ event) => {
      if (el.dataset.auConfirmed === 'true') {
        delete el.dataset.auConfirmed;
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      const ok = await confirm({
        title: el.dataset.auConfirmTitle,
        text: el.dataset.auConfirm,
        confirmText: el.dataset.auConfirmText,
        variant: el.dataset.auConfirmVariant === 'danger' ? 'danger' : 'primary',
      });
      if (!ok) return;
      if (el instanceof HTMLAnchorElement && el.href) window.location.assign(el.href);
      else {
        el.dataset.auConfirmed = 'true';
        el.click();
      }
    };
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  },
};

export { Swal };
