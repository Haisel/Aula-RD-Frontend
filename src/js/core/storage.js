/**
 * Almacenamiento de preferencias NO sensibles (fusión de la plantilla con el
 * `StorageService` de la Fase 4, SPEC-004 §15 S-11).
 *
 * - Espacio de nombres: todas las claves se guardan como `au-<clave>`
 *   (`au-theme` lo lee `public/js/theme-boot.js` antes de pintar).
 * - Rechaza claves que parezcan sensibles (`token`, `password`, `session`, `auth`…):
 *   lanza `AppError(INVALID_ARGUMENT)`. Credenciales y sesión son del backend (cookies httpOnly).
 * - Respaldo en memoria si `localStorage` no está disponible (modo privado, iframes).
 * - Nunca lanza por fallos del navegador: lee `fallback` y escribe `false`.
 * @module core/storage
 */
import { AppError } from './errors.js';

const SENSITIVE_KEY = /(token|password|contrase|secret|credential|auth|session|cookie)/i;

/**
 * @typedef {object} KeyValueBackend
 * @property {(key: string) => string | null} getItem Lee.
 * @property {(key: string, value: string) => void} setItem Escribe.
 * @property {(key: string) => void} removeItem Borra.
 * @property {(index: number) => string | null} key Clave por índice.
 * @property {number} length Cantidad de claves.
 */

/**
 * Backend en memoria con la misma interfaz que `Storage`.
 * @returns {KeyValueBackend} Backend.
 */
export function createMemoryStorage() {
  /** @type {Map<string, string>} */
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? /** @type {string} */ (map.get(k)) : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
    key: (i) => [...map.keys()][i] ?? null,
    get length() {
      return map.size;
    },
  };
}

/**
 * Elige `localStorage` si funciona; si no, memoria.
 * @returns {KeyValueBackend} Backend.
 */
function defaultBackend() {
  try {
    const ls = window.localStorage;
    ls.getItem('au-probe');
    return ls;
  } catch {
    return createMemoryStorage();
  }
}

/** Envoltura con espacio de nombres y rechazo de claves sensibles. */
export class StorageService {
  /** @type {KeyValueBackend} */
  #backend;
  /** @type {string} */
  #prefix;

  /**
   * @param {object} [options] Opciones.
   * @param {KeyValueBackend} [options.storage] Backend (por defecto `localStorage` o memoria).
   * @param {string} [options.namespace='au'] Espacio de nombres.
   */
  constructor({ storage, namespace = 'au' } = {}) {
    this.#backend = storage ?? defaultBackend();
    this.#prefix = `${namespace}-`;
  }

  /**
   * @param {string} key Clave sin prefijo.
   * @returns {string} Clave con prefijo.
   */
  #key(key) {
    if (typeof key !== 'string' || !key)
      throw new AppError('[AU] La clave de almacenamiento está vacía.', { code: 'INVALID_ARGUMENT' });
    if (SENSITIVE_KEY.test(key)) {
      throw new AppError(`[AU] La clave "${key}" parece sensible y no puede guardarse en el navegador.`, {
        code: 'INVALID_ARGUMENT',
      });
    }
    return this.#prefix + key;
  }

  /**
   * Lee un valor JSON.
   * @template T
   * @param {string} key Clave sin prefijo.
   * @param {T} fallback Valor si no existe o no se puede leer.
   * @returns {T} Valor guardado o `fallback`.
   */
  get(key, fallback) {
    const k = this.#key(key);
    try {
      const raw = this.#backend.getItem(k);
      return raw === null ? fallback : /** @type {T} */ (JSON.parse(raw));
    } catch {
      return fallback;
    }
  }

  /**
   * Guarda un valor como JSON.
   * @param {string} key Clave sin prefijo.
   * @param {unknown} value Valor serializable.
   * @returns {boolean} `true` si se guardó.
   */
  set(key, value) {
    const k = this.#key(key);
    try {
      this.#backend.setItem(k, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Borra una clave.
   * @param {string} key Clave sin prefijo.
   * @returns {void}
   */
  remove(key) {
    const k = this.#key(key);
    try {
      this.#backend.removeItem(k);
    } catch {
      /* almacenamiento bloqueado */
    }
  }

  /**
   * Borra todas las claves de este espacio de nombres (cierre de sesión, cambio de institución).
   * Nunca toca claves ajenas del mismo origen.
   * @param {object} [options] Opciones.
   * @param {string[]} [options.keep] Claves que se conservan (por defecto, preferencias de interfaz: tema y sidebar).
   * @returns {number} Cantidad de claves borradas.
   */
  clear({ keep = ['theme', 'sidebar-collapsed'] } = {}) {
    const keepSet = new Set(keep.map((k) => this.#prefix + k));
    /** @type {string[]} */
    const victims = [];
    try {
      for (let i = 0; i < this.#backend.length; i += 1) {
        const k = this.#backend.key(i);
        if (k && k.startsWith(this.#prefix) && !keepSet.has(k)) victims.push(k);
      }
      victims.forEach((k) => this.#backend.removeItem(k));
    } catch {
      /* almacenamiento bloqueado */
    }
    return victims.length;
  }
}

/** Instancia compartida (`au-*`). */
export const storage = new StorageService();

/**
 * Lee un valor JSON del almacenamiento compartido.
 * @template T
 * @param {string} key Clave sin prefijo.
 * @param {T} fallback Valor si no existe o falla.
 * @returns {T} Valor guardado o `fallback`.
 */
export function getItem(key, fallback) {
  return storage.get(key, fallback);
}

/**
 * Guarda un valor JSON en el almacenamiento compartido.
 * @param {string} key Clave sin prefijo.
 * @param {unknown} value Valor serializable.
 * @returns {boolean} `true` si se guardó.
 */
export function setItem(key, value) {
  return storage.set(key, value);
}
