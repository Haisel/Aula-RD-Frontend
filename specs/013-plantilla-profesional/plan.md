# Plan — 013-plantilla-profesional

> Estado: Implementado (09/11/2026) · Aprobado (08/11/2026) · Spec: [013-plantilla-profesional.md](013-plantilla-profesional.md)

## Punto de partida
Spec aprobada. Meta: una plantilla al nivel de AdminLTE, AdminKit y CoreUI, con una auditoría que fija el punto de partida: 14 páginas, 30 ítems de menú que apuntan a `#algo`, 15 `href="#"` vacíos (7 en páginas y 8 en parciales) y `data-au-tabs` sin ninguna demostración. La spec 012 (galería) queda absorbida: su Fase 1 ya está publicada.

## Decisiones de diseño
1. **Una página por módulo, con un parcial de arquetipo.** Los 30 ítems de menú (9 superadmin, 9 institución, 6 docente, 6 familia) necesitan **30 archivos distintos**, porque cada página pertenece al menú de un solo portal. Se nombran `<portal>-<modulo>.html` (por ejemplo `institucion-estudiantes.html`). Cada archivo es corto: encabezado, aviso de demostración y un parcial de `src/partials/archetypes/`. Los datos específicos de cada módulo (título, columnas, fuente JSON) viven en `PAGES[...]` de `src/data/pages.js`.
2. **Sin JS nuevo en la primera pasada.** Los arquetipos de la Fase 1 se construyen con lo que ya existe (`data-au-datatable`, `data-au-render` + JSON, `data-au-action`, modales de Bootstrap, `data-au-chart`). Las operaciones reales en memoria (CRUD, filtros, tablero) llegan en la Fase 2 con la entrada de Vite para demostraciones, para que `app.js` no cambie.
3. **Prueba de trinquete contra enlaces muertos.** `tests/links.test.js` calcula los enlaces muertos y los compara con una lista `PENDIENTES` que solo puede encoger: un enlace muerto nuevo falla, y cuando se crea una página pendiente el test obliga a quitarla de la lista. Al cierre de la Fase 1 la lista debe quedar vacía.
4. **Menú de la plantilla con grupos plegables.** Con unas 90 páginas, el menú necesita grupos (como AdminLTE). Se añade a `sidebar.hbs` soporte para grupos con `data-bs-toggle="collapse"` (sin JS propio), accesibles con teclado y abiertos cuando contienen la página activa. Es el primer cambio de la Fase 1.
5. **Datos reproducibles y genéricos.** Los datos de cada módulo salen de `scripts/build-fixtures.mjs` (ya usa `randomuser.me` con semilla fija) y se guardan en `public/data/`. Ninguna página llama a una API externa.
6. **Matriz de cobertura automática.** `tests/coverage.test.js` lee los atributos `data-au-*` registrados y las claves públicas de `AU` y exige que cada uno aparezca en al menos una página (se activa en la Fase 6; antes lleva una lista de pendientes que solo encoge).
7. **Calidad con medidas.** Lighthouse por página (mediana de 3 ejecuciones); los resultados se registran en la spec. La medición la hago con la herramienta de Chrome disponible; un script reproducible para el repositorio es opcional.

## Fases
| Fase | Contenido | Resultado esperado |
|---|---|---|
| F1 | Menú con grupos, prueba de enlaces, páginas de error (403, 404, 500, mantenimiento), arquetipos y los 30 módulos | Cero enlaces muertos |
| F2 | Datos y lógica: tablas, CRUD, reporte, tablero (spec 012, fase 2) | Operaciones reales en memoria |
| F3 | Autenticación, cuenta y páginas públicas | Flujos completos |
| F4 | Interfaz y formularios: tipografía, colores, íconos, insignias, acordeón, pestañas, paginación, listas, carrusel, línea de tiempo, tooltips, cuadrícula; formularios básicos, validación, avanzados, asistente, editor, archivos, firma | Catálogo completo |
| F5 | Aplicaciones, calendario y gráficos: bandeja, chat, kanban, proyectos, contactos, galería, búsqueda; calendario; gráficos; paneles financiero y académico; widgets | Aplicaciones de ejemplo |
| F6 | Cobertura total, guía de integración, inicio rápido, medición con Lighthouse, versión 0.4.0 | Cierre |

## Riesgos
| Riesgo | Mitigación |
|---|---|
| Unas 90 a 100 páginas | Fases con commit propio; parciales de arquetipo; pruebas de contrato |
| El menú crece demasiado | Grupos plegables y página activa abierta (decisión 4) |
| `app.js` ya excede su límite | Medir en cada fase; las demostraciones van fuera del núcleo |
| Texto de relleno que parezca real | Rótulo de demostración y datos genéricos |
| El nombre de archivo `<portal>-<modulo>` crece con los módulos nuevos | Convención documentada en la guía de integración |
