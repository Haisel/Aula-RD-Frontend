/**
 * Adaptador de Chart.js (carga diferida). La página usa `AU.openChart(canvas, spec)`
 * o el atributo `data-au-chart`.
 *
 * ```html
 * <div class="au-chart"><canvas role="img" aria-label="Asistencia de la semana"
 *   data-au-chart='{"type":"bar","labels":["Lun","Mar"],"series":[{"label":"%","data":[94,96]}],"format":"percent"}'></canvas></div>
 * <canvas data-au-chart="data/asistencia.json"></canvas>   <!-- o una URL que devuelva la spec -->
 * ```
 * Los colores salen de las variables `--au-*` y se actualizan solos al cambiar el tema.
 * @module adapters/chart
 */
import { lazy } from './lazy.js';
import { cssToken } from '../core/theme.js';
import { on, EVENTS } from '../core/events.js';
import { buildChartConfig } from '../helpers/chart-config.js';

/** @typedef {import('../types.js').ChartSpec} ChartSpec */

/** Línea de meta horizontal (champagne, discontinua). */
const targetPlugin = {
  id: 'auTarget',
  /** @param {any} chart Instancia. */
  afterDatasetsDraw(chart) {
    const t = chart.options.plugins?.auTarget;
    if (!t || !chart.scales.y) return;
    const y = chart.scales.y.getPixelForValue(t.value);
    const { left, right } = chart.chartArea;
    const ctx = chart.ctx;
    ctx.save();
    ctx.strokeStyle = t.color;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
    ctx.restore();
  },
};

export const loadChart = lazy('Chart.js', async () => {
  const { Chart, registerables } = await import('chart.js');
  Chart.register(...registerables, targetPlugin);
  return Chart;
});

/**
 * Paleta del tema actual leída de las variables CSS.
 * @returns {import('../helpers/chart-config.js').ChartPalette} Paleta.
 */
export function currentPalette() {
  return {
    colors: {
      accent: cssToken('accent'),
      primary: cssToken('primary'),
      navy: '#4f6b92',
      gold: cssToken('gold-accent'),
      muted: cssToken('text-muted'),
      success: cssToken('success'),
      warning: cssToken('warning'),
      danger: cssToken('danger'),
      info: cssToken('info'),
    },
    text: cssToken('text-muted'),
    grid: cssToken('border'),
    surface: cssToken('surface'),
    ink: cssToken('text'),
  };
}

/** @type {Set<{ chart: any, spec: ChartSpec }>} */
const live = new Set();
const reducedMotion = () => Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

/**
 * Crea un gráfico con la marca.
 * @param {HTMLCanvasElement} canvas Lienzo.
 * @param {ChartSpec} spec Especificación.
 * @returns {Promise<any>} Instancia de Chart.js.
 */
export async function createChart(canvas, spec) {
  const Chart = await loadChart();
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  Chart.defaults.font.size = 12;
  const chart = new Chart(
    canvas,
    /** @type {any} */ (buildChartConfig(spec, currentPalette(), { reducedMotion: reducedMotion() })),
  );
  live.add({ chart, spec });
  return chart;
}

on(EVENTS.THEME_CHANGED, () => {
  for (const entry of live) {
    if (!entry.chart.canvas?.isConnected) {
      live.delete(entry);
      continue;
    }
    const cfg = /** @type {any} */ (buildChartConfig(entry.spec, currentPalette(), { reducedMotion: true }));
    entry.chart.data.datasets.forEach((/** @type {object} */ ds, /** @type {number} */ i) =>
      Object.assign(ds, cfg.data.datasets[i]),
    );
    entry.chart.options = cfg.options;
    entry.chart.update();
  }
});
