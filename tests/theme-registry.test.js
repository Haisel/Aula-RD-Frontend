import { describe, it, expect, vi } from 'vitest';
import { setTheme, getTheme, toggleTheme, resolveTheme } from '../src/js/core/theme.js';
import { register, initAll, destroy } from '../src/js/core/registry.js';

describe('tema', () => {
  it('aplica, guarda y alterna', () => {
    const seen = [];
    document.addEventListener('au:theme-change', (e) => seen.push(e.detail.theme));
    expect(setTheme('dark')).toBe('dark');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark');
    expect(localStorage.getItem('au-theme')).toBe('"dark"');
    expect(toggleTheme()).toBe('light');
    expect(getTheme()).toBe('light');
    expect(seen).toEqual(['dark', 'light']);
  });
  it('system sin matchMedia → claro', () => expect(resolveTheme('system')).toBe('light'));
});

describe('registro de componentes', () => {
  it('inicializa una sola vez, marca data-au-ready y limpia', () => {
    document.body.innerHTML = '<div data-x></div><div data-x></div>';
    const cleanup = vi.fn();
    const init = vi.fn(() => cleanup);
    register({ name: 'x', selector: '[data-x]', init });
    expect(initAll(document)).toBe(2);
    expect(initAll(document)).toBe(0);
    const el = document.querySelector('[data-x]');
    expect(el.dataset.auReady).toBe('x');
    destroy(el);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(el.dataset.auReady).toBeUndefined();
  });
  it('un error en un componente no detiene a los demás', () => {
    document.body.innerHTML = '<i data-bad></i><i data-good></i>';
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    register({
      name: 'bad',
      selector: '[data-bad]',
      init: () => {
        throw new Error('x');
      },
    });
    const good = vi.fn();
    register({ name: 'good', selector: '[data-good]', init: good });
    initAll(document);
    expect(good).toHaveBeenCalled();
    spy.mockRestore();
  });
});
