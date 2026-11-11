# 009-paginas-de-ejemplo

> Estado: Implementada (08/11/2026) · Aprobada por el propietario (10/11/2026) · Versión 1.0

## Objetivo
Mostrar la plantilla aplicada a los casos reales de Aula RD: captar suscripciones de instituciones y los cuatro portales (constitución §4.4).

## Alcance
| Página | Portal | Contenido |
|---|---|---|
| `index.html` | Público | Landing de suscripción |
| `suscribir.html` | Público | Registro de institución |
| `login.html` | Público | Inicio de sesión |
| `dashboard-superadmin.html` | Superadmin (global) | Plataforma: instituciones, MRR, planes, actividad |
| `dashboard-institucion.html` | Administración (institución) | Indicadores, asistencia, calificaciones, cobros, pago |
| `dashboard-docente.html` | Docente | Asistencia rápida, comunicado, calendario |
| `dashboard-tutor.html` | Estudiante/tutor | Rendimiento, carné QR/barra, estado de cuenta, autorización firmada |
| `componentes.html` | — | Catálogo |

## Exclusiones
Lógica de negocio real, guardado en servidor, navegación entre módulos internos (los enlaces del menú apuntan a anclas).

## Reglas de negocio
- RN-01 Todos los datos son **ficticios** y viven en `src/data/pages.js` y `public/data/` (ARCHITECTURE §5). Los formularios en modo `event` muestran "(demostración)" en el mensaje de éxito: no simulan guardar.
- RN-02 Precios y contacto son marcadores `[PRECIO]`, `[correo@aulard.do]` hasta que el propietario los defina.
- RN-03 La landing invita a **suscribir la institución** (no es una tienda).

## Requisitos no funcionales
| Id | Requisito | Medida |
|---|---|---|
| RNF-01 | Responsive | Usable a 390 px (sidebar en offcanvas, tablas con desplazamiento) |
| RNF-02 | Accesibilidad | Enlace "saltar al contenido", `h1` único, gráficos con `aria-label` descriptivo |

## Criterios de aceptación
| Id | Dado | Cuando | Entonces | Prueba |
|---|---|---|---|---|
| CA-01 | `npm run build` | Se abren las 8 páginas (claro y oscuro) | Sin errores de consola | Playwright 08/11/2026 |
| CA-02 | Landing | Clic en "Anual" | Cambian precios y etiqueta de período | Manual |
| CA-03 | Dashboard | Clic en botón de sidebar (≥ lg) | Se colapsa a 76 px y se recuerda | Manual |
| CA-04 | Topbar | "Cerrar sesión" | Pide confirmación | Manual |

## Información faltante
Respuestas del propietario (10/11/2026):
- **Métodos de pago:** solo tarjeta, en pesos dominicanos (RD$), con facturación mensual o anual.
- **Datos de contacto:** de ejemplo (`contacto@ejemplo.do`, `(809) 555-0100`, lunes a viernes de 8:00 a. m. a 5:00 p. m.); se sustituyen por los reales antes de publicar.
- **Plan Premium:** «a medida», sin precio publicado; se llega por «Hablar con nosotros».
- **Precios de referencia (10/11/2026):** no se hallaron precios en RD$ de proveedores dominicanos; solo ATL Software (Santo Domingo) con «desde US$ 97» sin detallar el período, y OurSchoolSoftware con US$ 10 al mes hasta 300 estudiantes (Capterra). Promedio: (10 + 97) / 2 = US$ 53.5 × RD$ 60 por dólar [Suposición: tasa] ≈ **RD$ 3,200 al mes para Básico (hasta 300 estudiantes)**. Profesional = el doble, **RD$ 6,400 (hasta 800)** [Suposición: escalera de planes]. Anual = 10 meses de 12 (RD$ 32,000 y 64,000; se muestra RD$ 2,667 y 5,333 por mes). Son cifras de referencia de una muestra de dos datos, no un estudio de mercado; el propietario fija el precio final.
- **Páginas legales:** `terminos.html`, `privacidad.html` (apoyada en la Ley 172-13), `cookies.html` y `reembolsos.html` redactadas como borrador pendiente de revisión jurídica. Los plazos de reembolso (15 días) y exportación (30 días) son valores de ejemplo.

## Trazabilidad
`src/*.html`, `src/partials/**`, `src/data/pages.js`, `public/data/*`.

## Aprobación
- [ ] Revisada por el propietario — fecha:
