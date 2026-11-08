/**
 * Formato de datos para República Dominicana (locale `es-DO`).
 *
 * Convenciones del sistema de diseño:
 * - Moneda: `RD$ 12,500.00` (coma de miles, punto decimal, espacio tras el símbolo).
 * - Fechas: `08/11/2026`; fecha y hora: `08/11/2026 2:30 p. m.`
 * - Cédula: `001-1234567-8` · RNC: `1-01-12345-6` · Teléfono: `(809) 555-1234`
 * @module helpers/format
 */
import dayjs from 'dayjs';
import 'dayjs/locale/es-do';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.locale('es-do');

const LOCALE = 'es-DO';
const nf2 = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nfCompact = new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 });

/**
 * Formatea un monto en pesos dominicanos.
 * @param {number} value Monto.
 * @param {object} [options] Opciones.
 * @param {boolean} [options.symbol=true] Incluir `RD$ `.
 * @returns {string} Ej.: `RD$ 12,500.00`. Devuelve `—` si no es un número.
 * @example formatCurrency(12500) // "RD$ 12,500.00"
 */
export function formatCurrency(value, { symbol = true } = {}) {
  if (!Number.isFinite(value)) return '—';
  const sign = value < 0 ? '-' : '';
  const body = nf2.format(Math.abs(value));
  return symbol ? `${sign}RD$ ${body}` : `${sign}${body}`;
}

/**
 * Monto abreviado para KPIs (el valor completo va en `title`).
 * @param {number} value Monto.
 * @returns {string} Ej.: `RD$ 386.5K`, `RD$ 1.3M`.
 * @example formatCompactCurrency(386450) // "RD$ 386.5K"
 */
export function formatCompactCurrency(value) {
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) < 1000) return formatCurrency(value);
  /** @type {Array<[number, string]>} */
  const units = [
    [1e9, 'B'],
    [1e6, 'M'],
    [1e3, 'K'],
  ];
  const [div, suffix] = /** @type {[number, string]} */ (units.find(([d]) => Math.abs(value) >= d));
  const n = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 }).format(value / div);
  return `RD$ ${n}${suffix}`;
}

/**
 * Número con separador de miles.
 * @param {number} value Número.
 * @param {number} [decimals=0] Decimales fijos.
 * @returns {string} Ej.: `1,248`.
 */
export function formatNumber(value, decimals = 0) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Número compacto (sin moneda).
 * @param {number} value Número.
 * @returns {string} Ej.: `1.2 k`.
 */
export function formatCompact(value) {
  return Number.isFinite(value) ? nfCompact.format(value) : '—';
}

/**
 * Porcentaje. Acepta 0–100 (por defecto) o fracción 0–1.
 * @param {number} value Valor.
 * @param {object} [options] Opciones.
 * @param {number} [options.decimals=1] Decimales.
 * @param {boolean} [options.fraction=false] `true` si el valor viene como 0–1.
 * @returns {string} Ej.: `94.6%`.
 */
export function formatPercent(value, { decimals = 1, fraction = false } = {}) {
  if (!Number.isFinite(value)) return '—';
  const v = fraction ? value * 100 : value;
  return `${new Intl.NumberFormat(LOCALE, { maximumFractionDigits: decimals }).format(v)}%`;
}

/**
 * Fecha `DD/MM/AAAA`. Acepta Date, ISO 8601 o `DD/MM/AAAA`.
 * @param {Date | string | number} value Fecha.
 * @param {string} [pattern='DD/MM/YYYY'] Patrón de dayjs.
 * @returns {string} Fecha formateada o `—` si es inválida.
 */
export function formatDate(value, pattern = 'DD/MM/YYYY') {
  const d = parseDate(value);
  return d.isValid() ? d.format(pattern) : '—';
}

/**
 * Fecha y hora en formato dominicano (`08/11/2026 2:30 p. m.`).
 * @param {Date | string | number} value Fecha.
 * @returns {string} Fecha y hora.
 */
export function formatDateTime(value) {
  const d = parseDate(value);
  if (!d.isValid()) return '—';
  const ampm = d.hour() < 12 ? 'a. m.' : 'p. m.';
  return `${d.format('DD/MM/YYYY h:mm')} ${ampm}`;
}

/**
 * Tiempo relativo en español (`hace 5 minutos`, `en 3 días`).
 * @param {Date | string | number} value Fecha.
 * @param {Date | string | number} [now] Referencia (por defecto, ahora).
 * @returns {string} Texto relativo.
 */
export function formatRelative(value, now) {
  const d = parseDate(value);
  if (!d.isValid()) return '—';
  return now === undefined ? d.fromNow() : d.from(parseDate(now));
}

/**
 * Convierte la entrada en un objeto dayjs.
 * @param {Date | string | number} value Fecha.
 * @returns {import('dayjs').Dayjs} Fecha dayjs (verifique `.isValid()`).
 */
export function parseDate(value) {
  if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value))
    return dayjs(value, 'DD/MM/YYYY', true);
  return dayjs(value);
}

/**
 * Deja solo dígitos.
 * @param {string} value Texto.
 * @returns {string} Solo dígitos.
 */
export function onlyDigits(value) {
  return String(value ?? '').replace(/\D/g, '');
}

/**
 * Cédula `000-0000000-0`.
 * @param {string} value Cédula con o sin guiones.
 * @returns {string} Cédula formateada (o el texto original si no tiene 11 dígitos).
 */
export function formatCedula(value) {
  const d = onlyDigits(value);
  return d.length === 11 ? `${d.slice(0, 3)}-${d.slice(3, 10)}-${d.slice(10)}` : String(value ?? '');
}

/**
 * RNC `0-00-00000-0`.
 * @param {string} value RNC con o sin guiones.
 * @returns {string} RNC formateado (o el original si no tiene 9 dígitos).
 */
export function formatRnc(value) {
  const d = onlyDigits(value);
  return d.length === 9
    ? `${d.slice(0, 1)}-${d.slice(1, 3)}-${d.slice(3, 8)}-${d.slice(8)}`
    : String(value ?? '');
}

/**
 * Teléfono `(809) 555-1234`. Acepta prefijo `1` o `+1`.
 * @param {string} value Teléfono.
 * @returns {string} Teléfono formateado (o el original).
 */
export function formatPhone(value) {
  let d = onlyDigits(value);
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : String(value ?? '');
}

/**
 * Iniciales para avatares (`Ana Martínez` → `AM`).
 * @param {string} name Nombre completo.
 * @returns {string} Hasta 2 letras en mayúscula.
 */
export function initials(name) {
  return String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toLocaleUpperCase(LOCALE))
    .join('');
}

export { dayjs };

/**
 * Abrevia una cantidad grande (`1234567` → `1.2 M`). Acepta texto numérico.
 * @param {number | string | null | undefined} value Cantidad.
 * @param {object} [options] Opciones.
 * @param {number} [options.maximumFractionDigits=1] Decimales máximos.
 * @param {'compact' | 'standard'} [options.notation='compact'] Notación.
 * @returns {string} Texto, o `''` si no es un número.
 */
export function humanize(value, { maximumFractionDigits = 1, notation = 'compact' } = {}) {
  const n = typeof value === 'string' ? Number(value.replace(/,/g, '')) : Number(value);
  if (value === null || value === undefined || value === '' || !Number.isFinite(n)) return '';
  return new Intl.NumberFormat('es-DO', { notation, maximumFractionDigits }).format(n);
}
