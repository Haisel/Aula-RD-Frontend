/**
 * Fachada pública **`window.AU`** — la única superficie global de Aula RD.
 *
 * Las páginas (y el código de cualquier backend) hablan solo con `AU`; nunca con
 * Axios, SweetAlert2, Chart.js ni los módulos internos. La fachada no implementa
 * lógica: delega en `helpers/`, `components/`, `adapters/` y `core/`.
 * Está congelada (`Object.freeze`): ningún script puede sobrescribir sus funciones.
 *
 * Referencia completa con ejemplos: `docs/04-api-au.md` y `docs/api/` (JSDoc).
 * @module facade
 */
import * as dom from './helpers/dom.js';
import * as format from './helpers/format.js';
import * as validators from './helpers/validators.js';
import { registerSchema, validate, zod } from './helpers/schema-registry.js';
import { sanitize, escapeHtml } from './helpers/sanitize.js';
import { statusVariant } from './helpers/status.js';
import { downloadBlob, readText, readJson, copyText, groupBy } from './helpers/files.js';
import * as theme from './core/theme.js';
import * as events from './core/events.js';
import * as storage from './core/storage.js';
import { initAll, destroy, registered } from './core/registry.js';
import { api, configureHttp } from './core/http.js';
import { render, registerHelper } from './core/templates.js';
import { getContext, setContext, can, hasRole } from './core/context.js';
import * as dialogs from './components/dialogs.js';
import * as modal from './components/modal.js';
import { validateForm, formToObject, showErrors, clearErrors } from './components/forms.js';
import { applyMask } from './components/masks.js';
import { toggleSidebar } from './components/sidebar.js';
import { createChart } from './adapters/chart.js';
import { createDataTable } from './adapters/datatable.js';
import { createSelect } from './adapters/select.js';
import { createDatepicker } from './adapters/datepicker.js';
import { createCalendar } from './adapters/calendar.js';
import { createEditor } from './adapters/editor.js';
import { exportRows } from './adapters/excel.js';
import { barcode, qrcode } from './adapters/codes.js';
import { attachSignature } from './adapters/signature.js';
import { dragSort } from './adapters/sortable.js';
import { resolveElement } from './core/errors.js';

/**
 * Construye la fachada inmutable.
 * @param {object} parts Partes resueltas en el arranque.
 * @param {Readonly<import('./config/index.js').AppConfig>} parts.config Configuración.
 * @param {Readonly<Record<string, number>>} parts.breakpoints Puntos de quiebre.
 * @returns {Readonly<Record<string, any>>} `AU`.
 */
export function createFacade({ config, breakpoints }) {
  const once = (/** @type {string} */ name, /** @type {(e: CustomEvent) => void} */ fn) => {
    const off = events.on(name, (e) => {
      off();
      fn(e);
    });
    return off;
  };

  const AU = {
    // ── Meta
    version: config.version,
    config,
    breakpoints,

    // ── Ciclo de vida de componentes declarativos (data-au-*)
    init: (/** @type {ParentNode} */ root = document) => initAll(root),
    destroy: (/** @type {HTMLElement} */ el) => destroy(el),
    components: () => registered(),

    // ── Tema
    theme: Object.freeze({
      get: theme.getTheme,
      set: theme.setTheme,
      toggle: theme.toggleTheme,
      preference: theme.getPreference,
      token: theme.cssToken,
    }),
    getTheme: theme.getTheme,
    setTheme: theme.setTheme,
    toggleTheme: theme.toggleTheme,
    toggleSidebar,

    // ── Diálogos (SweetAlert2)
    alert: dialogs.alert,
    success: (/** @type {string} */ text, /** @type {() => void} */ cb, /** @type {object} */ o) =>
      dialogs.alert(text, 'success', cb, o),
    error: (/** @type {string} */ text, /** @type {() => void} */ cb, /** @type {object} */ o) =>
      dialogs.alert(text, 'error', cb, o),
    warning: (/** @type {string} */ text, /** @type {() => void} */ cb, /** @type {object} */ o) =>
      dialogs.alert(text, 'warning', cb, o),
    info: (/** @type {string} */ text, /** @type {() => void} */ cb, /** @type {object} */ o) =>
      dialogs.alert(text, 'info', cb, o),
    toast: dialogs.toast,
    toastSuccess: (/** @type {string} */ t, /** @type {object} */ o) => dialogs.toast(t, 'success', o),
    toastError: (/** @type {string} */ t, /** @type {object} */ o) => dialogs.toast(t, 'error', o),
    toastWarning: (/** @type {string} */ t, /** @type {object} */ o) => dialogs.toast(t, 'warning', o),
    toastInfo: (/** @type {string} */ t, /** @type {object} */ o) => dialogs.toast(t, 'info', o),
    confirm: dialogs.confirm,
    confirmDanger: dialogs.confirmDanger,
    confirmInsert: dialogs.confirmInsert,
    confirmUpdate: dialogs.confirmUpdate,
    confirmDelete: dialogs.confirmDelete,
    confirmDeleteByName: dialogs.confirmDeleteByName,
    loading: dialogs.loading,
    close: dialogs.close,
    btnLoading: dialogs.btnLoading,

    // ── Modales (Bootstrap)
    openModal: modal.openModal,
    closeModal: modal.closeModal,
    getModalData: modal.getModalData,
    setModalTitle: modal.setModalTitle,
    setModalBody: modal.setModalBody,
    onModalOpen: modal.onModalOpen,
    onModalClose: modal.onModalClose,

    // ── DOM
    q: dom.qs,
    qa: dom.qsa,
    el: dom.h,
    ready: dom.ready,
    on: (
      /** @type {EventTarget} */ target,
      /** @type {string} */ type,
      /** @type {EventListener} */ fn,
      /** @type {AddEventListenerOptions} */ opts,
    ) => {
      target.addEventListener(type, fn, opts);
      return () => target.removeEventListener(type, fn, opts);
    },
    show: (/** @type {string|HTMLElement} */ t) => (resolveElement(t, 'el elemento').hidden = false),
    hide: (/** @type {string|HTMLElement} */ t) => (resolveElement(t, 'el elemento').hidden = true),
    toggle: (/** @type {string|HTMLElement} */ t, /** @type {boolean} */ force) => {
      const el = /** @type {HTMLElement} */ (resolveElement(t, 'el elemento'));
      el.hidden = force === undefined ? !el.hidden : !force;
      return !el.hidden;
    },

    // ── Formularios y validación (Zod)
    validForm: (/** @type {HTMLFormElement|string} */ f, /** @type {string} */ schema) =>
      validateForm(resolveElement(f, 'el formulario'), schema),
    serializeForm: (/** @type {HTMLFormElement|string} */ f) =>
      formToObject(resolveElement(f, 'el formulario')),
    showErrors: (
      /** @type {HTMLFormElement|string} */ f,
      /** @type {Record<string, string|string[]>} */ errs,
      /** @type {string} */ general,
    ) => showErrors(resolveElement(f, 'el formulario'), errs, general),
    clearErrors: (/** @type {HTMLFormElement|string} */ f) => clearErrors(resolveElement(f, 'el formulario')),
    validate,
    registerSchema,
    zod,
    isValidCedula: validators.isValidCedula,
    isValidRnc: validators.isValidRnc,
    isValidPhone: validators.isValidPhoneDO,
    isValidEmail: validators.isValidEmail,
    mask: (/** @type {HTMLInputElement|string} */ input, /** @type {string|object} */ type) =>
      applyMask(resolveElement(input, 'el campo'), /** @type {any} */ (type)),

    // ── Formato (es-DO)
    format: Object.freeze({ ...format, dayjs: undefined }),
    formatCurrency: format.formatCurrency,
    formatCompactCurrency: format.formatCompactCurrency,
    formatNumber: format.formatNumber,
    formatPercent: format.formatPercent,
    formatDate: format.formatDate,
    formatDateTime: format.formatDateTime,
    formatRelative: format.formatRelative,
    formatCedula: format.formatCedula,
    formatRnc: format.formatRnc,
    formatPhone: format.formatPhone,
    initials: format.initials,
    date: format.dayjs,
    statusVariant,

    // ── Plantillas y seguridad
    render,
    registerHelper,
    sanitize,
    escapeHtml,

    // ── API (Axios, neutro respecto al backend)
    api,
    configureApi: configureHttp,

    // ── Contexto de sesión/institución (solo presentación)
    getContext,
    setContext,
    can,
    hasRole,

    // ── Librerías diferidas (se descargan al primer uso)
    openChart: createChart,
    createDataTable,
    createSelect,
    createDatepicker,
    openCalendar: createCalendar,
    editWithQuill: createEditor,
    exportRows,
    excelExport: (/** @type {import('./adapters/excel.js').ExportRequest} */ req) =>
      exportRows({ ...req, format: 'xlsx' }),
    barcode,
    qrcode,
    attachSignature,
    dragSort,

    // ── Archivos y utilidades
    download: downloadBlob,
    readText,
    readJson,
    copy: copyText,
    groupBy,
    print: () => window.print(),
    storeGet: storage.getItem,
    storeSet: storage.setItem,

    // ── Eventos (au:*)
    events: Object.freeze({ on: events.on, once, emit: events.emit, names: events.EVENTS }),
  };

  return Object.freeze(AU);
}
