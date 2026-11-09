#!/usr/bin/env node
/**
 * Genera los datos de demostración de la galería (spec 012) en `public/data/`:
 * `estudiantes.json`, `docentes.json`, `reporte.json` y `tablero.json`.
 *
 * Los NOMBRES se piden una sola vez a la API pública randomuser.me, con semilla fija
 * (`aulard-demo`) y solo los campos `name` y `gender`: sin fotos, correos ni teléfonos.
 * El resto de los campos (grado, sección, estado, notas, pagos) se calcula con un generador
 * pseudoaleatorio con la misma semilla, de modo que el resultado es el mismo cada vez.
 *
 * Los datos son ficticios. Las páginas NUNCA llaman a esa API: leen los JSON ya generados.
 *
 * Uso: `node scripts/build-fixtures.mjs` (necesita red; no forma parte de `npm run check`).
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SEED = 'aulard-demo';
const RESULTS = 120;
const URL = `https://randomuser.me/api/?seed=${SEED}&nat=es&results=${RESULTS}&inc=name,gender&noinfo`;
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/data');

/**
 * Generador pseudoaleatorio con semilla (mulberry32).
 * @param {string} seed Texto semilla.
 * @returns {() => number} Función que devuelve números en [0, 1).
 */
function rng(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(h ^ seed.charCodeAt(i), 3432918353) << 13) | (h >>> 19);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = rng(SEED);
/**
 * Elige un elemento al azar.
 * @template T
 * @param {T[]} list Lista.
 * @returns {T} Elemento elegido.
 */
const pick = (list) => list[Math.floor(rand() * list.length)];
/**
 * Entero al azar en un rango cerrado.
 * @param {number} min Mínimo.
 * @param {number} max Máximo.
 * @returns {number} Entero en [min, max].
 */
const int = (min, max) => min + Math.floor(rand() * (max - min + 1));
/**
 * Número con dos dígitos.
 * @param {number} n Número.
 * @returns {string} Texto con ceros a la izquierda.
 */
const two = (n) => String(n).padStart(2, '0');
/**
 * Elige un valor según su peso.
 * @param {[string, number][]} pairs Pares [valor, peso].
 * @returns {string} Valor elegido.
 */
const weighted = (pairs) => {
  let r = rand() * pairs.reduce((s, [, w]) => s + w, 0);
  for (const [value, weight] of pairs) if ((r -= weight) < 0) return value;
  return pairs[0][0];
};

const res = await fetch(URL);
if (!res.ok) {
  console.error(`✖ randomuser.me respondió ${res.status}. Intente de nuevo más tarde.`);
  process.exit(1);
}
const { results } = await res.json();
const names = [...new Set(results.map((/** @type {any} */ u) => `${u.name.first} ${u.name.last}`))];
if (names.length < 102) {
  console.error(`✖ Se esperaban al menos 102 nombres distintos y llegaron ${names.length}.`);
  process.exit(1);
}

const GRADOS = [
  ...[1, 2, 3, 4, 5, 6].map((n) => `${n}.º Primaria`),
  ...[1, 2, 3, 4, 5, 6].map((n) => `${n}.º Secundaria`),
];
const AREAS = ['Matemática', 'Lengua Española', 'Ciencias Naturales', 'Ciencias Sociales', 'Inglés', 'Educación Física', 'Informática', 'Arte'];

const estudiantes = names.slice(0, 60).map((nombre, i) => ({
  id: `est-${String(i + 1).padStart(3, '0')}`,
  nombre,
  grado: pick(GRADOS),
  seccion: pick(['A', 'B', 'C']),
  tutor: names[60 + (i % 30)],
  estado: weighted([['Activo', 80], ['Inactivo', 12], ['Retirado', 8]]),
  matricula: `2026-${String(i + 1).padStart(4, '0')}`,
  ingreso: `${int(2022, 2026)}-${two(int(1, 12))}-${two(int(1, 28))}`,
}));

const docentes = names.slice(90, 102).map((nombre, i) => ({
  id: `doc-${two(i + 1)}`,
  nombre,
  area: AREAS[i % AREAS.length],
  secciones: int(1, 5),
  estado: weighted([['Activo', 90], ['Licencia', 10]]),
}));

const reporte = estudiantes.map((e) => ({
  periodo: '2026-2027',
  estudianteId: e.id,
  nombre: e.nombre,
  grado: e.grado,
  estado: e.estado,
  asistencia: int(72, 100),
  promedio: int(62, 99),
  pagos: weighted([['Pagado', 60], ['Pendiente', 25], ['Vencido', 15]]),
  monto: pick([9800, 12500]),
}));

const COLUMNAS = ['nuevas', 'revision', 'aprobadas'];
const tablero = estudiantes.slice(0, 12).map((e, i) => ({
  id: `sol-${two(i + 1)}`,
  titulo: `Matrícula de ${e.nombre}`,
  responsable: docentes[i % docentes.length].nombre,
  columna: COLUMNAS[i % COLUMNAS.length],
  prioridad: pick(['Alta', 'Media', 'Baja']),
  fecha: `2026-${two(int(8, 11))}-${two(int(1, 28))}`,
}));

// ── Spec 013: datos de los módulos de gestión. Se generan DESPUÉS de los anteriores para que
// la secuencia pseudoaleatoria de los archivos ya publicados no cambie.
const MUNICIPIOS = [
  'Santo Domingo Este',
  'Santiago de los Caballeros',
  'La Vega',
  'San Cristóbal',
  'Puerto Plata',
  'La Romana',
  'San Pedro de Macorís',
  'Higüey',
];
const PRECIO = { Básico: 2500, Profesional: 6900, Premium: 15000 };

const instituciones = Array.from({ length: 24 }, (_, i) => ({
  id: `ins-${String(i + 1).padStart(3, '0')}`,
  nombre: `Centro educativo de demostración ${i + 1}`,
  municipio: pick(MUNICIPIOS),
  plan: weighted([['Básico', 40], ['Profesional', 40], ['Premium', 20]]),
  estudiantes: int(80, 2400),
  estado: weighted([['Activo', 75], ['Período de prueba', 15], ['Suspendida', 10]]),
}));

const usuariosInternos = Array.from({ length: 10 }, (_, i) => ({
  id: `usr-${two(i + 1)}`,
  nombre: names[(102 + i) % names.length],
  rol: pick(['Administrador', 'Soporte', 'Contabilidad', 'Ventas', 'Auditoría']),
  ultimoAcceso: `2026-11-${two(int(1, 8))}`,
  estado: weighted([['Activo', 85], ['Inactivo', 15]]),
}));

const suscripciones = instituciones.map((ins, i) => {
  const inicioMes = int(1, 9);
  return {
    id: `sus-${String(i + 1).padStart(3, '0')}`,
    institucion: ins.nombre,
    plan: ins.plan,
    inicio: `2026-${two(inicioMes)}-${two(int(1, 28))}`,
    vence: `2027-${two(inicioMes)}-${two(int(1, 28))}`,
    monto: PRECIO[/** @type {keyof typeof PRECIO} */ (ins.plan)],
    estado: weighted([['Vigente', 70], ['Por vencer', 20], ['Vencido', 10]]),
  };
});

const facturas = Array.from({ length: 30 }, (_, i) => ({
  id: `fac-${String(i + 1).padStart(4, '0')}`,
  institucion: pick(instituciones).nombre,
  concepto: pick(['Suscripción mensual', 'Suscripción anual', 'Módulo adicional']),
  monto: pick([2500, 6900, 15000]),
  fecha: `2026-${two(int(8, 11))}-${two(int(1, 28))}`,
  estado: weighted([['Pagado', 65], ['Pendiente', 25], ['Vencido', 10]]),
}));

const MESES = ['Septiembre', 'Octubre', 'Noviembre', 'Diciembre', 'Enero', 'Febrero', 'Marzo', 'Abril'];
const cuenta = MESES.map((mes, i) => ({
  id: `cta-${two(i + 1)}`,
  concepto: `Cuota de ${mes}`,
  vence: `${i < 4 ? 2026 : 2027}-${two([9, 10, 11, 12, 1, 2, 3, 4][i])}-13`,
  monto: 12500,
  estado: i < 2 ? 'Pagado' : i === 2 ? 'Pendiente' : 'Pendiente',
}));

/**
 * Escribe un JSON con sangría de 2 espacios y salto de línea final.
 * @param {string} file Nombre del archivo.
 * @param {unknown} data Contenido.
 * @returns {void}
 */
const write = (file, data) => writeFileSync(resolve(OUT, file), `${JSON.stringify(data, null, 2)}\n`);
write('estudiantes.json', estudiantes);
write('docentes.json', docentes);
write('reporte.json', reporte);
write('tablero.json', tablero);
write('instituciones.json', instituciones);
write('usuarios-internos.json', usuariosInternos);
write('suscripciones.json', suscripciones);
write('facturas.json', facturas);
write('cuenta.json', cuenta);
console.warn(
  `✔ ${estudiantes.length} estudiantes, ${docentes.length} docentes, ${reporte.length} filas de reporte y ${tablero.length} tarjetas → public/data/`,
);
