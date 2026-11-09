# Datos de ejemplo (fixtures)

**Ficticios.** Solo existen para que las páginas de la plantilla muestren contenido.
Nombres, montos e instituciones son inventados (ARCHITECTURE §5: no presentar datos simulados como reales).

En su backend, reemplace cada URL `data/*.json` de los atributos `data-au-source`, `data-au-chart`
y `data-au-calendar` por el endpoint real que devuelva la MISMA forma de datos.
Los contratos están documentados en `docs/COMPONENTES.md` (sección «Contratos de datos»).

## Datos de la galería (spec 012)

`estudiantes.json`, `docentes.json`, `reporte.json` y `tablero.json` los generó `scripts/build-fixtures.mjs`:

- **Nombres:** se piden una sola vez a la API pública [randomuser.me](https://randomuser.me) con la semilla fija `aulard-demo`, nacionalidad `es`, y solo los campos `name` y `gender` (sin fotos, correos ni teléfonos). Son nombres genéricos; ninguna persona real los aporta.
- **Resto de campos:** grado, sección, estado, notas, pagos y fechas se calculan con un generador pseudoaleatorio con la misma semilla. Ejecutar el script otra vez produce los mismos archivos.
- **Las páginas no llaman a esa API.** Leen estos JSON ya generados; ninguna solicitud sale del propio origen.
- **Regenerar:** `node scripts/build-fixtures.mjs` (necesita red; no forma parte de `npm run check`).

| Archivo | Forma |
|---|---|
| `estudiantes.json` | `{ id, nombre, grado, seccion, tutor, estado, matricula, ingreso }` (60) |
| `docentes.json` | `{ id, nombre, area, secciones, estado }` (12) |
| `reporte.json` | `{ periodo, estudianteId, nombre, grado, estado, asistencia, promedio, pagos, monto }` (60) |
| `tablero.json` | `{ id, titulo, responsable, columna, prioridad, fecha }` (12) |
| `instituciones.json` | `{ id, nombre, municipio, plan, estudiantes, estado }` (24) |
| `usuarios-internos.json` | `{ id, nombre, rol, ultimoAcceso, estado }` (10) |
| `suscripciones.json` | `{ id, institucion, plan, inicio, vence, monto, estado }` (24, una por institución) |
| `facturas.json` | `{ id, institucion, concepto, monto, fecha, estado }` (30) |
| `cuenta.json` | `{ id, concepto, vence, monto, estado }` (8) |

Las fechas van en ISO (`AAAA-MM-DD`); la interfaz las muestra como `DD/MM/AAAA`.
