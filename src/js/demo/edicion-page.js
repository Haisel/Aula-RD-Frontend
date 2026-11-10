/**
 * Demostración de edición con aviso de cambios sin guardar y deshacer (spec 012, T-22 · RF-09).
 *
 * Lee el perfil docente de `data/perfiles.json` con `AU.api.get`. Al editar, el cambio de cada
 * campo se anota en un borrador ({@link createDraft}); si hay cambios sin guardar, salir de la página
 * pide confirmación (enlace de salida y `beforeunload`). Al terminar, el foco vuelve al botón que
 * abrió la edición. Nada se guarda en el navegador (RN-02). Usa solo la fachada `window.AU`.
 * @module demo/edicion-page
 */
import { createDraft } from './edicion.js';

/** Campos editables, en el orden en que se muestran. */
const CAMPOS = ['nombre', 'correo', 'telefono', 'cargo'];

/**
 * Activa la demostración sobre su contenedor.
 * @param {HTMLElement} root Contenedor `[data-demo="edicion"]`.
 * @param {any} au Fachada `window.AU`.
 * @returns {Promise<void>}
 */
export async function edicion(root, au) {
  /**
   * Elemento con un gancho `data-ed`.
   * @param {string} name Valor de `data-ed`.
   * @returns {HTMLElement} Elemento.
   */
  const el = (name) => /** @type {HTMLElement} */ (root.querySelector(`[data-ed="${name}"]`));
  const form = /** @type {HTMLFormElement} */ (el('form'));
  const editBtn = /** @type {HTMLButtonElement} */ (el('editar'));
  const undoBtn = /** @type {HTMLButtonElement} */ (el('deshacer'));
  const state = el('estado');
  const live = el('anuncio');
  // El enlace de salida está en el encabezado de la página, fuera del contenedor.
  const exitLink = /** @type {HTMLAnchorElement} */ (document.querySelector('[data-ed="salir"]'));

  /** @type {ReturnType<typeof createDraft> | null} */
  let draft = null;

  /**
   * Campo del formulario por nombre.
   * @param {string} name Nombre del campo.
   * @returns {HTMLInputElement} Campo.
   */
  const field = (name) => /** @type {HTMLInputElement} */ (form.elements.namedItem(name));

  /**
   * Anuncia un mensaje a los lectores de pantalla.
   * @param {string} text Mensaje.
   * @returns {void}
   */
  const announce = (text) => {
    live.textContent = text;
  };

  /**
   * Pasa al borrador lo escrito en los campos (el evento `change` solo llega al salir del campo).
   * @returns {void}
   */
  const commit = () => {
    if (!draft || form.hidden) return;
    for (const name of CAMPOS) draft.set(name, field(name).value);
  };

  /**
   * Hay cambios sin guardar.
   * @returns {boolean} `true` si el borrador difiere de lo guardado.
   */
  const dirty = () => {
    commit();
    return Boolean(draft?.isDirty());
  };

  /**
   * Refleja el estado del borrador en la interfaz.
   * @returns {void}
   */
  const sync = () => {
    const n = draft?.changed().length ?? 0;
    state.textContent = n ? `Cambios sin guardar (${n})` : 'Sin cambios';
    state.className = `au-status au-status-${n ? 'warning' : 'success'}`;
    undoBtn.disabled = !draft?.canUndo();
  };

  /**
   * Muestra los valores guardados en el resumen.
   * @param {Record<string, string>} v Valores.
   * @returns {void}
   */
  const paintSummary = (v) => {
    for (const name of CAMPOS) el(`ver-${name}`).textContent = v[name];
  };

  /**
   * Cierra la edición y devuelve el foco al botón que la abrió.
   * @returns {void}
   */
  const closeEdit = () => {
    au.clearErrors(form);
    form.hidden = true;
    editBtn.hidden = false;
    editBtn.focus();
  };

  try {
    /** @type {any} */
    const perfiles = await au.api.get('data/perfiles.json');
    const d = perfiles.docente;
    draft = createDraft({ nombre: d.name, correo: d.email, telefono: d.phone, cargo: d.role });
    paintSummary(draft.values());
    el('region').hidden = false;
    el('error').hidden = true;
  } catch {
    el('error').hidden = false;
    el('region').hidden = true;
    return;
  }
  sync();

  editBtn.addEventListener('click', () => {
    const values = /** @type {NonNullable<typeof draft>} */ (draft).values();
    for (const name of CAMPOS) field(name).value = values[name];
    form.hidden = false;
    editBtn.hidden = true;
    field('nombre').focus();
    announce('Edición abierta.');
  });

  form.addEventListener('change', () => {
    commit();
    sync();
  });

  undoBtn.addEventListener('click', () => {
    commit();
    const undone = draft?.undo();
    if (!undone) return;
    field(undone.field).value = undone.value;
    field(undone.field).focus();
    sync();
    announce(`Se restauró el campo ${undone.field}.`);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    commit();
    au.clearErrors(form);
    if (!draft?.values().nombre.trim()) {
      au.showErrors(form, { nombre: 'Escriba el nombre completo.' });
      field('nombre').focus();
      return;
    }
    paintSummary(draft.save());
    sync();
    au.toast('Cambios guardados (demostración: nada se envía).', 'success');
    closeEdit();
  });

  el('cancelar').addEventListener('click', async () => {
    if (
      dirty() &&
      !(await au.confirm({
        title: '¿Descartar los cambios?',
        text: 'Se perderán las modificaciones sin guardar.',
        confirmText: 'Descartar',
        variant: 'danger',
      }))
    ) {
      return;
    }
    draft?.discard();
    sync();
    closeEdit();
    announce('Cambios descartados.');
  });

  /**
   * Pide confirmación al navegador al cerrar o recargar con cambios sin guardar.
   * @param {BeforeUnloadEvent} event Evento.
   * @returns {void}
   */
  function guard(event) {
    if (!dirty()) return;
    event.preventDefault();
    event.returnValue = '';
  }
  window.addEventListener('beforeunload', guard);

  exitLink.addEventListener('click', async (event) => {
    if (!dirty()) return;
    event.preventDefault();
    const ok = await au.confirm({
      title: 'Hay cambios sin guardar',
      text: 'Si sale ahora, se perderán. ¿Desea salir de todos modos?',
      confirmText: 'Salir sin guardar',
      variant: 'danger',
    });
    if (ok) {
      window.removeEventListener('beforeunload', guard);
      window.location.href = exitLink.href;
    }
  });
}
