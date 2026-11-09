# Plan — 009-paginas-de-ejemplo

> Estado: Borrador · Fecha: 08/11/2026 · Spec: [009-paginas-de-ejemplo.md](009-paginas-de-ejemplo.md)

## Situación de partida
Implementada y pendiente de aprobación. Son las 8 páginas de ejemplo (landing, login, suscripción, 4 portales y catálogo de componentes). La spec trae tres preguntas de contenido sin responder.

## Verificado el 08/11/2026 (build real y navegador)
| Comprobación | Resultado |
|---|---|
| Recursos | Cumple: los `src` y `href` relativos de las 8 páginas existen en `dist/` (0 faltantes) |
| Consola | Cumple: las 8 páginas cargan sin errores de JavaScript |
| Diseño | Cumple lo medido en la spec 005 (tema claro/oscuro, 390 px, foco del menú) |

## Brechas
1. **Aviso de formularios en consola.** Cuatro páginas muestran "A form field element should have an id or name attribute": suscribir (3 campos), componentes (5), docente (3) e institución (2). No sé qué campos son; [Suposición] pueden ser entradas auxiliares de librerías (selectores o buscadores). Afecta a autocompletado y accesibilidad.
2. **Datos de ejemplo fuera de `public/data/`.** `AGENTS.md` §6 pide "sin datos ficticios fuera de `public/data/`". Hay filas de tabla escritas en `src/dashboard-superadmin.html` (por ejemplo "Colegio San Rafael") y usuarios fijos en `src/data/pages.js`, entre ellos "Haisel Ramírez / Superadmin" para el portal de superadmin, sin `#au-context`. La spec cita `src/data/pages.js` como parte de la trazabilidad, así que está previsto, pero choca con la definición de terminado.
3. **Información faltante de contenido** (precios de planes y métodos de pago, datos de contacto y enlaces legales, si "Premium" es a medida o tiene precio): decisión del propietario.
4. No hay una verificación registrada de contraste ni de navegación por teclado de las páginas completas; solo del menú lateral.

## Enfoque
Primero identificar los campos de la brecha 1 en navegador; luego decidir con el propietario qué hacer con los datos de ejemplo (brecha 2: moverlos a `public/data/` y pintarlos con `data-au-render`, o documentar la excepción en la spec y en `AGENTS.md`). Las preguntas de contenido se responden antes de pensar en un lanzamiento real.

## Riesgos
| Riesgo | Mitigación |
|---|---|
| Una página de ejemplo se confunde con datos reales | Los datos de ejemplo van en `public/data/` y se rotulan como fixtures |
| El nombre de una persona real aparece como usuario de demostración | Sustituirlo por un nombre genérico si el propietario lo prefiere |
