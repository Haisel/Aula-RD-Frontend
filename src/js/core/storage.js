/**
 * Acceso seguro a `localStorage` (no lanza en modo privado ni en iframes restringidos).
 * Todas las claves llevan el prefijo `au-`.
 * @module core/storage
 */

const PREFIX = 'au-';

/**
 * Lee un valor JSON.
 * @template T
 * @param {string} key Clave sin prefijo.
 * @param {T} fallback Valor si no existe o falla.
 * @returns {T} Valor guardado o `fallback`.
 */
export function getItem(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : /** @type {T} */ (JSON.parse(raw));
  } catch {
    return fallback;
  }
}

/**
 * Guarda un valor como JSON. Falla en silencio si el almacenamiento no está disponible.
 * @param {string} key Clave sin prefijo.
 * @param {unknown} value Valor serializable.
 * @returns {boolean} `true` si se guardó.
 */
export function setItem(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
