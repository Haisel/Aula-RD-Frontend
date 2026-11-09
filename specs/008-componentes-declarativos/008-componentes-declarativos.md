# 008-componentes-declarativos

> Estado: Implementada (08/11/2026) · pendiente de aprobación · Versión 1.0 · ADR-003, ADR-009, ADR-010

## Objetivo
Que cualquier backend obtenga comportamiento completo solo con HTML: atributos `data-au-*` que activan componentes y librerías del ecosistema, inicializados una sola vez y con carga diferida.

## Alcance
24 componentes registrados (lista y opciones en `docs/03-componentes.md` §3): estructura de app, navbar, tema, confirmación, acciones, formularios, máscaras, contraseña, facturación, tiempo relativo, formato, tooltip, gráfico, tabla, select, fecha, calendario, editor, firma, ordenable, código de barras, QR, render de plantillas, exportación, pestañas accesibles (spec 010).

## Requisitos funcionales
| Id | Requisito |
|---|---|
| RF-01 | Cada componente se inicializa una sola vez por elemento y se marca con `data-au-ready`. |
| RF-02 | `AU.init(root)` inicializa contenido insertado después de la carga. |
| RF-03 | Un fallo en un componente no impide inicializar los demás; el elemento queda con `data-au-error`. |
| RF-04 | Componentes con librería pesada la descargan solo si su atributo está presente. |
| RF-05 | Formularios: tres modos de envío (`native`, `ajax`, `event`), errores por campo con `aria-invalid` y `aria-describedby`, foco al primer error, errores del servidor por campo. |
| RF-06 | Gráficos, calendario y render aceptan JSON en línea o URL. |
| RF-07 | Tablas: DataTables 2 en español; el menú de tamaño incluye el valor configurado. |
| RF-08 | Máscaras de cédula, RNC, teléfono, moneda y entero. |

## Criterios de aceptación
| Id | Dado | Cuando | Entonces | Prueba |
|---|---|---|---|---|
| CA-01 | Dos elementos `[data-x]` | `initAll` dos veces | Se inicializan una sola vez | `tests/theme-registry.test.js` |
| CA-02 | Componente que lanza error | `initAll` | Los demás se inicializan | idem |
| CA-03 | `suscribir.html` vacío | Enviar | 10 campos marcados con mensajes en español; foco en el primero | Playwright 08/11/2026 |
| CA-04 | Formulario completo con RNC/cédula válidos | Enviar | Sin errores; toast de éxito | Playwright 08/11/2026 |
| CA-05 | `<tbody data-au-render data-au-source="data/cobros.json">` | Carga | 6 filas con estado en píldora y montos RD$ | Playwright 08/11/2026 |
| CA-06 | `data-au-page-length="5"` | Carga | Selector muestra "5" | Playwright 08/11/2026 |
| CA-07 | Choices con error | Enviar | El mensaje aparece debajo del control, no dentro | Playwright 08/11/2026 |

## Riesgos
- DataTables incluye jQuery interno (ADR-010).

## Trazabilidad
`src/js/core/registry.js`, `src/js/components/*`, `src/js/adapters/*`, `src/scss/vendors/*`.

## Verificación (08/11/2026)
Build compilado servido con `vite preview`, Chrome en Windows. Los modos `ajax` y `login` se probaron contra la API simulada `npm run mock` (spec 011), cambiando `data-au-submit` en el formulario real de `login.html`.

| Criterio | Resultado | Detalle |
|---|---|---|
| CA-03 | Cumple | `suscribir.html` vacío: 10 campos con `aria-invalid`, foco en el primero, mensajes en español enlazados con `aria-describedby` |
| CA-04 | Cumple | Formulario completo con RNC y cédula válidos (dígito verificador): 0 campos inválidos, evento `au:form:submit` con 11 datos y toast de éxito |
| CA-05, CA-06 | Cumple | Tabla con `data-au-render` (6 filas, píldoras, `RD$`) y selector "5 por página" |
| CA-07 | Cumple | El mensaje "Seleccione la provincia." queda justo después del contenedor `.choices` y fuera de él |
| RF-05 modos | Cumple | `native`: no envía con datos inválidos (2 campos marcados) y llama a `form.submit()` una vez con datos válidos. `event`: emite `au:form:submit`. `ajax`: clave incorrecta emite `au:form:error` (`UNAUTHORIZED`), muestra el mensaje y restaura el botón; clave correcta emite `au:form:success`. `login`: igual, y la sesión pasa a `authenticated` sin token en `localStorage` ni `sessionStorage` |
| RF-08 | Cumple | Las máscaras dejan `1-62-32215-6`, `001-0889020-3`, `(809) 555-1234` en el navegador (más `tests/forms-masks.test.js`) |
| Quill | Corregido | Antes: el selector de títulos (`.ql-picker-label`) sin nombre y botones con etiquetas en inglés. Ahora los 11 controles de la barra tienen nombre en español y ninguno sin nombre; el editor sigue funcionando (negrita alterna `aria-pressed` y produce `<strong>`) |

**Cambios de código por esta verificación:** `labelToolbar()` en `src/js/adapters/editor.js` (etiquetas en español para la barra de Quill; prueba primero en `tests/editor-a11y.test.js`, 6 pruebas vistas en rojo) y la corrección de `aria-describedby` duplicado en `showErrors` (hecha antes, con su prueba).

**Límites:** una sola sesión de Chrome. En `suscribir.html` rellené el `<select>` nativo por script, así que Choices siguió mostrando el texto de ayuda aunque el valor era válido; no probé la selección con el ratón. Los modos `native`, `ajax` y `login` no tienen ninguna página de ejemplo (todas usan `event`). No se probó Firefox ni Safari.

## Aprobación
- [ ] Revisada por el propietario — fecha:
