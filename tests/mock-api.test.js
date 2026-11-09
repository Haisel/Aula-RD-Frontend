// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMockApi, DEMO_USER } from '../scripts/mock-api.mjs';

/**
 * Spec 011 · T-01: API simulada solo para pruebas locales (fixture, no datos reales).
 * Contrato: POST /auth/login, POST /auth/refresh (cookie), POST /auth/logout, GET /me.
 */
describe('API simulada de autenticación (spec 011)', () => {
  /** @type {import('node:http').Server} */
  let server;
  let base = '';

  beforeAll(async () => {
    server = createMockApi({ accessTtl: 60 });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(undefined)));
    const addr = /** @type {import('node:net').AddressInfo} */ (server.address());
    base = `http://127.0.0.1:${addr.port}`;
  });

  afterAll(async () => {
    await new Promise((resolve) => server.close(() => resolve(undefined)));
  });

  /**
   * Hace una solicitud JSON.
   * @param {string} path Ruta.
   * @param {{ method?: string, body?: unknown, token?: string, cookie?: string, origin?: string }} [o] Opciones.
   * @returns {Promise<Response>} Respuesta.
   */
  const call = (path, { method = 'GET', body, token, cookie, origin } = {}) =>
    fetch(base + path, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(cookie ? { Cookie: cookie } : {}),
        ...(origin ? { Origin: origin } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

  /**
   * Inicia sesión con el usuario de demostración.
   * @returns {Promise<{ accessToken: string, cookie: string, body: any, setCookie: string }>} Token y cookie de renovación.
   */
  async function login() {
    const res = await call('/auth/login', {
      method: 'POST',
      body: { email: DEMO_USER.email, password: DEMO_USER.password },
    });
    const setCookie = res.headers.get('set-cookie') ?? '';
    const body = await res.json();
    return { accessToken: body.accessToken, cookie: setCookie.split(';')[0], body, setCookie };
  }

  it('login correcto: devuelve accessToken y expiresIn, y la renovación va en cookie httpOnly', async () => {
    const { body, setCookie } = await login();
    expect(typeof body.accessToken).toBe('string');
    expect(body.expiresIn).toBe(60);
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
    expect(JSON.stringify(body)).not.toContain('refresh');
  });

  it('el accessToken es un JWT con exp coherente con expiresIn', async () => {
    const { accessToken } = await login();
    const [, payload] = accessToken.split('.');
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    const left = claims.exp - Math.floor(Date.now() / 1000);
    expect(left).toBeGreaterThan(55);
    expect(left).toBeLessThanOrEqual(60);
  });

  it('login con contraseña incorrecta: 401 con mensaje', async () => {
    const res = await call('/auth/login', { method: 'POST', body: { email: DEMO_USER.email, password: 'mala' } });
    expect(res.status).toBe(401);
    expect(res.headers.get('set-cookie')).toBeNull();
    expect((await res.json()).message).toMatch(/Correo o contraseña/);
  });

  it('GET /me sin token: 401; con token: usuario, roles, permisos e institución', async () => {
    expect((await call('/me')).status).toBe(401);
    const { accessToken } = await login();
    const res = await call('/me', { token: accessToken });
    expect(res.status).toBe(200);
    const me = await res.json();
    expect(me.user.email).toBe(DEMO_USER.email);
    expect(Array.isArray(me.roles)).toBe(true);
    expect(Array.isArray(me.permissions)).toBe(true);
    expect(me.institution.id).toBeTruthy();
  });

  it('GET /me con un token manipulado: 401', async () => {
    const { accessToken } = await login();
    const bad = accessToken.slice(0, -3) + 'abc';
    expect((await call('/me', { token: bad })).status).toBe(401);
  });

  it('refresh con la cookie: nuevo accessToken y la cookie rota (la anterior deja de valer)', async () => {
    const first = await login();
    const res = await call('/auth/refresh', { method: 'POST', cookie: first.cookie });
    expect(res.status).toBe(200);
    expect(typeof (await res.json()).accessToken).toBe('string');
    const rotated = (res.headers.get('set-cookie') ?? '').split(';')[0];
    expect(rotated).not.toBe(first.cookie);
    expect((await call('/auth/refresh', { method: 'POST', cookie: first.cookie })).status).toBe(401);
    expect((await call('/auth/refresh', { method: 'POST', cookie: rotated })).status).toBe(200);
  });

  it('refresh sin cookie: 401', async () => {
    expect((await call('/auth/refresh', { method: 'POST' })).status).toBe(401);
  });

  it('logout: 204, borra la cookie e invalida la renovación', async () => {
    const { accessToken, cookie } = await login();
    const res = await call('/auth/logout', { method: 'POST', token: accessToken, cookie });
    expect(res.status).toBe(204);
    expect(res.headers.get('set-cookie')).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/i);
    expect((await call('/auth/refresh', { method: 'POST', cookie })).status).toBe(401);
  });

  it('CORS: refleja el origen con credenciales y responde al preflight', async () => {
    const origin = 'http://localhost:4173';
    const pre = await fetch(`${base}/auth/login`, {
      method: 'OPTIONS',
      headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization,content-type' },
    });
    expect(pre.status).toBe(204);
    expect(pre.headers.get('access-control-allow-origin')).toBe(origin);
    expect(pre.headers.get('access-control-allow-credentials')).toBe('true');
    expect(pre.headers.get('access-control-allow-headers')).toMatch(/authorization/i);
  });

  it('ruta desconocida: 404 JSON', async () => {
    const res = await call('/no-existe');
    expect(res.status).toBe(404);
  });
});
