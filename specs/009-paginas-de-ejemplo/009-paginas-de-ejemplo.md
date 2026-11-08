# 009-paginas-de-ejemplo

> Estado: Implementada (08/11/2026) · pendiente de aprobación · Versión 1.0

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
- Precios reales de los planes y métodos de pago.
- Datos de contacto y enlaces legales.
- ¿Plan "Premium" es "a medida" o tiene precio?

## Trazabilidad
`src/*.html`, `src/partials/**`, `src/data/pages.js`, `public/data/*`.

## Aprobación
- [ ] Revisada por el propietario — fecha:
