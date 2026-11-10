/**
 * Demostración de carga de archivos (spec 012, T-24 · RF-15).
 *
 * Zona para soltar archivos o elegirlos con el botón (teclado incluido). Cada archivo se revisa con
 * {@link revisarArchivos} (tipo, tamaño y cantidad) y se muestra la lista de aceptados y de
 * rechazados con su motivo. Nada se sube ni se guarda (RN-02). Usa solo la fachada `window.AU`.
 * @module demo/archivos-page
 */
import { LIMITES, revisarArchivos, tamano } from './archivos.js';

/**
 * Activa la demostración sobre su contenedor.
 * @param {HTMLElement} root Contenedor `[data-demo="archivos"]`.
 * @param {any} au Fachada `window.AU`.
 * @returns {void}
 */
export function archivos(root, au) {
  /**
   * Elemento con un gancho `data-ar`.
   * @param {string} name Valor de `data-ar`.
   * @returns {HTMLElement} Elemento.
   */
  const el = (name) => /** @type {HTMLElement} */ (root.querySelector(`[data-ar="${name}"]`));
  const input = /** @type {HTMLInputElement} */ (el('input'));
  const zone = el('zona');
  const list = el('lista');
  const rejected = el('rechazados');
  const live = el('anuncio');

  /** @type {import('./archivos.js').Archivo[]} */
  let accepted = [];

  /**
   * Pinta las listas de aceptados y rechazados.
   * @param {{ name: string, motivo: string }[]} rechazados Archivos rechazados en esta tanda.
   * @returns {void}
   */
  const paint = (rechazados) => {
    list.innerHTML = accepted.length
      ? accepted
          .map(
            (f, i) =>
              `<li class="list-group-item d-flex align-items-center gap-2"><i class="bi bi-file-earmark-check text-success" aria-hidden="true"></i><span class="flex-grow-1 text-break">${au.escapeHtml(f.name)} <span class="text-body-secondary">(${tamano(f.size)})</span></span><button class="btn btn-outline-danger btn-sm au-btn-icon" type="button" data-ar-quitar="${i}" aria-label="Quitar ${au.escapeHtml(f.name)}"><i class="bi bi-x-lg" aria-hidden="true"></i></button></li>`,
          )
          .join('')
      : '<li class="list-group-item text-body-secondary">Aún no hay archivos.</li>';
    rejected.hidden = !rechazados.length;
    rejected.innerHTML = rechazados.length
      ? `<p class="au-alert-title">No se aceptaron ${rechazados.length} archivo(s)</p><ul class="mb-0">${rechazados
          .map((r) => `<li><strong>${au.escapeHtml(r.name)}:</strong> ${au.escapeHtml(r.motivo)}</li>`)
          .join('')}</ul>`
      : '';
    el('contador').textContent = `${accepted.length} de ${LIMITES.maxArchivos} archivos`;
    live.textContent = `${accepted.length} archivos aceptados, ${rechazados.length} rechazados.`;
  };

  /**
   * Revisa los archivos elegidos o soltados.
   * @param {FileList | File[]} files Archivos.
   * @returns {void}
   */
  const receive = (files) => {
    const res = revisarArchivos(
      [...files].map((f) => ({ name: f.name, type: f.type, size: f.size })),
      accepted.length,
    );
    accepted = [...accepted, ...res.aceptados];
    paint(res.rechazados);
  };

  input.addEventListener('change', () => {
    if (input.files) receive(input.files);
    input.value = '';
  });

  for (const type of ['dragenter', 'dragover']) {
    zone.addEventListener(type, (event) => {
      event.preventDefault();
      zone.classList.add('is-over');
    });
  }
  for (const type of ['dragleave', 'drop']) {
    zone.addEventListener(type, () => zone.classList.remove('is-over'));
  }
  zone.addEventListener('drop', (event) => {
    event.preventDefault();
    if (event.dataTransfer?.files) receive(event.dataTransfer.files);
  });

  list.addEventListener('click', (event) => {
    const btn = /** @type {HTMLElement} */ (event.target).closest('[data-ar-quitar]');
    if (!btn) return;
    accepted = accepted.filter((_, i) => i !== Number(/** @type {HTMLElement} */ (btn).dataset.arQuitar));
    paint([]);
    input.focus();
  });

  el('limpiar').addEventListener('click', () => {
    accepted = [];
    paint([]);
    input.focus();
  });

  paint([]);
}
