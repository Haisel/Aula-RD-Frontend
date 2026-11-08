/**
 * Tipos compartidos (solo JSDoc). Importe con:
 *   `@typedef {import('./types.js').ThemeName} ThemeName`
 * @module types
 */

/** @typedef {'light' | 'dark'} ThemeName Tema aplicado en `<html data-bs-theme>`. */
/** @typedef {'light' | 'dark' | 'system'} ThemePreference Preferencia guardada por el usuario. */
/** @typedef {'success' | 'warning' | 'danger' | 'info'} Variant Variante semántica de estado. */

/**
 * Componente auto-inicializable por atributo `data-au-*`.
 * @typedef {object} ComponentDefinition
 * @property {string} name Nombre único (aparece en `data-au-ready`).
 * @property {string} selector Selector CSS que activa el componente.
 * @property {(el: HTMLElement) => (void | (() => void))} init Inicializa un elemento. Puede devolver una función de limpieza.
 */

/**
 * Opciones de una notificación.
 * @typedef {object} ToastOptions
 * @property {Variant} [variant='info'] Variante visual.
 * @property {string} [title] Título opcional en negrita.
 * @property {number} [delay=5000] Milisegundos antes de ocultarse (0 = no se oculta).
 */

/**
 * Opciones del diálogo de confirmación.
 * @typedef {object} ConfirmOptions
 * @property {string} [title='¿Está seguro?'] Título del diálogo.
 * @property {string} message Texto explicativo (texto plano).
 * @property {string} [confirmText='Confirmar'] Etiqueta del botón de confirmación.
 * @property {string} [cancelText='Cancelar'] Etiqueta del botón de cancelar.
 * @property {'primary' | 'danger'} [variant='primary'] Estilo del botón de confirmación.
 */

/**
 * Serie de un gráfico.
 * @typedef {object} ChartSeries
 * @property {string} label Nombre de la serie (leyenda y tooltip).
 * @property {number[]} data Valores en el mismo orden que `labels`.
 * @property {ChartColor} [color='accent'] Color semántico.
 */

/** @typedef {'accent' | 'primary' | 'navy' | 'gold' | 'muted' | 'success' | 'warning' | 'danger' | 'info'} ChartColor */

/**
 * Especificación simplificada de gráfico (independiente de Chart.js).
 * @typedef {object} ChartSpec
 * @property {'bar' | 'line' | 'doughnut'} type Tipo de gráfico.
 * @property {string[]} labels Etiquetas del eje X (o de los segmentos).
 * @property {ChartSeries[]} series Series de datos.
 * @property {'number' | 'currency' | 'percent' | 'compact-currency'} [format='number'] Formato de valores en ejes y tooltips.
 * @property {{ value: number, label: string }} [target] Línea de meta horizontal (champagne, discontinua).
 * @property {boolean} [stacked=false] Barras apiladas.
 * @property {number} [min] Mínimo del eje Y.
 * @property {number} [max] Máximo del eje Y.
 */

/**
 * Error normalizado de una respuesta HTTP, sin importar el backend.
 * @typedef {object} ApiErrorShape
 * @property {number} status Código HTTP (0 si no hubo respuesta).
 * @property {string} message Mensaje para mostrar al usuario.
 * @property {Record<string, string[]>} fieldErrors Errores por campo (`name` del input → mensajes).
 * @property {unknown} [raw] Respuesta original.
 */

export {};
