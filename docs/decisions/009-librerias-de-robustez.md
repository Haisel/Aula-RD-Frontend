# 009 — Librerías de robustez y herramientas de calidad

## Contexto
El propietario pidió "muchas librerías para reforzar el .js". La constitución (§2.3, §7.1) exige justificar y aprobar cada dependencia nueva. Cada librería se evaluó por: problema que resuelve, licencia, mantenimiento, tamaño y si puede diferirse.

## Opciones consideradas
1. No agregar nada → validaciones y sanitización a mano, más errores.
2. Agregar muchas librerías sin criterio → más peso y superficie de ataque, sin más robustez.
3. **Una librería por problema concreto**, diferida cuando sea posible.

## Decisión
| Librería | Problema que resuelve | Licencia | Carga |
|---|---|---|---|
| Zod 4 | Validación declarativa con mensajes por campo (cédula, RNC, teléfono…) | MIT | Diferida (al primer envío) |
| IMask 7 | Máscaras de cédula, RNC, teléfono y moneda | MIT | Diferida (si hay `data-au-mask`) |
| DOMPurify 3 | Evitar XSS al insertar HTML (plantillas, Quill, modales) | MPL-2.0 / Apache-2.0 | Núcleo |
| Handlebars 4 | Pintar JSON del API en el navegador con plantillas `<template>` | MIT | Diferida |
| Chart.js 4 | Gráficos con colores del tema | MIT | Diferida |
| SortableJS 1 | Ordenar arrastrando | MIT | Diferida |
| Vitest + jsdom | Pruebas unitarias (62 casos) | MIT | Solo desarrollo |
| ESLint + eslint-plugin-jsdoc | Errores comunes y JSDoc obligatorio | MIT / BSD | Solo desarrollo |
| TypeScript (`checkJs`) | Verificar los tipos declarados en JSDoc sin escribir TS | Apache-2.0 | Solo desarrollo |
| Stylelint | Reglas de SCSS (prefijo `au-`, sin hex fuera de tokens) | MIT | Solo desarrollo |
| docdash | Plantilla de la documentación JSDoc | Apache-2.0 | Solo desarrollo |

Se **descartaron** Tom Select y Simple-DataTables (duplican Choices.js y DataTables 2, ya aprobadas).

## Consecuencias
- El núcleo (`app.js`) pesa 97 KB gzip; las librerías anteriores no penalizan páginas que no las usan.
- Zod 4 completo pesa ~92 KB gzip en su chunk; si se necesita menos, evaluar `zod/mini` (API funcional).

## Estado: Propuesta — pendiente de confirmar la lista exacta con el propietario
## Fecha: 2026-11-08
## Arquitecto: Claude
