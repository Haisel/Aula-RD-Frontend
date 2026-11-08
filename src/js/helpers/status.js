/**
 * Mapa fijo de estados de negocio → variante visual (`.au-status-*`).
 * Fuente: README del sistema de diseño, componente StatusBadge.
 * @module helpers/status
 */

/** @type {Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand'>} */
const MAP = {
  pagado: 'success',
  pagada: 'success',
  activo: 'success',
  activa: 'success',
  aprobado: 'success',
  aprobada: 'success',
  presente: 'success',
  pendiente: 'warning',
  'por vencer': 'warning',
  tardanza: 'warning',
  parcial: 'warning',
  vencido: 'danger',
  vencida: 'danger',
  rechazado: 'danger',
  rechazada: 'danger',
  suspendido: 'danger',
  suspendida: 'danger',
  ausente: 'danger',
  'en revisión': 'info',
  borrador: 'info',
  becado: 'info',
  becada: 'info',
  inactivo: 'neutral',
  inactiva: 'neutral',
  archivado: 'neutral',
  archivada: 'neutral',
  retirado: 'neutral',
  retirada: 'neutral',
  'en prueba': 'brand',
  'período de prueba': 'brand',
  nuevo: 'brand',
  nueva: 'brand',
};

/**
 * Variante para un estado. Compara sin mayúsculas y por prefijo (`Becada 50%` → `info`).
 * @param {string} label Texto del estado.
 * @returns {'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand'} Variante (por defecto `neutral`).
 */
export function statusVariant(label) {
  const key = String(label ?? '')
    .trim()
    .toLocaleLowerCase('es-DO');
  if (MAP[key]) return MAP[key];
  const hit = Object.keys(MAP).find((k) => key.startsWith(k));
  return hit ? MAP[hit] : 'neutral';
}
