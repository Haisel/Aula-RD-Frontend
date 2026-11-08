/**
 * Contexto de sesión e institución entregado por el backend (cualquier backend).
 *
 * El servidor lo imprime en la página como DATOS (no código):
 * ```html
 * <script type="application/json" id="au-context">
 *   {"user":{"name":"Ana Martínez","role":"Directora"},"institution":{"name":"Colegio San Rafael","plan":"Profesional"},
 *    "roles":["institution-admin"],"permissions":["estudiantes.ver","cobros.registrar"]}
 * </script>
 * ```
 * o lo carga por API y llama `AU.setContext(datos)`.
 *
 * - `[data-au-bind="user.name"]` muestra un valor del contexto (texto plano).
 * - `[data-au-can="cobros.registrar"]` se oculta si falta el permiso.
 *
 * ⚠ Ocultar elementos es SOLO presentación (constitución 3.2). El backend debe
 * rechazar cualquier operación no autorizada.
 * @module core/context
 */
import { emit } from './events.js';

/**
 * @typedef {object} AppContext
 * @property {{ name?: string, role?: string, email?: string, avatar?: string } & Record<string, unknown>} [user] Usuario actual.
 * @property {{ id?: string, name?: string, plan?: string } & Record<string, unknown>} [institution] Institución activa.
 * @property {string[]} [roles] Roles (super-admin, institution-admin, teacher, student-guardian).
 * @property {string[]} [permissions] Permisos (cadena libre, la define el backend).
 */

/** @type {AppContext} */
let current = {};

/**
 * Lee un valor anidado (`user.name`).
 * @param {object} obj Objeto.
 * @param {string} path Ruta con puntos.
 * @returns {unknown} Valor o `undefined`.
 */
export function getPath(obj, path) {
  return path
    .split('.')
    .reduce(
      (acc, k) => (acc && typeof acc === 'object' ? /** @type {any} */ (acc)[k] : undefined),
      /** @type {unknown} */ (obj),
    );
}

/**
 * Contexto actual (copia).
 * @returns {AppContext} Contexto.
 */
export function getContext() {
  return structuredClone(current);
}

/**
 * Reemplaza el contexto y actualiza la página. Emite `au:context-change`.
 * @param {AppContext} ctx Contexto.
 * @returns {void}
 */
export function setContext(ctx) {
  current = { roles: [], permissions: [], ...ctx };
  applyContext(document);
  emit('au:context-change', { context: getContext() });
}

/**
 * ¿Tiene el permiso? (solo presentación).
 * @param {string} permission Permiso.
 * @returns {boolean} Resultado.
 */
export function can(permission) {
  return Boolean(current.permissions?.includes(permission) || current.roles?.includes('super-admin'));
}

/**
 * ¿Tiene el rol?
 * @param {string} role Rol.
 * @returns {boolean} Resultado.
 */
export function hasRole(role) {
  return Boolean(current.roles?.includes(role));
}

/**
 * Aplica `data-au-bind` y `data-au-can` dentro de `root`.
 * @param {ParentNode} root Contenedor.
 * @returns {void}
 */
export function applyContext(root) {
  if (!Object.keys(current).length) return;
  root.querySelectorAll('[data-au-bind]').forEach((el) => {
    const v = getPath(current, /** @type {HTMLElement} */ (el).dataset.auBind ?? '');
    if (v !== undefined && v !== null) el.textContent = String(v);
  });
  root.querySelectorAll('[data-au-can]').forEach((el) => {
    /** @type {HTMLElement} */ (el).hidden = !can(/** @type {HTMLElement} */ (el).dataset.auCan ?? '');
  });
}

/**
 * Lee `<script type="application/json" id="au-context">` si existe.
 * @returns {void}
 */
export function readContextFromPage() {
  const node = document.getElementById('au-context');
  if (!node?.textContent) return;
  try {
    setContext(JSON.parse(node.textContent));
  } catch {
    console.error('[AU] #au-context no contiene JSON válido.');
  }
}
