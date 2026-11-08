# 012 — Validación asíncrona con Zod diferido

## Contexto
Zod 4 pesa ~92 KB gzip. Cargarlo en el núcleo triplicaba el peso de `app.js` en páginas sin formularios.

## Decisión
- Funciones puras sin dependencias (`isValidCedula`, `isValidRnc`, `isValidPhone`, `isValidEmail`) disponibles al instante.
- Esquemas en `helpers/schemas.js`, cargados la primera vez que se valida.
- `AU.validForm`, `AU.validate` devuelven `Promise`. El componente `form[data-au-validate]` detiene el envío, valida y, si es válido en modo `native`, reenvía con `form.submit()`.
- Esquemas propios: `AU.registerSchema('nombre', (z, campos) => z.object({...}))` (fábrica: no obliga a cargar Zod antes de tiempo).

## Consecuencias
Primer envío de un formulario: +~100 ms en redes lentas mientras se descarga Zod. Los siguientes son inmediatos.

## Estado: Propuesta
## Fecha: 2026-11-08
## Arquitecto: Claude
