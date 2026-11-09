import { describe, it, expect, vi } from 'vitest';
import { AuthService, readJwtExpiry } from '../src/js/services/auth-service.js';
import { HttpClient } from '../src/js/services/http-client.js';
import { Logger } from '../src/js/core/logger.js';

const logger = new Logger({ sink: { debug() {}, info() {}, warn() {}, error() {} } });
const axiosError = (status, data) =>
  Object.assign(new Error('Request failed'), { isAxiosError: true, request: {}, response: { status, data } });
const jwt = (payload) => `h.${btoa(JSON.stringify(payload)).replace(/=+$/, '')}.s`;

/**
 * API falsa: `routes[url]` es una función `(config) => respuesta` o lanza.
 * @param {Record<string, (config: any) => any>} routes Rutas.
 * @returns {{ request: import('vitest').Mock, defaults: Record<string, unknown> }} Instancia tipo axios.
 */
function fakeApi(routes) {
  return {
    defaults: {},
    request: vi.fn(async (config) => {
      const handler = routes[config.url];
      if (!handler) throw axiosError(404);
      return handler(config);
    }),
  };
}

const setup = (routes, { now } = {}) => {
  const http = fakeApi(routes);
  const auth = new AuthService({ http, logger, now });
  const session = { handleUnauthorized: vi.fn() };
  const client = new HttpClient({
    axios: http,
    logger,
    config: {
      session,
      auth: {
        isEnabled: () => auth.isEnabled(),
        getToken: () => auth.getToken(),
        peek: () => auth.peek(),
        refresh: () => auth.refresh(),
      },
    },
  });
  auth.configure({ loginUrl: '/auth/login', refreshUrl: '/auth/refresh', logoutUrl: '/auth/logout' });
  return { http, auth, client, session };
};

describe('AuthService — opción A (token en memoria)', () => {
  it('login guarda el token en memoria y devuelve el cuerpo sin el token', async () => {
    const { auth, http } = setup({
      '/auth/login': () => ({
        status: 200,
        data: { accessToken: 'A1', expiresIn: 900, user: { name: 'Ana' }, roles: ['teacher'] },
      }),
    });
    const body = await auth.login({ email: 'ana@x.do', password: 'x' });
    expect(body).toEqual({ user: { name: 'Ana' }, roles: ['teacher'] });
    expect(auth.peek()).toBe('A1');
    expect(http.request.mock.calls[0][0].withCredentials).toBe(true);
    expect(JSON.stringify({ ...localStorage })).not.toContain('A1');
    expect(JSON.stringify({ ...sessionStorage })).not.toContain('A1');
    expect(document.cookie).not.toContain('A1');
  });
  it('login 401 sin mensaje → "Correo o contraseña incorrectos."', async () => {
    const { auth } = setup({ '/auth/login': () => Promise.reject(axiosError(401, {})) });
    await expect(auth.login({})).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      message: 'Correo o contraseña incorrectos.',
    });
    expect(auth.hasToken()).toBe(false);
  });
  it('respuesta sin accessToken → AUTH_TOKEN_MISSING', async () => {
    const { auth } = setup({ '/auth/login': () => ({ status: 200, data: { ok: true } }) });
    await expect(auth.login({})).rejects.toMatchObject({ code: 'AUTH_TOKEN_MISSING' });
  });
  it('refresh es single-flight', async () => {
    let n = 0;
    const { auth, http } = setup({
      '/auth/refresh': async () => ({ status: 200, data: { access_token: `R${++n}` } }),
    });
    const tokens = await Promise.all([auth.refresh(), auth.refresh(), auth.refresh()]);
    expect(tokens).toEqual(['R1', 'R1', 'R1']);
    expect(http.request).toHaveBeenCalledTimes(1);
  });
  it('restore: true con cookie válida, false sin sesión (nunca lanza)', async () => {
    expect(
      await setup({ '/auth/refresh': () => ({ status: 200, data: { token: 'T' } }) }).auth.restore(),
    ).toBe(true);
    expect(await setup({ '/auth/refresh': () => Promise.reject(axiosError(401)) }).auth.restore()).toBe(
      false,
    );
  });
  it('logout olvida el token aunque el servidor falle', async () => {
    const { auth } = setup({
      '/auth/login': () => ({ status: 200, data: { accessToken: 'A1' } }),
      '/auth/logout': () => Promise.reject(axiosError(500)),
    });
    await auth.login({});
    await auth.logout();
    expect(auth.hasToken()).toBe(false);
  });
  it('configure rechaza rutas absolutas fuera de baseURL', () => {
    const { auth } = setup({});
    expect(() => auth.configure({ refreshUrl: 'https://evil.example/refresh' })).toThrow(/relativa/);
  });
  it('readJwtExpiry lee exp sin verificar', () => {
    expect(readJwtExpiry(jwt({ exp: 1800000000 }))).toBe(1800000000000);
    expect(readJwtExpiry('no-es-jwt')).toBe(0);
  });
});

describe('HttpClient + JWT', () => {
  it('envía Authorization; auth:false no lo envía', async () => {
    const { auth, client, http } = setup({
      '/auth/login': () => ({ status: 200, data: { accessToken: 'A1', expiresIn: 900 } }),
      '/cursos': () => ({ status: 200, data: [] }),
      '/publico': () => ({ status: 200, data: [] }),
    });
    await auth.login({});
    await client.request({ url: '/cursos' });
    await client.request({ url: '/publico', auth: false });
    const calls = http.request.mock.calls.map(([c]) => c);
    expect(calls[1].headers.Authorization).toBe('Bearer A1');
    expect(calls[2].headers.Authorization).toBeUndefined();
  });
  it('401 → una sola renovación compartida y reintento de cada solicitud', async () => {
    let refreshes = 0;
    const { auth, client } = setup({
      '/auth/login': () => ({ status: 200, data: { accessToken: 'VIEJO', expiresIn: 900 } }),
      '/auth/refresh': async () => {
        refreshes += 1;
        await new Promise((r) => setTimeout(r, 5));
        return { status: 200, data: { accessToken: 'NUEVO', expiresIn: 900 } };
      },
      '/a': (c) =>
        c.headers.Authorization === 'Bearer NUEVO'
          ? { status: 200, data: 'a' }
          : Promise.reject(axiosError(401)),
      '/b': (c) =>
        c.headers.Authorization === 'Bearer NUEVO'
          ? { status: 200, data: 'b' }
          : Promise.reject(axiosError(401)),
      '/c': (c) =>
        c.headers.Authorization === 'Bearer NUEVO'
          ? { status: 200, data: 'c' }
          : Promise.reject(axiosError(401)),
    });
    await auth.login({});
    const results = await Promise.all(['/a', '/b', '/c'].map((url) => client.request({ url })));
    expect(results.map((r) => r.data)).toEqual(['a', 'b', 'c']);
    expect(refreshes).toBe(1);
  });
  it('si la renovación falla: sesión expirada y UnauthorizedError (sin bucle)', async () => {
    const { auth, client, session, http } = setup({
      '/auth/login': () => ({ status: 200, data: { accessToken: 'A1', expiresIn: 900 } }),
      '/auth/refresh': () => Promise.reject(axiosError(401)),
      '/x': () => Promise.reject(axiosError(401)),
    });
    await auth.login({});
    await expect(client.request({ url: '/x' })).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(session.handleUnauthorized).toHaveBeenCalledTimes(1);
    expect(auth.hasToken()).toBe(false);
    expect(http.request.mock.calls.filter(([c]) => c.url === '/x')).toHaveLength(1);
  });
  it('las solicitudes hechas durante restore esperan el token', async () => {
    const { auth, client, http } = setup({
      '/auth/refresh': async () => (
        await new Promise((r) => setTimeout(r, 10)),
        { status: 200, data: { accessToken: 'R1', expiresIn: 900 } }
      ),
      '/x': () => ({ status: 200, data: 1 }),
    });
    const restoring = auth.restore();
    await client.request({ url: '/x' });
    await restoring;
    expect(http.request.mock.calls.find(([c]) => c.url === '/x')[0].headers.Authorization).toBe('Bearer R1');
  });
  it('tokens más cortos que el margen no renuevan en cada solicitud', async () => {
    let t = 0;
    const { auth, client, http } = setup(
      {
        '/auth/login': () => ({ status: 200, data: { accessToken: 'A1', expiresIn: 10 } }),
        '/auth/refresh': () => ({ status: 200, data: { accessToken: 'A2', expiresIn: 10 } }),
        '/x': () => ({ status: 200, data: 1 }),
      },
      { now: () => t },
    );
    await auth.login({});
    await client.request({ url: '/x' });
    await client.request({ url: '/x' });
    expect(http.request.mock.calls.filter(([c]) => c.url === '/auth/refresh')).toHaveLength(0);
    t += 6000; // quedan 4 s < mitad de la vida (5 s)
    await client.request({ url: '/x' });
    expect(http.request.mock.calls.filter(([c]) => c.url === '/auth/refresh')).toHaveLength(1);
  });
  it('sin token, un 401 no intenta renovar', async () => {
    const { client, http } = setup({
      '/x': () => Promise.reject(axiosError(401)),
      '/auth/refresh': () => ({ status: 200, data: { token: 'T' } }),
    });
    await expect(client.request({ url: '/x' })).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(http.request.mock.calls.some(([c]) => c.url === '/auth/refresh')).toBe(false);
  });
  it('renueva por adelantado si el token está por vencer', async () => {
    let t = 1_000_000;
    const { auth, client, http } = setup(
      {
        '/auth/login': () => ({ status: 200, data: { accessToken: 'A1', expiresIn: 60 } }),
        '/auth/refresh': () => ({ status: 200, data: { accessToken: 'A2', expiresIn: 900 } }),
        '/x': () => ({ status: 200, data: 1 }),
      },
      { now: () => t },
    );
    await auth.login({});
    t += 45_000; // quedan 15 s < margen de 30 s
    await client.request({ url: '/x' });
    const call = http.request.mock.calls.find(([c]) => c.url === '/x')[0];
    expect(call.headers.Authorization).toBe('Bearer A2');
  });
});
