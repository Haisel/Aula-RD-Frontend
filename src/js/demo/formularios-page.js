/**
 * Demostración del formulario avanzado de matrícula (spec 012, T-21 · RF-05).
 *
 * Asistente por pasos con validación por paso y foco al primer error, listas dependientes
 * (grado → sección), selección múltiple y rango de fechas (componentes `data-au-*`), filas
 * repetibles de tutores y errores del «servidor» mostrados por campo. Nada se envía (RN-02).
 * Usa solo la fachada `window.AU`; la lógica de validación está en {@link module:demo/formularios}.
 * @module demo/formularios-page
 */
import { SECCIONES, primerPasoInvalido, respuestaServidor, seccionesDe, validarPaso } from './formularios.js';

/** Cantidad total de pasos del asistente. */
const PASOS = 3;
/** Máximo de tutores que se pueden agregar. */
const MAX_TUTORES = 3;

/**
 * Activa la demostración sobre su contenedor.
 * @param {HTMLElement} root Contenedor `[data-demo="formularios"]`.
 * @param {any} au Fachada `window.AU`.
 * @returns {void}
 */
export function formularios(root, au) {
  /**
   * Elemento con un gancho `data-fm`.
   * @param {string} name Valor de `data-fm`.
   * @returns {HTMLElement} Elemento.
   */
  const el = (name) => /** @type {HTMLElement} */ (root.querySelector(`[data-fm="${name}"]`));
  const form = /** @type {HTMLFormElement} */ (el('form'));
  const grado = /** @type {HTMLSelectElement} */ (form.elements.namedItem('grado'));
  const seccion = /** @type {HTMLSelectElement} */ (form.elements.namedItem('seccion'));
  const rows = el('tutores');
  const live = el('anuncio');
  const panes = /** @type {HTMLElement[]} */ ([...root.querySelectorAll('[data-fm-paso]')]);
  const steps = /** @type {HTMLElement[]} */ ([...root.querySelectorAll('[data-fm-go]')]);
  let current = 1;

  for (const g of Object.keys(SECCIONES)) grado.add(new Option(g, g));

  /**
   * Valores del formulario como texto (para validar).
   * @returns {Record<string, string>} Datos.
   */
  const datos = () => {
    /** @type {Record<string, string>} */
    const out = {};
    for (const [k, v] of new FormData(form).entries()) if (typeof v === 'string' && !(k in out)) out[k] = v;
    return out;
  };

  /**
   * Muestra un paso y marca el del indicador.
   * @param {number} n Número de paso.
   * @returns {void}
   */
  const show = (n) => {
    current = n;
    panes.forEach((p, i) => {
      p.hidden = i + 1 !== n;
    });
    steps.forEach((s, i) => {
      s.classList.toggle('active', i + 1 === n);
      if (i + 1 === n) s.setAttribute('aria-current', 'step');
      else s.removeAttribute('aria-current');
    });
    if (n === PASOS) {
      const d = datos();
      el('resumen').textContent =
        `${d.nombre} · ${d.grado} ${d.seccion} · Tutor: ${d.tutor1} · Período: ${d.periodo}`;
    }
  };

  /**
   * Muestra errores, enfoca el primer campo inválido y lo anuncia.
   * @param {Record<string, string>} errores Error por campo.
   * @returns {void}
   */
  const mostrar = (errores) => {
    au.clearErrors(form);
    au.showErrors(form, errores);
    /** @type {HTMLElement | null} */ (form.querySelector('.is-invalid'))?.focus();
    live.textContent = `Hay ${Object.keys(errores).length} campo(s) por corregir.`;
  };

  grado.addEventListener('change', () => {
    seccion.replaceChildren(new Option('Seleccione…', ''));
    for (const s of seccionesDe(grado.value)) seccion.add(new Option(s, s));
    seccion.disabled = !grado.value;
  });

  root.addEventListener('click', (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    const next = target.closest('[data-fm-next]');
    const prev = target.closest('[data-fm-prev]');
    const add = target.closest('[data-fm="agregar"]');
    const remove = target.closest('[data-fm-quitar]');
    if (next) {
      const errores = validarPaso(current, datos());
      if (Object.keys(errores).length) mostrar(errores);
      else {
        au.clearErrors(form);
        show(current + 1);
      }
    } else if (prev) {
      au.clearErrors(form);
      show(current - 1);
    } else if (add && rows.children.length < MAX_TUTORES) {
      const n = rows.children.length + 1;
      const row = document.createElement('div');
      row.className = 'input-group mb-2';
      row.innerHTML = `<input class="form-control" name="tutor${n}" type="text" aria-label="Nombre del tutor ${n}" autocomplete="off"><button class="btn btn-outline-danger" type="button" data-fm-quitar aria-label="Quitar tutor ${n}"><i class="bi bi-x-lg" aria-hidden="true"></i></button>`;
      rows.append(row);
      /** @type {HTMLElement} */ (row.firstElementChild).focus();
      /** @type {HTMLButtonElement} */ (el('agregar')).disabled = rows.children.length >= MAX_TUTORES;
    } else if (remove) {
      const row = /** @type {HTMLElement} */ (remove.closest('.input-group'));
      row.remove();
      /** @type {HTMLButtonElement} */ (el('agregar')).disabled = false;
      /** @type {HTMLElement} */ (el('agregar')).focus();
    }
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const d = datos();
    const invalido = primerPasoInvalido(d);
    if (invalido) {
      show(invalido.paso);
      mostrar(invalido.errores);
      return;
    }
    const servidor = respuestaServidor(d);
    if (Object.keys(servidor).length) {
      show(1);
      mostrar(servidor);
      return;
    }
    au.clearErrors(form);
    au.toast('Matrícula válida (demostración: nada se envía).', 'success');
    live.textContent = 'Matrícula válida.';
  });

  show(1);
}
