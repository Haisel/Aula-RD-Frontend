import { describe, it, expect, afterEach, vi } from 'vitest';
import { http } from '../src/js/core/http.js';
import { lazy } from '../src/js/adapters/lazy.js';
import { AppError } from '../src/js/core/errors.js';
import { createFacade } from '../src/js/facade.js';
import { loadConfig, BREAKPOINTS } from '../src/js/config/index.js';

// `__AU_VERSION__` lo define Vite al compilar; Vitest no. `vi.hoisted` corre antes que los imports.
vi.hoisted(() => {
  /** @type {any} */ (globalThis).__AU_VERSION__ = 'test';
});

/**
 * Spec 007: contrato de la fachada `AU`.
 * RF-03 (diálogos expuestos), RF-06 (CSRF automático), RF-08 (carga fallida de librerías).
 */

/**
 * Hace una solicitud con un adaptador falso y devuelve la configuración final (con cabeceras).
 * @param {string} [method] Método HTTP.
 * @returns {Promise<import('axios').InternalAxiosRequestConfig>} Configuración que llegaría al adaptador.
 */
async function sentConfig(method = 'post') {
  /** @type {any} */
  let seen;
  await http.request({
    url: '/prueba',
    method,
    adapter: (cfg) => {
      seen = cfg;
      return Promise.resolve({ data: {}, status: 200, statusText: 'OK', headers: {}, config: cfg });
    },
  });
  return seen;
}

describe('RF-06: CSRF automático (spec 007)', () => {
  afterEach(() => {
    document.head.querySelectorAll('meta[name="csrf-token"]').forEach((m) => m.remove());
  });

  it('envía X-CSRF-TOKEN y X-XSRF-TOKEN si existe <meta name="csrf-token">', async () => {
    document.head.insertAdjacentHTML('beforeend', '<meta name="csrf-token" content="tok-123">');
    const cfg = await sentConfig('post');
    expect(cfg.headers.get('X-CSRF-TOKEN')).toBe('tok-123');
    expect(cfg.headers.get('X-XSRF-TOKEN')).toBe('tok-123');
  });

  it('no envía las cabeceras CSRF si no hay <meta>', async () => {
    const cfg = await sentConfig('post');
    expect(cfg.headers.get('X-CSRF-TOKEN')).toBeFalsy();
    expect(cfg.headers.get('X-XSRF-TOKEN')).toBeFalsy();
  });
});

describe('RF-08: carga fallida de una librería diferida (spec 007)', () => {
  it('rechaza con AppError y código estable LIB_LOAD_FAILED', async () => {
    const load = lazy('Prueba', () => Promise.reject(new Error('sin red')));
    const err = await load().catch((e) => e);
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe('LIB_LOAD_FAILED');
    expect(err.message).toContain('Prueba');
    expect(err.cause).toBeInstanceOf(Error);
  });

  it('reintenta en la siguiente llamada tras un fallo', async () => {
    let calls = 0;
    const load = lazy('Reintento', () =>
      ++calls === 1 ? Promise.reject(new Error('x')) : Promise.resolve('ok'),
    );
    await expect(load()).rejects.toBeInstanceOf(AppError);
    await expect(load()).resolves.toBe('ok');
    expect(calls).toBe(2);
  });

  it('memoriza la carga correcta (un solo import)', async () => {
    let calls = 0;
    const load = lazy('Una vez', () => Promise.resolve(++calls));
    await Promise.all([load(), load(), load()]);
    expect(calls).toBe(1);
  });
});

describe('RF-03: diálogos expuestos en AU (spec 007)', () => {
  const AU = createFacade({ config: loadConfig(), breakpoints: BREAKPOINTS });
  const names = [
    'alert',
    'success',
    'error',
    'warning',
    'info',
    'toast',
    'toastSuccess',
    'toastError',
    'toastWarning',
    'toastInfo',
    'confirm',
    'confirmDanger',
    'confirmInsert',
    'confirmUpdate',
    'confirmDelete',
    'confirmDeleteByName',
    'loading',
    'close',
    'btnLoading',
  ];

  for (const name of names) {
    it(`AU.${name} es una función`, () => {
      expect(typeof (/** @type {any} */ (AU)[name])).toBe('function');
    });
  }
});
