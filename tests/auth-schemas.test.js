// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { schemas, validate } from '../src/js/helpers/schemas.js';

/**
 * Spec 013 · V-01: esquemas de las páginas de recuperar contraseña y de acceso con código.
 */
/**
 * Valida datos con un esquema registrado.
 * @param {string} name Nombre del esquema.
 * @param {Record<string, unknown>} data Datos.
 * @returns {ReturnType<typeof validate>} Resultado.
 */
const check = (name, data) => validate(/** @type {any} */ (schemas.get(name)), data);

describe('esquema "recuperar" (olvidé mi contraseña)', () => {
  it('está registrado', () => {
    expect(schemas.has('recuperar')).toBe(true);
  });

  it('acepta un correo válido', () => {
    expect(check('recuperar', { email: 'nombre@colegio.edu.do' }).success).toBe(true);
  });

  it('pide el correo si está vacío', () => {
    const r = check('recuperar', { email: '' });
    expect(r.success).toBe(false);
    expect(r.errors.email).toBe('Escriba el correo.');
  });

  it('rechaza un correo mal escrito, con el mensaje en español', () => {
    const r = check('recuperar', { email: 'no-es-correo' });
    expect(r.success).toBe(false);
    expect(r.errors.email).toMatch(/correo válido/);
  });

  it('no exige contraseña', () => {
    expect(check('recuperar', { email: 'a@b.do' }).errors).toEqual({});
  });
});

describe('esquema "codigo-acceso" (inicio de sesión sin contraseña)', () => {
  it('está registrado', () => {
    expect(schemas.has('codigo-acceso')).toBe(true);
  });

  it('acepta un correo y un código de 6 dígitos', () => {
    expect(check('codigo-acceso', { email: 'nombre@colegio.edu.do', codigo: '048215' }).success).toBe(true);
  });

  it.each([['12345'], ['1234567'], ['12a456'], ['      ']])('rechaza el código "%s"', (codigo) => {
    const r = check('codigo-acceso', { email: 'nombre@colegio.edu.do', codigo });
    expect(r.success).toBe(false);
    expect(r.errors.codigo).toBe('Escriba los 6 dígitos del código.');
  });

  it('ignora espacios alrededor del código', () => {
    expect(check('codigo-acceso', { email: 'a@b.do', codigo: ' 048215 ' }).success).toBe(true);
  });

  it('pide el correo y el código por separado', () => {
    const r = check('codigo-acceso', { email: '', codigo: '' });
    expect(r.errors.email).toBe('Escriba el correo.');
    expect(r.errors.codigo).toBe('Escriba los 6 dígitos del código.');
  });
});
