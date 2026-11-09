// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Spec 012 · RF-12 / CA-14 / CA-16: datos de demostración de la galería.
 * Nombres genéricos generados una sola vez con randomuser.me (semilla fija); sin datos personales.
 */
const DATA = resolve(import.meta.dirname, '../public/data');

/**
 * Lee un JSON de `public/data/`.
 * @param {string} file Nombre del archivo.
 * @returns {any} Contenido.
 */
const load = (file) => JSON.parse(readFileSync(resolve(DATA, file), 'utf8'));

const FILES = ['estudiantes.json', 'docentes.json', 'reporte.json', 'tablero.json'];
const ESTADOS = ['Activo', 'Inactivo', 'Retirado'];
const PAGOS = ['Pagado', 'Pendiente', 'Vencido'];
const COLUMNAS = ['nuevas', 'revision', 'aprobadas'];
const ISO = /^\d{4}-\d{2}-\d{2}$/;

describe('datos de demostración de la galería (spec 012)', () => {
  it('existen los cuatro archivos', () => {
    for (const f of FILES) expect(existsSync(resolve(DATA, f)), f).toBe(true);
  });

  it('estudiantes: 60 con campos válidos e ids únicos', () => {
    const rows = load('estudiantes.json');
    expect(rows).toHaveLength(60);
    expect(new Set(rows.map((r) => r.id)).size).toBe(60);
    for (const r of rows) {
      expect(Object.keys(r).sort()).toEqual(['estado', 'grado', 'id', 'ingreso', 'matricula', 'nombre', 'seccion', 'tutor']);
      expect(ESTADOS).toContain(r.estado);
      expect(['A', 'B', 'C']).toContain(r.seccion);
      expect(r.matricula).toMatch(/^2026-\d{4}$/);
      expect(r.ingreso).toMatch(ISO);
      expect(r.nombre.trim().split(/\s+/).length).toBeGreaterThanOrEqual(2);
    }
  });

  it('docentes: 12 con campos válidos e ids únicos', () => {
    const rows = load('docentes.json');
    expect(rows).toHaveLength(12);
    expect(new Set(rows.map((r) => r.id)).size).toBe(12);
    for (const r of rows) {
      expect(Object.keys(r).sort()).toEqual(['area', 'estado', 'id', 'nombre', 'secciones']);
      expect(r.secciones).toBeGreaterThanOrEqual(1);
    }
  });

  it('reporte: una fila por estudiante, con valores en rango', () => {
    const rows = load('reporte.json');
    const ids = load('estudiantes.json').map((r) => r.id);
    expect(rows.map((r) => r.estudianteId).sort()).toEqual([...ids].sort());
    for (const r of rows) {
      expect(r.periodo).toBe('2026-2027');
      expect(r.asistencia).toBeGreaterThanOrEqual(0);
      expect(r.asistencia).toBeLessThanOrEqual(100);
      expect(r.promedio).toBeGreaterThanOrEqual(0);
      expect(r.promedio).toBeLessThanOrEqual(100);
      expect(PAGOS).toContain(r.pagos);
      expect(r.monto).toBeGreaterThan(0);
    }
  });

  it('tablero: tarjetas en columnas válidas con responsable existente', () => {
    const rows = load('tablero.json');
    const docentes = new Set(load('docentes.json').map((d) => d.nombre));
    expect(rows.length).toBeGreaterThanOrEqual(9);
    for (const r of rows) {
      expect(COLUMNAS).toContain(r.columna);
      expect(docentes.has(r.responsable), r.responsable).toBe(true);
      expect(r.fecha).toMatch(ISO);
    }
    for (const c of COLUMNAS) expect(rows.some((r) => r.columna === c), c).toBe(true);
  });

  it('sin datos personales: ni correos, ni teléfonos, ni cédulas, ni fotos (CA-14)', () => {
    for (const f of FILES) {
      const text = readFileSync(resolve(DATA, f), 'utf8');
      expect(text, `${f}: correo`).not.toMatch(/@/);
      expect(text, `${f}: cédula o teléfono`).not.toMatch(/\d{10,}/);
      expect(text, `${f}: clave personal`).not.toMatch(/"(email|telefono|cedula|foto|picture|direccion)"/i);
    }
  });

  it('el README documenta el origen y cómo regenerar (CA-16)', () => {
    const readme = readFileSync(resolve(DATA, 'README.md'), 'utf8');
    expect(readme).toMatch(/randomuser\.me/);
    expect(readme).toMatch(/aulard-demo/);
    expect(readme).toMatch(/build-fixtures/);
  });
});
