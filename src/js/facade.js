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
import { bus, EVENTS } from './core/events.js';
import { storage } from './core/storage.js';
import { initAll, destroy, registered } from './core/registry.js';
import { api, configureHttp, request } from './core/http.js';
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
import { resolveElement, ERRORS } from './core/errors.js';
import { session, institution, appScope, errorHandler, configureAuth, login, auth } from './kernel.js';
import { truncate, normalizeSpaces } from './helpers/strings.js';
import {
  toggleFullscreen,
  isFullscreen,
  createIframe,
  assetUrl,
  listen,
  customSet,
  customGet,
} from './helpers/browser.js';
import { setBusy, isBusy, setProgress, showInlineAlert, dismissInlineAlert } from './components/feedback.js';

/**
 * Construye la fachada inmutable.
 * @param {object} parts Partes resueltas en el arranque.
 * @param {Readonly<import('./config/index.js').AppConfig>} parts.config Configuración.
 * @param {Readonly<Record<string, number>>} parts.breakpoints Puntos de quiebre.
 * @returns {Readonly<Record<string, any>>} `AU`.
 */
export function createFacade({ config, breakpoints }) {
  /**
   * Conecta los puertos del backend y vuelve a resolver sesión/institución.
   * @param {{ session?: import('./services/session-service.js').SessionPorts, institution?: import('./services/institution-context.js').InstitutionPorts }} ports Puertos.
   * @returns {Promise<import('./core/context.js').AppContext>} Contexto resultante.
   */
  const configurePorts = async ({ session: sp, institution: ip } = {}) => {
    if (sp) session.setPorts(sp);
    if (ip) institution.setPorts(ip);
    if (sp) await session.resolve();
    if (ip) await institution.resolve();
    return getContext();
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
    toggleModal: modal.toggleModal,
    getModal: modal.getModal,
    destroyModal: modal.destroyModal,
    setModalContent: modal.setModalContent,

    // ── Retroalimentación en la página
    busy: (
      /** @type {string|HTMLElement} */ t,
      /** @type {boolean} */ on,
      /** @type {{label?: string}} */ o,
    ) => setBusy(t, on, o),
    isBusy,
    progress: setProgress,
    inlineAlert: showInlineAlert,
    dismissInlineAlert,

    // ── DOM
    q: dom.qs,
    qa: dom.qsa,
    el: dom.h,
    ready: dom.ready,
    on: (
      /** @type {EventTarget|string} */ target,
      /** @type {string} */ type,
      /** @type {(e: Event, match?: Element) => void} */ fn,
      /** @type {AddEventListenerOptions & { delegate?: string }} */ opts,
    ) => listen(typeof target === 'string' ? resolveElement(target, 'el elemento') : target, type, fn, opts),
    show: (/** @type {string|HTMLElement} */ t) => (resolveElement(t, 'el elemento').hidden = false),
    hide: (/** @type {string|HTMLElement} */ t) => (resolveElement(t, 'el elemento').hidden = true),
    toggle: (/** @type {string|HTMLElement} */ t, /** @type {boolean} */ force) => {
      const el = /** @type {HTMLElement} */ (resolveElement(t, 'el elemento'));
      el.hidden = force === undefined ? !el.hidden : !force;
      return !el.hidden;
    },
    isHidden: (/** @type {string|HTMLElement} */ t) => {
      const el = typeof t === 'string' ? document.querySelector(t) : t;
      return !el || /** @type {HTMLElement} */ (el).hidden || el.classList.contains('d-none');
    },
    toggleFullscreen: (/** @type {string|Element} */ t) =>
      toggleFullscreen(t ? resolveElement(t, 'el elemento') : undefined),
    isFullscreen,

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
    isValidPlaca: validators.isValidPlaca,
    isValidCurrency: validators.isValidCurrency,
    isNullOrEmpty: validators.isNullOrEmpty,
    isEmpty: validators.isEmpty,
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
    humanize: format.humanize,
    truncate,
    normalizeSpaces,
    date: format.dayjs,
    statusVariant,

    // ── Plantillas y seguridad
    render,
    registerHelper,
    sanitize,
    escapeHtml,

    // ── API (neutro respecto al backend; errores tipados en AU.errors)
    api,
    request,
    configureApi: configureHttp,
    errors: ERRORS,
    report: (/** @type {unknown} */ error, /** @type {{context?: string}} */ o) =>
      errorHandler.report(error, o),
    createScope: () => appScope.child(),

    // ── Sesión, institución y contexto (datos del backend; autorización SOLO visual)
    session: Object.freeze({
      status: () => session.status(),
      user: () => session.user(),
      resolve: () => session.resolve(),
      signOut: () => session.signOut(),
      subscribe: (/** @type {(s: string) => void} */ fn) => session.subscribe(fn),
    }),
    institution: Object.freeze({
      status: () => institution.status(),
      current: () => institution.current(),
      resolve: () => institution.resolve(),
      available: () => institution.available(),
      select: (/** @type {string} */ id) => institution.select(id),
      subscribe: (/** @type {(i: unknown) => void} */ fn) => institution.subscribe(fn),
    }),
    configurePorts,
    configureAuth: async (/** @type {import('./services/auth-service.js').AuthOptions} */ options) => {
      configureAuth(options);
      await auth.restore();
      return session.resolve();
    },
    login,
    logout: () => session.signOut(),
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
    openIframe: createIframe,
    assetUrl: (/** @type {string} */ path) => assetUrl(path, config.assetBaseUrl),
    customSet,
    customGet,
    storeGet: (/** @type {string} */ key, /** @type {unknown} */ fallback) => storage.get(key, fallback),
    storeSet: (/** @type {string} */ key, /** @type {unknown} */ value) => storage.set(key, value),
    storeRemove: (/** @type {string} */ key) => storage.remove(key),

    // ── Eventos (au:<ámbito>:<evento>)
    events: Object.freeze({
      on: (/** @type {string} */ n, /** @type {(e: CustomEvent) => void} */ fn) => bus.on(n, fn),
      once: (/** @type {string} */ n, /** @type {(e: CustomEvent) => void} */ fn) => bus.once(n, fn),
      off: (/** @type {string} */ n, /** @type {(e: CustomEvent) => void} */ fn) => bus.off(n, fn),
      emit: (/** @type {string} */ n, /** @type {object} */ detail) => bus.emit(n, detail),
      names: EVENTS,
    }),
  };

  return Object.freeze(AU);
}
