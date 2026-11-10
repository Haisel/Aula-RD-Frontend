/**
 * Demostración de perfiles por rol (spec 012, T-23 · RF-08).
 *
 * Lee `data/perfiles-rol.json` con `AU.api.get`. Al elegir un rol, `AU.setContext` cambia usuario,
 * institución, roles y permisos de ejemplo; los elementos con `data-au-bind` se actualizan y los que
 * tienen `data-au-can` se muestran u ocultan. Los datos, las pestañas y las acciones son propios de
 * cada rol. Ocultar no es proteger: el aviso de seguridad permanece siempre. Nada se guarda (RN-02).
 * @module demo/perfiles-page
 */

/** Nombre e ícono de cada permiso de ejemplo que se muestra como botón. */
const ACCIONES = /** @type {Record<string, [string, string]>} */ ({
  'instituciones.crear': ['Crear institución', 'building-add'],
  'planes.editar': ['Editar planes', 'tags'],
  'cobros.registrar': ['Registrar cobro', 'cash-coin'],
  'usuarios.invitar': ['Invitar usuarios', 'person-plus'],
  'notas.registrar': ['Registrar calificaciones', 'journal-check'],
  'asistencia.tomar': ['Tomar asistencia', 'clipboard-check'],
  'boletin.ver': ['Ver boletín', 'file-earmark-text'],
  'tareas.entregar': ['Entregar tarea', 'upload'],
  'cuotas.pagar': ['Pagar cuota', 'credit-card'],
  'ausencias.justificar': ['Justificar ausencia', 'envelope-paper'],
});

/**
 * @typedef {object} Rol
 * @property {string} etiqueta Nombre del rol.
 * @property {{ id: string, name: string, role: string }} user Usuario de ejemplo.
 * @property {{ id: string, name: string }} institution Institución de ejemplo.
 * @property {string[]} roles Roles.
 * @property {string[]} permissions Permisos.
 * @property {{ label: string, value: string }[]} stats Indicadores.
 * @property {{ titulo: string, items: { label: string, value: string }[] }[]} tabs Pestañas propias.
 * @property {string[]} acciones Permisos que se muestran como botones.
 */

/**
 * Activa la demostración sobre su contenedor.
 * @param {HTMLElement} root Contenedor `[data-demo="perfiles"]`.
 * @param {any} au Fachada `window.AU`.
 * @returns {Promise<void>}
 */
export async function perfiles(root, au) {
  /**
   * Elemento con un gancho `data-pf`.
   * @param {string} name Valor de `data-pf`.
   * @returns {HTMLElement} Elemento.
   */
  const el = (name) => /** @type {HTMLElement} */ (root.querySelector(`[data-pf="${name}"]`));
  const selector = /** @type {HTMLSelectElement} */ (el('rol'));
  const live = el('anuncio');

  /** @type {Record<string, Rol>} */
  let data;
  try {
    data = await au.api.get('data/perfiles-rol.json');
  } catch {
    el('error').hidden = false;
    return;
  }
  const claves = Object.keys(data).filter((k) => !k.startsWith('_'));
  selector.replaceChildren(...claves.map((k) => new Option(data[k].etiqueta, k)));

  /**
   * Pinta el perfil del rol elegido y cambia el contexto.
   * @param {string} key Clave del rol.
   * @returns {void}
   */
  const paint = (key) => {
    const rol = data[key];
    el('iniciales').textContent = rol.user.name
      .split(' ')
      .slice(-2)
      .map((p) => p[0])
      .join('');
    el('stats').innerHTML = rol.stats
      .map(
        (s) =>
          `<div class="col-sm-4"><div class="card"><div class="card-body"><div class="text-body-secondary small">${au.escapeHtml(s.label)}</div><div class="h4 mb-0 au-tabular">${au.escapeHtml(s.value)}</div></div></div></div>`,
      )
      .join('');
    el('tabs').innerHTML = `<ul class="nav nav-tabs mb-3" role="tablist">${rol.tabs
      .map(
        (t, i) =>
          `<li class="nav-item" role="presentation"><button class="nav-link${i ? '' : ' active'}" id="pf-tab-${i}" data-bs-toggle="tab" data-bs-target="#pf-pane-${i}" type="button" role="tab" aria-controls="pf-pane-${i}" aria-selected="${i === 0}">${au.escapeHtml(t.titulo)}</button></li>`,
      )
      .join('')}</ul><div class="tab-content">${rol.tabs
      .map(
        (t, i) =>
          `<div class="tab-pane fade${i ? '' : ' show active'}" id="pf-pane-${i}" role="tabpanel" aria-labelledby="pf-tab-${i}" tabindex="0"><dl class="row mb-0">${t.items
            .map(
              (it) =>
                `<dt class="col-sm-4">${au.escapeHtml(it.label)}</dt><dd class="col-sm-8">${au.escapeHtml(it.value)}</dd>`,
            )
            .join('')}</dl></div>`,
      )
      .join('')}</div>`;
    // Todas las acciones del catálogo existen en el DOM; `data-au-can` deja visibles solo las permitidas.
    el('acciones').innerHTML = Object.entries(ACCIONES)
      .map(
        ([perm, [label, icon]]) =>
          `<button class="btn btn-outline-primary btn-sm" type="button" data-au-can="${perm}"><i class="bi bi-${icon}" aria-hidden="true"></i>${au.escapeHtml(label)}</button>`,
      )
      .join('');
    el('permisos').textContent = rol.permissions.join(', ');
    au.setContext({
      user: rol.user,
      institution: rol.institution,
      roles: rol.roles,
      permissions: rol.permissions,
    });
    live.textContent = `Perfil de ${rol.etiqueta}: ${rol.acciones.length} acciones disponibles.`;
  };

  selector.addEventListener('change', () => paint(selector.value));
  el('region').hidden = false;
  paint(selector.value);
}
