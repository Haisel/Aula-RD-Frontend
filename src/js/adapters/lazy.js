/**
 * Carga diferida de librerías (decisión 003). Cada adaptador envuelve su `import()`
 * con {@link lazy}: la librería se descarga la primera vez que se usa y Vite la
 * separa en su propio archivo (`dist/js/chunks/*.js`). Si la descarga falla, la
 * próxima llamada lo reintenta.
 * @module adapters/lazy
 */
import { AppError } from '../core/errors.js';

/**
 * Memoriza una función asíncrona de carga.
 * @template T
 * @param {string} name Nombre de la librería (para mensajes).
 * @param {() => Promise<T>} loader Función que hace el `import()`.
 * @returns {() => Promise<T>} Cargador memoizado.
 */
export function lazy(name, loader) {
  /** @type {Promise<T> | undefined} */
  let promise;
  return () => {
    promise ??= loader().catch((cause) => {
      promise = undefined;
      throw new AppError(`[AU] No se pudo cargar ${name}. Verifique la conexión.`, {
        code: 'LIB_LOAD_FAILED',
        cause,
      });
    });
    return promise;
  };
}
