// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { createStore } from '../src/js/demo/store.js';
import { filtrar, resumen, porGrado } from '../src/js/demo/reporte.js';
import { agrupar, mover, contar } from '../src/js/demo/tablero.js';

/**
 * Spec 012 · T-14: lógica pura de las demostraciones (sin DOM), en memoria y sin persistir (RN-02).
 */

/**
 * Filas de ejemplo para el almacén.
 * @returns {{ id: string, nombre: string, grado: string }[]} Tres estudiantes.
 */
const filas = () => [
  { id: 'est-001', nombre: 'Ana Uno', grado: '1.º Primaria' },
  { id: 'est-002', nombre: 'Beto Dos', grado: '2.º Primaria' },
  { id: 'est-003', nombre: 'Cira Tres', grado: '3.º Primaria' },
];

describe('almacén en memoria del CRUD (RF-03)', () => {
  it('lista copias: modificarlas no cambia el almacén', () => {
    const s = createStore(filas());
    s.list()[0].nombre = 'Cambiado';
    expect(s.get('est-001')?.nombre).toBe('Ana Uno');
  });

  it('crea con el siguiente id consecutivo', () => {
    const s = createStore(filas());
    const r = s.create({ nombre: 'Dani Cuatro', grado: '4.º Primaria' });
    expect(r.id).toBe('est-004');
    expect(s.list()).toHaveLength(4);
  });

  it('el id nuevo no repite uno existente tras borrar', () => {
    const s = createStore(filas());
    s.remove('est-001');
    expect(s.create({ nombre: 'Nuevo' }).id).toBe('est-004');
  });

  it('actualiza solo los campos recibidos y devuelve la fila', () => {
    const s = createStore(filas());
    const r = s.update('est-002', { grado: '5.º Primaria' });
    expect(r).toMatchObject({ id: 'est-002', nombre: 'Beto Dos', grado: '5.º Primaria' });
  });

  it('actualizar o borrar un id que no existe devuelve null y no cambia nada', () => {
    const s = createStore(filas());
    expect(s.update('est-999', { nombre: 'x' })).toBeNull();
    expect(s.remove('est-999')).toBeNull();
    expect(s.list()).toHaveLength(3);
  });

  it('borra y devuelve la fila borrada', () => {
    const s = createStore(filas());
    expect(s.remove('est-002')?.nombre).toBe('Beto Dos');
    expect(s.list().map((r) => r.id)).toEqual(['est-001', 'est-003']);
  });

  it('deshacer una creación la quita', () => {
    const s = createStore(filas());
    s.create({ nombre: 'Nuevo' });
    expect(s.undo()?.type).toBe('create');
    expect(s.list()).toHaveLength(3);
  });

  it('deshacer una edición restaura los valores anteriores', () => {
    const s = createStore(filas());
    s.update('est-001', { nombre: 'Editado' });
    expect(s.undo()?.type).toBe('update');
    expect(s.get('est-001')?.nombre).toBe('Ana Uno');
  });

  it('deshacer un borrado devuelve la fila a su posición original', () => {
    const s = createStore(filas());
    s.remove('est-002');
    expect(s.undo()?.type).toBe('remove');
    expect(s.list().map((r) => r.id)).toEqual(['est-001', 'est-002', 'est-003']);
  });

  it('sin historial, deshacer devuelve null y canUndo es falso', () => {
    const s = createStore(filas());
    expect(s.canUndo()).toBe(false);
    expect(s.undo()).toBeNull();
  });

  it('deshace en orden inverso y conserva como máximo 20 cambios', () => {
    const s = createStore(filas());
    for (let i = 0; i < 25; i++) s.create({ nombre: `N${i}` });
    let deshechos = 0;
    while (s.undo()) deshechos++;
    expect(deshechos).toBe(20);
    expect(s.list()).toHaveLength(3 + 5);
  });
});

/**
 * Filas de ejemplo para el reporte.
 * @returns {object[]} Cuatro filas.
 */
const reporte = () => [
  { grado: '2.º Primaria', estado: 'Activo', asistencia: 90, promedio: 80, pagos: 'Pagado', monto: 9800 },
  { grado: '1.º Primaria', estado: 'Activo', asistencia: 80, promedio: 70, pagos: 'Pendiente', monto: 12500 },
  { grado: '1.º Primaria', estado: 'Retirado', asistencia: 70, promedio: 60, pagos: 'Vencido', monto: 9800 },
  { grado: '1.º Secundaria', estado: 'Activo', asistencia: 100, promedio: 90, pagos: 'Pagado', monto: 12500 },
];

describe('filtros y resumen del reporte (RF-04)', () => {
  it('un filtro vacío significa "todos"', () => {
    expect(filtrar(reporte(), { grado: '', estado: '', pagos: '' })).toHaveLength(4);
  });

  it('combina filtros', () => {
    expect(filtrar(reporte(), { grado: '1.º Primaria', estado: 'Activo', pagos: '' })).toHaveLength(1);
    expect(filtrar(reporte(), { grado: '', estado: '', pagos: 'Pagado' })).toHaveLength(2);
  });

  it('no modifica los datos de entrada', () => {
    const datos = reporte();
    filtrar(datos, { grado: '1.º Primaria', estado: '', pagos: '' });
    expect(datos).toHaveLength(4);
  });

  it('resume totales, promedios, pagos y monto pendiente', () => {
    const r = resumen(reporte());
    expect(r.total).toBe(4);
    expect(r.asistenciaMedia).toBe(85);
    expect(r.promedioMedio).toBe(75);
    expect(r.pagos).toEqual({ Pagado: 2, Pendiente: 1, Vencido: 1 });
    expect(r.montoPendiente).toBe(12500 + 9800);
  });

  it('sin filas, el resumen son ceros y no NaN', () => {
    const r = resumen([]);
    expect(r).toMatchObject({ total: 0, asistenciaMedia: 0, promedioMedio: 0, montoPendiente: 0 });
    expect(r.pagos).toEqual({ Pagado: 0, Pendiente: 0, Vencido: 0 });
  });

  it('promedio por grado, en el orden de los grados y solo los presentes', () => {
    const g = porGrado(reporte());
    expect(g.labels).toEqual(['1.º Primaria', '2.º Primaria', '1.º Secundaria']);
    expect(g.promedio).toEqual([65, 80, 90]);
  });
});

/**
 * Tarjetas de ejemplo para el tablero.
 * @returns {{ id: string, columna: string }[]} Cinco tarjetas.
 */
const tarjetas = () => [
  { id: 's1', columna: 'nuevas' },
  { id: 's2', columna: 'nuevas' },
  { id: 's3', columna: 'revision' },
  { id: 's4', columna: 'aprobadas' },
  { id: 's5', columna: 'nuevas' },
];

describe('tablero (kanban) (spec 012)', () => {
  it('agrupa por columna conservando el orden', () => {
    const g = agrupar(tarjetas());
    expect(g.nuevas.map((t) => t.id)).toEqual(['s1', 's2', 's5']);
    expect(g.revision.map((t) => t.id)).toEqual(['s3']);
    expect(g.aprobadas.map((t) => t.id)).toEqual(['s4']);
  });

  it('cuenta por columna', () => {
    expect(contar(tarjetas())).toEqual({ nuevas: 3, revision: 1, aprobadas: 1 });
  });

  it('mueve una tarjeta a otra columna sin tocar el original', () => {
    const datos = tarjetas();
    const nuevo = mover(datos, 's1', 'aprobadas');
    expect(nuevo.find((t) => t.id === 's1')?.columna).toBe('aprobadas');
    expect(datos.find((t) => t.id === 's1')?.columna).toBe('nuevas');
  });

  it('mueve a una posición dentro de la columna de destino', () => {
    const nuevo = mover(tarjetas(), 's5', 'revision', 0);
    expect(agrupar(nuevo).revision.map((t) => t.id)).toEqual(['s5', 's3']);
  });

  it('una tarjeta que no existe deja todo igual', () => {
    expect(mover(tarjetas(), 'zzz', 'revision')).toEqual(tarjetas());
  });

  it('una columna desconocida es un error', () => {
    expect(() => mover(tarjetas(), 's1', 'archivadas')).toThrow(/Columna desconocida/);
  });
});
