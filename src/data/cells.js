// @ts-check
/**
 * Celdas de las tablas de los arquetipos (spec 013). Funciones puras, usadas al generar las
 * páginas: todo valor se escapa (los datos vienen de archivos JSON y nunca se confían) y los
 * formatos son los de la plantilla (`RD$ 12,500.00`, `08/11/2026`).
 * @module data/cells
 */

/**
 * @typedef {object} Column
 * @property {string} key Campo de la fila que se muestra.
 * @property {string} [label] Encabezado de la columna.
 * @property {'text' | 'entity' | 'status' | 'money' | 'date' | 'number' | 'plan'} [kind] Tipo de celda (por defecto, texto).
 * @property {string} [meta] Solo en `entity`: campo de la línea secundaria.
 */

/** Texto que se muestra cuando falta un valor. */
const EMPTY = '—';

/**
 * Escapa el HTML de un valor.
 * @param {unknown} value Valor.
 * @returns {string} Texto seguro para insertar en HTML.
 */
const esc = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

/**
 * Da formato de moneda dominicana.
 * @param {number} amount Monto.
 * @returns {string} `RD$ 12,500.00`, o un guion si no es un número.
 */
export function formatMoney(amount) {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return EMPTY;
  return `RD$ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Convierte una fecha ISO a `DD/MM/AAAA`.
 * @param {string} iso Fecha `AAAA-MM-DD`.
 * @returns {string} Fecha formateada, o un guion si no es válida.
 */
export function formatIsoDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso ?? ''));
  return m ? `${m[3]}/${m[2]}/${m[1]}` : EMPTY;
}

/** Tono de la píldora según el estado. */
const TONES = {
  success: ['Activo', 'Pagado', 'Aprobado', 'Aprobada', 'Resuelto', 'Completado', 'Al día', 'Vigente', 'Publicado'],
  warning: ['Pendiente', 'Por vencer', 'En revisión', 'Borrador', 'Parcial'],
  danger: ['Vencido', 'Retirado', 'Suspendida', 'Suspendido', 'Rechazado', 'Cancelado', 'Urgente'],
  info: ['Licencia', 'Abierto', 'Abierta', 'En proceso', 'Nuevo', 'Programado'],
  brand: ['Período de prueba', 'Prueba'],
};

/**
 * Tono de la píldora de un estado.
 * @param {string} status Estado.
 * @returns {'success' | 'warning' | 'danger' | 'info' | 'brand' | 'neutral'} Tono.
 */
export function statusTone(status) {
  for (const [tone, list] of Object.entries(TONES)) {
    if (list.includes(status)) return /** @type {'success' | 'warning' | 'danger' | 'info' | 'brand'} */ (tone);
  }
  return 'neutral';
}

/**
 * HTML de la celda de una fila para una columna.
 * @param {Column} column Columna.
 * @param {Record<string, unknown>} row Fila.
 * @returns {string} HTML ya escapado.
 */
export function cell(column, row) {
  const value = row[column.key];
  if (value === undefined || value === null || value === '') return EMPTY;
  switch (column.kind) {
    case 'entity': {
      const meta = column.meta ? row[column.meta] : undefined;
      return meta ? `${esc(value)}<span class="au-cell-meta">${esc(meta)}</span>` : esc(value);
    }
    case 'status':
      return `<span class="au-status au-status-${statusTone(String(value))}">${esc(value)}</span>`;
    case 'money':
      return formatMoney(/** @type {number} */ (value));
    case 'date':
      return formatIsoDate(/** @type {string} */ (value));
    case 'number':
      return typeof value === 'number' ? value.toLocaleString('en-US') : esc(value);
    case 'plan': {
      const text = String(value);
      const extra = text === 'Profesional' ? ' au-plan-pro' : text === 'Premium' ? ' au-plan-premium' : '';
      return `<span class="au-plan${extra}">${esc(text)}</span>`;
    }
    default:
      return esc(value);
  }
}
