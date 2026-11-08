# 010 — Versiones fijadas del ecosistema

## Contexto
`npm install` sin rango instaló DataTables 3 y Choices 11, mientras la ADR-002/constitución nombran "DataTables 2". El proyecto v1 tenía `choices.js@^9`, `signature_pad@^4`.

## Decisión
| Paquete | Versión | Nota |
|---|---|---|
| bootstrap | ^5.3.8 | |
| datatables.net-bs5 | **^2** (2.3.x) | Respeta "DataTables 2". Trae jQuery como dependencia interna; queda aislada en su chunk diferido. |
| choices.js | ^11 | v9 (2019) sin mantenimiento; API de creación compatible para nuestro uso. |
| signature_pad | ^5 | API `addEventListener('endStroke')` (v4 usaba `onEnd`). |
| quill | ^2 | Usa `getSemanticHTML()`. |
| @fullcalendar/* | ^6 | |
| sweetalert2 | ^11 | |
| xlsx (SheetJS) | 0.20.3 desde `cdn.sheetjs.com` | La versión de npm (0.18.5) tiene vulnerabilidades conocidas; igual que en v1. |
| vite | ^8 | Usa Rolldown (`build.rolldownOptions`). |

## Consecuencias
Si se integran helpers del v1, revisar las llamadas a Choices (v9→v11) y Signature Pad (v4→v5).

## Estado: Propuesta
## Fecha: 2026-11-08
## Arquitecto: Claude
