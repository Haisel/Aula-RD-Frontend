/**
 * Archivos: descargar, leer y copiar al portapapeles.
 * @module helpers/files
 */

/**
 * Descarga un Blob con un nombre.
 * @param {Blob} blob Contenido.
 * @param {string} fileName Nombre del archivo.
 * @returns {void}
 */
export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Lee un archivo como texto.
 * @param {File | Blob} file Archivo.
 * @returns {Promise<string>} Contenido.
 */
export function readText(file) {
  return file.text();
}

/**
 * Lee un archivo JSON.
 * @param {File | Blob} file Archivo.
 * @returns {Promise<unknown>} Objeto parseado.
 */
export async function readJson(file) {
  return JSON.parse(await file.text());
}

/**
 * Copia texto al portapapeles.
 * @param {string} text Texto.
 * @returns {Promise<boolean>} `true` si se copió.
 */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Agrupa elementos por una clave.
 * @template T
 * @param {T[]} list Lista.
 * @param {(item: T) => string} keyFn Función que devuelve la clave.
 * @returns {Record<string, T[]>} Grupos.
 */
export function groupBy(list, keyFn) {
  /** @type {Record<string, T[]>} */
  const out = {};
  for (const item of list) (out[keyFn(item)] ??= []).push(item);
  return out;
}
