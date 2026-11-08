// @ts-check
/**
 * Contexto de Handlebars para las páginas de ejemplo (solo en build/dev; no llega al navegador).
 *
 * Define, por página: título, descripción, portal, menú lateral y usuario de ejemplo.
 * Los datos de usuarios e instituciones son FICTICIOS (fixtures, ARCHITECTURE §5) y solo
 * sirven para mostrar la plantilla. En su backend, sustitúyalos por datos reales.
 * @module data/pages
 */

/**
 * @typedef {object} NavItem
 * @property {string} label Texto del enlace.
 * @property {string} icon Clase de Bootstrap Icons sin `bi-`.
 * @property {string} href Destino.
 * @property {string|number} [badge] Contador opcional.
 * @property {string} [section] Si existe, se pinta un encabezado de sección antes del ítem.
 */

/** @type {Record<string, NavItem[]>} */
const NAV = {
  'super-admin': [
    { label: 'Resumen', icon: 'grid-1x2', href: 'dashboard-superadmin.html' },
    { label: 'Instituciones', icon: 'building', href: '#instituciones' },
    { label: 'Planes', icon: 'layers', href: '#planes' },
    { label: 'Suscripciones', icon: 'credit-card', href: '#suscripciones', badge: 7 },
    { label: 'Cobros', icon: 'cash-coin', href: '#cobros' },
    { label: 'Soporte', icon: 'life-preserver', href: '#soporte', badge: 12 },
    { label: 'Publicidad', icon: 'badge-ad', href: '#publicidad', section: 'Negocio' },
    { label: 'Contabilidad', icon: 'journal-bookmark', href: '#contabilidad' },
    { label: 'Usuarios internos', icon: 'people', href: '#usuarios', section: 'Sistema' },
    { label: 'Componentes', icon: 'palette', href: 'componentes.html' },
    { label: 'Configuración', icon: 'gear', href: '#configuracion' },
  ],
  'institution-admin': [
    { label: 'Inicio', icon: 'house-door', href: 'dashboard-institucion.html' },
    { label: 'Estudiantes', icon: 'people', href: '#estudiantes' },
    { label: 'Docentes', icon: 'person-badge', href: '#docentes' },
    { label: 'Matrícula', icon: 'clipboard-check', href: '#matricula' },
    { label: 'Calificaciones', icon: 'journal-text', href: '#calificaciones' },
    { label: 'Asistencia', icon: 'calendar3', href: '#asistencia' },
    { label: 'Cobros', icon: 'cash-coin', href: '#cobros', badge: 37, section: 'Administración' },
    { label: 'Comunicados', icon: 'megaphone', href: '#comunicados' },
    { label: 'Reportes', icon: 'bar-chart-line', href: '#reportes' },
    { label: 'Configuración', icon: 'gear', href: '#configuracion' },
  ],
  teacher: [
    { label: 'Inicio', icon: 'house-door', href: 'dashboard-docente.html' },
    { label: 'Mis secciones', icon: 'collection', href: '#secciones' },
    { label: 'Asistencia', icon: 'calendar-check', href: '#asistencia' },
    { label: 'Calificaciones', icon: 'journal-text', href: '#calificaciones', badge: 2 },
    { label: 'Planificación', icon: 'calendar3', href: '#planificacion' },
    { label: 'Comunicados', icon: 'megaphone', href: '#comunicados', section: 'Comunicación' },
    { label: 'Mensajes', icon: 'chat-left-text', href: '#mensajes' },
  ],
  'student-guardian': [
    { label: 'Inicio', icon: 'house-door', href: 'dashboard-tutor.html' },
    { label: 'Calificaciones', icon: 'journal-text', href: '#calificaciones' },
    { label: 'Asistencia', icon: 'calendar-check', href: '#asistencia' },
    { label: 'Estado de cuenta', icon: 'receipt', href: '#cuenta', badge: 1 },
    { label: 'Horario', icon: 'clock', href: '#horario' },
    { label: 'Comunicados', icon: 'megaphone', href: '#comunicados', section: 'Comunicación' },
    { label: 'Autorizaciones', icon: 'pen', href: '#autorizaciones' },
  ],
};

const ORG = { name: 'Colegio San Rafael', plan: 'Profesional', initials: 'SR' };

/** Metadatos por página. Claves = ruta relativa a `src/`. */
const PAGES = {
  'index.html': {
    title: 'Gestión escolar para República Dominicana',
    description:
      'Matrícula, calificaciones, asistencia y cobros conectados. Suscriba su institución a Aula RD.',
    layout: 'landing',
  },
  'suscribir.html': {
    title: 'Suscribir institución',
    description: 'Registre su institución en Aula RD.',
    layout: 'auth',
  },
  'login.html': { title: 'Iniciar sesión', description: 'Acceda a su cuenta de Aula RD.', layout: 'auth' },
  'dashboard-superadmin.html': {
    title: 'Resumen de la plataforma',
    portal: 'super-admin',
    active: 'dashboard-superadmin.html',
    user: { name: 'Haisel Ramírez', role: 'Superadmin', initials: 'HR' },
  },
  'dashboard-institucion.html': {
    title: 'Panel de la institución',
    portal: 'institution-admin',
    active: 'dashboard-institucion.html',
    org: ORG,
    user: { name: 'Ana Martínez', role: 'Directora', initials: 'AM' },
  },
  'dashboard-docente.html': {
    title: 'Panel docente',
    portal: 'teacher',
    active: 'dashboard-docente.html',
    org: ORG,
    user: { name: 'Luis Peña', role: 'Docente de Matemática', initials: 'LP' },
  },
  'dashboard-tutor.html': {
    title: 'Portal de familia',
    portal: 'student-guardian',
    active: 'dashboard-tutor.html',
    org: ORG,
    user: { name: 'Rosa Peña', role: 'Tutora', initials: 'RP' },
  },
  'componentes.html': {
    title: 'Componentes',
    portal: 'super-admin',
    active: 'componentes.html',
    user: { name: 'Haisel Ramírez', role: 'Superadmin', initials: 'HR' },
  },
};

/**
 * Contexto de una página.
 * @param {string} pagePath Ruta de la página (p. ej. `/index.html` en dev o `index.html` en build).
 * @param {{ dev?: boolean, single?: boolean }} [env] Entorno.
 * @returns {Record<string, unknown>} Contexto para Handlebars.
 */
export function pageContext(pagePath, env = {}) {
  const key = pagePath.replace(/^\//, '');
  const page = PAGES[/** @type {keyof typeof PAGES} */ (key)] ?? { title: 'Aula RD' };
  const portal = /** @type {any} */ (page).portal;
  const nav = portal
    ? NAV[portal].map((item) => ({ ...item, active: item.href === /** @type {any} */ (page).active }))
    : [];
  return {
    ...page,
    nav,
    isSuperAdmin: portal === 'super-admin',
    year: new Date().getFullYear(),
    dev: Boolean(env.dev),
    single: Boolean(env.single),
  };
}

/** Helpers de Handlebars para las páginas. */
export const helpers = {
  /**
   * Igualdad estricta para `{{#if (eq a b)}}`.
   * @param {unknown} a Primer valor.
   * @param {unknown} b Segundo valor.
   * @returns {boolean} `true` si son iguales.
   */
  eq: (a, b) => a === b,
  /**
   * Serializa un valor a JSON (para `<script type="application/json">`).
   * @param {unknown} v Valor.
   * @returns {string} JSON.
   */
  json: (v) => JSON.stringify(v),
};
