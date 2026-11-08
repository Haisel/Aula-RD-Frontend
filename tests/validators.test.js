import { describe, it, expect } from 'vitest';
import { isValidCedula, isValidRnc, isValidPhoneDO, isValidEmail } from '../src/js/helpers/validators.js';
import { validate, schemas } from '../src/js/helpers/schemas.js';

/** Genera una cédula válida calculando su dígito verificador (no se usan cédulas reales). */
function cedula(base10) {
  let sum = 0;
  [...base10].forEach((ch, i) => {
    let p = Number(ch) * (i % 2 === 0 ? 1 : 2);
    if (p > 9) p -= 9;
    sum += p;
  });
  return base10 + ((10 - (sum % 10)) % 10);
}

/** Genera un RNC válido calculando su dígito verificador. */
function rnc(base8) {
  const w = [7, 9, 8, 6, 5, 4, 3, 2];
  const r = [...base8].reduce((a, ch, i) => a + Number(ch) * w[i], 0) % 11;
  return base8 + (r === 0 ? 2 : r === 1 ? 1 : 11 - r);
}

describe('isValidCedula', () => {
  it('acepta dígito verificador correcto, con o sin guiones', () => {
    const c = cedula('0011234567');
    expect(isValidCedula(c)).toBe(true);
    expect(isValidCedula(`${c.slice(0, 3)}-${c.slice(3, 10)}-${c.slice(10)}`)).toBe(true);
  });
  it('rechaza dígito incorrecto, longitud y repetidos', () => {
    const c = cedula('0011234567');
    const wrong = c.slice(0, 10) + ((Number(c[10]) + 1) % 10);
    expect(isValidCedula(wrong)).toBe(false);
    expect(isValidCedula('123')).toBe(false);
    expect(isValidCedula('00000000000')).toBe(false);
  });
});

describe('isValidRnc', () => {
  it('acepta y rechaza según el verificador', () => {
    const r = rnc('10112345');
    expect(isValidRnc(r)).toBe(true);
    expect(isValidRnc(r.slice(0, 8) + ((Number(r[8]) + 1) % 10))).toBe(false);
  });
});

describe('isValidPhoneDO', () => {
  it.each(['8095551234', '(829) 555-1234', '+1 849 555 1234'])('acepta %s', (v) =>
    expect(isValidPhoneDO(v)).toBe(true),
  );
  it.each(['3055551234', '809555123', ''])('rechaza %s', (v) => expect(isValidPhoneDO(v)).toBe(false));
});

describe('isValidEmail', () => {
  it('valida forma básica', () => {
    expect(isValidEmail('direccion@colegio.edu.do')).toBe(true);
    expect(isValidEmail('direccion@colegio')).toBe(false);
  });
});

describe('esquemas Zod', () => {
  it('login: mensajes en español por campo', () => {
    const r = validate(schemas.get('login'), { email: 'x', password: '' });
    expect(r.success).toBe(false);
    expect(r.errors.email).toMatch(/correo válido/);
    expect(r.errors.password).toMatch(/contraseña/);
  });

  it('registro de institución válido', () => {
    const r = validate(schemas.get('registro-institucion'), {
      institucion: 'Colegio Demo',
      rnc: rnc('10112345'),
      provincia: 'Santiago',
      telefono: '(809) 555-1234',
      plan: 'profesional',
      director: 'Ana Martínez',
      cedula: cedula('0011234567'),
      email: 'a@colegio.edu.do',
      inicio: '18/08/2026',
      password: 'Clave2026',
      terminos: 'on',
    });
    expect(r.success).toBe(true);
  });

  it('contraseña débil y términos sin aceptar', () => {
    const r = validate(schemas.get('registro-institucion'), { password: 'abc' });
    expect(r.errors.password).toBe('Use al menos 8 caracteres.');
    expect(r.errors.terminos).toBe('Debe aceptar para continuar.');
  });
});
