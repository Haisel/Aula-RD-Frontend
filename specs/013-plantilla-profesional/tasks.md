# Tareas — 013-plantilla-profesional

> Estado: Aprobado (08/11/2026) · Plan: [plan.md](plan.md) · Spec: [013-plantilla-profesional.md](013-plantilla-profesional.md)

Leyenda: `[x]` hecho · `[ ]` pendiente · `P` en paralelo. Cada tarea termina con `npm run check` en verde y, si es una página, con su verificación en navegador. Pruebas primero cuando haya lógica o contrato.

## Fase 1 — menú, errores, arquetipos y los 30 módulos
**Estado 08/11/2026: en curso.** **Primera rebanada de módulos hecha: 8 de los 30** (los de tipo tabla: Instituciones, Usuarios internos, Suscripciones, Cobros del superadmin, Estudiantes, Docentes, Cobros de la institución y Estado de cuenta). T-04 hecha (migas de pan, `components/breadcrumb`). T-05 en curso: 5 archivos de datos nuevos de 11 (`instituciones`, `usuarios-internos`, `suscripciones`, `facturas`, `cuenta`), reproducibles y sin cambiar los anteriores. T-06 y T-07 en curso: arquetipo `archetypes/table` con las celdas de `src/data/cells.js` (22 pruebas) y las páginas de tabla, con `tests/module-pages.test.js` (57 pruebas, 48 vistas en rojo antes de crear las páginas). Los datos se leen de `public/data/` al generar las páginas (sin parpadeo y también en el servidor de desarrollo). Verificado en navegador a 390 y 1440 px: DataTables arranca, filas correctas, menú activo, migas, sin desbordamiento, consola limpia. **Deuda actual del trinquete: 22 ítems de menú y 15 `href="#"`.** Notas honestas: los filtros por columna no se incluyeron porque sin lógica de demostración serían controles inertes (llegan con la Fase 2), y las acciones de fila solo muestran avisos de demostración. T-03 hecha: `403.html`, `404.html`, `500.html` y `mantenimiento.html` (`tests/error-pages.test.js`, 24 pruebas, vistas en rojo antes). Verificadas en navegador en claro y oscuro: un solo logo visible, sin desbordamiento a 390 px, contraste del título 13.6:1 y 15.4:1 y del código 5.1:1 y 9.1:1, salida a `index.html`, consola limpia y sin recursos externos. **Defecto hallado y corregido al verificar:** los botones, `.btn-check`, paginación y acordeón de Bootstrap mostraban como único foco un halo al 25 % (1.4:1 en claro, 1.7:1 en oscuro, por debajo de WCAG 1.4.11); ahora llevan el anillo sólido de la marca (5.07:1 en claro y 9.09:1 en oscuro, medido con la tecla Tab real). `tests/focus-ring.test.js` (4 pruebas, vistas en rojo antes). T-02 hecha: el menú tiene grupos plegables (`children` en `NAV`, botón con colapso de Bootstrap, sin JS propio). `tests/sidebar-groups.test.js` (10 pruebas, 7 vistas en rojo antes). Verificado en navegador: abre y cierra con clic, Enter y Espacio, `aria-expanded` correcto, llega abierto si contiene la página activa, anillo de foco `#52CABB`, menú contraído a íconos (76 px) y menú móvil a 390 px (botón de 47 px). La galería ya agrupa "Interfaz". T-01 hecha: `tests/links.test.js` (3 pruebas) fija la deuda exacta: **30 ítems de menú** muertos y **15 `href="#"` vacíos** (7 en 5 páginas y 8 en los parciales `topbar` y `footer`). Un enlace muerto nuevo hace fallar la prueba y cada arreglo obliga a quitar su entrada de la lista.

| Id | Tarea | Cubre | Hecho cuando |
|---|---|---|---|
| T-01 | Prueba de trinquete `tests/links.test.js` con la lista `PENDIENTES` (hoy 30 ítems de menú y los `href="#"` vacíos) | RF-01, CA-01 | Prueba en verde y lista exacta |
| T-02 | Grupos plegables en `sidebar.hbs` y en `NAV` (`children`), accesibles y abiertos si contienen la página activa | RF-02 | Menú con grupos verificado en navegador y con teclado |
| T-03 P | Páginas de error 403, 404, 500 y mantenimiento (`src/*.html`) con salida | RF-03, CA-07 | Verificadas; `404.html` en la raíz |
| T-04 | Migas de pan: parcial y uso en las páginas interiores | RF-05 | Parcial creado y usado |
| T-05 | Fixtures por módulo en `scripts/build-fixtures.mjs` y `public/data/` | RF-11 | Datos generados, reproducibles y con prueba |
| T-06 P | Arquetipo "Lista con CRUD" y las páginas de Instituciones, Usuarios internos, Estudiantes y Docentes | RF-04 | Verificadas |
| T-07 P | Arquetipo "Tabla con filtros" y Suscripciones, Cobros (superadmin e institución) y Estado de cuenta | RF-04 | Verificadas |
| T-08 P | Arquetipos "Tarjetas y precios" y "Reporte": Planes, Publicidad, Contabilidad y Reportes | RF-04 | Verificadas |
| T-09 P | Arquetipos "Bandeja", "Cuadrícula de registro" y "Asistente por pasos": Soporte, Mensajes, Asistencia, Calificaciones y Matrícula | RF-04 | Verificadas |
| T-10 P | Arquetipos "Calendario", "Comunicados", "Secciones", "Firma" y "Configuración": Planificación, Horario, Comunicados, Mis secciones, Autorizaciones y Configuración | RF-04 | Verificadas |
| T-11 | Vaciar `PENDIENTES` y reemplazar los `href="#"` vacíos por destinos reales | RF-01, CA-01 | Lista vacía y prueba en verde |
| T-12 | Verificación de la fase: consola, 390 px, oscuro, 1440/1920/2560, teclado, `app.js` sin cambios | CA-04, CA-05, CA-06, CA-10 | Resultados en la spec |
| T-13 | `CHANGELOG.md`, spec y commit de la Fase 1 | — | Commit hecho |

## Fase 2 — datos y lógica (spec 012, fase 2)
Se retoma con T-13 y T-15 a T-19 de [la spec 012](../012-galeria-de-funcionalidades/tasks.md), ya con la lógica y los datos hechos (T-12 y T-14 de esa lista).

## Fase 3 — autenticación, cuenta y páginas públicas
| Id | Tarea | Cubre | Hecho cuando |
|---|---|---|---|
| T-14 | Registro, olvidé mi contraseña, restablecer, verificación en dos pasos y bloqueo de pantalla | RF-06, CA-08 | Verificadas con errores por campo |
| T-15 | Perfil por rol, cuenta y seguridad, preferencias, notificaciones | RF-06 | Verificadas |
| T-16 | Ayuda y preguntas frecuentes, contacto, términos y privacidad (texto de relleno rotulado) | RF-08, RN-03 | Verificadas |

## Fase 4 — interfaz y formularios
| Id | Tarea | Cubre | Hecho cuando |
|---|---|---|---|
| T-17 | Tipografía, colores, íconos (buscador), insignias y progreso, acordeón y colapsables, pestañas y navegación (con `data-au-tabs`), paginación y migas, listas, carrusel, línea de tiempo, tooltips y popovers, cuadrícula | RF-07, RF-08 | Verificadas |
| T-18 | Formularios: controles básicos, validación, avanzados, asistente por pasos, editor, archivos y firma | RF-08 | Verificadas |

## Fase 5 — aplicaciones, calendario y gráficos
| Id | Tarea | Cubre | Hecho cuando |
|---|---|---|---|
| T-19 | Bandeja (lista, lectura, redacción), chat, kanban, proyectos, contactos, galería de imágenes y búsqueda | RF-08 | Verificadas |
| T-20 | Calendario y agenda; gráficos (línea y barras, dona y área); widgets | RF-08 | Verificadas |
| T-21 | Paneles financiero y académico | RF-08 | Verificados |

## Fase 6 — cierre
| Id | Tarea | Cubre | Hecho cuando |
|---|---|---|---|
| T-22 | `tests/coverage.test.js`: cada `data-au-*` y cada función de `AU` con demostración | RF-07, CA-02 | Prueba en verde y lista de pendientes vacía |
| T-23 | Guía de integración, página de inicio rápido y referencia de componentes | RF-09, CA-12 | Documentos publicados |
| T-24 | Medición con Lighthouse en todas las páginas (mediana de 3 ejecuciones) | RNF-01, RNF-02, CA-03 | Resultados registrados y umbrales cumplidos |
| T-25 | Versión 0.4.0, `CHANGELOG.md` y cierre de la spec (estado "Implementada") | CA-01 a CA-12 | Spec cerrada |
