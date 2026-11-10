/**
 * Lógica pura de los formularios avanzados de la galería (spec 012, T-21 · RF-05).
 * @module demo/formularios
 */

/** Secciones por grado (listas dependientes). */
export const SECCIONES = /** @type {Record<string, string[]>} */ ({
  '1.º Primaria': ['A', 'B'],
  '2.º Primaria': ['A', 'B', 'C'],
  '3.º Primaria': ['A'],
  '1.º Secundaria': ['A', 'B'],
});

/**
 * Secciones disponibles de un grado.
 * @param {string} grado Grado elegido.
 * @returns {string[]} Secciones (vacío si no hay grado válido).
 */
export function seccionesDe(grado) {
  return SECCIONES[grado] ?? [];
}

/**
 * Valida los campos de un paso del asistente.
 * @param {number} paso Número de paso (1, 2 o 3).
 * @param {Record<string, string>} datos Valores del formulario.
 * @returns {Record<string, string>} Mensaje de error por campo (vacío si el paso es válido).
 */
export function validarPaso(paso, datos) {
  /** @type {Record<string, string>} */
  const errores = {};
  const vacio = (/** @type {string} */ k) => !String(datos[k] ?? '').trim();
  if (paso === 1) {
    if (vacio('nombre')) errores.nombre = 'Escriba el nombre del estudiante.';
    if (vacio('grado')) errores.grado = 'Seleccione el grado.';
    else if (vacio('seccion')) errores.seccion = 'Seleccione la sección.';
    else if (!seccionesDe(datos.grado).includes(datos.seccion)) {
      errores.seccion = 'Esa sección no existe en el grado elegido.';
    }
  }
  if (paso === 2) {
    if (vacio('tutor1')) errores.tutor1 = 'Escriba el nombre del primer tutor.';
    if (vacio('periodo')) errores.periodo = 'Elija el rango de fechas del período.';
  }
  return errores;
}

/**
 * Valida todos los pasos y devuelve el primero con errores.
 * @param {Record<string, string>} datos Valores del formulario.
 * @param {number} [pasos] Cantidad de pasos con validación.
 * @returns {{ paso: number, errores: Record<string, string> } | null} Primer paso inválido, o `null`.
 */
export function primerPasoInvalido(datos, pasos = 2) {
  for (let p = 1; p <= pasos; p += 1) {
    const errores = validarPaso(p, datos);
    if (Object.keys(errores).length) return { paso: p, errores };
  }
  return null;
}

/**
 * Simula la respuesta de un servidor que rechaza campos concretos.
 * @param {Record<string, string>} datos Valores enviados.
 * @returns {Record<string, string>} Errores del servidor simulado por campo (vacío si lo acepta).
 */
export function respuestaServidor(datos) {
  /** @type {Record<string, string>} */
  const errores = {};
  if (/^\s*duplicado\s*$/i.test(datos.nombre ?? '')) {
    errores.nombre = 'Ya existe un estudiante con ese nombre (respuesta simulada del servidor).';
  }
  return errores;
}
