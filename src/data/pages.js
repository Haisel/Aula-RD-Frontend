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
import { cell, formatMoney, formatIsoDate } from './cells.js';

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
    { label: 'Planes', icon: 'layers', href: 'superadmin-planes.html' },
    { label: 'Suscripciones', icon: 'credit-card', href: 'superadmin-suscripciones.html', badge: 7 },
    { label: 'Cobros', icon: 'cash-coin', href: 'superadmin-cobros.html' },
    { label: 'Soporte', icon: 'life-preserver', href: 'superadmin-soporte.html', badge: 12 },
    { label: 'Publicidad', icon: 'badge-ad', href: 'superadmin-publicidad.html', section: 'Negocio' },
    { label: 'Contabilidad', icon: 'journal-bookmark', href: 'superadmin-contabilidad.html' },
    { label: 'Usuarios internos', icon: 'people', href: 'superadmin-usuarios.html', section: 'Sistema' },
    { label: 'Componentes', icon: 'palette', href: 'componentes.html' },
    { label: 'Galería', icon: 'grid-3x3-gap', href: 'galeria.html' },
    { label: 'Configuración', icon: 'gear', href: 'superadmin-configuracion.html' },
  ],
  'institution-admin': [
    { label: 'Inicio', icon: 'house-door', href: 'dashboard-institucion.html' },
    { label: 'Estudiantes', icon: 'people', href: 'institucion-estudiantes.html' },
    { label: 'Docentes', icon: 'person-badge', href: 'institucion-docentes.html' },
    { label: 'Matrícula', icon: 'clipboard-check', href: 'institucion-matricula.html' },
    { label: 'Calificaciones', icon: 'journal-text', href: 'institucion-calificaciones.html' },
    { label: 'Asistencia', icon: 'calendar3', href: 'institucion-asistencia.html' },
    {
      label: 'Cobros',
      icon: 'cash-coin',
      href: 'institucion-cobros.html',
      badge: 37,
      section: 'Administración',
    },
    { label: 'Comunicados', icon: 'megaphone', href: 'institucion-comunicados.html' },
    { label: 'Reportes', icon: 'bar-chart-line', href: 'institucion-reportes.html' },
    { label: 'Configuración', icon: 'gear', href: 'institucion-configuracion.html' },
    { label: 'Galería', icon: 'grid-3x3-gap', href: 'galeria.html', section: 'Ejemplos' },
  ],
  teacher: [
    { label: 'Inicio', icon: 'house-door', href: 'dashboard-docente.html' },
    { label: 'Mis secciones', icon: 'collection', href: 'docente-secciones.html' },
    { label: 'Asistencia', icon: 'calendar-check', href: 'docente-asistencia.html' },
    { label: 'Calificaciones', icon: 'journal-text', href: 'docente-calificaciones.html', badge: 2 },
    { label: 'Planificación', icon: 'calendar3', href: 'docente-planificacion.html' },
    { label: 'Comunicados', icon: 'megaphone', href: 'docente-comunicados.html', section: 'Comunicación' },
    { label: 'Mensajes', icon: 'chat-left-text', href: 'docente-mensajes.html' },
    { label: 'Galería', icon: 'grid-3x3-gap', href: 'galeria.html', section: 'Ejemplos' },
  ],
  'student-guardian': [
    { label: 'Inicio', icon: 'house-door', href: 'dashboard-tutor.html' },
    { label: 'Calificaciones', icon: 'journal-text', href: 'familia-calificaciones.html' },
    { label: 'Asistencia', icon: 'calendar-check', href: 'familia-asistencia.html' },
    { label: 'Estado de cuenta', icon: 'receipt', href: 'familia-estado-de-cuenta.html', badge: 1 },
    { label: 'Horario', icon: 'clock', href: 'familia-horario.html' },
    { label: 'Comunicados', icon: 'megaphone', href: 'familia-comunicados.html', section: 'Comunicación' },
    { label: 'Autorizaciones', icon: 'pen', href: 'familia-autorizaciones.html' },
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
      label: 'Datos',
      icon: 'database',
      children: [
        { label: 'Tablas', icon: 'table', href: 'ejemplo-tablas.html' },
        { label: 'CRUD', icon: 'pencil-square', href: 'ejemplo-crud.html' },
        { label: 'Reporte', icon: 'bar-chart-line', href: 'ejemplo-reporte.html' },
        { label: 'Tablero', icon: 'kanban', href: 'ejemplo-kanban.html' },
      ],
    },
    {
      label: 'Aplicaciones',
      icon: 'grid-1x2',
      children: [
        { label: 'Chat', icon: 'chat-dots', href: 'app-chat.html' },
        { label: 'Proyectos', icon: 'folder2-open', href: 'app-proyectos.html' },
        { label: 'Contactos', icon: 'person-lines-fill', href: 'app-contactos.html' },
        { label: 'Galería de imágenes', icon: 'images', href: 'app-galeria.html' },
        { label: 'Búsqueda', icon: 'search', href: 'app-busqueda.html' },
      ],
    },
    {
      label: 'Paneles y gráficos',
      icon: 'bar-chart-line',
      children: [
        { label: 'Gráficos y widgets', icon: 'graph-up', href: 'graficos.html' },
        { label: 'Panel financiero', icon: 'cash-stack', href: 'panel-financiero.html' },
        { label: 'Panel académico', icon: 'mortarboard', href: 'panel-academico.html' },
      ],
    },
    {
      label: 'Cuenta y ayuda',
      icon: 'person-gear',
      children: [
        { label: 'Mi cuenta', icon: 'person-circle', href: 'cuenta.html' },
        { label: 'Ayuda', icon: 'question-circle', href: 'ayuda.html' },
        { label: 'Componentes de interfaz', icon: 'puzzle', href: 'interfaz-componentes.html' },
        { label: 'Inicio rápido', icon: 'rocket-takeoff', href: 'inicio-rapido.html' },
        { label: 'Referencia de AU', icon: 'braces', href: 'referencia-au.html' },
      ],
    },
    {
      label: 'Avanzado',
      icon: 'stars',
      children: [
        { label: 'Formularios', icon: 'ui-checks', href: 'ejemplo-formularios.html' },
        { label: 'Edición', icon: 'pencil', href: 'ejemplo-edicion.html' },
        { label: 'Perfiles por rol', icon: 'person-badge', href: 'ejemplo-perfiles.html' },
        { label: 'Archivos', icon: 'cloud-upload', href: 'ejemplo-archivos.html' },
        { label: 'Calendario', icon: 'calendar3', href: 'ejemplo-calendario.html' },
        { label: 'Navegación', icon: 'signpost-split', href: 'ejemplo-navegacion.html' },
        { label: 'Impresión', icon: 'printer', href: 'ejemplo-impresion.html' },
      ],
    },
    {
      label: 'Autenticación',
      icon: 'box-arrow-in-right',
      children: [
        { label: 'Dividido con marca', icon: 'layout-sidebar-inset', href: 'login.html' },
        { label: 'Centrado en tarjeta', icon: 'square', href: 'login-centrado.html' },
        { label: 'Con ilustración', icon: 'image', href: 'login-ilustracion.html' },
        { label: 'Mínimo', icon: 'dash-square', href: 'login-minimo.html' },
        { label: 'Con portada', icon: 'card-image', href: 'login-portada.html' },
        { label: 'Por portal', icon: 'segmented-nav', href: 'login-portales.html' },
        { label: 'Con código', icon: 'key', href: 'login-codigo.html' },
        { label: 'Recuperar contraseña', icon: 'arrow-counterclockwise', href: 'recuperar-contrasena.html' },
        { label: 'Crear cuenta', icon: 'person-plus', href: 'registro.html' },
        { label: 'Contraseña nueva', icon: 'key', href: 'restablecer-contrasena.html' },
        { label: 'Dos pasos', icon: 'shield-lock', href: 'verificacion-dos-pasos.html' },
        { label: 'Sesión bloqueada', icon: 'lock', href: 'bloqueo-pantalla.html' },
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
  'contacto.html': {
    title: 'Contacto',
    description: 'Escríbanos para solicitar una demostración o resolver una duda sobre Aula RD.',
    layout: 'landing',
  },
  'terminos.html': {
    title: 'Términos de uso',
    description: 'Condiciones de uso de Aula RD. Borrador pendiente de revisión jurídica.',
    layout: 'landing',
  },
  'privacidad.html': {
    title: 'Política de privacidad',
    description:
      'Cómo se tratan los datos personales en Aula RD. Borrador pendiente de revisión jurídica.',
    layout: 'landing',
  },
  'cookies.html': {
    title: 'Política de cookies',
    description: 'Qué cookies y almacenamiento usa Aula RD. Borrador pendiente de revisión jurídica.',
    layout: 'landing',
  },
  'reembolsos.html': {
    title: 'Cancelación y reembolsos',
    description: 'Cómo cancelar la suscripción y cuándo se reembolsa. Borrador pendiente de revisión jurídica.',
    layout: 'landing',
  },
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
    description: 'Indicadores de la plataforma: instituciones, suscripciones y cobros.',
    portal: 'super-admin',
    active: 'dashboard-superadmin.html',
    user: { name: 'Haisel Ramírez', role: 'Superadmin', initials: 'HR' },
  },
  'dashboard-institucion.html': {
    title: 'Panel de la institución',
    description: 'Panel de la institución con indicadores, asistencia semanal y estados de pago.',
    portal: 'institution-admin',
    active: 'dashboard-institucion.html',
    org: ORG,
    user: { name: 'Ana Martínez', role: 'Directora', initials: 'AM' },
  },
  'dashboard-docente.html': {
    title: 'Panel docente',
    description: 'Panel docente con secciones, asistencia y calificaciones pendientes.',
    portal: 'teacher',
    active: 'dashboard-docente.html',
    org: ORG,
    user: { name: 'Luis Peña', role: 'Docente de Matemática', initials: 'LP' },
  },
  'dashboard-tutor.html': {
    title: 'Portal de familia',
    description: 'Portal de familia con calificaciones, asistencia y estado de cuenta.',
    portal: 'student-guardian',
    active: 'dashboard-tutor.html',
    org: ORG,
    user: { name: 'Rosa Peña', role: 'Tutora', initials: 'RP' },
  },
  'componentes.html': {
    title: 'Componentes',
    description: 'Catálogo de componentes de la plantilla Aula RD con sus variantes.',
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
  'ejemplo-tablas.html': {
    title: 'Tablas de datos',
    description: 'Selección de filas, acciones masivas, filtros externos y detalle desplegable.',
    portal: 'galeria',
    active: 'ejemplo-tablas.html',
    user: GALLERY_USER,
    demo: true,
    crumbs: [{ label: 'Galería', href: 'galeria.html' }, { label: 'Datos' }, { label: 'Tablas' }],
  },
  'ejemplo-crud.html': {
    title: 'CRUD de estudiantes',
    description: 'Crear, editar y borrar registros con validación, confirmación, aviso y deshacer.',
    portal: 'galeria',
    active: 'ejemplo-crud.html',
    user: GALLERY_USER,
    demo: true,
    crumbs: [{ label: 'Galería', href: 'galeria.html' }, { label: 'Datos' }, { label: 'CRUD' }],
  },
  'ejemplo-reporte.html': {
    title: 'Reporte de estudiantes',
    description: 'Filtros que actualizan indicadores, gráficos y tabla; exportación a Excel e impresión.',
    portal: 'galeria',
    active: 'ejemplo-reporte.html',
    user: GALLERY_USER,
    demo: true,
    crumbs: [{ label: 'Galería', href: 'galeria.html' }, { label: 'Datos' }, { label: 'Reporte' }],
  },
  'ejemplo-kanban.html': {
    title: 'Tablero de solicitudes',
    description: 'Tarjetas que se mueven entre columnas arrastrándolas o con botones accesibles por teclado.',
    portal: 'galeria',
    active: 'ejemplo-kanban.html',
    user: GALLERY_USER,
    demo: true,
    crumbs: [{ label: 'Galería', href: 'galeria.html' }, { label: 'Datos' }, { label: 'Tablero' }],
  },
  'ejemplo-formularios.html': {
    title: 'Formularios avanzados',
    description:
      'Asistente con validación por paso, listas dependientes, filas repetibles y errores del servidor.',
    portal: 'galeria',
    active: 'ejemplo-formularios.html',
    user: GALLERY_USER,
    demo: true,
    crumbs: [{ label: 'Galería', href: 'galeria.html' }, { label: 'Avanzado' }, { label: 'Formularios' }],
  },
  'ejemplo-edicion.html': {
    title: 'Edición con deshacer',
    description:
      'Aviso de cambios sin guardar, deshacer el último cambio y foco que vuelve al botón de origen.',
    portal: 'galeria',
    active: 'ejemplo-edicion.html',
    user: GALLERY_USER,
    demo: true,
    crumbs: [{ label: 'Galería', href: 'galeria.html' }, { label: 'Avanzado' }, { label: 'Edición' }],
  },
  'ejemplo-perfiles.html': {
    title: 'Perfiles por rol',
    description: 'El perfil propio de cada rol, con datos, pestañas y acciones distintos según el contexto.',
    portal: 'galeria',
    active: 'ejemplo-perfiles.html',
    user: GALLERY_USER,
    demo: true,
    crumbs: [
      { label: 'Galería', href: 'galeria.html' },
      { label: 'Avanzado' },
      { label: 'Perfiles por rol' },
    ],
  },
  'ejemplo-archivos.html': {
    title: 'Carga de archivos',
    description: 'Zona para soltar o elegir archivos con revisión de tipo, tamaño y cantidad.',
    portal: 'galeria',
    active: 'ejemplo-archivos.html',
    user: GALLERY_USER,
    demo: true,
    crumbs: [{ label: 'Galería', href: 'galeria.html' }, { label: 'Avanzado' }, { label: 'Archivos' }],
  },
  'ejemplo-calendario.html': {
    title: 'Calendario y agenda',
    description: 'Calendario mensual con eventos de colores y agenda filtrable por categoría.',
    portal: 'galeria',
    active: 'ejemplo-calendario.html',
    user: GALLERY_USER,
    demo: true,
    crumbs: [{ label: 'Galería', href: 'galeria.html' }, { label: 'Avanzado' }, { label: 'Calendario' }],
  },
  'ejemplo-navegacion.html': {
    title: 'Navegación',
    description:
      'Migas de pan, pestañas, píldoras, paginación, acordeón, menú desplegable y lista de enlaces.',
    portal: 'galeria',
    active: 'ejemplo-navegacion.html',
    user: GALLERY_USER,
    crumbs: [{ label: 'Galería', href: 'galeria.html' }, { label: 'Avanzado' }, { label: 'Navegación' }],
  },
  'registro.html': {
    title: 'Crear cuenta',
    description: 'Registro de una persona usuaria con contraseña repetida y aceptación de términos.',
    layout: 'auth',
    demo: true,
  },
  'restablecer-contrasena.html': {
    title: 'Contraseña nueva',
    description: 'Cree una contraseña nueva desde el enlace recibido por correo.',
    layout: 'auth',
    demo: true,
  },
  'verificacion-dos-pasos.html': {
    title: 'Verificación en dos pasos',
    description: 'Código de 6 dígitos de la aplicación de autenticación.',
    layout: 'auth',
    demo: true,
  },
  'bloqueo-pantalla.html': {
    title: 'Sesión bloqueada',
    description: 'Pantalla de bloqueo por inactividad: se desbloquea con la contraseña.',
    layout: 'auth',
    demo: true,
  },
  'cuenta.html': {
    title: 'Mi cuenta',
    description: 'Perfil, seguridad, preferencias y notificaciones de la cuenta.',
    portal: 'galeria',
    active: 'cuenta.html',
    user: GALLERY_USER,
    demo: true,
    crumbs: [{ label: 'Galería', href: 'galeria.html' }, { label: 'Cuenta y ayuda' }, { label: 'Mi cuenta' }],
  },
  'ayuda.html': {
    title: 'Ayuda y preguntas frecuentes',
    description: 'Preguntas frecuentes con buscador.',
    portal: 'galeria',
    active: 'ayuda.html',
    user: GALLERY_USER,
    demo: true,
    crumbs: [{ label: 'Galería', href: 'galeria.html' }, { label: 'Cuenta y ayuda' }, { label: 'Ayuda' }],
  },
  'interfaz-componentes.html': {
    title: 'Componentes de interfaz',
    description: 'Tipografía, íconos, insignias, progreso, tooltips, carrusel, línea de tiempo y cuadrícula.',
    portal: 'galeria',
    active: 'interfaz-componentes.html',
    user: GALLERY_USER,
    demo: true,
    crumbs: [
      { label: 'Galería', href: 'galeria.html' },
      { label: 'Cuenta y ayuda' },
      { label: 'Componentes de interfaz' },
    ],
  },
  'inicio-rapido.html': {
    title: 'Inicio rápido',
    description: 'Página en blanco con el diseño de aplicación para copiar y empezar.',
    portal: 'galeria',
    active: 'inicio-rapido.html',
    user: GALLERY_USER,
    crumbs: [
      { label: 'Galería', href: 'galeria.html' },
      { label: 'Cuenta y ayuda' },
      { label: 'Inicio rápido' },
    ],
  },
  'referencia-au.html': {
    title: 'Referencia de la fachada AU',
    description: 'Las funciones públicas de window.AU agrupadas por tema, con su llamada.',
    portal: 'galeria',
    active: 'referencia-au.html',
    user: GALLERY_USER,
    crumbs: [
      { label: 'Galería', href: 'galeria.html' },
      { label: 'Cuenta y ayuda' },
      { label: 'Referencia de AU' },
    ],
  },
  'app-chat.html': {
    title: 'Chat',
    description: 'Conversación con envío y respuesta de ejemplo.',
    portal: 'galeria',
    active: 'app-chat.html',
    user: GALLERY_USER,
    demo: true,
    crumbs: [{ label: 'Galería', href: 'galeria.html' }, { label: 'Aplicaciones' }, { label: 'Chat' }],
  },
  'app-proyectos.html': {
    title: 'Proyectos',
    description: 'Proyectos escolares con avance, responsable y fecha.',
    portal: 'galeria',
    active: 'app-proyectos.html',
    user: GALLERY_USER,
    crumbs: [{ label: 'Galería', href: 'galeria.html' }, { label: 'Aplicaciones' }, { label: 'Proyectos' }],
  },
  'app-contactos.html': {
    title: 'Contactos',
    description: 'Directorio de personas con búsqueda y filtro por rol.',
    portal: 'galeria',
    active: 'app-contactos.html',
    user: GALLERY_USER,
    demo: true,
    crumbs: [{ label: 'Galería', href: 'galeria.html' }, { label: 'Aplicaciones' }, { label: 'Contactos' }],
  },
  'app-galeria.html': {
    title: 'Galería de imágenes',
    description: 'Cuadrícula de imágenes con filtro por álbum.',
    portal: 'galeria',
    active: 'app-galeria.html',
    user: GALLERY_USER,
    demo: true,
    crumbs: [
      { label: 'Galería', href: 'galeria.html' },
      { label: 'Aplicaciones' },
      { label: 'Galería de imágenes' },
    ],
  },
  'app-busqueda.html': {
    title: 'Búsqueda',
    description: 'Resultados de búsqueda por tipo con filtro en vivo.',
    portal: 'galeria',
    active: 'app-busqueda.html',
    user: GALLERY_USER,
    demo: true,
    crumbs: [{ label: 'Galería', href: 'galeria.html' }, { label: 'Aplicaciones' }, { label: 'Búsqueda' }],
  },
  'graficos.html': {
    title: 'Gráficos y widgets',
    description: 'Barras, líneas, dona y área con indicadores.',
    portal: 'galeria',
    active: 'graficos.html',
    user: GALLERY_USER,
    crumbs: [
      { label: 'Galería', href: 'galeria.html' },
      { label: 'Paneles y gráficos' },
      { label: 'Gráficos y widgets' },
    ],
  },
  'panel-financiero.html': {
    title: 'Panel financiero',
    description: 'Cobros, ingresos y cuentas por cobrar.',
    portal: 'galeria',
    active: 'panel-financiero.html',
    user: GALLERY_USER,
    crumbs: [
      { label: 'Galería', href: 'galeria.html' },
      { label: 'Paneles y gráficos' },
      { label: 'Panel financiero' },
    ],
  },
  'panel-academico.html': {
    title: 'Panel académico',
    description: 'Rendimiento, asistencia y secciones del período.',
    portal: 'galeria',
    active: 'panel-academico.html',
    user: GALLERY_USER,
    crumbs: [
      { label: 'Galería', href: 'galeria.html' },
      { label: 'Paneles y gráficos' },
      { label: 'Panel académico' },
    ],
  },
  'ejemplo-impresion.html': {
    title: 'Impresión y códigos',
    description: 'Carnet con código QR y boleta con código de barras y firma, listos para imprimir.',
    portal: 'galeria',
    active: 'ejemplo-impresion.html',
    user: GALLERY_USER,
    crumbs: [{ label: 'Galería', href: 'galeria.html' }, { label: 'Avanzado' }, { label: 'Impresión' }],
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
 * @property {'table' | 'plans' | 'settings' | 'attendance' | 'grades' | 'inbox' | 'calendar'} archetype Arquetipo de la página.
 * @property {string} title Título.
 * @property {string} subtitle Descripción corta.
 * @property {string} [source] Archivo de datos en `public/data/` (el calendario y la configuración no lo usan).
 * @property {import('./cells.js').Column[]} [columns] Columnas de la tabla (la primera da nombre a la fila). Solo en el arquetipo de tabla.
 * @property {number} [limit] Máximo de filas que se toman del archivo (cuadrículas de registro).
 * @property {string} [view] Vista inicial del calendario (`dayGridMonth`, `listMonth`…).
 * @property {{ sections: { id: string, title: string, description: string, fields: Record<string, any>[] }[] }} [settings] Secciones y campos del arquetipo de configuración.
 * @property {string} [primary] Texto del botón principal de alta.
 * @property {boolean} [readOnly] Solo lectura: las filas solo ofrecen "Ver" (familia, reportes).
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
    readOnly: true,
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

// Tanda 2 de módulos (spec 013, Fase 1): mismo arquetipo de tabla, datos y columnas propios.
Object.assign(MODULES, {
  'superadmin-soporte.html': {
    portal: 'super-admin',
    archetype: 'table',
    title: 'Soporte',
    subtitle: 'Solicitudes de ayuda de las instituciones y su prioridad.',
    source: 'tickets.json',
    primary: 'Nuevo ticket',
    columns: [
      { key: 'asunto', label: 'Asunto', kind: 'entity', meta: 'id' },
      { key: 'institucion', label: 'Institución' },
      { key: 'prioridad', label: 'Prioridad' },
      { key: 'fecha', label: 'Fecha', kind: 'date' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
  'superadmin-publicidad.html': {
    portal: 'super-admin',
    archetype: 'table',
    title: 'Publicidad',
    subtitle: 'Campañas de promoción de la plataforma por canal.',
    source: 'campanas.json',
    primary: 'Nueva campaña',
    columns: [
      { key: 'nombre', label: 'Campaña', kind: 'entity', meta: 'id' },
      { key: 'canal', label: 'Canal' },
      { key: 'inicio', label: 'Inicio', kind: 'date' },
      { key: 'alcance', label: 'Alcance', kind: 'number' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
  'superadmin-contabilidad.html': {
    portal: 'super-admin',
    archetype: 'table',
    title: 'Contabilidad',
    subtitle: 'Asientos de ingresos y gastos de la plataforma y su conciliación.',
    source: 'asientos.json',
    primary: 'Nuevo asiento',
    columns: [
      { key: 'concepto', label: 'Concepto', kind: 'entity', meta: 'id' },
      { key: 'cuenta', label: 'Cuenta' },
      { key: 'fecha', label: 'Fecha', kind: 'date' },
      { key: 'debe', label: 'Debe', kind: 'money' },
      { key: 'haber', label: 'Haber', kind: 'money' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
  'institucion-matricula.html': {
    portal: 'institution-admin',
    archetype: 'table',
    title: 'Matrícula',
    subtitle: 'Solicitudes de inscripción y su estado de revisión.',
    source: 'matriculas.json',
    primary: 'Nueva solicitud',
    columns: [
      { key: 'estudiante', label: 'Estudiante', kind: 'entity', meta: 'id' },
      { key: 'grado', label: 'Grado' },
      { key: 'tutor', label: 'Tutor' },
      { key: 'fecha', label: 'Solicitada', kind: 'date' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
  'institucion-calificaciones.html': {
    portal: 'institution-admin',
    archetype: 'table',
    readOnly: true,
    title: 'Calificaciones',
    subtitle: 'Promedio general de cada estudiante en el período 2026-2027.',
    source: 'reporte.json',
    columns: [
      { key: 'nombre', label: 'Estudiante', kind: 'entity', meta: 'grado' },
      { key: 'promedio', label: 'Promedio', kind: 'number' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
  'institucion-asistencia.html': {
    portal: 'institution-admin',
    archetype: 'table',
    readOnly: true,
    title: 'Asistencia',
    subtitle: 'Porcentaje de asistencia de cada estudiante en el período 2026-2027.',
    source: 'reporte.json',
    columns: [
      { key: 'nombre', label: 'Estudiante', kind: 'entity', meta: 'grado' },
      { key: 'asistencia', label: 'Asistencia', kind: 'percent' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
  'institucion-comunicados.html': {
    portal: 'institution-admin',
    archetype: 'table',
    title: 'Comunicados',
    subtitle: 'Avisos enviados a las familias y a los docentes.',
    source: 'comunicados.json',
    primary: 'Nuevo comunicado',
    columns: [
      { key: 'asunto', label: 'Asunto', kind: 'entity', meta: 'destinatarios' },
      { key: 'autor', label: 'Autor' },
      { key: 'fecha', label: 'Fecha', kind: 'date' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
  'institucion-reportes.html': {
    portal: 'institution-admin',
    archetype: 'table',
    readOnly: true,
    title: 'Reportes',
    subtitle: 'Resumen por estudiante: asistencia, promedio y pagos. Descargue la tabla en Excel o CSV.',
    source: 'reporte.json',
    columns: [
      { key: 'nombre', label: 'Estudiante', kind: 'entity', meta: 'grado' },
      { key: 'asistencia', label: 'Asistencia', kind: 'percent' },
      { key: 'promedio', label: 'Promedio', kind: 'number' },
      { key: 'pagos', label: 'Pagos', kind: 'status' },
      { key: 'monto', label: 'Cuota', kind: 'money' },
    ],
  },
  'docente-secciones.html': {
    portal: 'teacher',
    archetype: 'table',
    readOnly: true,
    title: 'Mis secciones',
    subtitle: 'Las secciones que atiende, con su aula y su horario.',
    source: 'secciones.json',
    columns: [
      { key: 'seccion', label: 'Sección', kind: 'entity', meta: 'area' },
      { key: 'estudiantes', label: 'Estudiantes', kind: 'number' },
      { key: 'aula', label: 'Aula' },
      { key: 'horario', label: 'Horario' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
  'docente-comunicados.html': {
    portal: 'teacher',
    archetype: 'table',
    title: 'Comunicados',
    subtitle: 'Avisos que ha enviado a las familias de sus secciones.',
    source: 'comunicados.json',
    primary: 'Nuevo comunicado',
    columns: [
      { key: 'asunto', label: 'Asunto', kind: 'entity', meta: 'destinatarios' },
      { key: 'fecha', label: 'Fecha', kind: 'date' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
  'familia-calificaciones.html': {
    portal: 'student-guardian',
    archetype: 'table',
    readOnly: true,
    title: 'Calificaciones',
    subtitle: 'Notas por asignatura en los tres períodos del año escolar.',
    source: 'notas.json',
    columns: [
      { key: 'asignatura', label: 'Asignatura' },
      { key: 'p1', label: 'Período 1', kind: 'number' },
      { key: 'p2', label: 'Período 2', kind: 'number' },
      { key: 'p3', label: 'Período 3', kind: 'number' },
      { key: 'promedio', label: 'Promedio', kind: 'number' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
  'familia-asistencia.html': {
    portal: 'student-guardian',
    archetype: 'table',
    readOnly: true,
    title: 'Asistencia',
    subtitle: 'Asistencia diaria del estudiante en las últimas semanas.',
    source: 'asistencia-hijo.json',
    columns: [
      { key: 'fecha', label: 'Fecha', kind: 'date' },
      { key: 'estado', label: 'Estado', kind: 'status' },
      { key: 'nota', label: 'Nota' },
    ],
  },
  'familia-comunicados.html': {
    portal: 'student-guardian',
    archetype: 'table',
    readOnly: true,
    title: 'Comunicados',
    subtitle: 'Avisos de la institución y de los docentes.',
    source: 'comunicados.json',
    columns: [
      { key: 'asunto', label: 'Asunto', kind: 'entity', meta: 'destinatarios' },
      { key: 'autor', label: 'De' },
      { key: 'fecha', label: 'Fecha', kind: 'date' },
    ],
  },
  'familia-autorizaciones.html': {
    portal: 'student-guardian',
    archetype: 'table',
    readOnly: true,
    title: 'Autorizaciones',
    subtitle: 'Actividades que requieren su firma y las que ya firmó.',
    source: 'autorizaciones.json',
    columns: [
      { key: 'actividad', label: 'Actividad', kind: 'entity', meta: 'id' },
      { key: 'fecha', label: 'Fecha de la actividad', kind: 'date' },
      { key: 'vence', label: 'Firmar antes del', kind: 'date' },
      { key: 'estado', label: 'Estado', kind: 'status' },
    ],
  },
});

// Tanda 3 (spec 013, Fase 1): módulos con arquetipo propio.
Object.assign(MODULES, {
  'superadmin-planes.html': {
    portal: 'super-admin',
    archetype: 'plans',
    title: 'Planes',
    subtitle: 'Planes de suscripción, su precio mensual y cuántas instituciones usan cada uno.',
    source: 'planes.json',
    primary: 'Nuevo plan',
  },
  'superadmin-configuracion.html': {
    portal: 'super-admin',
    archetype: 'settings',
    title: 'Configuración',
    subtitle: 'Ajustes generales de la plataforma, la facturación y la seguridad.',
    settings: {
      sections: [
        {
          id: 'general',
          title: 'General',
          description: 'Datos que ven todas las instituciones.',
          fields: [
            { id: 'nombre', label: 'Nombre de la plataforma', type: 'text', value: 'Aula RD' },
            { id: 'soporte', label: 'Correo de soporte', type: 'email', value: 'soporte@aulard.example' },
            {
              id: 'zona',
              label: 'Zona horaria',
              type: 'select',
              value: 'América/Santo Domingo (UTC−4)',
              options: ['América/Santo Domingo (UTC−4)', 'UTC'],
            },
            {
              id: 'idioma',
              label: 'Idioma',
              type: 'select',
              value: 'Español (República Dominicana)',
              options: ['Español (República Dominicana)'],
            },
          ],
        },
        {
          id: 'facturacion',
          title: 'Facturación',
          description: 'Reglas de cobro de las suscripciones.',
          fields: [
            { id: 'moneda', label: 'Moneda', type: 'text', value: 'RD$ (peso dominicano)', readonly: true },
            { id: 'itbis', label: 'ITBIS (%)', type: 'number', value: '18' },
            {
              id: 'gracia',
              label: 'Días de gracia tras el vencimiento',
              type: 'number',
              value: '5',
              help: 'Pasado ese plazo, la cuenta pasa a "Suspendida".',
            },
            { id: 'recordatorios', label: 'Enviar recordatorios de pago', type: 'switch', checked: true },
          ],
        },
        {
          id: 'seguridad',
          title: 'Seguridad',
          description: 'Controles de acceso de las personas que administran la plataforma.',
          fields: [
            {
              id: 'dos-pasos',
              label: 'Exigir verificación en dos pasos',
              type: 'switch',
              checked: true,
              help: 'Aplica a los usuarios internos.',
            },
            {
              id: 'expira',
              label: 'La sesión expira tras',
              type: 'select',
              value: '30 minutos',
              options: ['15 minutos', '30 minutos', '1 hora', '8 horas'],
            },
            { id: 'bloqueo', label: 'Bloquear tras intentos fallidos', type: 'number', value: '5' },
          ],
        },
      ],
    },
  },
  'institucion-configuracion.html': {
    portal: 'institution-admin',
    archetype: 'settings',
    title: 'Configuración',
    subtitle: 'Datos de la institución, el año escolar y los avisos que se envían.',
    settings: {
      sections: [
        {
          id: 'institucion',
          title: 'Institución',
          description: 'Datos que aparecen en facturas, boletines y comunicados.',
          fields: [
            { id: 'nombre', label: 'Nombre de la institución', type: 'text', value: 'Colegio San Rafael' },
            { id: 'rnc', label: 'RNC', type: 'text', value: '1-30-00000-1' },
            { id: 'telefono', label: 'Teléfono', type: 'tel', value: '(809) 555-0100' },
            { id: 'correo', label: 'Correo de contacto', type: 'email', value: 'contacto@sanrafael.edu.do' },
          ],
        },
        {
          id: 'anio',
          title: 'Año escolar',
          description: 'Período vigente y cuota por defecto.',
          fields: [
            {
              id: 'periodo',
              label: 'Período',
              type: 'select',
              value: '2026-2027',
              options: ['2025-2026', '2026-2027'],
            },
            { id: 'inicio', label: 'Inicio de clases', type: 'text', value: '18/08/2026' },
            { id: 'cuota', label: 'Cuota mensual por defecto (RD$)', type: 'text', value: '7,500.00' },
            { id: 'cortes', label: 'Cortes de notas por año', type: 'number', value: '4' },
          ],
        },
        {
          id: 'avisos',
          title: 'Notificaciones',
          description: 'Qué avisos reciben las familias y el personal.',
          fields: [
            {
              id: 'aviso-notas',
              label: 'Avisar a las familias cuando se publiquen calificaciones',
              type: 'switch',
              checked: true,
            },
            { id: 'aviso-pago', label: 'Recordar los pagos pendientes', type: 'switch', checked: true },
            {
              id: 'aviso-ausencia',
              label: 'Avisar de las ausencias del día',
              type: 'switch',
              checked: false,
            },
          ],
        },
      ],
    },
  },
  'docente-asistencia.html': {
    portal: 'teacher',
    archetype: 'attendance',
    title: 'Asistencia',
    subtitle: 'Marque la asistencia de hoy: presente, tardanza o ausente.',
    source: 'estudiantes.json',
    limit: 12,
  },
  'docente-calificaciones.html': {
    portal: 'teacher',
    archetype: 'grades',
    title: 'Calificaciones',
    subtitle: 'Registre las notas del corte por estudiante y evaluación.',
    source: 'estudiantes.json',
    limit: 12,
  },
  'docente-mensajes.html': {
    portal: 'teacher',
    archetype: 'inbox',
    title: 'Mensajes',
    subtitle: 'Mensajes de las familias de sus secciones.',
    source: 'mensajes.json',
  },
  'docente-planificacion.html': {
    portal: 'teacher',
    archetype: 'calendar',
    title: 'Planificación',
    subtitle: 'Evaluaciones, entregas y reuniones del mes.',
    view: 'dayGridMonth',
    primary: 'Nuevo evento',
  },
  'familia-horario.html': {
    portal: 'student-guardian',
    archetype: 'calendar',
    title: 'Horario',
    subtitle: 'Próximas actividades y evaluaciones del estudiante.',
    view: 'listMonth',
  },
});

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
    description:
      'Campos de texto, números, fechas, listas, casillas, interruptores, rangos, tamaños y estados.',
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
    description:
      'Listas con búsqueda y selección múltiple, fechas, máscaras dominicanas y orden por arrastre.',
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
 * @returns {(ModuleConfig & { rows: Record<string, unknown>[], labelKey: string, actionsIndex: number, unread: number }) | undefined} Módulo listo.
 */
function resolveModule(cfg) {
  if (!cfg) return undefined;
  const all = cfg.source ? loadData(cfg.source) : [];
  const rows = cfg.limit ? all.slice(0, cfg.limit) : all;
  return {
    ...cfg,
    rows,
    labelKey: cfg.columns?.[0]?.key ?? '',
    actionsIndex: cfg.columns?.length ?? 0,
    unread: rows.filter((r) => r.leido === false).length,
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
   * Monto en pesos dominicanos: `{{money precio}}` → `RD$ 2,500.00`.
   * @param {number} amount Monto.
   * @returns {string} Texto formateado.
   */
  money: (amount) => formatMoney(amount),
  /**
   * Fecha ISO a `DD/MM/AAAA`: `{{date fecha}}`.
   * @param {string} iso Fecha `AAAA-MM-DD`.
   * @returns {string} Fecha formateada.
   */
  date: (iso) => formatIsoDate(iso),
  /**
   * Entero con separador de miles: `{{num estudiantes}}` → `1,000`.
   * @param {number} n Número.
   * @returns {string} Texto formateado.
   */
  num: (n) => Number(n).toLocaleString('en-US'),
  /**
   * Índice base 1 para nombres de campo: `e{{inc @index}}`.
   * @param {number} n Índice base 0.
   * @returns {number} Índice base 1.
   */
  inc: (n) => n + 1,
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
