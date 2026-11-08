import { describe, it, expect, beforeEach } from 'vitest';
import { toMatrix, toCsv } from '../src/js/adapters/excel.js';
import { setContext, can, hasRole, getPath, getContext } from '../src/js/core/context.js';

describe('exportación', () => {
  it('toMatrix respeta columnas y orden', () => {
    const m = toMatrix({
      rows: [{ a: 1, b: 'x' }],
      columns: [
        { key: 'b', label: 'B' },
        { key: 'a', label: 'A' },
      ],
    });
    expect(m).toEqual([
      ['B', 'A'],
      ['x', '1'],
    ]);
  });
  it('toCsv escapa comas y comillas y añade BOM', () => {
    const csv = toCsv([
      ['Nombre', 'Nota'],
      ['Peña, María', 'Dijo "hola"'],
    ]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain('"Peña, María","Dijo ""hola"""');
  });
});

describe('contexto (solo presentación)', () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<span data-au-bind="user.name"></span><button data-au-can="cobros.registrar">Registrar</button><button data-au-can="planes.editar">Editar</button>';
    setContext({ user: { name: 'Ana' }, roles: ['institution-admin'], permissions: ['cobros.registrar'] });
  });
  it('enlaza texto y oculta por permiso', () => {
    expect(document.querySelector('[data-au-bind]').textContent).toBe('Ana');
    expect(document.querySelector('[data-au-can="cobros.registrar"]').hidden).toBe(false);
    expect(document.querySelector('[data-au-can="planes.editar"]').hidden).toBe(true);
  });
  it('can / hasRole / getPath / copia defensiva', () => {
    expect(can('cobros.registrar')).toBe(true);
    expect(hasRole('super-admin')).toBe(false);
    expect(getPath({ a: { b: 2 } }, 'a.b')).toBe(2);
    const c = getContext();
    c.user.name = 'X';
    expect(getContext().user.name).toBe('Ana');
  });
});
