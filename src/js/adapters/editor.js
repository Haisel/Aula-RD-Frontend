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
