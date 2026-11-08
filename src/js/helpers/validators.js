/**
 * Validadores puros de datos dominicanos (sin dependencias, disponibles al instante).
 * Los esquemas de formularios (Zod) viven en `helpers/schemas.js` y se cargan bajo demanda.
 * @module helpers/validators
 */
import { onlyDigits } from './format.js';

/**
 * Valida el dígito verificador de una cédula dominicana (11 dígitos).
 * Algoritmo de Luhn con pesos 1,2 alternos sobre los primeros 10 dígitos.
 * Debe llegar como texto: como número se pierden los ceros iniciales.
 * @param {string} value Cédula con o sin guiones.
 * @returns {boolean} `true` si es válida.
 */
export function isValidCedula(value) {
  const d = onlyDigits(value);
  // Municipio 000 no existe (y hacía válida la cédula de ceros); tampoco dígitos repetidos.
  if (d.length !== 11 || d.startsWith('000') || /^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 10; i += 1) {
    let p = Number(d[i]) * (i % 2 === 0 ? 1 : 2);
    if (p > 9) p -= 9;
    sum += p;
  }
  return (10 - (sum % 10)) % 10 === Number(d[10]);
}

/**
 * Valida el dígito verificador de un RNC (9 dígitos), pesos 7,9,8,6,5,4,3,2 módulo 11.
 * @param {string} value RNC con o sin guiones.
 * @returns {boolean} `true` si es válido.
 */
export function isValidRnc(value) {
  const d = onlyDigits(value);
  if (d.length !== 9) return false;
  const weights = [7, 9, 8, 6, 5, 4, 3, 2];
  const sum = weights.reduce((acc, w, i) => acc + w * Number(d[i]), 0);
  const r = sum % 11;
  const check = r === 0 ? 2 : r === 1 ? 1 : 11 - r;
  return check === Number(d[8]);
}

/**
 * Teléfono dominicano: códigos de área 809, 829 o 849 + 7 dígitos (acepta prefijo 1).
 * @param {string} value Teléfono.
 * @returns {boolean} `true` si es válido.
 */
export function isValidPhoneDO(value) {
  let d = onlyDigits(value);
  if (d.length === 11 && d.startsWith('1')) d = d.slice(1);
  return /^(809|829|849)\d{7}$/.test(d);
}

/**
 * Correo con forma válida (nombre@dominio.tld).
 * @param {string} value Correo.
 * @returns {boolean} `true` si es válido.
 */
export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value ?? '').trim());
}

/**
 * `true` para `null`, `undefined` o texto en blanco.
 * @param {unknown} value Valor.
 * @returns {boolean} Resultado.
 */
export function isNullOrEmpty(value) {
  return value === null || value === undefined || (typeof value === 'string' && value.trim() === '');
}

/**
 * Como {@link isNullOrEmpty} y además `true` para arreglos, `Map`, `Set` y objetos planos vacíos.
 * Números (incluido 0), booleanos y fechas nunca están vacíos.
 * @param {unknown} value Valor.
 * @returns {boolean} Resultado.
 */
export function isEmpty(value) {
  if (isNullOrEmpty(value)) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (value instanceof Map || value instanceof Set) return value.size === 0;
  if (typeof value === 'object') {
    const proto = Object.getPrototypeOf(value);
    return (
      (proto === Object.prototype || proto === null) &&
      Object.keys(/** @type {object} */ (value)).length === 0
    );
  }
  return false;
}

/**
 * Placa de vehículo dominicana: 1–2 letras + 5–6 dígitos (`A123456`, `AB12345`).
 * Útil para el registro de transporte escolar. Ignora espacios y guiones.
 * @param {unknown} value Placa.
 * @returns {boolean} Resultado.
 */
export function isValidPlaca(value) {
  return typeof value === 'string' && /^[A-Z]{1,2}\d{5,6}$/.test(value.replace(/[\s-]/g, '').toUpperCase());
}

/**
 * Monto con hasta 2 decimales, con o sin separador de miles (`12,500.00`, `12500.5`).
 * Acepta también `number` finito con máximo 2 decimales.
 * @param {unknown} value Monto.
 * @returns {boolean} Resultado.
 */
export function isValidCurrency(value) {
  if (typeof value === 'number') return Number.isFinite(value) && Math.round(value * 100) / 100 === value;
  return typeof value === 'string' && /^-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?$/.test(value.trim());
}
