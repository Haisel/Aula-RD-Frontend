import { describe, it, expect, vi, afterEach } from 'vitest';
import { actionComponent } from '../src/js/components/misc.js';

/**
 * Spec 013 · V-02: `data-au-action="print"` abre el diálogo de impresión del navegador
 * (la credencial del perfil la usa sin JavaScript en línea).
 */
describe('data-au-action="print"', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  /**
   * Crea un botón con la acción y lo inicializa.
   * @param {string} action Valor de `data-au-action`.
   * @returns {{ btn: HTMLButtonElement, cleanup: (() => void) | void }} Botón y limpieza.
   */
  function setup(action) {
    const btn = document.createElement('button');
    btn.dataset.auAction = action;
    document.body.append(btn);
    return { btn, cleanup: actionComponent.init(btn) };
  }

  it('llama a window.print al hacer clic', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    const { btn } = setup('print');
    btn.click();
    await Promise.resolve();
    expect(print).toHaveBeenCalledTimes(1);
  });

  it('no imprime tras la limpieza del componente', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    const { btn, cleanup } = setup('print');
    if (cleanup) cleanup();
    btn.click();
    await Promise.resolve();
    expect(print).not.toHaveBeenCalled();
  });

  it('otras acciones no imprimen', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { btn } = setup('no-registrada');
    btn.click();
    await Promise.resolve();
    expect(print).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
  });
});
