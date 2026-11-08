/**
 * Traduce la especificación simple de Aula RD ({@link ChartSpec}) a configuración de Chart.js.
 * Es una función pura (recibe los colores ya resueltos) para poder probarla sin navegador.
 * @module helpers/chart-config
 */
import { formatCurrency, formatCompactCurrency, formatNumber, formatPercent } from './format.js';

/** @typedef {import('../types.js').ChartSpec} ChartSpec */
/** @typedef {import('../types.js').ChartColor} ChartColor */

/**
 * Paleta resuelta para el tema actual.
 * @typedef {object} ChartPalette
 * @property {Record<ChartColor, string>} colors Colores semánticos.
 * @property {string} text Color de ejes y leyendas.
 * @property {string} grid Color de la cuadrícula.
 * @property {string} surface Fondo de tooltips y bordes de dona.
 * @property {string} ink Texto de tooltips.
 */

/**
 * Formateador de valores según el formato de la especificación.
 * @param {ChartSpec['format']} format Formato.
 * @returns {(v: number) => string} Función de formato.
 */
export function valueFormatter(format) {
  if (format === 'currency') return (v) => formatCurrency(v);
  if (format === 'compact-currency') return (v) => formatCompactCurrency(v);
  if (format === 'percent') return (v) => formatPercent(v, { decimals: 1 });
  return (v) => formatNumber(v);
}

/**
 * Construye la configuración de Chart.js.
 * @param {ChartSpec} spec Especificación.
 * @param {ChartPalette} palette Colores del tema actual.
 * @param {object} [env] Entorno.
 * @param {boolean} [env.reducedMotion=false] Desactiva animaciones.
 * @returns {object} Configuración para `new Chart(canvas, config)`.
 */
export function buildChartConfig(spec, palette, { reducedMotion = false } = {}) {
  const fmt = valueFormatter(spec.format);
  const isDoughnut = spec.type === 'doughnut';
  const pick = (/** @type {ChartColor | undefined} */ c, /** @type {ChartColor} */ fallback) =>
    palette.colors[c ?? fallback] ?? palette.colors.accent;

  const datasets = spec.series.map((s, i) => {
    if (isDoughnut) {
      /** @type {ChartColor[]} */
      const order = ['accent', 'navy', 'gold', 'muted', 'info', 'success'];
      return {
        label: s.label,
        data: s.data,
        backgroundColor: s.data.map((_, j) => palette.colors[order[j % order.length]]),
        borderColor: palette.surface,
        borderWidth: 2,
      };
    }
    const color = pick(s.color, i === 0 ? 'accent' : 'navy');
    return {
      label: s.label,
      data: s.data,
      backgroundColor: color,
      borderColor: color,
      borderWidth: spec.type === 'line' ? 2.5 : 0,
      borderRadius: spec.type === 'bar' ? 6 : 0,
      maxBarThickness: 36,
      pointRadius: spec.type === 'line' ? 3 : 0,
      pointBackgroundColor: color,
      tension: 0.35,
      fill: false,
    };
  });

  return {
    type: spec.type,
    data: { labels: spec.labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: reducedMotion ? 0 : 400 },
      cutout: isDoughnut ? '68%' : undefined,
      plugins: {
        legend: {
          display: isDoughnut || spec.series.length > 1,
          position: 'bottom',
          labels: { color: palette.text, usePointStyle: true, boxWidth: 8 },
        },
        tooltip: {
          backgroundColor: palette.surface,
          titleColor: palette.ink,
          bodyColor: palette.ink,
          borderColor: palette.grid,
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: (/** @type {any} */ ctx) =>
              ` ${ctx.dataset.label}: ${fmt(Number(isDoughnut ? ctx.parsed : ctx.parsed.y))}`,
          },
        },
        auTarget: spec.target ? { ...spec.target, color: palette.colors.gold } : undefined,
      },
      scales: isDoughnut
        ? {}
        : {
            x: {
              stacked: spec.stacked,
              grid: { display: false },
              border: { color: palette.grid },
              ticks: { color: palette.text },
            },
            y: {
              stacked: spec.stacked,
              min: spec.min,
              max: spec.max,
              grid: { color: palette.grid },
              border: { display: false },
              ticks: { color: palette.text, callback: (/** @type {number|string} */ v) => fmt(Number(v)) },
            },
          },
    },
  };
}
