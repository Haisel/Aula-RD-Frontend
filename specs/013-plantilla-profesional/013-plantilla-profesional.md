# 013-plantilla-profesional

> Estado: Aprobada (08/11/2026, por Haisel Ramirez) · Versión 1.1 (ampliada el 08/11/2026 por pedido del propietario: variantes de diseño) · Fecha: 08/11/2026

## Objetivo
Dejar la plantilla **completa y profesional, al nivel de AdminLTE, AdminKit y CoreUI**: un menú por categorías donde cada ítem abre su página de demostración, cada componente y cada función de `AU` con ejemplo, calidad verificada con medidas y una guía para integrarla. Es la etapa previa a adecuar páginas para el sistema de gestión.

## Contexto
- El propietario pidió (08/11/2026): enlazar todas las páginas, hacer demostraciones de todo lo que contiene la plantilla y que quede "totalmente resuelta profesionalmente"; después se adecuan las páginas del sistema de gestión. Como referencia nombró AdminLTE, AdminKit y CoreUI.
- **Qué ofrecen esas plantillas** (la referencia de estructura): paneles (dashboards) en varias variantes, widgets, elementos de interfaz (botones, alertas, modales, tarjetas, tipografía, íconos, insignias, acordeón, pestañas, paginación, listas, carrusel, línea de tiempo, tooltips), formularios (controles, validación, avanzados, editores), tablas (básicas, DataTables), gráficos, calendario, aplicaciones (bandeja de correo, chat, tablero), páginas (perfil, facturas, precios, preguntas frecuentes, contacto), autenticación (iniciar sesión, registro, olvidé mi contraseña, bloqueo) y páginas de error.
- **Auditoría del 08/11/2026** (medida sobre el repositorio):
  - 14 páginas fuente.
  - **30 ítems de menú** de los 4 portales apuntan a `#algo` (páginas que no existen) y hay **15 `href="#"` vacíos** (7 en 5 páginas y 8 en los parciales de la barra superior y del pie, que se repiten en todas las páginas que los usan).
  - De los 24 componentes declarativos, **`data-au-tabs` no tiene ninguna demostración**; `data-au-confirm`, `data-au-sortable`, `data-au-calendar` y `data-au-datatable` aparecen en un solo archivo.
  - Faltan los flujos de cuenta, perfil, configuración, notificaciones, ayuda, términos y privacidad, y las páginas de error reales (403, 404 y 500 existen solo como tarjetas dentro de una página de ejemplo).
- Relación con la spec 012: la **013 absorbe las fases 2 a 4 de la 012** y las amplía. La 012 sigue vigente y su Fase 1 ya está publicada.
- Restricciones: constitución y `AGENTS.md` (sin JS ni estilos en línea; solo `AU.*`; solo librerías del ecosistema aprobado; datos de ejemplo en `public/data/`, ficticios y rotulados; el frontend no es barrera de seguridad; español de RD con "usted"). La spec 006 fija `app.js` ≤ 100 KB gzip y hoy mide 103 KB: **nada de esto puede aumentar el núcleo**. Se toma inspiración de la estructura de esas plantillas, no su código ni sus recursos.

## Alcance
Seis ejes.

**A. Menú por categorías sin callejones.** Un menú de la plantilla, compartido por todas las páginas de demostración, con estas categorías. Cada ítem abre una página real.

| Categoría | Páginas |
|---|---|
| Paneles | Los 4 portales (existen) + resumen financiero + analítica académica |
| Widgets | Indicadores, tarjetas pequeñas, gráficos en miniatura y listas de actividad |
| Interfaz | Botones, alertas y avisos, modales y paneles, tarjetas, estados (existen) + tipografía, colores, íconos (buscador de Bootstrap Icons), insignias y progreso, acordeón y colapsables, pestañas y navegación, paginación y migas, listas, carrusel, línea de tiempo, tooltips y popovers, cuadrícula y diseño |
| Formularios | Controles básicos, validación, avanzados (listas, fechas, máscaras), asistente por pasos, editor de texto, carga de archivos, firma |
| Tablas | Básicas, DataTable, CRUD, selección y acciones masivas, fila de detalle |
| Gráficos | Línea y barras; dona y área |
| Calendario | Mes, semana y lista con eventos |
| Aplicaciones | Bandeja de mensajes (lista, lectura y redacción), chat, tablero (kanban), proyectos, contactos, galería de imágenes, resultados de búsqueda |
| Páginas | Perfil, cuenta y seguridad, facturas, precios, preguntas frecuentes, contacto, actividad, notificaciones, términos, privacidad, inicio rápido (en blanco) |
| Autenticación | Iniciar sesión (existe), registro, olvidé mi contraseña, restablecer, verificación en dos pasos, bloqueo de pantalla |
| Errores | 403, 404, 500 y mantenimiento |
| Sistema de gestión | Los módulos del menú actual de cada portal, resueltos con arquetipos (ver abajo) |

**B. Módulos de gestión con arquetipos.** Cada ítem del menú de los 4 portales abre una página que usa un arquetipo, con datos de demostración propios del módulo; luego se adecuan al sistema de gestión.

| Arquetipo | Módulos que lo usan (portal) |
|---|---|
| Lista con CRUD | Instituciones, Usuarios internos (superadmin) · Estudiantes, Docentes (institución) |
| Tabla con filtros | Suscripciones, Cobros (superadmin) · Cobros (institución) · Estado de cuenta (familia) |
| Tarjetas y precios | Planes, Publicidad (superadmin) |
| Reporte | Contabilidad (superadmin) · Reportes (institución) |
| Bandeja de mensajes | Soporte (superadmin) · Mensajes (docente) |
| Cuadrícula de registro | Asistencia, Calificaciones (institución, docente y familia en lectura) |
| Asistente por pasos | Matrícula (institución) |
| Calendario | Planificación (docente) · Horario (familia) |
| Comunicados | Comunicados (institución, docente y familia) |
| Tarjetas de secciones | Mis secciones (docente) |
| Lista con firma | Autorizaciones (familia) |
| Configuración | Configuración (superadmin e institución) |

**C. Demostración de todo.** Una matriz de cobertura: cada atributo `data-au-*` y cada función pública de `AU` aparece en al menos una página con su "Cómo se usa". Una prueba automática falla si queda una celda vacía.

**D. Las páginas pendientes de la spec 012** (fases 2 a 4), integradas en las categorías de arriba.

**E. Calidad medible.** Lighthouse por página (accesibilidad ≥ 95, mejores prácticas ≥ 95, SEO ≥ 90), consola sin errores, sin recursos externos, 390 px, tema oscuro, impresión donde aplique y teclado.

**F. Documentación e integración.** Guía de integración (copiar una página, arquetipos, tokens y tema), inicio rápido en blanco, referencia de componentes y funciones, README al día y versión 0.4.0.

**G. Variantes de diseño (ampliación del 08/11/2026).** Como en AdminLTE, AdminKit y CoreUI, cada tipo de página tiene **varias estructuras y diseños**, no uno solo. Pedido del propietario: "varias páginas de login de diferente estructura y diseño, varias de perfiles, varios formularios, etc.". Lista propuesta:

| Tipo | Variantes |
|---|---|
| Inicio de sesión (7) | Dividido con panel de marca (existe) · centrado en tarjeta · con ilustración y acceso con proveedor externo · mínimo sin tarjeta · portada a pantalla completa con tarjeta translúcida · por pestañas según el portal · sin contraseña con código de un solo uso |
| Recuperación | Olvidé mi contraseña (centrado) |
| Perfiles (6) | Con portada y pestañas · con tarjeta lateral y detalle · compacto con línea de tiempo · ficha tipo credencial · perfil de institución · perfil editable (formulario) |
| Formularios (9) | Controles básicos · diseños (horizontal, en línea y con etiqueta flotante) · validación · agrupado por secciones · avanzado (listas, fechas, máscaras) · asistente por pasos · editor de texto · carga de archivos · firma |

Las variantes comparten componentes y tokens (no repiten estilos), usan datos de demostración y cumplen los mismos requisitos de accesibilidad y calidad que el resto.

## Exclusiones
- Lógica de negocio real, backend y persistencia: los datos son de demostración y se pierden al recargar.
- **Mapas** (por ejemplo mapas vectoriales o de Google): exigen librerías fuera del ecosistema aprobado; se hacen solo con un ADR y aprobación aparte.
- Copiar código o recursos de AdminLTE, AdminKit o CoreUI.
- Contenido final (textos legales, precios, datos de contacto): se usa texto de relleno rotulado.
- Otros idiomas distintos del español de RD.
- Adecuar las páginas al sistema de gestión: etapa siguiente, con su propia spec.

## Actores y permisos
| Actor | Portal | Puede | No puede |
|---|---|---|---|
| Persona que integra la plantilla | Todos | Recorrer toda la interfaz, copiar páginas y arquetipos | Guardar datos |
| Superadmin, administrador, docente, estudiante y tutor (ejemplo) | Su portal | Ver las páginas de su menú con datos de demostración | Nada de esto protege datos: `data-au-can` y `AU.can()` solo ocultan; la seguridad es del backend |

## Requisitos funcionales
| Id | Requisito |
|---|---|
| RF-01 | Cada entrada de menú de los cuatro portales y del menú de la plantilla debe abrir una página que exista; no puede quedar ningún `href="#algo"` ni `href="#"` vacío fuera de anclas internas de la misma página. |
| RF-02 | Debe existir el menú de la plantilla por categorías (tabla del eje A), con la página activa marcada, accesible desde cada portal y desde la galería. |
| RF-03 | Debe existir una página 404 real, y las páginas 403, 500 y de mantenimiento, con el mismo diseño y una salida. |
| RF-04 | Cada arquetipo del eje B debe existir como página con datos de demostración, estados (vacío, cargando, error, sin permiso) y bloque "Cómo se usa". |
| RF-05 | Las páginas interiores deben tener migas de pan, un único `h1`, `title` y `description` propios y `lang="es-DO"`. |
| RF-06 | Deben existir las páginas de autenticación y de cuenta, con validación, errores por campo y foco al primer error. |
| RF-07 | Cada atributo `data-au-*` registrado y cada función pública de `AU` debe aparecer en al menos una página con su "Cómo se usa". |
| RF-08 | Deben existir las páginas de interfaz, formularios, tablas, gráficos, calendario y aplicaciones de la tabla del eje A. |
| RF-09 | Debe existir una guía de integración y una página de inicio rápido en blanco con el diseño de aplicación. |
| RF-10 | El código de demostración debe cargarse diferido y no debe aumentar `dist/js/app.js` (hoy 333 485 bytes, huella `929e56f92a44b641`). |
| RF-11 | Los datos de demostración deben venir de `public/data/` (nombres genéricos, spec 012 RF-12) y cada página debe indicar que son de demostración. |
| RF-12 | Deben existir las variantes de diseño del eje G (7 de inicio de sesión, 6 de perfil y 9 de formularios), cada una con una estructura distinta y no una copia con otro color, todas enlazadas desde el menú de la plantilla. |

## Requisitos no funcionales
| Id | Requisito | Medida |
|---|---|---|
| RNF-01 | Accesibilidad | WCAG 2.2 AA; teclado; foco visible; Lighthouse de accesibilidad ≥ 95 en cada página |
| RNF-02 | Calidad web | Lighthouse de mejores prácticas ≥ 95 y de SEO ≥ 90 en cada página |
| RNF-03 | Consola y red | 0 errores de consola y 0 solicitudes fuera del propio origen en cada página |
| RNF-04 | Responsivo y temas | Sin desbordamiento a 390 px; claro y oscuro; a 1440, 1920 y 2560 px sin banda vacía |
| RNF-05 | Peso | `app.js` no crece; todas las páginas comparten el mismo CSS |
| RNF-06 | Limpieza | Sin JS ni estilos en línea, sin `!important` nuevo, sin hex sueltos; solo tokens y `--au-*` |
| RNF-07 | Texto | Español de RD con "usted", verbos en infinitivo, `RD$ 12,500.00`, `08/11/2026` |

## Reglas de negocio
- RN-01 Datos ficticios y rotulados; ninguna identidad real ni presentada como real.
- RN-02 Nada se guarda (ni `localStorage` ni `sessionStorage` ni servidor).
- RN-03 Todo contenido de relleno (legal, contacto, precios) lleva un rótulo visible de "texto de ejemplo".
- RN-04 Una entrada de menú nunca queda sin destino: si un módulo no tiene diseño propio, usa su arquetipo.

## Flujos y estados
Cada página parte con datos cargados. Donde aplica se simulan vacío, cargando, error y sin permiso. Las rutas desconocidas llevan a la página 404.

## Interfaz y componentes
Reutiliza los 24 componentes declarativos y las funciones de `AU`; sin componentes nuevos de la librería ni librerías nuevas. Parciales nuevos previstos: migas de pan, menú de la plantilla, encabezado de arquetipo. Ya existen el bloque "Cómo se usa", la tarjeta de índice y el aviso de demostración.

## Contrato de datos
JSON de demostración en `public/data/` (arreglos de objetos): los de la spec 012 más los que pidan los arquetipos (por ejemplo `instituciones.json`, `planes.json`, `mensajes.json`, `notificaciones.json`, `proyectos.json`, `contactos.json`). Formas concretas en el plan.

## Criterios de aceptación
| Id | Dado | Cuando | Entonces | Prueba |
|---|---|---|---|---|
| CA-01 | Todos los menús y páginas | Se ejecuta la prueba de enlaces | Ningún enlace apunta a una página inexistente ni a `#` vacío | `tests/links.test.js` |
| CA-02 | Los componentes y funciones de `AU` | Se ejecuta la prueba de cobertura | Cada uno aparece en al menos una página | `tests/coverage.test.js` |
| CA-03 | Cada página | Se mide con Lighthouse | Accesibilidad ≥ 95, mejores prácticas ≥ 95, SEO ≥ 90 | Medida registrada por página |
| CA-04 | Cada página | Se carga en navegador | 0 errores de consola y 0 solicitudes externas | Manual en navegador |
| CA-05 | Cada página a 390 px, en oscuro y a 1440, 1920 y 2560 px | Se revisa | Sin desbordamiento y sin banda vacía | Manual en navegador |
| CA-06 | Cada arquetipo y cada categoría | Se recorre con teclado | Todo es alcanzable y el foco es visible | Manual |
| CA-07 | Ruta desconocida | Se abre | Muestra la página 404 con salida | Manual |
| CA-08 | Autenticación y cuenta | Se envían vacíos y completos | Errores por campo y foco al primero; éxito con aviso | Manual + pruebas de lógica |
| CA-09 | El menú de la plantilla | Se recorre ítem por ítem | Cada ítem abre su página y la marca como activa | `tests/links.test.js` + manual |
| CA-10 | `npm run build` | Se mide `app.js` | Idéntico al de referencia | Medida |
| CA-11 | Repositorio | Se ejecuta `npm run check` | Verde, con las pruebas nuevas | `npm run check` |
| CA-12 | La guía de integración | Una persona nueva copia una página | La página funciona en su proyecto sin tocar nada más | Revisión |
| CA-13 | Las variantes de inicio de sesión, perfil y formularios | Se comparan entre sí | Cada una tiene una estructura distinta (no solo otro color) y todas pasan CA-01, CA-04, CA-05 y CA-06 | `tests/auth-pages.test.js` y equivalentes + manual |

## Información faltante
**Aprobadas el 08/11/2026 las propuestas de los puntos 1 a 5 y 7** (arquetipos, sin mapas por ahora, páginas públicas con texto de relleno rotulado, umbrales de Lighthouse, variantes financiera y académica de panel, y entrega por fases). **Sigue abierto el punto 6** (peso de `app.js`). Texto original de cada decisión:
1. **Menú sin destino:** ¿cada módulo abre una página de arquetipo con datos propios, o una sola página genérica "Módulo en construcción"? *Propuesta: arquetipos.*
2. **Mapas:** ¿se incluyen? Exigen una librería nueva y un ADR. *Propuesta: no, por ahora.*
3. **Páginas públicas:** términos, privacidad y contacto con texto de relleno rotulado. *Propuesta: sí.*
4. **Umbrales de calidad:** Lighthouse ≥ 95 en accesibilidad y mejores prácticas, ≥ 90 en SEO. *Propuesta: sí.*
5. **Variantes de panel:** ¿resumen financiero y analítica académica, o prefiere otras? *Propuesta: esas dos.*
6. **Peso de `app.js`** (spec 006): hoy 103 KB frente a un límite de 100 KB. ¿Se sube el límite con un ADR o se reduce el núcleo? *No bloquea esta spec, pero debe decidirse antes del cierre.*
7. **Orden de entrega:** *Propuesta en el plan: F1 menú, arquetipos y errores; F2 datos (tablas, CRUD, reporte, tablero); F3 autenticación, cuenta y páginas; F4 interfaz y formularios; F5 aplicaciones, calendario y gráficos; F6 cobertura total, guía y medición.*

## Riesgos
| Riesgo | Mitigación |
|---|---|
| Volumen: unas 90 a 100 páginas en total | Fases por categoría con commit propio; arquetipos y parciales reutilizables; pruebas de contrato |
| Enlaces muertos que reaparezcan | `tests/links.test.js` dentro de `npm run check` |
| Texto de relleno que parezca real | Rótulo visible (RN-03) y datos genéricos |
| `app.js` ya excede su límite | RF-10 y CA-10: medir en cada fase y no añadir al núcleo |
| Lighthouse varía entre ejecuciones | Registrar la mediana de 3 ejecuciones y el entorno |
| Parecerse demasiado a las plantillas de referencia | Solo se toma la estructura; diseño, tokens y código son propios |

## Trazabilidad
| Requisito | Archivos previstos | Prueba |
|---|---|---|
| RF-01, RF-02, RF-05 | `src/data/pages.js`, parciales de menú y migas, páginas | CA-01, CA-09 |
| RF-03 | `src/404.html`, `403.html`, `500.html`, `mantenimiento.html` | CA-07 |
| RF-04, RF-08 | Páginas por categoría, `src/js/demo/*`, `public/data/*.json` | CA-04, CA-06 |
| RF-06 | Páginas de autenticación y cuenta | CA-08 |
| RF-07 | Matriz de cobertura en `tests/coverage.test.js` | CA-02 |
| RF-09 | `docs/09-guia-de-integracion.md`, `src/inicio-rapido.html` | CA-12 |
| RF-10, RF-11 | Entrada de Vite de demostraciones, `public/data/` | CA-10 |

## Aprobación
- [x] Revisada por el propietario — fecha: 08/11/2026 (Haisel Ramirez)
