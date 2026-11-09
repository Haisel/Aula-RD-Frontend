import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { tabsComponent } from '../src/js/components/tabs.js';
import { showErrors } from '../src/js/components/forms.js';

/**
 * Spec 013 · V-03: asistente por pasos sobre `data-au-tabs`.
 * - `data-au-tab-go="#panel"` (botón dentro del contenedor) activa ese paso y su pestaña.
 * - `showErrors` abre el panel del primer campo con error: un foco en un paso oculto no se vería.
 */
beforeAll(() => {
  // jsdom no trae CSS.escape (lo usa showErrors).
  if (!globalThis.CSS) /** @type {any} */ (globalThis).CSS = {};
  if (!globalThis.CSS.escape)
    globalThis.CSS.escape = (/** @type {string} */ s) => s.replace(/["\\]/g, '\\$&');
});

afterEach(() => {
  document.body.innerHTML = '';
});

/**
 * Monta un asistente de dos pasos y lo inicializa.
 * @returns {{ form: HTMLFormElement, root: HTMLElement, cleanup: (() => void) | void }} Piezas.
 */
function mount() {
  document.body.innerHTML = `
    <form id="f"><div data-au-tabs id="root">
      <ul class="nav nav-pills">
        <li class="nav-item"><button class="nav-link active" type="button" data-bs-target="#s1" id="t1">Uno</button></li>
        <li class="nav-item"><button class="nav-link" type="button" data-bs-target="#s2" id="t2">Dos</button></li>
      </ul>
      <div class="tab-content">
        <div class="tab-pane active show" id="s1"><button type="button" id="next" data-au-tab-go="#s2">Siguiente</button></div>
        <div class="tab-pane" id="s2"><input name="x" id="x"><button type="button" id="prev" data-au-tab-go="#s1">Anterior</button></div>
      </div>
    </div></form>`;
  const root = /** @type {HTMLElement} */ (document.getElementById('root'));
  return {
    form: /** @type {HTMLFormElement} */ (document.getElementById('f')),
    root,
    cleanup: tabsComponent.init(root),
  };
}

/**
 * Espera a que Bootstrap termine de mostrar una pestaña.
 * @param {string} id Id del botón de la pestaña.
 * @returns {Promise<void>} Se resuelve en `shown.bs.tab`.
 */
const shown = (id) =>
  new Promise((ok) =>
    document.getElementById(id)?.addEventListener('shown.bs.tab', () => ok(), { once: true }),
  );

describe('data-au-tab-go', () => {
  it('"Siguiente" activa el paso y su pestaña', async () => {
    mount();
    const done = shown('t2');
    /** @type {HTMLElement} */ (document.getElementById('next')).click();
    await done;
    expect(document.getElementById('s2')?.classList.contains('active')).toBe(true);
    expect(document.getElementById('s1')?.classList.contains('active')).toBe(false);
    expect(document.getElementById('t2')?.getAttribute('aria-selected')).toBe('true');
    expect(document.getElementById('t1')?.getAttribute('aria-selected')).toBe('false');
  });

  it('"Anterior" vuelve al paso previo', async () => {
    mount();
    let done = shown('t2');
    /** @type {HTMLElement} */ (document.getElementById('next')).click();
    await done;
    done = shown('t1');
    /** @type {HTMLElement} */ (document.getElementById('prev')).click();
    await done;
    expect(document.getElementById('s1')?.classList.contains('active')).toBe(true);
  });

  it('un destino que no existe no rompe nada', () => {
    mount();
    const btn = /** @type {HTMLElement} */ (document.getElementById('next'));
    btn.dataset.auTabGo = '#no-existe';
    expect(() => btn.click()).not.toThrow();
    expect(document.getElementById('s1')?.classList.contains('active')).toBe(true);
  });

  it('tras la limpieza el botón deja de funcionar', () => {
    const { cleanup } = mount();
    if (cleanup) cleanup();
    /** @type {HTMLElement} */ (document.getElementById('next')).click();
    expect(document.getElementById('s1')?.classList.contains('active')).toBe(true);
  });
});

describe('showErrors con campos sustituidos por un widget (el foco no puede caer en body)', () => {
  it('lista de Choices: enfoca el campo de búsqueda del widget, no el select oculto', () => {
    document.body.innerHTML = `<form id="f"><div class="choices">
      <select name="g" id="g" hidden tabindex="-1"></select>
      <input type="search" class="choices__input choices__input--cloned" id="g-busca"></div></form>`;
    showErrors(/** @type {HTMLFormElement} */ (document.getElementById('f')), { g: 'Elija una opción.' });
    expect(document.activeElement?.id).toBe('g-busca');
  });

  it('campo oculto de un widget con data-au-input: enfoca el widget (firma) y lo hace enfocable por programa', () => {
    document.body.innerHTML = `<form id="f"><canvas id="lienzo" data-au-input="#firma" aria-labelledby="l"></canvas>
      <input type="hidden" name="firma" id="firma"></form>`;
    showErrors(/** @type {HTMLFormElement} */ (document.getElementById('f')), {
      firma: 'Firme en el recuadro.',
    });
    expect(document.activeElement?.id).toBe('lienzo');
    expect(document.getElementById('lienzo')?.getAttribute('tabindex')).toBe('-1');
  });

  it('campo oculto del editor: enfoca el área editable', () => {
    document.body.innerHTML = `<form id="f"><div data-au-input="#html"><div class="ql-editor" id="ed" tabindex="0"></div></div>
      <input type="hidden" name="mensaje" id="html"></form>`;
    showErrors(/** @type {HTMLFormElement} */ (document.getElementById('f')), {
      mensaje: 'Escriba el mensaje.',
    });
    expect(document.activeElement?.id).toBe('ed');
  });

  it('un campo normal sigue enfocándose a sí mismo', () => {
    document.body.innerHTML = '<form id="f"><input name="n" id="n"></form>';
    showErrors(/** @type {HTMLFormElement} */ (document.getElementById('f')), { n: 'Falta.' });
    expect(document.activeElement?.id).toBe('n');
  });
});

describe('showErrors con campos en un paso oculto', () => {
  it('abre el paso del primer error y le da el foco', async () => {
    const { form } = mount();
    const done = shown('t2');
    showErrors(form, { x: 'Escriba el valor.' });
    await done;
    expect(document.getElementById('s2')?.classList.contains('active')).toBe(true);
    expect(document.activeElement?.id).toBe('x');
  });

  it('si el campo ya está en el paso visible, solo enfoca', () => {
    const { form } = mount();
    document.getElementById('s1')?.insertAdjacentHTML('beforeend', '<input name="y" id="y">');
    showErrors(form, { y: 'Falta.' });
    expect(document.activeElement?.id).toBe('y');
    expect(document.getElementById('s1')?.classList.contains('active')).toBe(true);
  });
});
