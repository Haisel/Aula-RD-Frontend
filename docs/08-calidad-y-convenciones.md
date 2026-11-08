# 08 · Calidad y convenciones

## 1. Nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| Clases propias | kebab-case con prefijo `au-`; modificadores `is-*` | `.au-stat`, `.au-stat-icon.is-warning` |
| Variables CSS | `--au-<token>` | `--au-accent-text` |
| Atributos | `data-au-<componente>[-opción]` | `data-au-page-length` |
| Eventos | `au:<evento>` | `au:theme-change` |
| Archivos JS | kebab-case | `schema-registry.js` |
| Funciones | camelCase, verbo | `createDataTable`, `formatCurrency` |
| Componentes registrados | `{ name, selector, init }` | `name: 'datatable'` |
| SCSS | parciales `_nombre.scss` en su capa | `vendors/_choices.scss` |

## 2. JSDoc (obligatorio en funciones públicas)

```js
/**
 * Formatea un monto en pesos dominicanos.
 * @param {number} value Monto.
 * @param {object} [options] Opciones.
 * @param {boolean} [options.symbol=true] Incluir `RD$ `.
 * @returns {string} Ej.: `RD$ 12,500.00`. Devuelve `—` si no es un número.
 * @example formatCurrency(12500) // "RD$ 12,500.00"
 */
```

- Cada `@param` y `@returns` con descripción (ESLint lo exige).
- Tipos compartidos en `src/js/types.js` (`@typedef`), importados con `import('../types.js').Nombre`.
- `npm run typecheck` valida los tipos (TypeScript en modo `checkJs`, sin compilar TS).
- `npm run docs` publica la referencia en `docs/api/`.

## 3. Pruebas

- Vitest + jsdom en `tests/*.test.js`. Toda función de `helpers/` y la lógica pura de `core/`/`adapters/` lleva prueba.
- No usar cédulas ni RNC reales: los tests **calculan** el dígito verificador.
- Cobertura actual: formato, validadores, esquemas Zod, normalización de errores HTTP, sanitización, estados, configuración de gráficos, exportación, contexto, tema y registro (62 casos).

## 4. Calidad automática

| Herramienta | Comando | Verifica |
|---|---|---|
| ESLint + jsdoc | `npm run lint:js` | Errores de JS, `const`/`let`, `===`, JSDoc completo |
| Stylelint | `npm run lint:css` | SCSS válido, nombres de clase con prefijo |
| TypeScript checkJs | `npm run typecheck` | Tipos de JSDoc |
| Vitest | `npm test` | Comportamiento |
| Prettier | `npm run format` | Formato (constitución §6.1) |
| Todo | `npm run check` | Debe pasar antes de entregar |

## 5. Texto de interfaz

Español de República Dominicana; **usted** en mensajes; botones en infinitivo y *sentence case* ("Guardar cambios"); errores que dicen qué pasó y cómo resolverlo; formatos `RD$ 12,500.00`, `08/11/2026`, `2:30 p. m.`, `4.º de Secundaria`, cédula `001-1234567-8`.

## 6. Commits (sugerido)

`tipo(ámbito): resumen` — tipos `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`. Ej.: `feat(datatable): menú de páginas incluye el tamaño configurado`.
