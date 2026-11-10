/**
 * Validación pura de archivos para la demostración de carga (spec 012, T-24 · RF-15).
 * Nada se sube: solo se revisan nombre, tipo y tamaño.
 * @module demo/archivos
 */

/** Límites de la demostración. */
export const LIMITES = {
  maxBytes: 2 * 1024 * 1024,
  maxArchivos: 5,
  tipos: ['image/png', 'image/jpeg', 'application/pdf'],
};

/**
 * Tamaño legible en español.
 * @param {number} bytes Tamaño en bytes.
 * @returns {string} Por ejemplo `1.5 KB`.
 */
export function tamano(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * @typedef {{ name: string, type: string, size: number }} Archivo
 */

/**
 * Revisa una lista de archivos contra los límites.
 * @param {Archivo[]} archivos Archivos elegidos.
 * @param {number} [yaCargados] Cantidad ya aceptada antes.
 * @returns {{ aceptados: Archivo[], rechazados: { name: string, motivo: string }[] }} Resultado.
 */
export function revisarArchivos(archivos, yaCargados = 0) {
  /** @type {Archivo[]} */
  const aceptados = [];
  /** @type {{ name: string, motivo: string }[]} */
  const rechazados = [];
  for (const f of archivos) {
    if (!LIMITES.tipos.includes(f.type)) {
      rechazados.push({ name: f.name, motivo: 'Tipo no permitido: use PNG, JPG o PDF.' });
    } else if (f.size > LIMITES.maxBytes) {
      rechazados.push({ name: f.name, motivo: `Pesa ${tamano(f.size)}; el máximo es ${tamano(LIMITES.maxBytes)}.` });
    } else if (yaCargados + aceptados.length >= LIMITES.maxArchivos) {
      rechazados.push({ name: f.name, motivo: `Solo se admiten ${LIMITES.maxArchivos} archivos.` });
    } else {
      aceptados.push(f);
    }
  }
  return { aceptados, rechazados };
}
