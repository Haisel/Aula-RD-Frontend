/**
 * Adaptador de Quill 2 (carga diferida): editor de texto enriquecido para comunicados.
 *
 * ```html
 * <div data-au-editor data-au-input="#comunicado-html" data-au-placeholder="Escriba el comunicado…"></div>
 * <input type="hidden" name="contenido" id="comunicado-html">
 * ```
 * El HTML que produce el editor se sanitiza antes de copiarse al input.
 * @module adapters/editor
 */
import { lazy } from './lazy.js';
import { sanitize } from '../helpers/sanitize.js';

export const loadQuill = lazy('Quill', async () => (await import('quill')).default);

/** Nombre accesible en español de cada control de la barra (Quill solo trae `aria-label` en inglés). */
const TOOLBAR_LABELS = {
  toolbar: 'Formato del texto',
  header: 'Estilo del párrafo',
  headerItems: { 2: 'Título 2', 3: 'Título 3', normal: 'Texto normal' },
  buttons: [
    ['.ql-bold', 'Negrita'],
    ['.ql-italic', 'Cursiva'],
    ['.ql-underline', 'Subrayado'],
    ['.ql-list[value="ordered"]', 'Lista numerada'],
    ['.ql-list[value="bullet"]', 'Lista con viñetas'],
    ['.ql-link', 'Enlace'],
    ['.ql-clean', 'Quitar formato'],
  ],
};

/**
 * Da nombre accesible en español a la barra de Quill (WCAG 4.1.2). Quill deja sin nombre el
 * selector de títulos y sus opciones, y etiqueta los botones en inglés ("bold", "list: ordered").
 * Solo cambia `aria-label`; el resto de atributos de Quill (`aria-pressed`, `aria-expanded`…) no se toca.
 * Es idempotente.
 * @param {HTMLElement} toolbar Contenedor `.ql-toolbar`.
 * @returns {void}
 */
export function labelToolbar(toolbar) {
  toolbar.setAttribute('aria-label', TOOLBAR_LABELS.toolbar);
  toolbar.querySelector('.ql-header .ql-picker-label')?.setAttribute('aria-label', TOOLBAR_LABELS.header);
  toolbar.querySelectorAll('.ql-header .ql-picker-item').forEach((item) => {
    const value = item.getAttribute('data-value');
    const items = /** @type {Record<string, string>} */ (TOOLBAR_LABELS.headerItems);
    item.setAttribute('aria-label', items[value ?? 'normal'] ?? `Título ${value}`);
  });
  for (const [selector, text] of TOOLBAR_LABELS.buttons) {
    toolbar.querySelectorAll(selector).forEach((button) => button.setAttribute('aria-label', text));
  }
}

/**
 * Crea un editor.
 * @param {HTMLElement} el Contenedor del editor.
 * @param {object} [options] Opciones de Quill.
 * @returns {Promise<{ quill: any, getHTML: () => string, setHTML: (html: string) => void }>} Controlador.
 */
export async function createEditor(el, options = {}) {
  const Quill = await loadQuill();
  const quill = new Quill(el, {
    theme: 'snow',
    placeholder: el.dataset.auPlaceholder ?? 'Escriba aquí…',
    modules: {
      toolbar: [
        [{ header: [2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean'],
      ],
    },
    ...options,
  });
  const toolbar = /** @type {HTMLElement | undefined} */ (
    /** @type {{ container?: HTMLElement } | undefined} */ (quill.getModule('toolbar'))?.container
  );
  if (toolbar) labelToolbar(toolbar);
  const getHTML = () => sanitize(quill.getSemanticHTML());
  const setHTML = (/** @type {string} */ html) => quill.clipboard.dangerouslyPasteHTML(sanitize(html));
  const target = el.dataset.auInput
    ? /** @type {HTMLInputElement | null} */ (document.querySelector(el.dataset.auInput))
    : null;
  if (target) {
    if (target.value) setHTML(target.value);
    quill.on('text-change', () => (target.value = getHTML()));
  }
  return { quill, getHTML, setHTML };
}
