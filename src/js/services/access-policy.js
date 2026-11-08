/**
 * Política de acceso VISUAL (portada de la Fase 4, SPEC-004 §7.6, §15 S-1).
 *
 * Oculta elementos `[data-au-can="permiso"]` cuando el usuario no tiene ese
 * permiso. Es solo presentación: **el backend valida cada solicitud** y debe
 * rechazar lo no autorizado aunque el botón esté visible.
 *
 * Diferencia con la plantilla 1.0: ya no hay comodín para `super-admin`.
 * El backend envía la lista completa de permisos de cada rol.
 * @module services/access-policy
 */

/** Comprobaciones de permisos opacos para la interfaz. */
export class AccessPolicy {
  /** @type {Set<string>} */
  #permissions = new Set();
  /** @type {Set<string>} */
  #roles = new Set();

  /**
   * @param {{ permissions?: string[], roles?: string[] } | null} [user] Usuario inicial.
   */
  constructor(user = null) {
    this.syncFromUser(user);
  }

  /**
   * Reemplaza permisos y roles con los del usuario vigente.
   * @param {{ permissions?: string[], roles?: string[] } | null} [user] Usuario (o `null` al cerrar sesión).
   * @returns {void}
   */
  syncFromUser(user) {
    this.#permissions = new Set((user?.permissions ?? []).map(String));
    this.#roles = new Set((user?.roles ?? []).map(String));
  }

  /**
   * ¿Tiene el permiso? Solo para visibilidad, nunca para seguridad.
   * @param {string} permission Permiso opaco.
   * @returns {boolean} Resultado.
   */
  can(permission) {
    return typeof permission === 'string' && permission !== '' && this.#permissions.has(permission);
  }

  /**
   * ¿Tiene el rol?
   * @param {string} role Rol.
   * @returns {boolean} Resultado.
   */
  hasRole(role) {
    return this.#roles.has(String(role));
  }

  /**
   * Oculta (`hidden` + `aria-hidden`) los `[data-au-can]` sin permiso dentro de `root`.
   * @param {ParentNode} [root=document] Contenedor.
   * @returns {void}
   */
  applyTo(root = document) {
    root.querySelectorAll('[data-au-can]').forEach((node) => {
      const el = /** @type {HTMLElement} */ (node);
      const key = el.dataset.auCan?.trim();
      if (!key) return;
      el.hidden = !this.can(key);
      if (el.hidden) el.setAttribute('aria-hidden', 'true');
      else el.removeAttribute('aria-hidden');
    });
  }
}
