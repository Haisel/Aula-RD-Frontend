# .sdd/constitution.md — Constitución de Aula RD (plantilla UI)

> Versión 2.0-propuesta · 08/11/2026. Base: constitución v1 del proyecto `E:\AulaRD` (sin cambios de fondo en §1–§9).
> Las **enmiendas** de la sección 0 reflejan decisiones del propietario en la conversación del 08/11/2026 y requieren su **aprobación formal** (§9.4) antes de considerarse vigentes.

Este documento define los principios obligatorios que ningún desarrollo del proyecto Aula RD podrá contradecir.

## 0. Enmiendas v2 (08/11/2026) — pendientes de aprobación formal

| Id | Cambia | Enmienda | Origen |
|---|---|---|---|
| E-1 | §10.4 | **Identidad visual B.** Paleta Navy `#142B4A` · Turquoise `#18B6A4` · Champagne `#C6A15B` · White; tipografía **Plus Jakarta Sans** (sustituye Inter/Outfit/JetBrains Mono); logo versión B (escudo + A + libro). | Decisión del propietario (chat) · ADR-006 |
| E-2 | §1.3, §1.4 | **Plantilla neutra respecto al backend.** El build produce `dist/css/app.css`, `dist/js/app.js` (+ `js/chunks/` diferidos), `dist/fonts`, `dist/img`. Modo opcional `build:single` con un único JS. Handlebars solo genera las páginas de ejemplo y pinta JSON en el navegador; no se usa Blade ni otro motor de servidor. | Decisión del propietario · ADR-007 |
| E-3 | §1.2 | **Fachada pública `window.AU`** (sustituye `window.AR`), congelada, de estilo plano (`AU.success()`, `AU.toast()`, `AU.confirm()`…). Prefijos: clases `au-*`, variables `--au-*`, atributos `data-au-*`, eventos `au:*`. | Decisión del propietario · ADR-008 |
| E-4 | §2.2, §7.4 | **Librerías de robustez** añadidas al ecosistema: Zod (validación), IMask (máscaras), DOMPurify (sanitización), Handlebars (plantillas en el navegador), Chart.js y SortableJS (ya presentes en el proyecto v1). Herramientas de desarrollo: Vitest, ESLint + eslint-plugin-jsdoc, TypeScript (`checkJs`, solo verificación de JSDoc), Stylelint. | Solicitud del propietario ("muchas librerías para reforzar el JS") · ADR-009 |
| E-5 | §2.2 | **Versiones fijadas**: DataTables **2.x** (`datatables.net-bs5@^2`), Choices.js 11, Signature Pad 5, Quill 2, FullCalendar 6, SweetAlert2 11. DataTables trae jQuery como dependencia interna transitiva: está permitido solo dentro de su chunk diferido; no se usa jQuery en el código propio. | ADR-010 |
| E-6 | §10.2 | **Atributo de tema** `data-bs-theme` (nativo de Bootstrap 5.3) en lugar de `data-theme`. Preferencia `light`/`dark`/`system` en `localStorage["au-theme"]`. | ADR-011 |

Mientras una enmienda no esté aprobada, cualquier agente que encuentre una contradicción entre este documento y la v1 debe seguir §9.5 y preguntar.


## 1. Arquitectura

1.1. **Arquitectura multiinstitucional**: La plataforma debe estar preparada para que múltiples instituciones compartan la infraestructura sin mezclar datos. Cada institución debe tener un contexto identificable y sus datos deben permanecer aislados.

1.2. **Separación de responsabilidades**: El frontend debe mantener clara separación entre: presentación, componentes, lógica de aplicación, servicios, adaptadores, comunicación con API y configuración.

1.3. **Puntos de entrada únicos**: Las páginas deben consumir `src/styles/app.scss` y `src/js/app.js` como referencias principales, minimizando referencias manuales a librerías individuales.

1.4. **Vite como sistema central**: Vite debe administrar la compilación, gestión de assets, chunks y carga diferente. No se deben añadir scripts externos manualmente a las páginas.

1.5. **Preparación para temas futuros**: La arquitectura debe estar diseñada para poder soportar temas dark/light y temas institucionales en una fase posterior sin requerir reestructuración mayor del código base. Se deben definir tokens semánticos en lugar de colores fijos y evitar estilos que dificulten el cambio de tema.

## 2. Tecnologías

2.1. **Stack frontend obligatorio**: HTML5, Bootstrap 5.3, Sass, CSS3, JavaScript Vanilla ES6+. No se permite sustituir estas tecnologías por React, Vue, Angular, Svelte, jQuery o Tailwind.

2.2. **Ecosistema de librerías aprobado**: DataTables 2, Flatpickr, FullCalendar, Choices.js, Axios, Animate.css, JsBarcode, QRCode, Quill, Signature Pad, SweetAlert2, Toastr, SheetJS (`xlsx`), Day.js, JSDoc. *Ampliado por E-4 (pendiente de aprobación): Zod, IMask, DOMPurify, Handlebars, Chart.js, SortableJS; desarrollo: Vitest, ESLint, eslint-plugin-jsdoc, TypeScript (checkJs), Stylelint.*

2.3. **No tecnologías adicionales**: Sin jQuery, sin React, sin Vue, sin Angular, sin Tailwind CSS. Cualquier nueva librería requiere aprobación explícita.

2.4. **ES Modules**: La modularización debe usar JavaScript ES Modules nativas, no sistemas externos ni bundlers que no sean Vite.

## 3. Seguridad

3.1. **Seguridad real del backend**: La autenticación, autorización, validación de permisos y aislamiento de datos deben implementarse y verificarse en el backend. El frontend nunca debe considerarse una barrera de seguridad suficiente.

3.2. **Ocultar menús no es seguridad**: Ocultar menús, botones o registros mediante JavaScript no constituye aislamiento multiinstitucional ni control de acceso real.

3.3. **Frontend consumiendo API**: El frontend debe estar preparado para consumir capacidades de seguridad mediante API, pero no debe fingir que ya están garantizadas. Debe manejar estados de error, no autorizado y fallos de comunicación.

## 4. Multiinstitucionalidad

4.1. **Contexto institucional identificable**: Cada institución debe tener un contexto identificable en la aplicación.

4.2. **Operaciones dentro del contexto**: Las operaciones deben ejecutarse dentro del contexto institucional correspondiente.

4.3. **Aislamiento de datos**: Los datos de una institución no deben ser accesibles desde otra institución sin autorización explícita.

4.4. **Permisos globales e institucionales**: Los permisos deben contemplar ambos ámbitos: global (super administrador) e institucional (administrador, docente, estudiante).

4.5. **Relaciones usuario-institución**: Las relaciones deben definirse en las especificaciones y no asumirse automáticamente.

4.6. **Nunca simular seguridad**: El frontend no debe simular operaciones de seguridad ni presentar datos simulados como reales.

4.7. **Separación de responsabilidades frontend/backend**: 
   - El frontend es responsable de la presentación visual, tokens de diseño y temas de la interfaz.
   - El backend es responsable de la autenticación, autorización, contexto institucional y aislamiento de datos.
   - **Nunca** el frontend debe Considerirse una barrera de seguridad suficiente.
   - **Ocultar menús o botones mediante JS** no constituye aislamiento multiinstitucional ni control de acceso real.
   - **La gestión de temas y paletas es responsabilidad visual del frontend. No depende del backend ni del contexto institucional.**

## 5. SDD (Spec-Driven Development)

5.1. **Flujo obligatorio**: Para cada capacidad o funcionalidad: analizar contexto → identificar requisitos → identificar información faltante → elaborar especificación → identificar reglas de negocio → identificar actores y permisos → definir flujos y estados → definir criterios de aceptación → definir pruebas → presentar para revisión → esperar aprobación → implementar → ejecutar pruebas → documentar.

5.2. **Trazabilidad**: Cada funcionalidad implementada debe relacionarse con una especificación, requisitos identificables, criterios de aceptación, pruebas y documentación.

5.3. **No programar primero**: No se debe programar antes de tener la especificación aprobada. El desarrollo parte de la especificación, no al revés.

5.4. **Cambios en requisitos**: Si se detecta que una especificación está incompleta o contradictoria, detener el desarrollo de la parte afectada, explicar el problema, indicar qué requisito debe modificarse y esperar aprobación.

## 6. Calidad de código

6.1. **Prettier**: El código debe formatearse con Prettier. No se aceptará código sin formatear.

6.2. **JSDoc**: Las funciones públicas deben estar documentadas con JSDoc. Las funciones privadas deben tener comentarios cuando su propósito no sea obvio.

6.3. **Nombres uniformes**: Convenciones de nombres consistentes en todo el proyecto.

6.4. **Manejo centralizado de errores**: Errores manejados en puntos centralizados, no dispersos por el código.

6.5. **Evitar duplicación**: No duplicar componentes, servicios, utilidades ni lógica que deban ser compartidas.

6.6. **Evitar dependencias innecesarias**: Solo incluir dependencias que estén justificadas y aprobadas.

6.7. **Evitar archivos gigantes**: Ningún archivo debe concentrar toda la lógica de una funcionalidad.

6.8. **Evitar funciones con múltiples responsabilidades**: Cada función debe tener una responsabilidad única y clara.

6.9. **Evitar estilos inline**: Solo excepciones justificadas. Preferir clases CSS/Sass.

6.10. **Evitar JavaScript inline**: No poner JavaScript directamente en el HTML.

6.11. **Evitar `!important`**: No como mecanismo habitual de CSS. Resolver conflictos de especificidad mediante diseño estructurado.

6.12. **Manipulación segura del DOM**: Evitar manipulaciones inseguras del DOM. Delegación de eventos cuando sea apropiado.

## 7. Dependencias

7.1. **Aprobación previa**: No se incorporarán frameworks o librerías adicionales sin justificar su necesidad y solicitar aprobación.

7.2. **Verificación antes de instalar**: Verificar versiones, compatibilidad con Bootstrap 5, mantenimiento, licencia y posibles dependencias transitivas antes de instalar.

7.3. **No asumir cobertura de licencia**: La licencia de una librería no cubre automáticamente sus plugins, temas, fuentes o recursos adicionales.

7.4. **Ecosistema cerrado**: Las librerías forman parte del ecosistema previsto. No se reemplazarán ni se agregarán otras sin aprobación.

7.5. **Carga diferenciada**: Las dependencias pesadas o especializadas deben poder cargarse de manera diferida cuando se necesiten, no obligatoriamente en todas las páginas.

## 8. Documentación

8.1. **Documentos obligatorios**: `.sdd/constitution.md`, `docs/ARCHITECTURE.md`, `docs/decisions/README.md`, `docs/decisions/*.md` (decisiones registradas).

8.2. **Actualización continua**: Toda decisión arquitectónica relevante debe registrarse en `docs/decisions/`. Toda modificación de una especificación aprobada debe quedar documentada.

8.3. **Fuente de verdad**: La documentación versionada es la fuente de verdad del proyecto. No se deben mantener decisiones importantes únicamente en el historial del chat.

8.4. **No documentos vacíos**: Las carpetas y archivos deben tener contenido sustancial, no crearse únicamente para aparentar estructura.

## 9. Gestión de cambios

9.1. **Registro de decisiones**: Toda decisión arquitectónica relevante debe registrarse en `docs/decisions/` con su estado (aprobada, pendiente, por verificar).

9.2. **Modificaciones documentadas**: Toda modificación de una especificación aprobada debe quedar documentada en el registro correspondiente.

9.3. **No cambios silenciosos**: No se deben modificar silenciosamente el alcance o las decisiones técnicas. Los cambios deben comunicarse y aprobarse.

9.4. **Proceso de aprobación**: Los cambios que afecten la arquitectura deben presentarse para revisión y esperar aprobación antes de implementarse.

9.5. **Contradicciones entre documentos**: Si se detectan contradicciones, identificar los documentos involucrados, explicar la contradicción, determinar cuál es la decisión más reciente y explícita, y si no es posible resolverla, solicitar aprobación (no elegir arbitrariamente).

9.6. **Versionado**: Los documentos deben versionarse o fechaarse para llevar un historial de cambios.

## 10. Preparación de Temas y Tokens (Lineamientos a largo plazo)

10.1. **Tokens semánticos vs. colores fijos**: El proyecto debe utilizar tokens semánticos en lugar de colores hexadecimales puros siempre que sea posible, permitiendo una definición más flexible y mantenible del sistema visual.

10.2. **Arquitectura de temas frontend**: El frontend debe estar diseñado para soportar tema claro, tema oscuro y la incorporación de nuevas paletas de colores en fases posteriores. Esto incluye:
- Definir variables CSS personalizadas para facilitar el cambio de tema.
- Estructurar el CSS para permitir override de estilos por tema.
- Compatibilidad con `prefers-color-scheme` media query para modo del sistema operativo.

10.3. **Gestión de responsabilidades**:
- **Frontend**: Define e intercambia tokens semánticos, paletas de colores y temas visuales. No depende del backend para decisiones de diseño visual.
- **Backend**: No determina colores, paletas ni temas visuales de la interfaz. Su responsabilidad es la autenticación, autorización, contexto institucional y aislamiento de datos.

10.4. **Paleta institucional** *(enmendada, ver E-1)*: Navy `#142B4A`, Turquoise `#18B6A4`, Champagne `#C6A15B`, White `#FFFFFF`. De la paleta v1 se conservan `#F4F6F8` (fondo claro), `#1F2937` (texto) y `#C0392B` (rojo, ahora color de error/destructivo). `#1E3A5F` pasa a ser `navy-600` (hover del primario). La fuente de verdad técnica es `src/tokens/tokens.json`.

10.5. **Temas en el roadmap** *(superado: la plantilla ya implementa claro/oscuro/sistema)*: La implementación efectiva de temas dark/light y variaciones institucionales quedará definida en el roadmap del proyecto para fases posteriores a la Fundación (Fase 1). La preparación técnica en la Fase 1 sentará las bases sin implementar funcionalidades completas.
