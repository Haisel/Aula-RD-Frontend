// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { pageContext } from '../src/data/pages.js';

/**
 * Spec 013 · RF-01 / CA-01: ningún enlace del menú ni de las páginas puede quedar sin destino.
 *
 * Es una prueba de TRINQUETE: las listas `PENDIENTES_*` son la deuda actual y solo pueden
 * encoger. Un enlace muerto nuevo hace fallar la prueba; cuando se arregla uno, la prueba
 * obliga a quitarlo de la lista. Al cierre de la Fase 1 deben quedar vacías.
 */
const SRC = resolve(import.meta.dirname, '../src');

/** Páginas cuyo menú representa a cada portal y a la galería. */
const MENUS = [
  'dashboard-superadmin.html',
  'dashboard-institucion.html',
  'dashboard-docente.html',
  'dashboard-tutor.html',
  'galeria.html',
];

/** Ítems de menú que aún apuntan a una página que no existe (portal | etiqueta | destino). */
const PENDIENTES_MENU = [
  'dashboard-superadmin.html | Instituciones | #instituciones',
  'dashboard-superadmin.html | Planes | #planes',
  'dashboard-superadmin.html | Suscripciones | #suscripciones',
  'dashboard-superadmin.html | Cobros | #cobros',
  'dashboard-superadmin.html | Soporte | #soporte',
  'dashboard-superadmin.html | Publicidad | #publicidad',
  'dashboard-superadmin.html | Contabilidad | #contabilidad',
  'dashboard-superadmin.html | Usuarios internos | #usuarios',
  'dashboard-superadmin.html | Configuración | #configuracion',
  'dashboard-institucion.html | Estudiantes | #estudiantes',
  'dashboard-institucion.html | Docentes | #docentes',
  'dashboard-institucion.html | Matrícula | #matricula',
  'dashboard-institucion.html | Calificaciones | #calificaciones',
  'dashboard-institucion.html | Asistencia | #asistencia',
  'dashboard-institucion.html | Cobros | #cobros',
  'dashboard-institucion.html | Comunicados | #comunicados',
  'dashboard-institucion.html | Reportes | #reportes',
  'dashboard-institucion.html | Configuración | #configuracion',
  'dashboard-docente.html | Mis secciones | #secciones',
  'dashboard-docente.html | Asistencia | #asistencia',
  'dashboard-docente.html | Calificaciones | #calificaciones',
  'dashboard-docente.html | Planificación | #planificacion',
  'dashboard-docente.html | Comunicados | #comunicados',
  'dashboard-docente.html | Mensajes | #mensajes',
  'dashboard-tutor.html | Calificaciones | #calificaciones',
  'dashboard-tutor.html | Asistencia | #asistencia',
  'dashboard-tutor.html | Estado de cuenta | #cuenta',
  'dashboard-tutor.html | Horario | #horario',
  'dashboard-tutor.html | Comunicados | #comunicados',
  'dashboard-tutor.html | Autorizaciones | #autorizaciones',
];

/** Archivos con `href="#"` vacío y cuántos tienen (páginas y parciales). */
const PENDIENTES_VACIOS = {
  'dashboard-institucion.html': 2,
  'dashboard-superadmin.html': 1,
  'index.html': 1,
  'login.html': 1,
  'suscribir.html': 2,
  'partials/app/topbar.hbs': 5,
  'partials/landing/footer.hbs': 3,
};

/**
 * @typedef {object} NavNode
 * @property {string} label Texto del ítem.
 * @property {string} [href] Destino (los grupos no tienen).
 * @property {NavNode[]} [children] Hijos de un grupo plegable.
 */

/**
 * Aplana el menú: los grupos se sustituyen por sus hijos (spec 013, T-02).
 * @param {NavNode[]} items Ítems del menú.
 * @returns {NavNode[]} Solo enlaces.
 */
const flat = (items) => items.flatMap((i) => (i.children ? flat(i.children) : [i]));

/**
 * Lista los archivos `.html` y `.hbs` de `src/` (páginas y parciales).
 * @param {string} dir Directorio.
 * @returns {string[]} Rutas absolutas.
 */
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = resolve(dir, e.name);
    if (e.isDirectory()) return e.name === 'js' || e.name === 'scss' ? [] : walk(p);
    return /\.(html|hbs)$/.test(e.name) ? [p] : [];
  });

const FILES = walk(SRC);

describe('enlaces sin destino (spec 013 · RF-01)', () => {
  it('los ítems de menú muertos son exactamente los pendientes (el trinquete solo encoge)', () => {
    const muertos = [];
    for (const page of MENUS) {
      const { nav } = /** @type {{ nav: NavNode[] }} */ (pageContext(page));
      for (const item of flat(nav)) {
        const ok = /\.html$/.test(item.href ?? '') && existsSync(resolve(SRC, item.href ?? ''));
        if (!ok) muertos.push(`${page} | ${item.label} | ${item.href}`);
      }
    }
    expect(muertos.sort()).toEqual([...PENDIENTES_MENU].sort());
  });

  it('los href="#" vacíos son exactamente los pendientes (el trinquete solo encoge)', () => {
    /** @type {Record<string, number>} */
    const vacios = {};
    for (const file of FILES) {
      const n = (readFileSync(file, 'utf8').match(/href="#"/g) ?? []).length;
      if (n) vacios[relative(SRC, file).split(sep).join('/')] = n;
    }
    expect(vacios).toEqual(PENDIENTES_VACIOS);
  });

  it('todo enlace a una página .html de la plantilla apunta a un archivo que existe', () => {
    const rotos = [];
    for (const file of FILES) {
      const text = readFileSync(file, 'utf8');
      for (const m of text.matchAll(/href\s*=\s*"([a-z0-9-]+\.html)(?:#[^"]*)?"/gi)) {
        if (!existsSync(resolve(SRC, m[1])))
          rotos.push(`${relative(SRC, file).split(sep).join('/')} → ${m[1]}`);
      }
    }
    expect(rotos).toEqual([]);
  });
});
