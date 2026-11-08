/**
 * Registro de esquemas con carga diferida de Zod.
 * @module helpers/schema-registry
 */
import { lazy } from '../adapters/lazy.js';

/** @typedef {(z: any, fields: any) => any} SchemaFactory */

const loadSchemas = lazy('Zod', () => import('./schemas.js'));

/** @type {Map<string, SchemaFactory>} */
const custom = new Map();

/**
 * Registra (o reemplaza) un esquema. Recibe una fábrica para no cargar Zod antes de tiempo.
 * @param {string} name Nombre usado en `data-au-validate`.
 * @param {SchemaFactory} factory `(z, campos) => esquema`.
 * @returns {void}
 */
export function registerSchema(name, factory) {
  custom.set(name, factory);
}

/**
 * Obtiene un esquema por nombre (propio o incluido).
 * @param {string} name Nombre.
 * @returns {Promise<any | undefined>} Esquema Zod o `undefined`.
 */
export async function getSchema(name) {
  const mod = await loadSchemas();
  const factory = custom.get(name);
  return factory ? factory(mod.z, mod.fields) : mod.schemas.get(name);
}

/**
 * Valida datos con un esquema (por nombre o fábrica).
 * @param {string | SchemaFactory} schema Nombre registrado o fábrica `(z, campos) => esquema`.
 * @param {Record<string, unknown>} data Datos.
 * @returns {Promise<{ success: boolean, data: any, errors: Record<string, string> }>} Resultado.
 */
export async function validate(schema, data) {
  const mod = await loadSchemas();
  const s = typeof schema === 'string' ? await getSchema(schema) : schema(mod.z, mod.fields);
  if (!s) throw new Error(`[AU] Esquema "${String(schema)}" no registrado.`);
  return mod.validate(s, data);
}

/**
 * Devuelve Zod (para usos avanzados).
 * @returns {Promise<any>} El objeto `z`.
 */
export async function zod() {
  return (await loadSchemas()).z;
}

/**
 * Valida con un esquema Zod ya construido.
 * @param {any} schema Esquema Zod.
 * @param {Record<string, unknown>} data Datos.
 * @returns {Promise<{ success: boolean, data: any, errors: Record<string, string> }>} Resultado.
 */
export async function validateWith(schema, data) {
  return (await loadSchemas()).validate(schema, data);
}
