// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { cell, statusTone, formatMoney, formatIsoDate } from '../src/data/cells.js';

/**
 * Spec 013 · T-06/T-07: celdas de las tablas de los arquetipos. Todo valor se escapa (los datos
 * vienen de archivos JSON y nunca se confían), y los formatos son los de la plantilla.
 */
describe('formatos de la plantilla', () => {
  it('moneda: RD$ con separador de miles y dos decimales', () => {
    expect(formatMoney(12500)).toBe('RD$ 12,500.00');
    expect(formatMoney(9800.5)).toBe('RD$ 9,800.50');
    expect(formatMoney(0)).toBe('RD$ 0.00');
  });

  it('fecha ISO a DD/MM/AAAA', () => {
    expect(formatIsoDate('2026-11-08')).toBe('08/11/2026');
    expect(formatIsoDate('2023-01-24')).toBe('24/01/2023');
  });

  it('una fecha o un monto inválidos no rompen: devuelven un guion', () => {
    expect(formatIsoDate('')).toBe('—');
    expect(formatIsoDate('no-es-fecha')).toBe('—');
    expect(formatMoney(Number.NaN)).toBe('—');
    expect(formatMoney(/** @type {any} */ (undefined))).toBe('—');
  });
});

describe('tono de los estados', () => {
  it.each([
    ['Activo', 'success'],
    ['Pagado', 'success'],
    ['Pendiente', 'warning'],
    ['Vencido', 'danger'],
    ['Retirado', 'danger'],
    ['Licencia', 'info'],
    ['Inactivo', 'neutral'],
    ['Período de prueba', 'brand'],
  ])('%s → %s', (estado, tono) => {
    expect(statusTone(estado)).toBe(tono);
  });

  it('un estado desconocido es neutro', () => {
    expect(statusTone('Algo raro')).toBe('neutral');
  });
});

describe('cell(): una celda por tipo', () => {
  it('texto: escapa el HTML', () => {
    expect(cell({ kind: 'text', key: 'n' }, { n: '<img src=x onerror=alert(1)>' })).toBe(
      '&lt;img src=x onerror=alert(1)&gt;',
    );
  });

  it('entidad: nombre y línea secundaria, ambos escapados', () => {
    const html = cell(
      { kind: 'entity', key: 'nombre', meta: 'grado' },
      { nombre: 'Ana <b>', grado: '4.º Primaria' },
    );
    expect(html).toContain('Ana &lt;b&gt;');
    expect(html).toContain('<span class="au-cell-meta">4.º Primaria</span>');
    expect(html).not.toContain('<b>');
  });

  it('entidad sin línea secundaria no deja una etiqueta vacía', () => {
    expect(cell({ kind: 'entity', key: 'nombre' }, { nombre: 'Ana' })).not.toContain('au-cell-meta');
  });

  it('estado: píldora con el tono del valor', () => {
    expect(cell({ kind: 'status', key: 'estado' }, { estado: 'Pagado' })).toBe(
      '<span class="au-status au-status-success">Pagado</span>',
    );
    expect(cell({ kind: 'status', key: 'estado' }, { estado: 'Vencido' })).toContain('au-status-danger');
  });

  it('estado: escapa el valor aunque el tono sea neutro', () => {
    expect(cell({ kind: 'status', key: 'estado' }, { estado: '<x>' })).toContain('&lt;x&gt;');
  });

  it('moneda y fecha usan los formatos de la plantilla', () => {
    expect(cell({ kind: 'money', key: 'monto' }, { monto: 12500 })).toBe('RD$ 12,500.00');
    expect(cell({ kind: 'date', key: 'f' }, { f: '2026-11-08' })).toBe('08/11/2026');
  });

  it('plan: píldora de plan (básico, profesional, premium)', () => {
    expect(cell({ kind: 'plan', key: 'plan' }, { plan: 'Profesional' })).toBe(
      '<span class="au-plan au-plan-pro">Profesional</span>',
    );
    expect(cell({ kind: 'plan', key: 'plan' }, { plan: 'Premium' })).toContain('au-plan-premium');
    expect(cell({ kind: 'plan', key: 'plan' }, { plan: 'Básico' })).toBe(
      '<span class="au-plan">Básico</span>',
    );
  });

  it('número: separador de miles', () => {
    expect(cell({ kind: 'number', key: 'n' }, { n: 1248 })).toBe('1,248');
  });

  it('un campo ausente se muestra como un guion', () => {
    expect(cell({ kind: 'text', key: 'x' }, {})).toBe('—');
    expect(cell({ kind: 'date', key: 'x' }, {})).toBe('—');
  });

  it('un tipo desconocido se trata como texto escapado', () => {
    expect(cell({ kind: /** @type {any} */ ('raro'), key: 'n' }, { n: '<i>' })).toBe('&lt;i&gt;');
  });
});
