/**
 * Validadores puros de datos dominicanos (sin dependencias, disponibles al instante).
 * Los esquemas de formularios (Zod) viven en `helpers/schemas.js` y se cargan bajo demanda.
 * @module helpers/validators
 */
import { onlyDigits } from './format.js';

/**
 * Valida el dígito verificador de una cédula dominicana (11 dígitos).
 * Algoritmo de Luhn con pesos 1,2 alternos sobre los primeros 10 dígitos.
 * @param {string} value Cédula con o sin guiones.
 * @returns {boolean} `true` si es válida.
 */
export function isValidCedula(value) {
  const d = onlyDigits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
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
