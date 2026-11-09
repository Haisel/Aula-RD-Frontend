# 012-galeria-de-funcionalidades

> Estado: Borrador · Versión 0.1 · Fecha: 08/11/2026

## Objetivo
Dar a quien integre la plantilla una **galería de páginas de ejemplo por contexto** (CRUD, reporte, formularios avanzados, tablas, tarjetas, perfiles, edición, botones, modales y alertas) que muestre cada funcionalidad de los componentes funcionando y cómo se usa, para copiarla en su backend.

## Contexto
- La spec 009 trajo 8 páginas y el catálogo `componentes.html` (12 secciones, una por componente). Ese catálogo enseña piezas sueltas; no enseña **flujos** (crear → editar → borrar, filtrar → exportar, ver como otro rol).
- El propietario pidió (08/11/2026) páginas para: CRUD, reporte, formularios avanzados, DataTable con ejemplo, tarjetas personalizadas, diferentes perfiles, ediciones, botones, modales, alertas "y etc.", y dejó a mi criterio los detalles ("por contexto").
- Restricciones que aplican: constitución y `AGENTS.md` (sin JS ni estilos en línea; solo `AU.*`; datos de ejemplo solo en `public/data/`; el frontend no es barrera de seguridad; español de RD con "usted"). La spec 006 fija `app.js` ≤ 100 KB gzip y hoy ya lo supera, así que **esta galería no debe aumentar el núcleo**.
- Supuestos míos (ver "Información faltante"): "diferentes perfiles" = fichas de perfil **y** ver la interfaz como otro rol; "etc." = las extras de la sección Alcance.

## Alcance
Una página índice y diez páginas de ejemplo, todas con el layout de aplicación y un menú lateral propio "Galería":

| Página | Archivo | Muestra |
|---|---|---|
| Galería (índice) | `galeria.html` | Tarjetas agrupadas por contexto, con qué componente usa cada página |
| CRUD | `ejemplo-crud.html` | Listar, crear, editar y borrar estudiantes con tabla, modal de formulario, confirmación y avisos; estados vacío, cargando y error |
| Reporte | `ejemplo-reporte.html` | Filtros (fechas, grado, estado), indicadores, gráficos, tabla de resultados, exportar a Excel, imprimir |
| Formularios avanzados | `ejemplo-formularios.html` | Secciones, asistente por pasos, validación en vivo, máscaras, listas dependientes (provincia → municipio), selección múltiple, rango de fechas, editor de texto, firma, archivos, filas repetibles |
| Tablas (DataTable) | `ejemplo-tablas.html` | Búsqueda, orden, paginación, selección de filas y acciones masivas, filtros externos, fila de detalle, columnas con píldoras, avatares y acciones, exportación |
| Tarjetas | `ejemplo-tarjetas.html` | Indicador, estudiante, docente, plan con precio, progreso, lista, línea de tiempo, colapsable, con imagen, esqueleto de carga |
| Perfiles | `ejemplo-perfiles.html` | Fichas de estudiante, docente, tutor e institución con pestañas; selector "Ver como" que muestra y oculta con `data-au-can` según permisos |
| Edición | `ejemplo-edicion.html` | Edición en línea, en modal y en panel lateral; aviso de cambios sin guardar; deshacer |
| Botones | `ejemplo-botones.html` | Variantes, tamaños, con ícono, grupos, desplegables, estados (cargando, deshabilitado), alternables, acciones masivas |
| Modales | `ejemplo-modales.html` | Tamaños, desplazamiento, pantalla completa, formulario en modal, confirmaciones, panel lateral, ventana emergente, marco `AU.openIframe` |
| Alertas | `ejemplo-alertas.html` | Alertas en línea, avisos emergentes (toast), diálogos, banners, errores de formulario, estados vacíos y de error, barra de progreso |

Extras que entrarían bajo "etc." (el propietario decide en "Información faltante"): calendario y agenda, navegación (migas, pestañas, acordeón, paginación, pasos), carga de archivos con vista previa, impresión.

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
| RF-01 | `galeria.html` debe listar las diez páginas agrupadas por contexto, cada una con una frase de uso y los componentes que demuestra. |
| RF-02 | Todas las páginas de la galería deben compartir un menú lateral "Galería" con la página activa marcada, y enlazar con las páginas de la spec 009. |
| RF-03 | **CRUD:** debe permitir crear, editar y borrar registros con validación (`data-au-validate`), confirmación de borrado (`AU.confirmDelete`) y aviso de éxito o error, actualizando la tabla sin recargar; con estados vacío, cargando y error simulables. |
| RF-04 | **Reporte:** los filtros deben actualizar indicadores, gráficos y tabla; debe poder exportarse a Excel y verse bien impreso (hoja `@media print`). |
| RF-05 | **Formularios avanzados:** debe incluir un asistente por pasos (validación por paso y foco al primer error), listas dependientes, selección múltiple, rango de fechas, filas repetibles, y mostrar los errores del servidor por campo. |
| RF-06 | **Tablas:** debe mostrar DataTables 2 en español con selección de filas, acciones masivas que se habilitan según la selección, filtros externos y fila de detalle desplegable. |
| RF-07 | **Tarjetas:** cada variante debe usar solo clases `au-*` y utilidades de Bootstrap, y funcionar en tema claro y oscuro. |
| RF-08 | **Perfiles:** el selector "Ver como" debe cambiar el usuario y los permisos de ejemplo y reflejarlo con `data-au-can` y `data-au-bind`, con un aviso visible de que ocultar no es proteger. |
| RF-09 | **Edición:** debe avisar de cambios sin guardar al salir, permitir deshacer el último cambio y devolver el foco al elemento que abrió la edición. |
| RF-10 | **Botones, modales y alertas:** cada variante debe tener nombre accesible, operarse con teclado y mostrar su foco. |
| RF-11 | Cada ejemplo debe incluir un bloque "Cómo se usa" con el fragmento de HTML (atributos `data-au-*`) o la llamada `AU.*` que lo produce, en texto (no como código ejecutable). |
| RF-12 | Los datos de ejemplo deben venir de archivos nuevos en `public/data/` (por ejemplo `estudiantes.json`, `docentes.json`, `reporte.json`), rotulados como demostración, y cada página debe indicar visiblemente que son datos de demostración. |
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
| CA-01 | `npm run build` | Se abren las 11 páginas | Sin errores de consola y todos los recursos existen | Manual en navegador + comprobación de recursos |
| CA-02 | `galeria.html` | Se revisa | Lista las diez páginas con su contexto y todos los enlaces funcionan | Manual |
| CA-03 | `ejemplo-crud.html` | Se crea, edita y borra un registro | La tabla refleja cada cambio, hay aviso de éxito y la confirmación precede al borrado | Manual + prueba de la lógica de simulación |
| CA-04 | CRUD con formulario vacío | Se envía | Errores por campo en español, foco en el primero | Manual |
| CA-05 | `ejemplo-reporte.html` | Se cambia un filtro | Indicadores, gráficos y tabla se actualizan; la exportación genera `.xlsx` | Manual |
| CA-06 | `ejemplo-formularios.html` | Se avanza el asistente con un paso inválido | No avanza y marca los campos del paso | Manual |
| CA-07 | `ejemplo-tablas.html` | Se seleccionan filas | Las acciones masivas se habilitan según la selección | Manual |
| CA-08 | `ejemplo-perfiles.html` | Se elige otro rol en "Ver como" | Cambian usuario y elementos visibles, y el aviso de seguridad permanece | Manual |
| CA-09 | `ejemplo-edicion.html` | Se edita y se intenta salir sin guardar | Aparece el aviso; deshacer restaura el valor | Manual |
| CA-10 | Cada página | Se recorre con teclado | Todo es alcanzable y el foco es visible | Manual |
| CA-11 | Cada página a 390 px y en tema oscuro | Se revisa | Sin desbordamiento horizontal y contraste correcto | Manual |
| CA-12 | `npm run build` | Se mide `app.js` | Su peso gzip no es mayor que el medido al empezar | Medida |
| CA-13 | Repositorio | Se ejecuta `npm run check` | Verde, con las pruebas nuevas | `npm run check` |
| CA-14 | Código de la galería | Se busca `localStorage`, `sessionStorage` y datos fuera de `public/data/` | No hay | Búsqueda + prueba |

## Información faltante
Preguntas para el propietario (con mi supuesto si no responde):
1. **"Diferentes perfiles":** ¿fichas de perfil (estudiante, docente, tutor, institución) o cómo se ve la interfaz según el rol? *Supuesto: ambas, en `ejemplo-perfiles.html`.*
2. **"Etc.":** ¿se incluyen calendario y agenda, navegación (migas, pestañas, acordeón, pasos), carga de archivos con vista previa e impresión? *Supuesto: sí a los cuatro, como una fase final.*
3. **Persistencia de la simulación:** ¿en memoria (se pierde al recargar) o en el navegador? *Supuesto: en memoria; `AGENTS.md` prohíbe presentar datos simulados como reales y guardar nada sensible.*
4. **Orden de entrega:** ¿por fases? *Propuesta: Fase 1 índice, botones, alertas, modales y tarjetas (casi solo HTML y CSS); Fase 2 tablas, CRUD y reporte; Fase 3 formularios avanzados, edición, perfiles y extras.*
5. **Datos de ejemplo:** ¿usar nombres genéricos ("Estudiante de demostración 1")? Recomendado, por la observación de la spec 009 sobre personas reales.

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

## Aprobación
- [ ] Revisada por el propietario — fecha:
