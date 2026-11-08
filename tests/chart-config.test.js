import { describe, it, expect } from 'vitest';
import { buildChartConfig, valueFormatter } from '../src/js/helpers/chart-config.js';

const palette = {
  colors: {
    accent: '#18b6a4',
    primary: '#142b4a',
    navy: '#4f6b92',
    gold: '#c6a15b',
    muted: '#4e5b6c',
    success: '#1b7a43',
    warning: '#e09a1a',
    danger: '#c0392b',
    info: '#2f6fdb',
  },
  text: '#4e5b6c',
  grid: '#dce2e9',
  surface: '#ffffff',
  ink: '#1f2937',
};

describe('buildChartConfig', () => {
  it('barras: primera serie en accent, segunda en navy, meta en champagne', () => {
    const cfg = buildChartConfig(
      {
        type: 'bar',
        labels: ['A', 'B'],
        series: [
          { label: 'x', data: [1, 2] },
          { label: 'y', data: [3, 4] },
        ],
        target: { value: 3, label: 'Meta' },
      },
      palette,
    );
    expect(cfg.data.datasets[0].backgroundColor).toBe('#18b6a4');
    expect(cfg.data.datasets[1].backgroundColor).toBe('#4f6b92');
    expect(cfg.options.plugins.auTarget).toMatchObject({ value: 3, color: '#c6a15b' });
    expect(cfg.options.plugins.legend.display).toBe(true);
  });
  it('dona: un color por segmento y sin ejes', () => {
    const cfg = buildChartConfig(
      { type: 'doughnut', labels: ['a', 'b', 'c'], series: [{ label: 'n', data: [1, 2, 3] }] },
      palette,
    );
    expect(cfg.data.datasets[0].backgroundColor).toHaveLength(3);
    expect(cfg.options.scales).toEqual({});
  });
  it('movimiento reducido desactiva la animación', () => {
    const cfg = buildChartConfig({ type: 'line', labels: [], series: [] }, palette, { reducedMotion: true });
    expect(cfg.options.animation.duration).toBe(0);
  });
  it('formatos de eje', () => {
    expect(valueFormatter('compact-currency')(412600)).toBe('RD$ 412.6K');
    expect(valueFormatter('percent')(94.6)).toBe('94.6%');
  });
});
