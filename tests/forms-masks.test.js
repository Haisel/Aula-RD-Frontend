import { describe, it, expect, beforeEach } from 'vitest';
import { showErrors, clearErrors } from '../src/js/components/forms.js';
import { applyMask } from '../src/js/components/masks.js';

/**
 * Spec 008: errores por campo con atributos de accesibilidad (RF-05) y máscaras (RF-08).
 */

describe('RF-05: errores por campo accesibles (spec 008)', () => {
  /** @type {HTMLFormElement} */
  let form;

  beforeEach(() => {
    document.body.innerHTML = `
      <form id="f">
        <div data-au-form-error class="d-none"></div>
        <input id="correo" name="correo">
        <input id="clave" name="clave" aria-describedby="clave-help">
        <input id="otro" name="otro">
      </form>`;
    form = /** @type {HTMLFormElement} */ (document.getElementById('f'));
  });

  it('marca aria-invalid y enlaza el mensaje con aria-describedby', () => {
    showErrors(form, { correo: 'Escriba un correo válido.' });
    const field = /** @type {HTMLInputElement} */ (document.getElementById('correo'));
    expect(field.getAttribute('aria-invalid')).toBe('true');
    expect(field.classList.contains('is-invalid')).toBe(true);
    const id = field.getAttribute('aria-describedby');
    expect(id).toBe('correo-error');
    expect(document.getElementById(/** @type {string} */ (id))?.textContent).toBe(
      'Escriba un correo válido.',
    );
  });

  it('conserva un aria-describedby previo y no lo duplica', () => {
    showErrors(form, { clave: 'Escriba la contraseña.' });
    showErrors(form, { clave: 'Escriba la contraseña.' });
    const value = document.getElementById('clave')?.getAttribute('aria-describedby');
    expect(value).toBe('clave-help clave-error');
  });

  it('lleva el foco al primer campo con error', () => {
    showErrors(form, { otro: 'Falta.', correo: 'Falta.' });
    expect(document.activeElement?.id).toBe('otro');
  });

  it('muestra el error general en [data-au-form-error]', () => {
    showErrors(form, {}, 'No se pudo guardar.');
    const box = form.querySelector('[data-au-form-error]');
    expect(box?.textContent).toBe('No se pudo guardar.');
    expect(box?.classList.contains('d-none')).toBe(false);
  });

  it('clearErrors quita aria-invalid, la clase y los mensajes', () => {
    showErrors(form, { correo: 'Falta.' }, 'General');
    clearErrors(form);
    const field = document.getElementById('correo');
    expect(field?.hasAttribute('aria-invalid')).toBe(false);
    expect(field?.classList.contains('is-invalid')).toBe(false);
    expect(document.getElementById('correo-error')?.textContent).toBe('');
    expect(form.querySelector('[data-au-form-error]')?.classList.contains('d-none')).toBe(true);
  });

  it('ignora nombres de campo que no existen', () => {
    expect(() => showErrors(form, { inexistente: 'x' })).not.toThrow();
  });
});

describe('RF-08: máscaras (spec 008)', () => {
  /**
   * Aplica una máscara a un campo nuevo y devuelve el texto que muestra para una entrada.
   * @param {keyof typeof import('../src/js/components/masks.js').MASKS} name Nombre de la máscara.
   * @param {string} raw Texto escrito por la persona.
   * @returns {Promise<string>} Valor con formato.
   */
  async function masked(name, raw) {
    const input = document.createElement('input');
    document.body.append(input);
    const m = await applyMask(input, name);
    m.value = raw;
    const out = m.value;
    m.destroy();
    return out;
  }

  it('cédula: 000-0000000-0', async () => {
    expect(await masked('cedula', '00112345678')).toBe('001-1234567-8');
  });

  it('RNC: 0-00-00000-0', async () => {
    expect(await masked('rnc', '101234567')).toBe('1-01-23456-7');
  });

  it('teléfono: (000) 000-0000', async () => {
    expect(await masked('telefono', '8095551234')).toBe('(809) 555-1234');
  });

  it('moneda: miles con coma y dos decimales', async () => {
    expect(await masked('moneda', '12500.5')).toBe('12,500.50');
  });

  it('entero: miles con coma y sin decimales', async () => {
    expect(await masked('entero', '1234567')).toBe('1,234,567');
  });

  it('descarta letras en las máscaras numéricas', async () => {
    expect(await masked('cedula', 'abc00112345678')).toBe('001-1234567-8');
  });

  it('rechaza una máscara desconocida', async () => {
    const input = document.createElement('input');
    await expect(applyMask(input, /** @type {any} */ ('nada'))).rejects.toThrow('Máscara desconocida');
  });
});
