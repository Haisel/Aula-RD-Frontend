# 012-galeria-de-funcionalidades

> Estado: Implementada (09/11/2026) · Aprobada (08/11/2026, por Haisel Ramirez) · Versión 1.0 · Fecha: 08/11/2026
> Las páginas de la galería de las Fases 1 a 4 están publicadas; los resultados por fase están en `tasks.md`. Tras la implementación, el propietario pidió una escala más compacta (decisión 017).

## Objetivo
Dar a quien integre la plantilla una **galería de páginas de ejemplo por contexto** (CRUD, reporte, formularios avanzados, tablas, tarjetas, perfiles, edición, botones, modales y alertas) que muestre cada funcionalidad de los componentes funcionando y cómo se usa, para copiarla en su backend.

## Contexto
- La spec 009 trajo 8 páginas y el catálogo `componentes.html` (12 secciones, una por componente). Ese catálogo enseña piezas sueltas; no enseña **flujos** (crear → editar → borrar, filtrar → exportar, ver como otro rol).
- El propietario pidió (08/11/2026) páginas para: CRUD, reporte, formularios avanzados, DataTable con ejemplo, tarjetas personalizadas, diferentes perfiles, ediciones, botones, modales, alertas "y etc.", y dejó a mi criterio los detalles ("por contexto").
- Restricciones que aplican: constitución y `AGENTS.md` (sin JS ni estilos en línea; solo `AU.*`; datos de ejemplo solo en `public/data/`; el frontend no es barrera de seguridad; español de RD con "usted"). La spec 006 fija `app.js` ≤ 100 KB gzip y hoy ya lo supera, así que **esta galería no debe aumentar el núcleo**.
- Decisiones del propietario (08/11/2026): "diferentes perfiles" = **el perfil de cada usuario según su rol**; "etc." = **incluir todo lo que se pueda**; los datos usan **nombres genéricos**, y si existe una API pública para generarlos, mejor (ver RF-12).

## Alcance
Una página índice y dieciséis páginas de ejemplo, todas con el layout de aplicación y un menú lateral propio "Galería":

| Página | Archivo | Muestra |
|---|---|---|
| Galería (índice) | `galeria.html` | Tarjetas agrupadas por contexto, con qué componente usa cada página |
| CRUD | `ejemplo-crud.html` | Listar, crear, editar y borrar estudiantes con tabla, modal de formulario, confirmación y avisos; estados vacío, cargando y error |
| Reporte | `ejemplo-reporte.html` | Filtros (fechas, grado, estado), indicadores, gráficos, tabla de resultados, exportar a Excel, imprimir |
| Formularios avanzados | `ejemplo-formularios.html` | Secciones, asistente por pasos, validación en vivo, máscaras, listas dependientes (provincia → municipio), selección múltiple, rango de fechas, editor de texto, firma, archivos, filas repetibles |
| Tablas (DataTable) | `ejemplo-tablas.html` | Búsqueda, orden, paginación, selección de filas y acciones masivas, filtros externos, fila de detalle, columnas con píldoras, avatares y acciones, exportación |
| Tarjetas | `ejemplo-tarjetas.html` | Indicador, estudiante, docente, plan con precio, progreso, lista, línea de tiempo, colapsable, con imagen, esqueleto de carga |
| Perfiles | `ejemplo-perfiles.html` | **El perfil de cada usuario según su rol** (superadmin, administrador de institución, docente, estudiante y tutor): datos propios, pestañas, acciones y permisos distintos por rol, con el rol elegible en la página y reflejado con `data-au-can` |
| Edición | `ejemplo-edicion.html` | Edición en línea, en modal y en panel lateral; aviso de cambios sin guardar; deshacer |
| Botones | `ejemplo-botones.html` | Variantes, tamaños, con ícono, grupos, desplegables, estados (cargando, deshabilitado), alternables, acciones masivas |
| Modales | `ejemplo-modales.html` | Tamaños, desplazamiento, pantalla completa, formulario en modal, confirmaciones, panel lateral, ventana emergente, marco `AU.openIframe` |
| Alertas | `ejemplo-alertas.html` | Alertas en línea, avisos emergentes (toast), diálogos, banners, errores de formulario, estados vacíos y de error, barra de progreso |
| Calendario y agenda | `ejemplo-calendario.html` | FullCalendar en mes, semana y lista; eventos desde JSON; crear y mover eventos; filtro por tipo |
| Navegación | `ejemplo-navegacion.html` | Migas, pestañas, acordeón, paginación, pasos (stepper), menú desplegable, scrollspy |
| Archivos | `ejemplo-archivos.html` | Carga con arrastrar y soltar, vista previa, validación de tipo y tamaño, lista con progreso y quitar |
| Impresión y códigos | `ejemplo-impresion.html` | Carnet estudiantil con QR, boleta o factura imprimible con código de barras y firma, hoja `@media print` |
| Tablero (kanban) | `ejemplo-kanban.html` | Tarjetas arrastrables entre columnas con SortableJS, por teclado y con aviso de cambio |
| Estados | `ejemplo-estados.html` | Vacío, cargando (esqueleto), error con reintento, sin permiso, sin conexión y las páginas 403, 404 y 500 |

El propietario pidió "todo lo que se pueda incluir": estas seis páginas son el techo de esta spec; cualquier otra se pide como spec nueva.

## Exclusiones
- Backend, persistencia y autenticación reales. Las operaciones de ejemplo se **simulan en memoria** y se pierden al recargar.
- Componentes nuevos de la librería: la galería usa los existentes. Solo se añade el código de demostración necesario (ver RF-13).
- Cambiar el diseño, los tokens o los componentes existentes.
- Pruebas de rendimiento y de otros navegadores distintos de los ya cubiertos.

## Actores y permisos
| Actor | Portal | Puede | No puede |
|---|---|---|---|
| Persona que integra la plantilla | Galería | Ver, probar y copiar cada ejemplo | Guardar datos: nada persiste |
| Perfil simulado (superadmin, administrador, docente, tutor) | Perfiles | Ver cómo cambia la interfaz según sus permisos de ejemplo | Nada de esto protege datos: `data-au-can` y `AU.can()` solo ocultan; la seguridad es del backend |

## Requisitos funcionales
| Id | Requisito |
|---|---|
| RF-01 | `galeria.html` debe listar las dieciséis páginas agrupadas por contexto, cada una con una frase de uso y los componentes que demuestra. |
| RF-02 | Todas las páginas de la galería deben compartir un menú lateral "Galería" con la página activa marcada, y enlazar con las páginas de la spec 009. |
| RF-03 | **CRUD:** debe permitir crear, editar y borrar registros con validación (`data-au-validate`), confirmación de borrado (`AU.confirmDelete`) y aviso de éxito o error, actualizando la tabla sin recargar; con estados vacío, cargando y error simulables. |
| RF-04 | **Reporte:** los filtros deben actualizar indicadores, gráficos y tabla; debe poder exportarse a Excel y verse bien impreso (hoja `@media print`). |
| RF-05 | **Formularios avanzados:** debe incluir un asistente por pasos (validación por paso y foco al primer error), listas dependientes, selección múltiple, rango de fechas, filas repetibles, y mostrar los errores del servidor por campo. |
| RF-06 | **Tablas:** debe mostrar DataTables 2 en español con selección de filas, acciones masivas que se habilitan según la selección, filtros externos y fila de detalle desplegable. |
| RF-07 | **Tarjetas:** cada variante debe usar solo clases `au-*` y utilidades de Bootstrap, y funcionar en tema claro y oscuro. |
| RF-08 | **Perfiles:** debe mostrar el perfil propio de cada rol (superadmin, administrador de institución, docente, estudiante y tutor) con datos, pestañas y acciones distintos; al elegir el rol cambian el usuario y los permisos de ejemplo, reflejados con `data-au-can` y `data-au-bind`, con un aviso visible de que ocultar no es proteger. |
| RF-09 | **Edición:** debe avisar de cambios sin guardar al salir, permitir deshacer el último cambio y devolver el foco al elemento que abrió la edición. |
| RF-10 | **Botones, modales y alertas:** cada variante debe tener nombre accesible, operarse con teclado y mostrar su foco. |
| RF-11 | Cada ejemplo debe incluir un bloque "Cómo se usa" con el fragmento de HTML (atributos `data-au-*`) o la llamada `AU.*` que lo produce, en texto (no como código ejecutable). |
| RF-12 | Los datos de ejemplo deben venir de archivos nuevos en `public/data/` (por ejemplo `estudiantes.json`, `docentes.json`, `reporte.json`), con **nombres genéricos**, rotulados como demostración, y cada página debe indicar visiblemente que son datos de demostración. Los nombres se generan **una sola vez** con una API pública (`randomuser.me`, semilla fija y solo nombre y género, sin fotos ni correos) y se guardan en los archivos; `public/data/README.md` documenta su origen y cómo regenerarlos. **Ninguna página llama a una API externa en tiempo de ejecución.** |
| RF-15 | **Extras:** las páginas de calendario, navegación, archivos, impresión y códigos, tablero y estados deben cumplir lo mismo que las demás (accesibilidad, temas, 390 px, datos de demostración y bloque "Cómo se usa"). |
| RF-13 | El código de demostración (simulación del CRUD, edición, filtros del reporte) debe cargarse **diferido**, por `import()` mediante `adapters/lazy.js`, solo en las páginas que lo usan, y no debe aumentar `dist/js/app.js`. |
| RF-14 | Las páginas deben generarse con el mismo mecanismo que las de la spec 009 (`src/*.html` + `src/partials/**`), y el menú de la spec 009 debe enlazar `galeria.html`. |

## Requisitos no funcionales
| Id | Requisito | Medida |
|---|---|---|
| RNF-01 | Accesibilidad | WCAG 2.2 AA; navegable con teclado; foco visible; todos los campos con etiqueta |
| RNF-02 | Contraste | Pares de `tokens.json` ya cubiertos por `tests/contrast.test.js`; cualquier color nuevo, vía token, con su prueba |
| RNF-03 | Responsivo y temas | Sin desbordamiento horizontal a 390 px; claro y oscuro |
| RNF-04 | Peso | `dist/js/app.js` no crece respecto del valor medido al empezar la spec (hoy 103 KB gzip con `gzip -9`) |
| RNF-05 | Limpieza | Sin JS en línea, sin estilos en línea, sin `!important` nuevo, sin errores de consola en ninguna página |
| RNF-06 | Texto | Español de RD con "usted", verbos en infinitivo en botones, sentence case, `RD$ 12,500.00`, `08/11/2026` |

## Reglas de negocio
- RN-01 Los datos son ficticios y están rotulados. Nada de identidades reales ni de datos presentados como reales.
- RN-02 Nada se guarda: ni en `localStorage`, ni en `sessionStorage`, ni en el servidor.
- RN-03 Un ejemplo que oculta contenido por permisos advierte que el control real está en el backend.

## Flujos y estados
Cada página parte de un estado cargado con datos de demostración. Donde aplica, se puede simular: vacío (sin registros), cargando (esqueleto), error (mensaje con reintento) y sin permiso (contenido oculto por `data-au-can`). Recargar la página restaura los datos originales.

## Interfaz y componentes
Reutiliza `data-au-datatable`, `data-au-render`, `data-au-chart`, `data-au-validate`, `data-au-mask`, `data-au-select`, `data-au-datepicker`, `data-au-editor`, `data-au-signature`, `data-au-export`, `data-au-sortable`, `data-au-can`, `data-au-bind`, `data-au-confirm`, `data-au-tabs` y las funciones `AU.alert/toast/confirm*`, `AU.toggleModal`, `AU.openIframe`, `AU.can`. Parciales nuevos previstos: menú lateral de la galería, tarjeta de índice, bloque "Cómo se usa".

## Contrato de datos
Archivos JSON de demostración en `public/data/`; arreglos de objetos. Forma prevista (se concreta en el plan):
- `estudiantes.json`: `{ id, nombre, grado, seccion, tutor, estado, matricula }`
- `docentes.json`: `{ id, nombre, area, secciones, estado }`
- `reporte.json`: `{ periodo, grado, estado, asistencia, promedio, pagos }`

## Criterios de aceptación
| Id | Dado | Cuando | Entonces | Prueba |
|---|---|---|---|---|
| CA-01 | `npm run build` | Se abren las 17 páginas | Sin errores de consola y todos los recursos existen | Manual en navegador + comprobación de recursos |
| CA-02 | `galeria.html` | Se revisa | Lista las dieciséis páginas con su contexto y todos los enlaces funcionan | Manual |
| CA-03 | `ejemplo-crud.html` | Se crea, edita y borra un registro | La tabla refleja cada cambio, hay aviso de éxito y la confirmación precede al borrado | Manual + prueba de la lógica de simulación |
| CA-04 | CRUD con formulario vacío | Se envía | Errores por campo en español, foco en el primero | Manual |
| CA-05 | `ejemplo-reporte.html` | Se cambia un filtro | Indicadores, gráficos y tabla se actualizan; la exportación genera `.xlsx` | Manual |
| CA-06 | `ejemplo-formularios.html` | Se avanza el asistente con un paso inválido | No avanza y marca los campos del paso | Manual |
| CA-07 | `ejemplo-tablas.html` | Se seleccionan filas | Las acciones masivas se habilitan según la selección | Manual |
| CA-08 | `ejemplo-perfiles.html` | Se elige cada uno de los cinco roles | Cada rol muestra su perfil (datos, pestañas y acciones propios), cambian los elementos visibles y el aviso de seguridad permanece | Manual |
| CA-09 | `ejemplo-edicion.html` | Se edita y se intenta salir sin guardar | Aparece el aviso; deshacer restaura el valor | Manual |
| CA-10 | Cada página | Se recorre con teclado | Todo es alcanzable y el foco es visible | Manual |
| CA-11 | Cada página a 390 px y en tema oscuro | Se revisa | Sin desbordamiento horizontal y contraste correcto | Manual |
| CA-12 | `npm run build` | Se mide `app.js` | Su peso gzip no es mayor que el medido al empezar | Medida |
| CA-13 | Repositorio | Se ejecuta `npm run check` | Verde, con las pruebas nuevas | `npm run check` |
| CA-14 | Código de la galería | Se busca `localStorage`, `sessionStorage` y datos fuera de `public/data/` | No hay | Búsqueda + prueba |
| CA-15 | Cualquier página de la galería | Se registra la red del navegador al cargarla y usarla | Ninguna solicitud sale del propio origen (nada de APIs ni imágenes externas) | Manual en navegador |
| CA-16 | `public/data/README.md` | Se lee | Documenta el origen de los nombres (`randomuser.me`, semilla, campos) y cómo regenerarlos | Revisión |

## Información faltante
Resuelta por el propietario el 08/11/2026:
1. **Perfiles:** el perfil de cada usuario según su rol.
2. **"Etc.":** incluir todo lo que se pueda (de ahí las seis páginas extra).
3. **Persistencia de la simulación:** en memoria; se pierde al recargar (se mantiene la propuesta).
4. **Orden de entrega:** por fases (ver `plan.md`).
5. **Datos de ejemplo:** nombres genéricos; si hay API pública, mejor. Decisión de diseño: se usa `randomuser.me` **una sola vez** para generar los fixtures y no en tiempo de ejecución, porque `AU.api` bloquea las URLs externas (spec 010, CA-08), una API externa en vivo exigiría abrir la política de contenido, enviaría la dirección IP de quien abra la galería a un tercero y haría los ejemplos dependientes de la red.

## Riesgos
| Riesgo | Mitigación |
|---|---|
| 11 páginas son mucho trabajo en una sola entrega | Entrega por fases, cada una con su `npm run check` y su revisión |
| El código de demostración infla `app.js` (ya supera 100 KB) | RF-13 y CA-12: carga diferida y medida antes y después |
| Los ejemplos se toman por la forma "correcta" de integrar | Bloque "Cómo se usa" y aviso de datos de demostración en cada página |
| La simulación en memoria se confunde con persistencia real | Aviso visible "los cambios no se guardan" |

## Trazabilidad
| Requisito | Archivos previstos | Prueba |
|---|---|---|
| RF-01, RF-02, RF-14 | `src/galeria.html`, `src/partials/app/sidebar-galeria.hbs`, `src/data/pages.js` | CA-01, CA-02 |
| RF-03, RF-09 | `src/ejemplo-crud.html`, `src/ejemplo-edicion.html`, `src/js/demo/*` | CA-03, CA-04, CA-09, lógica en `tests/` |
| RF-04, RF-06 | `src/ejemplo-reporte.html`, `src/ejemplo-tablas.html`, `public/data/*.json` | CA-05, CA-07 |
| RF-05 | `src/ejemplo-formularios.html` | CA-06 |
| RF-07, RF-10 | `src/ejemplo-tarjetas.html`, `ejemplo-botones.html`, `ejemplo-modales.html`, `ejemplo-alertas.html` | CA-10, CA-11 |
| RF-08 | `src/ejemplo-perfiles.html` | CA-08 |
| RF-11, RF-12, RF-13 | Parcial "Cómo se usa", `public/data/*.json`, `src/js/demo/*` | CA-12, CA-14 |

## Verificación — Fase 1 (08/11/2026)
Build compilado servido con `vite preview`, Chrome en Windows. Páginas: índice, botones, alertas, modales, tarjetas y estados.

| Criterio | Resultado | Detalle |
|---|---|---|
| CA-01 | Cumple | Las 6 páginas cargan sin errores ni avisos de consola (errores de JavaScript, promesas rechazadas, `console.error` y `console.warn` registrados desde el arranque) y todos sus recursos existen |
| CA-02 | Cumple | El índice muestra 7 tarjetas (5 de la galería y 2 de otras páginas); el menú "Galería" marca la página activa con `aria-current` |
| CA-10 | Cumple en lo medido | Ningún control sin nombre accesible (el buscador tiene una etiqueta oculta); botones, desplegable, alternables, 7 modales y el panel lateral responden; los modales llevan el foco adentro y lo devuelven al botón; Escape cierra el normal y no el obligatorio |
| CA-11 | Cumple tras una corrección | A 390 px, sin desbordamiento en claro y en oscuro, **con los bloques "Cómo se usa" abiertos**. Antes de la corrección había desbordamiento (683 px de contenido en 390) por una línea larga de código dentro de una rejilla; se arregló con `min-width: 0` en `.au-howto` |
| CA-12 | Cumple | `dist/js/app.js` idéntico a la referencia: 333 485 bytes, 106 236 con `gzip -9`, huella `929e56f92a44b641` |
| CA-15 | Cumple | Ninguna solicitud sale del propio origen en ninguna de las 6 páginas |
| RF-10 / RF-07 | Cumple | Toasts de los 4 tipos y diálogos de confirmación (`confirm-delete` con sus botones), alerta cerrable, barras de progreso con su ancho (78 % y 92 %; 78 % y 45 %), formulario en modal con 6 errores al enviarlo vacío y 0 con datos válidos, colapsable, esqueleto animado, `data-au-can` oculta el botón sin permiso |
| RF-11 | Cumple | Los bloques "Cómo se usa" salen como texto, no se ejecutan (0 botones o campos dentro) y muestran las plantillas literales |
| Contraste | Cumple | Aviso de demostración 12.8:1 (claro) y 12.5:1 (oscuro); bloque de código 12.7:1 y 12.1:1 |

**Pendiente de esta fase:** el marco `AU.openIframe` que menciona el alcance de la página de modales necesita código de demostración (se hará en la Fase 2 con la entrada de Vite para demostraciones). La barra superior de las páginas de la galería es la compartida de la spec 009 y muestra "Buscar estudiante, tutor o factura…" y "Período 2026-2027", que no corresponden al contexto de la galería.

**Límites de esta verificación:** una sola sesión de Chrome en Windows; el foco por teclado se comprobó en modales, panel y desplegable, no tabulando cada página completa; la prueba de 390 px usó marcos del mismo origen y no un emulador de móvil; no se probó Firefox ni Safari.

## Aprobación
- [x] Revisada por el propietario — fecha: 08/11/2026 (Haisel Ramirez)
