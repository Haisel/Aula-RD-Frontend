# Tareas — 011-autenticacion-jwt

> Estado: Implementado (08/11/2026) · Fecha: 08/11/2026 · Plan: [plan.md](plan.md) · Spec: [011-autenticacion-jwt.md](011-autenticacion-jwt.md)

Leyenda: `[x]` hecho · `[ ]` pendiente · `P` en paralelo. Cada tarea termina con `npm run check` en verde.

## Hecho (verificado el 08/11/2026)
- [x] CA-02, CA-03, CA-04, CA-05, CA-07, CA-09, CA-10 cubiertos por pruebas automáticas (181 en verde)

## Hecho el 08/11/2026
- [x] T-01 API simulada `scripts/mock-api.mjs` y `npm run mock`: prueba primero (vista en rojo, el módulo no existía) y luego implementación; `tests/mock-api.test.js` con 10 pruebas en verde
- [x] T-02 CA-01, CA-06 y CA-08 verificados en navegador contra la API simulada (ver "Verificación" en la spec)
- [x] T-03 CA-03 verificado en navegador: ningún token en `localStorage`, `sessionStorage`, `document.cookie`, `AU` ni el DOM
- [x] CA-02 y CA-07 también verificados en navegador
- [x] T-06 Aprobación del propietario: 08/11/2026 (Haisel Ramirez)

## Pendiente
| Id | Tarea | Cubre | Hecho cuando |
|---|---|---|---|
| T-04 P | **Decisión del propietario:** rutas reales de la API, duración de los tokens, rotación del token de renovación, dominio y CORS | Información faltante | Respuestas anotadas; ADR si cambia el diseño |
| T-05 | Trazabilidad, `CHANGELOG.md` y `specs/README.md` | — | Consistentes con el estado real |
| T-06 | Pedir aprobación al propietario | — | Spec `Aprobada (fecha, por)` |
| T-07 | Commit de la 010 y la 011 | — | Commit hecho, con la aprobación registrada |
