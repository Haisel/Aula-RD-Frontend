// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { schemas, validate } from '../src/js/helpers/schemas.js';

/**
 * Spec 013 · V-02: esquema "perfil" del formulario de perfil editable (perfil-editable.html).
 */
/**
 * Valida datos con el esquema "perfil".
 * @param {Record<string, unknown>} data Datos.
 * @returns {ReturnType<typeof validate>} Resultado.
 */
const check = (data) => validate(/** @type {any} */ (schemas.get('perfil')), data);

const ok = {
  nombre: 'Marisol Peña Cabrera',
  email: 'marisol.pena@colegio.edu.do',
  telefono: '(809) 555-0142',
  bio: 'Docente.',
};

describe('esquema "perfil"', () => {
  it('está registrado', () => {
    expect(schemas.has('perfil')).toBe(true);
  });

  it('acepta datos completos', () => {
    expect(check(ok).success).toBe(true);
  });

  it('la presentación es opcional', () => {
    expect(check({ ...ok, bio: '' }).success).toBe(true);
  });

  it('pide nombre, correo y teléfono, con mensajes en español', () => {
    const r = check({ nombre: '', email: '', telefono: '', bio: '' });
    expect(r.errors.nombre).toBe('Escriba el nombre.');
    expect(r.errors.email).toBe('Escriba el correo.');
    expect(r.errors.telefono).toBe('Escriba el teléfono.');
  });

  it('rechaza un teléfono que no es dominicano', () => {
    expect(check({ ...ok, telefono: '(212) 555-0142' }).errors.telefono).toMatch(/dominicano/);
  });

  it('limita la presentación a 280 caracteres', () => {
    const r = check({ ...ok, bio: 'a'.repeat(281) });
    expect(r.success).toBe(false);
    expect(r.errors.bio).toBe('Use 280 caracteres o menos.');
  });
});
