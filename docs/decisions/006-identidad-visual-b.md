# 006 — Identidad visual B: paleta, tipografía y logo

## Contexto
La paleta v1 (`#1E3A5F`, `#C0392B`, `#B8860B`) y las fuentes Inter/Outfit/JetBrains Mono se definieron antes del rediseño del logo. El 08/11/2026 el propietario eligió la **versión B** del logo (escudo navy, A turquesa, libro champagne como travesaño) y una paleta exacta.

## Opciones consideradas
1. Mantener la paleta v1 y solo cambiar el logo → incoherencia entre logo e interfaz.
2. Adoptar la paleta B solo en el logo → dos sistemas de color.
3. **Adoptar la paleta B en todo el sistema** y derivar escalas y tokens semánticos accesibles.

## Decisión
Opción 3.
- Marca: Navy `#142B4A`, Turquoise `#18B6A4`, Champagne `#C6A15B`, White `#FFFFFF`.
- Escalas `navy-50…950`, `turquoise-50…900`, `gold-50…900`, `gray-0…900`, y 36 tokens semánticos por tema (`src/tokens/tokens.json`).
- `#C0392B` (rojo v1) se conserva como `danger`; `#1E3A5F` como `navy-600`; `#F4F6F8` como `bg`; `#1F2937` como `text`.
- Tipografía única: **Plus Jakarta Sans** 400–800 (SIL OFL), servida desde `dist/fonts` (subconjunto latin, cubre español).

## Consecuencias
- Turquesa y champagne **no** sirven como texto sobre blanco (2.5:1 y 2.4:1); se definieron `accent-text` (`#0E766B`, 5.5:1) y `gold-text` (`#6E5328`, 7:1).
- En tema oscuro el `primary` pasa a turquesa (un botón navy desaparece sobre fondo navy).
- Toda la UI v1 que use `--ar-*` debe migrarse a `--au-*` (ver ADR-008).

## Estado: Propuesta — decidida por el propietario en conversación; falta aprobación formal
## Fecha: 2026-11-08
## Arquitecto: Claude (a solicitud del propietario)
