import { describe, it, expect } from 'vitest';
import { normalizeError } from '../src/js/core/http.js';

const axiosErr = (status, data) => ({ response: { status, data } });

describe('normalizeError (neutro respecto al backend)', () => {
  it('Laravel / Express: message + errors{campo: []}', () => {
    const e = normalizeError(axiosErr(422, { message: 'Datos inválidos', errors: { email: ['Ya existe'] } }));
    expect(e).toMatchObject({
      status: 422,
      message: 'Datos inválidos',
      fieldErrors: { email: ['Ya existe'] },
    });
  });

  it('ASP.NET ProblemDetails: title + errors con PascalCase', () => {
    const e = normalizeError(
      axiosErr(400, { title: 'One or more validation errors occurred.', errors: { Email: ['Required'] } }),
    );
    expect(e.message).toBe('One or more validation errors occurred.');
    expect(e.fieldErrors.email).toEqual(['Required']);
  });

  it('Django REST: detail', () =>
    expect(normalizeError(axiosErr(403, { detail: 'No autorizado' })).message).toBe('No autorizado'));

  it('sin respuesta (red caída)', () => {
    const e = normalizeError(new Error('Network Error'));
    expect(e.status).toBe(0);
    expect(e.message).toMatch(/No se pudo conectar/);
  });

  it('HTML de error del servidor no se muestra al usuario', () => {
    const e = normalizeError(axiosErr(500, '<!doctype html><h1>500</h1>'));
    expect(e.message).toMatch(/error en el servidor/);
  });

  it.each([
    [401, /sesión expiró/],
    [404, /No encontramos/],
    [419, /expiró/],
  ])('mensaje por defecto %i', (status, re) => {
    expect(normalizeError(axiosErr(status, {})).message).toMatch(re);
  });
});
