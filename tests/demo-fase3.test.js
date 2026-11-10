// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { createDraft } from '../src/js/demo/edicion.js';
import {
  seccionesDe,
  validarPaso,
  primerPasoInvalido,
  respuestaServidor,
} from '../src/js/demo/formularios.js';
import { revisarArchivos, tamano, LIMITES } from '../src/js/demo/archivos.js';

/** Spec 012, Fase 3: lógica pura de edición (RF-09), formularios (RF-05) y archivos (RF-15). */
describe('createDraft (RF-09)', () => {
  it('no está sucio al empezar y se ensucia al cambiar', () => {
    const d = createDraft({ a: '1', b: '2' });
    expect(d.isDirty()).toBe(false);
    expect(d.set('a', '9')).toBe(true);
    expect(d.isDirty()).toBe(true);
    expect(d.changed()).toEqual(['a']);
  });
  it('ignora cambios iguales y campos desconocidos', () => {
    const d = createDraft({ a: '1' });
    expect(d.set('a', '1')).toBe(false);
    expect(d.set('x', '1')).toBe(false);
    expect(d.canUndo()).toBe(false);
  });
  it('deshace el último cambio y devuelve el valor anterior', () => {
    const d = createDraft({ a: '1', b: '2' });
    d.set('a', '5');
    d.set('b', '6');
    expect(d.undo()).toEqual({ field: 'b', value: '2' });
    expect(d.values()).toEqual({ a: '5', b: '2' });
    expect(d.undo()).toEqual({ field: 'a', value: '1' });
    expect(d.isDirty()).toBe(false);
    expect(d.undo()).toBeNull();
  });
  it('volver al valor original deja de estar sucio', () => {
    const d = createDraft({ a: '1' });
    d.set('a', '2');
    d.set('a', '1');
    expect(d.isDirty()).toBe(false);
  });
  it('guardar fija la base y limpia el historial; descartar la restaura', () => {
    const d = createDraft({ a: '1' });
    d.set('a', '2');
    d.save();
    expect(d.isDirty()).toBe(false);
    expect(d.canUndo()).toBe(false);
    d.set('a', '3');
    d.discard();
    expect(d.values()).toEqual({ a: '2' });
  });
});

describe('formularios (RF-05 · CA-06)', () => {
  it('lista las secciones de cada grado', () => {
    expect(seccionesDe('2.º Primaria')).toEqual(['A', 'B', 'C']);
    expect(seccionesDe('')).toEqual([]);
  });
  it('el paso 1 vacío marca nombre y grado', () => {
    expect(Object.keys(validarPaso(1, {}))).toEqual(['nombre', 'grado']);
  });
  it('rechaza una sección que no pertenece al grado', () => {
    expect(validarPaso(1, { nombre: 'Ana', grado: '3.º Primaria', seccion: 'C' })).toHaveProperty('seccion');
  });
  it('el paso 2 exige tutor y período', () => {
    expect(Object.keys(validarPaso(2, {}))).toEqual(['tutor1', 'periodo']);
  });
  it('encuentra el primer paso inválido', () => {
    expect(primerPasoInvalido({ nombre: 'Ana', grado: '1.º Primaria', seccion: 'A' })?.paso).toBe(2);
    expect(
      primerPasoInvalido({
        nombre: 'Ana',
        grado: '1.º Primaria',
        seccion: 'A',
        tutor1: 'Luis',
        periodo: 'x',
      }),
    ).toBeNull();
  });
  it('el servidor simulado rechaza el nombre duplicado', () => {
    expect(respuestaServidor({ nombre: ' Duplicado ' })).toHaveProperty('nombre');
    expect(respuestaServidor({ nombre: 'Ana' })).toEqual({});
  });
});

describe('archivos (RF-15)', () => {
  const ok = { name: 'a.pdf', type: 'application/pdf', size: 1000 };
  it('acepta tipos y tamaños permitidos', () => {
    expect(revisarArchivos([ok]).aceptados).toHaveLength(1);
  });
  it('rechaza tipo no permitido y archivo grande con motivo', () => {
    const r = revisarArchivos([
      { name: 'x.exe', type: 'application/x-msdownload', size: 1 },
      { ...ok, size: LIMITES.maxBytes + 1 },
    ]);
    expect(r.rechazados.map((x) => x.name)).toEqual(['x.exe', 'a.pdf']);
    expect(r.rechazados[1].motivo).toMatch(/máximo/);
  });
  it('respeta la cantidad máxima', () => {
    const r = revisarArchivos(
      Array.from({ length: 7 }, () => ok),
      0,
    );
    expect(r.aceptados).toHaveLength(LIMITES.maxArchivos);
    expect(r.rechazados).toHaveLength(2);
  });
  it('formatea tamaños', () => {
    expect(tamano(500)).toBe('500 B');
    expect(tamano(1536)).toBe('1.5 KB');
    expect(tamano(3 * 1024 * 1024)).toBe('3.0 MB');
  });
});
