# 016 — Límite de peso de `app.js`: de 100 KB a 110 KB gzip

## Contexto
La spec 006 (RNF-01) fijó `app.js` ≤ 100 KB gzip, con 97 KB medidos entonces. Las versiones 0.2.0 y 0.3.0 añadieron el kernel, los servicios y la autenticación, y hoy el archivo pesa **107.7 KB gzip según Vite** (103 KB con `gzip -9`). El límite se incumple desde esa fecha. [Probable] El aumento viene de esas tres piezas; no se midió por separado.

## Opciones
1. **Subir el límite a 110 KB** y registrarlo.
2. **Dividir el bundle** con carga diferida de lo que no usan todas las páginas.
3. **Cerrar la fase con la deuda anotada** y resolverla después.

## Decisión
Opción 1, elegida por el propietario el 09/11/2026.
- El límite de `app.js` pasa a **≤ 110 kB gzip**, verificado por `scripts/check-budget.mjs`.
- El margen sobre el peso actual es de unos 2 KB. No es un permiso para crecer: todo cambio posterior que aumente el núcleo debe justificarse o compensarse con carga diferida (`adapters/lazy.js`).
- La spec 006 (RNF-01) se actualiza a 110 KB y apunta a esta decisión.

## Consecuencias
- (+) La Fase 1 se cierra sin rehacer el empaquetado.
- (−) El límite se movió hacia donde ya estaba el código: es un ajuste a la realidad, no una mejora. La carga inicial es ~8 % mayor que la prometida en la spec 006.
- (+) `npm run budget` (`scripts/check-budget.mjs`) falla si `app.js` supera 110 kB gzip y corre dentro de `npm run check`. Mide con gzip nivel 9 y kB decimales: da 106.76 kB, cerca de 1 kB menos que el informe de Vite.
- (−) Si el peso vuelve a subir, la opción 2 sigue pendiente como salida.

## Estado: Aceptada
## Fecha: 2026-11-09
## Arquitecto: Claude · Aprobó: Haisel Ramírez (propietario)
