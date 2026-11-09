// @ts-check
/**
 * Datos de demostración de los módulos (spec 013, Fase 1): soporte, publicidad, contabilidad,
 * matrícula, comunicados, secciones, notas, asistencia y autorizaciones.
 *
 * A diferencia de `build-fixtures.mjs`, este script NO usa la red: deriva los datos de los JSON
 * que ya están en `public/data/` con una semilla fija, así que cada ejecución da el mismo resultado.
 * Los nombres siguen siendo genéricos (sin datos personales reales).
 *
 * Uso: `node scripts/build-fixtures-modulos.mjs`
 * @module scripts/build-fixtures-modulos
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/data');

/**
 * Generador pseudoaleatorio con semilla (mulberry32).
 * @param {string} seed Semilla.
 * @returns {() => number} Función que devuelve números en [0, 1).
 */
function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
  let a = (h << 13) | (h >>> 19);
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng('aulard-modulos');
/**
 * Elemento al azar de una lista.
 * @template T
 * @param {T[]} list Lista.
 * @returns {T} Elemento.
 */
const pick = (list) => list[Math.floor(rand() * list.length)];
/**
 * Entero al azar entre dos límites (incluidos).
 * @param {number} min Mínimo.
 * @param {number} max Máximo.
 * @returns {number} Entero.
 */
const int = (min, max) => min + Math.floor(rand() * (max - min + 1));
const two = (/** @type {number} */ n) => String(n).padStart(2, '0');
/**
 * Fecha ISO a partir de un día del año escolar 2026-2027.
 * @param {number} month Mes (1-12).
 * @param {number} day Día.
 * @returns {string} `AAAA-MM-DD`.
 */
const iso = (month, day) => `${month >= 8 ? 2026 : 2027}-${two(month)}-${two(day)}`;

/**
 * Lee un JSON de `public/data/`.
 * @param {string} file Archivo.
 * @returns {any[]} Filas.
 */
const read = (file) => JSON.parse(readFileSync(resolve(OUT, file), 'utf8'));
/**
 * Escribe un JSON de `public/data/`.
 * @param {string} file Archivo.
 * @param {unknown} data Datos.
 * @returns {void}
 */
const write = (file, data) => writeFileSync(resolve(OUT, file), `${JSON.stringify(data, null, 2)}\n`);

const estudiantes = read('estudiantes.json');
const instituciones = read('instituciones.json');
const docentes = read('docentes.json');

write(
  'tickets.json',
  Array.from({ length: 14 }, (_, i) => ({
    id: `TK-${String(1001 + i)}`,
    institucion: pick(instituciones).nombre,
    asunto: pick([
      'No puedo registrar la asistencia',
      'Error al exportar calificaciones',
      'Cambio de plan de suscripción',
      'Factura con monto incorrecto',
      'Agregar un usuario administrador',
      'La importación de estudiantes falla',
    ]),
    prioridad: pick(['Alta', 'Media', 'Baja']),
    estado: pick(['Abierto', 'En proceso', 'Resuelto', 'Resuelto']),
    fecha: iso(11, int(1, 8)),
  })),
);

write(
  'campanas.json',
  [
    ['Inicio de año escolar', 'Correo', 'Activa'],
    ['Descuento por pago anual', 'Banner', 'Activa'],
    ['Webinar de calificaciones', 'Redes', 'Programado'],
    ['Referidos: invite a otra institución', 'Correo', 'Pausada'],
    ['Plan Premium de prueba', 'Banner', 'Finalizada'],
    ['Guía de matrícula en línea', 'Redes', 'Activa'],
    ['Encuesta de satisfacción', 'Correo', 'Finalizada'],
    ['Nuevo módulo de cobros', 'Banner', 'Programado'],
  ].map(([nombre, canal, estado], i) => ({
    id: `CP-${String(i + 1).padStart(2, '0')}`,
    nombre,
    canal,
    inicio: iso(9 + (i % 4), int(1, 20)),
    alcance: int(8, 90) * 100,
    estado,
  })),
);

write(
  'asientos.json',
  Array.from({ length: 16 }, (_, i) => {
    const ingreso = i % 3 !== 2;
    const monto = pick([2500, 6900, 15000, 4200, 850]);
    return {
      id: `AS-${String(2001 + i)}`,
      fecha: iso(10 + (i % 3), int(1, 28)),
      concepto: ingreso
        ? pick(['Suscripción mensual', 'Suscripción anual', 'Módulo adicional'])
        : pick(['Hosting y servidores', 'Comisión de pasarela de pago', 'Soporte contratado']),
      cuenta: ingreso ? 'Ingresos por suscripciones' : 'Gastos operativos',
      debe: ingreso ? 0 : monto,
      haber: ingreso ? monto : 0,
      estado: pick(['Conciliado', 'Conciliado', 'Por conciliar']),
    };
  }),
);

write(
  'matriculas.json',
  estudiantes.slice(0, 14).map((e, i) => ({
    id: `MT-${String(3001 + i)}`,
    estudiante: e.nombre,
    grado: e.grado,
    tutor: e.tutor,
    fecha: iso(8 + (i % 3), int(1, 28)),
    estado: pick(['En revisión', 'En revisión', 'Aprobada', 'Aprobada', 'Aprobada', 'Rechazada']),
  })),
);

write(
  'comunicados.json',
  [
    ['Calendario del primer corte de notas', 'Todos los grados'],
    ['Reunión de padres y tutores', '4.º Primaria · B'],
    ['Recordatorio de pago de noviembre', 'Todos los grados'],
    ['Excursión al Museo de Historia Natural', '5.º Primaria · A'],
    ['Cambio de horario por actividad deportiva', 'Secundaria'],
    ['Feria de ciencias: inscripción abierta', 'Todos los grados'],
    ['Vacunación escolar', 'Inicial'],
    ['Entrega de boletines', 'Todos los grados'],
    ['Suspensión de clases por lluvias', 'Todos los grados'],
    ['Convocatoria al club de ajedrez', 'Primaria'],
  ].map(([asunto, destinatarios], i) => ({
    id: `CM-${String(4001 + i)}`,
    asunto,
    destinatarios,
    autor: pick(docentes).nombre,
    fecha: iso(10 + (i % 3), int(1, 28)),
    estado: i === 0 ? 'Programado' : i === 6 ? 'Borrador' : 'Enviado',
  })),
);

write(
  'secciones.json',
  [
    ['4.º Primaria · B', 'Matemática'],
    ['5.º Primaria · A', 'Matemática'],
    ['1.º Secundaria · A', 'Matemática'],
    ['1.º Secundaria · B', 'Matemática'],
    ['2.º Secundaria · B', 'Estadística'],
    ['3.º Secundaria · A', 'Matemática'],
    ['3.º Secundaria · C', 'Estadística'],
    ['Club de ajedrez', 'Extracurricular'],
  ].map(([seccion, area], i) => ({
    id: `SC-${String(i + 1).padStart(2, '0')}`,
    seccion,
    area,
    estudiantes: int(22, 34),
    aula: `Aula ${int(1, 12)}`,
    horario: pick(['Lun y mié, 8:00', 'Mar y jue, 9:30', 'Lun a vie, 7:30', 'Vie, 2:00']),
    estado: 'Activo',
  })),
);

write(
  'notas.json',
  [
    'Matemática',
    'Lengua Española',
    'Ciencias de la Naturaleza',
    'Ciencias Sociales',
    'Inglés',
    'Educación Física',
    'Educación Artística',
  ].map((asignatura) => {
    const p1 = int(78, 99);
    const p2 = int(78, 99);
    const p3 = int(78, 99);
    const promedio = Math.round((p1 + p2 + p3) / 3);
    return { asignatura, p1, p2, p3, promedio, estado: promedio >= 70 ? 'Aprobado' : 'Pendiente' };
  }),
);

write(
  'asistencia-hijo.json',
  Array.from({ length: 15 }, (_, i) => {
    const estado = i === 4 ? 'Ausente' : i === 9 ? 'Tardanza' : 'Presente';
    return {
      id: `AT-${String(i + 1).padStart(2, '0')}`,
      fecha: iso(10 + (i > 9 ? 1 : 0), i > 9 ? i - 9 : 12 + i),
      estado,
      nota: estado === 'Ausente' ? 'Justificada con certificado médico' : estado === 'Tardanza' ? 'Llegó a las 8:25' : '',
    };
  }),
);

write('autorizaciones.json', [
  { id: 'AU-01', actividad: 'Excursión al Museo de Historia Natural', fecha: '2026-11-20', vence: '2026-11-15', estado: 'Pendiente' },
  { id: 'AU-02', actividad: 'Uso de imagen en la revista escolar', fecha: '2026-12-01', vence: '2026-11-25', estado: 'Pendiente' },
  { id: 'AU-03', actividad: 'Torneo deportivo interescolar', fecha: '2026-10-18', vence: '2026-10-10', estado: 'Firmada' },
  { id: 'AU-04', actividad: 'Feria de ciencias', fecha: '2026-10-05', vence: '2026-09-30', estado: 'Firmada' },
  { id: 'AU-05', actividad: 'Visita a la biblioteca nacional', fecha: '2026-09-22', vence: '2026-09-15', estado: 'Firmada' },
  { id: 'AU-06', actividad: 'Salida a la playa de fin de año', fecha: '2026-12-14', vence: '2026-12-05', estado: 'Pendiente' },
]);

process.stdout.write('✔ 9 archivos de datos de módulos en public/data/\n');
