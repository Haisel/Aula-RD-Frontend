// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { normalizar, coincide, filtrar } from '../src/js/demo/filtro.js';

/** Spec 013, T-19: búsqueda y filtro de las páginas de aplicaciones. */
describe('filtro (spec 013 · T-19)', () => {
  it('normaliza acentos y mayúsculas', () => {
    expect(normalizar('  Matemática ÁLGEBRA ')).toBe('matematica algebra');
  });
  it('una consulta vacía coincide con todo', () => {
    expect(coincide('cualquier texto', '')).toBe(true);
  });
  it('exige todas las palabras, sin importar el orden', () => {
    expect(coincide('Luis Peña, docente de Matemática', 'matematica luis')).toBe(true);
    expect(coincide('Luis Peña, docente de Matemática', 'luis historia')).toBe(false);
  });
  it('filtra por texto y por categoría', () => {
    const items = [
      { texto: 'Acta de notas', categoria: 'docs' },
      { texto: 'Foto de la feria', categoria: 'fotos' },
      { texto: 'Acta de reunión', categoria: 'docs' },
    ];
    expect(filtrar(items, 'acta')).toHaveLength(2);
    expect(filtrar(items, 'acta', 'fotos')).toHaveLength(0);
    expect(filtrar(items, '', 'fotos')).toHaveLength(1);
  });
});
