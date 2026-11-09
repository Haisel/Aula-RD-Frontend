import { describe, it, expect, vi } from 'vitest';
import { HttpClient, isAllowedUrl, toHttpError } from '../src/js/services/http-client.js';
import { Logger } from '../src/js/core/logger.js';
import { CancelledError, ServerError, ValidationError } from '../src/js/core/errors.js';

const logger = new Logger({ sink: { debug() {}, info() {}, warn() {}, error() {} } });
const axiosError = (status, data) =>
  Object.assign(new Error('Request failed'), { isAxiosError: true, request: {}, response: { status, data } });

/**
 * Axios falso: responde con la secuencia dada (objetos = respuesta, Error = rechazo).
 * @param {...any} replies Respuestas.
 * @returns {{ request: import('vitest').Mock, defaults: object }} Instancia.
 */
function fakeAxios(...replies) {
  const queue = [...replies];
  return {
    defaults: {},
    request: vi.fn(async () => {
      const next = queue.shift();
      if (next instanceof Error) throw next;
      return next ?? { status: 200, data: null };
    }),
  };
}

describe('HttpClient', () => {
  it('resuelve endpointKey + pathParams codificados', async () => {
    const ax = fakeAxios({ status: 200, data: { ok: 1 } });
    const c = new HttpClient({
      axios: ax,
      logger,
      config: { endpoints: { 'estudiante.ver': '/estudiantes/:id' } },
    });
    const r = await c.request({ endpointKey: 'estudiante.ver', pathParams: { id: 'a/b' } });
    expect(ax.request.mock.calls[0][0].url).toBe('/estudiantes/a%2Fb');
    expect(r).toEqual({ data: { ok: 1 }, meta: { source: 'api', status: 200 } });
    await expect(c.request({ endpointKey: 'estudiante.ver' })).rejects.toThrow(/Faltan parámetros/);
    await expect(c.request({ endpointKey: 'no.existe' })).rejects.toThrow(/no está registrado/);
  });
  it('rechaza URLs absolutas fuera de baseURL', () => {
    expect(isAllowedUrl('/api/x', '')).toBe(true);
    expect(isAllowedUrl('data/cobros.json', '')).toBe(true);
    expect(isAllowedUrl('https://evil.com/x', '')).toBe(false);
    expect(isAllowedUrl('//evil.com', '')).toBe(false);
    expect(isAllowedUrl('/\t/evil.com', '')).toBe(false);
    expect(isAllowedUrl('https://api.aula.do/v1/x', 'https://api.aula.do/v1')).toBe(true);
    expect(isAllowedUrl('https://api.aula.do/v10/x', 'https://api.aula.do/v1')).toBe(false);
  });
  it('la estrategia de contexto recibe la institución vigente en cada solicitud', async () => {
    const ax = fakeAxios({ status: 200 }, { status: 200 });
    let inst = { id: 'a', displayName: 'A' };
    const c = new HttpClient({
      axios: ax,
      logger,
      config: {
        getInstitution: () => inst,
        contextStrategy: {
          apply: (req, i) => ({ ...req, headers: { ...req.headers, 'X-Institution-Id': i?.id ?? '' } }),
        },
      },
    });
    await c.request({ url: '/a' });
    inst = { id: 'b', displayName: 'B' };
    await c.request({ url: '/a' });
    expect(ax.request.mock.calls.map(([r]) => r.headers['X-Institution-Id'])).toEqual(['a', 'b']);
  });
  it('reintenta solo GET ante 5xx; nunca 4xx ni escrituras', async () => {
    const ax = fakeAxios(axiosError(503), { status: 200, data: 'ok' });
    const c = new HttpClient({ axios: ax, logger, config: { retries: 2 } });
    expect((await c.request({ url: '/x' })).data).toBe('ok');
    expect(ax.request).toHaveBeenCalledTimes(2);

    const ax2 = fakeAxios(axiosError(503));
    const c2 = new HttpClient({ axios: ax2, logger, config: { retries: 2 } });
    await expect(c2.request({ url: '/x', method: 'post' })).rejects.toBeInstanceOf(ServerError);
    expect(ax2.request).toHaveBeenCalledTimes(1);

    const ax3 = fakeAxios(axiosError(422, { message: 'Revise', errors: { Correo: ['Inválido'] } }));
    const c3 = new HttpClient({ axios: ax3, logger, config: { retries: 2 } });
    const err = await c3.request({ url: '/x' }).catch((e) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err.message).toBe('Revise');
    expect(err.fieldErrors).toEqual({ correo: ['Inválido'] });
    expect(ax3.request).toHaveBeenCalledTimes(1);
  });
  it('401 avisa a la sesión y a onUnauthorized', async () => {
    const session = { handleUnauthorized: vi.fn() };
    const onUnauthorized = vi.fn();
    const c = new HttpClient({
      axios: fakeAxios(axiosError(401)),
      logger,
      config: { session, onUnauthorized },
    });
    await expect(c.request({ url: '/me' })).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(session.handleUnauthorized).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
  it('cancelación → CancelledError sin reintentos', async () => {
    const ax = fakeAxios(
      Object.assign(new Error('canceled'), { name: 'CanceledError', code: 'ERR_CANCELED' }),
    );
    const c = new HttpClient({ axios: ax, logger, config: { retries: 3 } });
    await expect(c.request({ url: '/x' })).rejects.toBeInstanceOf(CancelledError);
    expect(ax.request).toHaveBeenCalledTimes(1);
  });
  it('toHttpError: timeout y red', () => {
    expect(
      toHttpError(Object.assign(new Error('timeout of 20000ms exceeded'), { code: 'ECONNABORTED' })).code,
    ).toBe('TIMEOUT_ERROR');
    expect(toHttpError(Object.assign(new Error('Network Error'), { code: 'ERR_NETWORK' })).code).toBe(
      'NETWORK_ERROR',
    );
  });
});

describe('headerContextStrategy (decisión 014)', () => {
  it('envía X-Institution-Id con la institución vigente y nada sin institución', async () => {
    const { headerContextStrategy } = await import('../src/js/services/http-client.js');
    const ax = fakeAxios({ status: 200 }, { status: 200 });
    let inst = { id: 'inst-7', displayName: 'Colegio' };
    const c = new HttpClient({
      axios: ax,
      logger,
      config: { getInstitution: () => inst, contextStrategy: headerContextStrategy() },
    });
    await c.request({ url: '/cursos' });
    inst = null;
    await c.request({ url: '/plataforma/resumen' });
    const [first, second] = ax.request.mock.calls.map(([r]) => r.headers);
    expect(first['X-Institution-Id']).toBe('inst-7');
    expect(second).not.toHaveProperty('X-Institution-Id');
  });
  it('nombre configurable y validado', async () => {
    const { headerContextStrategy } = await import('../src/js/services/http-client.js');
    expect(headerContextStrategy('X-Tenant').apply({ headers: {} }, { id: 'a' }).headers['X-Tenant']).toBe(
      'a',
    );
    expect(() => headerContextStrategy('X Bad\n')).toThrow(/no válido/);
    expect(() => headerContextStrategy('')).toThrow(/no válido/);
  });
});
