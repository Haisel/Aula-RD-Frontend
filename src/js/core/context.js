/**
 * Contexto visible de la página: usuario, institución, roles y permisos.
 *
 * Desde la 1.1 no guarda estado propio: lee la {@link module:services/session-service}
 * y el {@link module:services/institution-context} del núcleo, de modo que hay una
 * sola fuente de verdad. Dos formas de alimentarlo, ambas con datos del backend:
 *
 * 1. El servidor imprime el contexto en la página como DATOS (no código):
 *    ```html
 *    <script type="application/json" id="au-context">
 *      {"user":{"id":"u-1","name":"Ana Martínez","role":"Directora"},
 *       "institution":{"id":"inst-7","name":"Colegio San Rafael","plan":"Profesional"},
 *       "roles":["institution-admin"],"permissions":["estudiantes.ver","cobros.registrar"]}
 *    </script>
 *    ```
 * 2. Se conectan puertos con `AU.configurePorts({ session: { resolve }, institution: { resolveCurrent } })`
 *    o se llama `AU.setContext(datos)` tras pedirlos por API.
 *
 * En el HTML:
 * - `[data-au-bind="user.name"]` muestra un valor (texto plano, nunca HTML).
 * - `[data-au-can="cobros.registrar"]` se oculta si falta el permiso.
 *
 * ⚠ Ocultar es SOLO presentación (constitución 3.2). El backend rechaza lo no autorizado.
 * @module core/context
 */
import { emit, EVENTS } from './events.js';
import { session, institution, access } from '../kernel.js';

/**
 * @typedef {object} AppContext
 * @property {({ name?: string, displayName?: string, role?: string, email?: string, avatar?: string } & Record<string, unknown>) | null} [user] Usuario actual.
 * @property {({ id?: string, name?: string, displayName?: string, plan?: string } & Record<string, unknown>) | null} [institution] Institución activa.
 * @property {string[]} [roles] Roles (super-admin, institution-admin, teacher, student-guardian).
 * @property {string[]} [permissions] Permisos opacos definidos por el backend.
 */

let batching = false;

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
 * Contexto actual (copia defensiva), derivado de sesión e institución.
 * @returns {AppContext} Contexto.
 */
export function getContext() {
  const user = session.user();
  return structuredClone({
    user,
    institution: institution.current(),
    roles: user?.roles ?? [],
    permissions: user?.permissions ?? [],
  });
}

/**
 * Aplica `data-au-bind` y `data-au-can` dentro de `root`.
 * @param {ParentNode} [root=document] Contenedor.
 * @returns {void}
 */
export function applyContext(root = document) {
  const ctx = getContext();
  root.querySelectorAll('[data-au-bind]').forEach((el) => {
    const v = getPath(ctx, /** @type {HTMLElement} */ (el).dataset.auBind ?? '');
    if (v !== undefined && v !== null) el.textContent = String(v);
  });
  access.applyTo(root);
}

/** Vuelve a pintar y avisa (`au:context:changed`). */
function refresh() {
  if (batching) return;
  access.syncFromUser(session.user());
  applyContext(document);
  emit(EVENTS.CONTEXT_CHANGED, { context: getContext() });
}

session.subscribe(refresh);
institution.subscribe(refresh);

/**
 * Reemplaza el contexto con datos que entregó el backend y actualiza la página.
 * Emite `au:context:changed` una sola vez.
 * @param {AppContext} ctx Contexto.
 * @returns {void}
 */
export function setContext(ctx) {
  batching = true;
  try {
    session.apply({ user: ctx?.user ?? null, roles: ctx?.roles, permissions: ctx?.permissions });
    institution.apply(ctx?.institution ?? null);
  } finally {
    batching = false;
  }
  refresh();
}

/**
 * ¿Tiene el permiso? (solo presentación).
 * @param {string} permission Permiso.
 * @returns {boolean} Resultado.
 */
export function can(permission) {
  return access.can(permission);
}

/**
 * ¿Tiene el rol?
 * @param {string} role Rol.
 * @returns {boolean} Resultado.
 */
export function hasRole(role) {
  return access.hasRole(role);
}

/**
 * Lee `<script type="application/json" id="au-context">` si existe.
 * @returns {boolean} `true` si encontró y aplicó un contexto válido.
 */
export function readContextFromPage() {
  const node = document.getElementById('au-context');
  if (!node?.textContent) return false;
  try {
    setContext(JSON.parse(node.textContent));
    return true;
  } catch {
    console.error('[AU] #au-context no contiene JSON válido.');
    return false;
  }
}
