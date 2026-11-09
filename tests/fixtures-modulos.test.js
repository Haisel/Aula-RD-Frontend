// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Spec 013 · T-05 (RF-11): datos de demostración de los módulos que genera
 * `scripts/build-fixtures-modulos.mjs`. Sin datos personales; fechas ISO; ids únicos.
 */
const DATA = resolve(import.meta.dirname, '../public/data');
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Lee un JSON de `public/data/`.
 * @param {string} file Archivo.
 * @returns {any[]} Filas.
 */
const load = (file) => JSON.parse(readFileSync(resolve(DATA, file), 'utf8'));

/** Archivo → { filas, campos exactos, estados permitidos, campos de fecha }. */
const ESPEC = {
  'tickets.json': {
    n: 14,
    campos: ['asunto', 'estado', 'fecha', 'id', 'institucion', 'prioridad'],
    estados: ['Abierto', 'En proceso', 'Resuelto'],
    fechas: ['fecha'],
  },
  'campanas.json': {
    n: 8,
    campos: ['alcance', 'canal', 'estado', 'id', 'inicio', 'nombre'],
    estados: ['Activa', 'Pausada', 'Finalizada', 'Programado'],
    fechas: ['inicio'],
  },
  'asientos.json': {
    n: 16,
    campos: ['concepto', 'cuenta', 'debe', 'estado', 'fecha', 'haber', 'id'],
    estados: ['Conciliado', 'Por conciliar'],
    fechas: ['fecha'],
  },
  'matriculas.json': {
    n: 14,
    campos: ['estado', 'estudiante', 'fecha', 'grado', 'id', 'tutor'],
    estados: ['En revisión', 'Aprobada', 'Rechazada'],
    fechas: ['fecha'],
  },
  'comunicados.json': {
    n: 10,
    campos: ['asunto', 'autor', 'destinatarios', 'estado', 'fecha', 'id'],
    estados: ['Enviado', 'Borrador', 'Programado'],
    fechas: ['fecha'],
  },
  'secciones.json': {
    n: 8,
    campos: ['area', 'aula', 'estado', 'estudiantes', 'horario', 'id', 'seccion'],
    estados: ['Activo'],
    fechas: [],
  },
  'notas.json': {
    n: 7,
    campos: ['asignatura', 'estado', 'p1', 'p2', 'p3', 'promedio'],
    estados: ['Aprobado', 'Pendiente'],
    fechas: [],
  },
  'asistencia-hijo.json': {
    n: 15,
    campos: ['estado', 'fecha', 'id', 'nota'],
    estados: ['Presente', 'Tardanza', 'Ausente'],
    fechas: ['fecha'],
  },
  'autorizaciones.json': {
    n: 6,
    campos: ['actividad', 'estado', 'fecha', 'id', 'vence'],
    estados: ['Pendiente', 'Firmada'],
    fechas: ['fecha', 'vence'],
  },
};

describe('datos de los módulos (spec 013 · T-05)', () => {
  for (const [file, e] of Object.entries(ESPEC)) {
    describe(file, () => {
      it(`tiene ${e.n} filas con los campos esperados`, () => {
        const rows = load(file);
        expect(rows).toHaveLength(e.n);
        for (const r of rows) expect(Object.keys(r).sort()).toEqual(e.campos);
      });

      it('los estados son los permitidos y los ids (si hay) no se repiten', () => {
        const rows = load(file);
        for (const r of rows) expect(e.estados).toContain(r.estado);
        if (rows[0].id) expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
      });

      it('las fechas son ISO válidas', () => {
        for (const r of load(file)) {
          for (const c of e.fechas) {
            expect(r[c], c).toMatch(ISO);
            expect(Number.isNaN(Date.parse(r[c])), `${c}: ${r[c]}`).toBe(false);
          }
        }
      });
    });
  }

  describe('planes.json', () => {
    const rows = () => load('planes.json');

    it('tiene los tres planes con sus campos', () => {
      expect(rows().map((r) => r.nombre)).toEqual(['Básico', 'Profesional', 'Premium']);
      for (const r of rows()) {
        expect(Object.keys(r).sort()).toEqual([
          'descripcion',
          'destacado',
          'estudiantes',
          'id',
          'incluye',
          'instituciones',
          'nombre',
          'precio',
        ]);
        expect(r.incluye.length).toBeGreaterThanOrEqual(3);
        expect(r.precio).toBeGreaterThan(0);
      }
    });

    it('un solo plan está destacado y las instituciones por plan suman las 24 de instituciones.json', () => {
      expect(rows().filter((r) => r.destacado)).toHaveLength(1);
      expect(rows().reduce((s, r) => s + r.instituciones, 0)).toBe(load('instituciones.json').length);
      for (const r of rows()) {
        expect(r.instituciones).toBe(load('instituciones.json').filter((i) => i.plan === r.nombre).length);
      }
    });
  });

  describe('mensajes.json', () => {
    it('tiene 8 mensajes con id único, fecha ISO, estado de lectura y texto', () => {
      const rows = load('mensajes.json');
      expect(rows).toHaveLength(8);
      expect(new Set(rows.map((r) => r.id)).size).toBe(8);
      for (const r of rows) {
        expect(Object.keys(r).sort()).toEqual(['asunto', 'cuerpo', 'de', 'fecha', 'id', 'leido']);
        expect(r.fecha).toMatch(ISO);
        expect(typeof r.leido).toBe('boolean');
        expect(r.cuerpo.length).toBeGreaterThan(20);
      }
      expect(rows.some((r) => !r.leido)).toBe(true);
    });
  });

  it('contabilidad: cada asiento tiene debe o haber, no los dos', () => {
    for (const r of load('asientos.json')) {
      expect(r.debe > 0 !== r.haber > 0, r.id).toBe(true);
    }
  });

  it('notas: el promedio es el de los tres períodos y el estado lo refleja', () => {
    for (const r of load('notas.json')) {
      expect(r.promedio).toBe(Math.round((r.p1 + r.p2 + r.p3) / 3));
      expect(r.estado).toBe(r.promedio >= 70 ? 'Aprobado' : 'Pendiente');
    }
  });

  it('autorizaciones: vence antes de la actividad', () => {
    for (const r of load('autorizaciones.json')) expect(r.vence <= r.fecha, r.id).toBe(true);
  });

  it('ningún dato trae enlaces ni correos reales', () => {
    for (const file of [...Object.keys(ESPEC), 'planes.json', 'mensajes.json']) {
      expect(readFileSync(resolve(DATA, file), 'utf8'), file).not.toMatch(/https?:\/\/|@/);
    }
  });
});
