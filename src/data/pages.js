// @ts-check
/**
 * Contexto de Handlebars para las páginas de ejemplo (solo en build/dev; no llega al navegador).
 *
 * Define, por página: título, descripción, portal, menú lateral y usuario de ejemplo.
 * Los datos de usuarios e instituciones son FICTICIOS (fixtures, ARCHITECTURE §5) y solo
 * sirven para mostrar la plantilla. En su backend, sustitúyalos por datos reales.
 * @module data/pages
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cell } from './cells.js';

/** Carpeta de los datos de demostración (`public/data/`). */
const DATA_DIR = fileURLToPath(new URL('../../public/data/', import.meta.url));

/**
 * Lee un JSON de demostración de `public/data/`. Solo se usa al generar las páginas, nunca en el navegador.
 * @param {string} file Nombre del archivo.
 * @returns {Record<string, unknown>[]} Filas.
 */
function loadData(file) {
  return JSON.parse(readFileSync(resolve(DATA_DIR, file), 'utf8'));
}

/**
 * @typedef {object} NavItem
 * @property {string} label Texto del enlace.
 * @property {string} icon Clase de Bootstrap Icons sin `bi-`.
 * @property {string} [href] Destino (un grupo con `children` no tiene).
 * @property {string|number} [badge] Contador opcional.
 * @property {string} [section] Si existe, se pinta un encabezado de sección antes del ítem.
 * @property {NavItem[]} [children] Si existe, el ítem es un grupo plegable con estos hijos.
 */

/** @type {Record<string, NavItem[]>} */
const NAV = {
  'super-admin': [
    { label: 'Resumen', icon: 'grid-1x2', href: 'dashboard-superadmin.html' },
    { label: 'Instituciones', icon: 'building', href: 'superadmin-instituciones.html' },
    { label: 'Planes', icon: 'layers', href: '#planes' },
    { label: 'Suscripciones', icon: 'credit-card', href: 'superadmin-suscripciones.html', badge: 7 },
    { label: 'Cobros', icon: 'cash-coin', href: 'superadmin-cobros.html' },
    { label: 'Soporte', icon: 'life-preserver', href: '#soporte', badge: 12 },
    { label: 'Publicidad', icon: 'badge-ad', href: '#publicidad', section: 'Negocio' },
    { label: 'Contabilidad', icon: 'journal-bookmark', href: '#contabilidad' },
    { label: 'Usuarios internos', icon: 'people', href: 'superadmin-usuarios.html', section: 'Sistema' },
    { label: 'Componentes', icon: 'palette', href: 'componentes.html' },
    { label: 'Galería', icon: 'grid-3x3-gap', href: 'galeria.html' },
    { label: 'Configuración', icon: 'gear', href: '#configuracion' },
  ],
  'institution-admin': [
    { label: 'Inicio', icon: 'house-door', href: 'dashboard-institucion.html' },
    { label: 'Estudiantes', icon: 'people', href: 'institucion-estudiantes.html' },
    { label: 'Docentes', icon: 'person-badge', href: 'institucion-docentes.html' },
    { label: 'Matrícula', icon: 'clipboard-check', href: '#matricula' },
    { label: 'Calificaciones', icon: 'journal-text', href: '#calificaciones' },
    { label: 'Asistencia', icon: 'calendar3', href: '#asistencia' },
    {
      label: 'Cobros',
      icon: 'cash-coin',
      href: 'institucion-cobros.html',
      badge: 37,
      section: 'Administración',
    },
    { label: 'Comunicados', icon: 'megaphone', href: '#comunicados' },
    { label: 'Reportes', icon: 'bar-chart-line', href: '#reportes' },
    { label: 'Configuración', icon: 'gear', href: '#configuracion' },
    { label: 'Galería', icon: 'grid-3x3-gap', href: 'galeria.html', section: 'Ejemplos' },
  ],
  teacher: [
    { label: 'Inicio', icon: 'house-door', href: 'dashboard-docente.html' },
    { label: 'Mis secciones', icon: 'collection', href: '#secciones' },
    { label: 'Asistencia', icon: 'calendar-check', href: '#asistencia' },
    { label: 'Calificaciones', icon: 'journal-text', href: '#calificaciones', badge: 2 },
    { label: 'Planificación', icon: 'calendar3', href: '#planificacion' },
    { label: 'Comunicados', icon: 'megaphone', href: '#comunicados', section: 'Comunicación' },
    { label: 'Mensajes', icon: 'chat-left-text', href: '#mensajes' },
    { label: 'Galería', icon: 'grid-3x3-gap', href: 'galeria.html', section: 'Ejemplos' },
  ],
  'student-guardian': [
    { label: 'Inicio', icon: 'house-door', href: 'dashboard-tutor.html' },
    { label: 'Calificaciones', icon: 'journal-text', href: '#calificaciones' },
    { label: 'Asistencia', icon: 'calendar-check', href: '#asistencia' },
    { label: 'Estado de cuenta', icon: 'receipt', href: 'familia-estado-de-cuenta.html', badge: 1 },
    { label: 'Horario', icon: 'clock', href: '#horario' },
    { label: 'Comunicados', icon: 'megaphone', href: '#comunicados', section: 'Comunicación' },
    { label: 'Autorizaciones', icon: 'pen', href: '#autorizaciones' },
    { label: 'Galería', icon: 'grid-3x3-gap', href: 'galeria.html', section: 'Ejemplos' },
  ],
  // Galería de funcionalidades (spec 012): se amplía en cada fase con las páginas que se publican.
  galeria: [
    { label: 'Galería', icon: 'grid-3x3-gap', href: 'galeria.html' },
    {
      label: 'Interfaz',
      icon: 'palette2',
      section: 'Plantilla',
      children: [
        { label: 'Botones', icon: 'hand-index', href: 'ejemplo-botones.html' },
        { label: 'Alertas', icon: 'bell', href: 'ejemplo-alertas.html' },
        { label: 'Modales', icon: 'window-stack', href: 'ejemplo-modales.html' },
        { label: 'Tarjetas', icon: 'card-text', href: 'ejemplo-tarjetas.html' },
        { label: 'Estados', icon: 'inbox', href: 'ejemplo-estados.html' },
      ],
    },
    {
      label: 'Perfiles',
      icon: 'person-vcard',
      children: [
        { label: 'Con portada', icon: 'image', href: 'perfil-portada.html' },
        { label: 'Tarjeta lateral', icon: 'layout-sidebar', href: 'perfil-lateral.html' },
        { label: 'Compacto', icon: 'list-ul', href: 'perfil-compacto.html' },
        { label: 'Credencial', icon: 'person-badge', href: 'perfil-credencial.html' },
        { label: 'Institución', icon: 'building', href: 'perfil-institucion.html' },
        { label: 'Editable', icon: 'pencil-square', href: 'perfil-editable.html' },
      ],
    },
    {
      label: 'Formularios',
      icon: 'ui-checks',
      children: [
        { label: 'Controles básicos', icon: 'input-cursor-text', href: 'formulario-basico.html' },
        { label: 'Diseños', icon: 'layout-three-columns', href: 'formulario-disenos.html' },
        { label: 'Validación', icon: 'shield-check', href: 'formulario-validacion.html' },
        { label: 'Por secciones', icon: 'list-nested', href: 'formulario-secciones.html' },
        { label: 'Avanzado', icon: 'sliders', href: 'formulario-avanzado.html' },
        { label: 'Asistente por pasos', icon: 'signpost-split', href: 'formulario-asistente.html' },
        { label: 'Editor de texto', icon: 'type', href: 'formulario-editor.html' },
        { label: 'Carga de archivos', icon: 'cloud-upload', href: 'formulario-archivos.html' },
        { label: 'Firma', icon: 'pen', href: 'formulario-firma.html' },
      ],
    },
    { label: 'Catálogo de componentes', icon: 'palette', href: 'componentes.html', section: 'Otras páginas' },
    { label: 'Panel de la plataforma', icon: 'speedometer2', href: 'dashboard-superadmin.html' },
    { label: 'Panel de la institución', icon: 'building', href: 'dashboard-institucion.html' },
    { label: 'Panel docente', icon: 'person-badge', href: 'dashboard-docente.html' },
    { label: 'Portal de familia', icon: 'people', href: 'dashboard-tutor.html' },
  ],
};

/** Usuario genérico de las páginas de la galería (no representa a ninguna persona real). */
const GALLERY_USER = { name: 'Persona de demostración', role: 'Galería de componentes', initials: 'PD' };

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
  'login-centrado.html': {
    title: 'Inicio de sesión centrado',
    description: 'Variante de inicio de sesión: tarjeta centrada sobre fondo neutro.',
    layout: 'auth',
  },
  'login-ilustracion.html': {
    title: 'Inicio de sesión con ilustración',
    description: 'Variante de inicio de sesión: formulario, acceso con proveedor externo y panel ilustrado.',
    layout: 'auth',
  },
  'login-minimo.html': {
    title: 'Inicio de sesión mínimo',
    description: 'Variante de inicio de sesión sin tarjeta: barra superior y formulario.',
    layout: 'auth',
  },
  'login-portada.html': {
    title: 'Inicio de sesión con portada',
    description: 'Variante de inicio de sesión: fondo a pantalla completa y tarjeta translúcida.',
    layout: 'auth',
  },
  'login-portales.html': {
    title: 'Inicio de sesión por portal',
    description: 'Variante de inicio de sesión con pestañas para dirección, docentes y familias.',
    layout: 'auth',
  },
  'login-codigo.html': {
    title: 'Inicio de sesión con código',
    description: 'Variante de inicio de sesión sin contraseña: código de un solo uso de 6 dígitos.',
    layout: 'auth',
  },
  'recuperar-contrasena.html': {
    title: 'Recuperar contraseña',
    description: 'Solicite las instrucciones para crear una contraseña nueva.',
    layout: 'auth',
  },
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
  'galeria.html': {
    title: 'Galería de funcionalidades',
    description:
      'Páginas de ejemplo por contexto: cada funcionalidad de los componentes, funcionando y con su uso.',
    portal: 'galeria',
    active: 'galeria.html',
    user: GALLERY_USER,
  },
  'ejemplo-botones.html': {
    title: 'Botones',
    description: 'Variantes, tamaños, íconos, grupos, desplegables y estados de los botones.',
    portal: 'galeria',
    active: 'ejemplo-botones.html',
    user: GALLERY_USER,
  },
  'ejemplo-alertas.html': {
    title: 'Alertas y avisos',
    description: 'Alertas en línea, avisos emergentes, diálogos y banners.',
    portal: 'galeria',
    active: 'ejemplo-alertas.html',
    user: GALLERY_USER,
  },
  'ejemplo-modales.html': {
    title: 'Modales y paneles',
    description: 'Modales de Bootstrap, paneles laterales, confirmaciones y ventanas emergentes.',
    portal: 'galeria',
    active: 'ejemplo-modales.html',
    user: GALLERY_USER,
  },
  'ejemplo-tarjetas.html': {
    title: 'Tarjetas',
    description: 'Tarjetas personalizadas: indicadores, personas, planes, progreso, listas y más.',
    portal: 'galeria',
    active: 'ejemplo-tarjetas.html',
    user: GALLERY_USER,
  },
  'ejemplo-estados.html': {
    title: 'Estados de la interfaz',
    description: 'Vacío, cargando, error, sin permiso, sin conexión y páginas de error.',
    portal: 'galeria',
    active: 'ejemplo-estados.html',
    user: GALLERY_USER,
  },
  '403.html': {
    title: 'Acceso denegado',
    description: 'No tiene permiso para ver esta página. Pida acceso a la persona administradora.',
  },
  '404.html': {
    title: 'Página no encontrada',
    description: 'La dirección no existe o la página fue movida. Vuelva al inicio de Aula RD.',
  },
  '500.html': {
    title: 'Algo salió mal',
    description: 'Ocurrió un problema de nuestro lado. Intente de nuevo en unos minutos.',
  },
  'mantenimiento.html': {
    title: 'Estamos en mantenimiento',
    description: 'Aula RD está en mantenimiento y volverá pronto. Sus datos están seguros.',
  },
};

/**
 * @typedef {object} ModuleConfig
 * @property {string} portal Portal al que pertenece (clave de `NAV`).
 * @property {'table'} archetype Arquetipo de la página.
 * @property {string} title Título.
 * @property {string} subtitle Descripción corta.
 * @property {string} source Archivo de datos en `public/data/`.
 * @property {import('./cells.js').Column[]} columns Columnas de la tabla (la primera da nombre a la fila).
 * @property {string} [primary] Texto del botón principal de alta.
 */

/**
 * Módulos de gestión (spec 013): cada ítem de menú abre una página con su arquetipo y sus datos.
 * @type {Record<string, ModuleConfig>}
 */
const MODULES = {
  'superadmin-instituciones.html': {
    portal: 'super-admin',
    archetype: 'table',
    title: 'Instituciones',
    subtitle: 'Colegios y centros educativos suscritos a la plataforma.',
    source: 'instituciones.json',
    primary: 'Nueva institución',
    columns: [
      { key: 'nombre', label: 'Institución', kind: 'entity', meta: 'municipio' },
      { key: 'plan', label: 'Plan', kind: 'plan' },
      { key: 'estudiantes', label: 'Estudiantes', kind: 'number' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
  'superadmin-usuarios.html': {
    portal: 'super-admin',
    archetype: 'table',
    title: 'Usuarios internos',
    subtitle: 'Personas del equipo con acceso al panel de la plataforma.',
    source: 'usuarios-internos.json',
    primary: 'Nuevo usuario',
    columns: [
      { key: 'nombre', label: 'Persona', kind: 'entity', meta: 'rol' },
      { key: 'rol', label: 'Rol' },
      { key: 'ultimoAcceso', label: 'Último acceso', kind: 'date' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
  'superadmin-suscripciones.html': {
    portal: 'super-admin',
    archetype: 'table',
    title: 'Suscripciones',
    subtitle: 'Planes contratados por cada institución y su vigencia.',
    source: 'suscripciones.json',
    primary: 'Nueva suscripción',
    columns: [
      { key: 'institucion', label: 'Institución' },
      { key: 'plan', label: 'Plan', kind: 'plan' },
      { key: 'inicio', label: 'Inicio', kind: 'date' },
      { key: 'vence', label: 'Vence', kind: 'date' },
      { key: 'monto', label: 'Cuota mensual', kind: 'money' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
  'superadmin-cobros.html': {
    portal: 'super-admin',
    archetype: 'table',
    title: 'Cobros',
    subtitle: 'Facturas emitidas a las instituciones por la suscripción a la plataforma.',
    source: 'facturas.json',
    primary: 'Registrar pago',
    columns: [
      { key: 'id', label: 'Factura' },
      { key: 'institucion', label: 'Institución' },
      { key: 'concepto', label: 'Concepto' },
      { key: 'monto', label: 'Monto', kind: 'money' },
      { key: 'fecha', label: 'Fecha', kind: 'date' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
  'institucion-estudiantes.html': {
    portal: 'institution-admin',
    archetype: 'table',
    title: 'Estudiantes',
    subtitle: 'Matrícula de la institución por grado y sección.',
    source: 'estudiantes.json',
    primary: 'Agregar estudiante',
    columns: [
      { key: 'nombre', label: 'Estudiante', kind: 'entity', meta: 'matricula' },
      { key: 'grado', label: 'Grado' },
      { key: 'seccion', label: 'Sección' },
      { key: 'tutor', label: 'Tutor' },
      { key: 'ingreso', label: 'Ingreso', kind: 'date' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
  'institucion-docentes.html': {
    portal: 'institution-admin',
    archetype: 'table',
    title: 'Docentes',
    subtitle: 'Personal docente, su área y las secciones que atiende.',
    source: 'docentes.json',
    primary: 'Agregar docente',
    columns: [
      { key: 'nombre', label: 'Docente', kind: 'entity', meta: 'area' },
      { key: 'area', label: 'Área' },
      { key: 'secciones', label: 'Secciones', kind: 'number' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
  'institucion-cobros.html': {
    portal: 'institution-admin',
    archetype: 'table',
    title: 'Cobros',
    subtitle: 'Cuotas de los estudiantes y su estado de pago.',
    source: 'cobros.json',
    primary: 'Registrar pago',
    columns: [
      { key: 'estudiante', label: 'Estudiante', kind: 'entity', meta: 'grado' },
      { key: 'tutor', label: 'Tutor' },
      { key: 'monto', label: 'Monto', kind: 'money' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
  'familia-estado-de-cuenta.html': {
    portal: 'student-guardian',
    archetype: 'table',
    title: 'Estado de cuenta',
    subtitle: 'Cuotas del año escolar, sus vencimientos y su estado.',
    source: 'cuenta.json',
    columns: [
      { key: 'concepto', label: 'Concepto' },
      { key: 'vence', label: 'Vence', kind: 'date' },
      { key: 'monto', label: 'Monto', kind: 'money' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
};

/** Dashboard de cada portal: de él toman el usuario y la institución de ejemplo. */
const DASHBOARD_OF = {
  'super-admin': 'dashboard-superadmin.html',
  'institution-admin': 'dashboard-institucion.html',
  teacher: 'dashboard-docente.html',
  'student-guardian': 'dashboard-tutor.html',
};

for (const [file, cfg] of Object.entries(MODULES)) {
  const dash = /** @type {Record<string, any>} */ (PAGES)[
    DASHBOARD_OF[/** @type {keyof typeof DASHBOARD_OF} */ (cfg.portal)]
  ];
  /** @type {Record<string, any>} */ (PAGES)[file] = {
    title: cfg.title,
    description: cfg.subtitle,
    portal: cfg.portal,
    active: file,
    user: dash.user,
    org: dash.org,
    module: cfg,
  };
}

/**
 * Variantes de perfil (spec 013, V-02): página → título, descripción y perfil de `perfiles.json`
 * que muestra. Todas viven en el portal de la galería.
 */
const PROFILE_PAGES = {
  'perfil-portada.html': {
    profile: 'docente',
    title: 'Perfil con portada',
    description: 'Perfil de una persona con portada y pestañas de resumen, actividad y seguridad.',
  },
  'perfil-lateral.html': {
    profile: 'tutor',
    title: 'Perfil con tarjeta lateral',
    description:
      'Perfil con tarjeta de contacto a un lado y el detalle, los estudiantes y la actividad al otro.',
  },
  'perfil-compacto.html': {
    profile: 'estudiante',
    title: 'Perfil compacto',
    description: 'Perfil en una sola columna con indicadores, datos y línea de tiempo de actividad.',
  },
  'perfil-credencial.html': {
    profile: 'estudiante',
    title: 'Perfil tipo credencial',
    description: 'Ficha de identificación imprimible con matrícula, vigencia y código QR.',
  },
  'perfil-institucion.html': {
    profile: 'institucion',
    title: 'Perfil de institución',
    description: 'Ficha de una institución con plan, indicadores, niveles y actividad reciente.',
  },
  'perfil-editable.html': {
    profile: 'docente',
    title: 'Perfil editable',
    description: 'Formulario para editar los datos del perfil, con validación por campo.',
  },
};

for (const [file, cfg] of Object.entries(PROFILE_PAGES)) {
  /** @type {Record<string, any>} */ (PAGES)[file] = {
    title: cfg.title,
    description: cfg.description,
    portal: 'galeria',
    active: file,
    user: GALLERY_USER,
    profileKey: cfg.profile,
    crumbs: [{ label: 'Galería', href: 'galeria.html' }, { label: 'Perfiles' }, { label: cfg.title }],
  };
}

/**
 * Páginas de formularios (spec 013, V-03): cada una enseña una técnica distinta. Portal de la galería.
 */
const FORM_PAGES = {
  'formulario-basico.html': {
    title: 'Controles básicos',
    description: 'Campos de texto, números, fechas, listas, casillas, interruptores, rangos, tamaños y estados.',
  },
  'formulario-disenos.html': {
    title: 'Diseños de formulario',
    description: 'El mismo formulario en diseño horizontal, en línea y con etiquetas flotantes.',
  },
  'formulario-validacion.html': {
    title: 'Validación',
    description: 'Estados válido e inválido, mensajes por campo en español y validación con esquema Zod.',
  },
  'formulario-secciones.html': {
    title: 'Formulario por secciones',
    description: 'Un formulario largo agrupado en secciones con leyenda, ayudas y validación.',
  },
  'formulario-avanzado.html': {
    title: 'Formulario avanzado',
    description: 'Listas con búsqueda y selección múltiple, fechas, máscaras dominicanas y orden por arrastre.',
  },
  'formulario-asistente.html': {
    title: 'Asistente por pasos',
    description: 'Un formulario dividido en pasos con avance, retroceso y resumen antes de enviar.',
  },
  'formulario-editor.html': {
    title: 'Editor de texto',
    description: 'Editor de texto enriquecido para redactar un comunicado, con validación.',
  },
  'formulario-archivos.html': {
    title: 'Carga de archivos',
    description: 'Campos de archivo nativos: uno, varios y solo imágenes, con sus límites explicados.',
  },
  'formulario-firma.html': {
    title: 'Firma',
    description: 'Autorización firmada con el dedo o el ratón sobre un lienzo, con validación.',
  },
};

for (const [file, cfg] of Object.entries(FORM_PAGES)) {
  /** @type {Record<string, any>} */ (PAGES)[file] = {
    title: cfg.title,
    description: cfg.description,
    portal: 'galeria',
    active: file,
    user: GALLERY_USER,
    crumbs: [{ label: 'Galería', href: 'galeria.html' }, { label: 'Formularios' }, { label: cfg.title }],
  };
}

/**
 * Perfiles de demostración de `public/data/perfiles.json` (solo al generar las páginas).
 * @returns {Record<string, Record<string, any>>} Perfiles por clave.
 */
function loadProfiles() {
  return /** @type {any} */ (JSON.parse(readFileSync(resolve(DATA_DIR, 'perfiles.json'), 'utf8')));
}

/**
 * Resuelve un módulo para las plantillas: lee sus datos y calcula lo que la tabla necesita.
 * @param {ModuleConfig | undefined} cfg Configuración del módulo.
 * @returns {(ModuleConfig & { rows: Record<string, unknown>[], labelKey: string, actionsIndex: number }) | undefined} Módulo listo.
 */
function resolveModule(cfg) {
  if (!cfg) return undefined;
  return {
    ...cfg,
    rows: loadData(cfg.source),
    labelKey: cfg.columns[0].key,
    actionsIndex: cfg.columns.length,
  };
}

/**
 * Marca la página activa en el menú. Un grupo (`children`) no está activo él mismo: queda
 * `open` (abierto) si alguno de sus hijos es la página actual.
 * @param {NavItem[]} items Ítems del menú.
 * @param {string | undefined} activeHref Página actual.
 * @returns {(NavItem & { active: boolean, open?: boolean })[]} Ítems con su estado.
 */
function buildNav(items, activeHref) {
  return items.map((item) => {
    if (!item.children) return { ...item, active: item.href === activeHref };
    const children = item.children.map((c) => ({ ...c, active: c.href === activeHref }));
    return { ...item, children, active: false, open: children.some((c) => c.active) };
  });
}

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
  const module = resolveModule(/** @type {any} */ (page).module);
  // Migas de pan de una página de módulo: Inicio (dashboard de su portal) › módulo actual.
  const crumbs = module
    ? [
        { label: 'Inicio', href: DASHBOARD_OF[/** @type {keyof typeof DASHBOARD_OF} */ (module.portal)] },
        { label: module.title },
      ]
    : /** @type {any} */ (page).crumbs;
  const profileKey = /** @type {any} */ (page).profileKey;
  const profile = profileKey ? loadProfiles()[profileKey] : undefined;
  const nav = portal ? buildNav(NAV[portal], /** @type {any} */ (page).active) : [];
  return {
    ...page,
    module,
    profile,
    crumbs,
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
   * Celda de una tabla de arquetipo: `{{{cell this ..}}}` dentro de `{{#each columns}}` (spec 013).
   * @param {import('./cells.js').Column} column Columna.
   * @param {Record<string, unknown>} row Fila.
   * @returns {string} HTML ya escapado.
   */
  cell: (column, row) => cell(column, row),
  /**
   * Serializa un valor a JSON (para `<script type="application/json">`).
   * @param {unknown} v Valor.
   * @returns {string} JSON.
   */
  json: (v) => JSON.stringify(v),
  /**
   * Bloque en bruto `{{{{code}}}}…{{{{/code}}}}`: muestra su contenido como TEXTO (escapado y sin
   * ejecutarse) dentro de `<pre><code>`. Se usa en los bloques "Cómo se usa" de la galería.
   * @param {{ fn: () => string }} options Bloque de Handlebars (contenido sin procesar).
   * @returns {string} HTML con el texto escapado y sin la sangría común.
   */
  code(options) {
    const lines = options
      .fn()
      .replace(/^\n+|\s+$/g, '')
      .split('\n');
    const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => /^ */.exec(l)?.[0].length ?? 0));
    const text = lines.map((l) => l.slice(indent)).join('\n');
    const safe = text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    return `<pre class="au-code" tabindex="0"><code>${safe}</code></pre>`;
  },
};
