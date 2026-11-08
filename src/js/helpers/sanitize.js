/**
 * Sanitización de HTML con DOMPurify. Úsela SIEMPRE antes de asignar `innerHTML`
 * con contenido que venga del servidor o del usuario.
 * @module helpers/sanitize
 */
import DOMPurify from 'dompurify';

/**
 * Limpia HTML (elimina scripts, manejadores `on*`, `javascript:` …).
 * @param {string} html HTML de origen no confiable.
 * @returns {string} HTML seguro.
 */
export function sanitize(html) {
  const source = String(html ?? '');
  // Filas/celdas sueltas se eliminan si se parsean fuera de una tabla: se sanitizan en su contexto.
  const tableContext = /^\s*<(tr|td|th|thead|tbody|tfoot|caption|colgroup)\b/i.exec(source);
  if (tableContext) {
    const tag = tableContext[1].toLowerCase();
    const wrapped =
      tag === 'tr'
        ? `<table><tbody>${source}</tbody></table>`
        : tag === 'td' || tag === 'th'
          ? `<table><tbody><tr>${source}</tr></tbody></table>`
          : `<table>${source}</table>`;
    const body = /** @type {HTMLElement} */ (
      DOMPurify.sanitize(wrapped, { USE_PROFILES: { html: true }, RETURN_DOM: true })
    );
    const host =
      tag === 'tr'
        ? body.querySelector('tbody')
        : tag === 'td' || tag === 'th'
          ? body.querySelector('tr')
          : body.querySelector('table');
    return host?.innerHTML ?? '';
  }
  return DOMPurify.sanitize(source, { USE_PROFILES: { html: true } });
}

/**
 * Escapa texto para insertarlo como HTML literal.
 * @param {string} text Texto.
 * @returns {string} Texto con `& < > " '` escapados.
 */
export function escapeHtml(text) {
  return String(text ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c,
  );
}

export { DOMPurify };
