#!/usr/bin/env node
/**
 * API simulada de autenticación — SOLO PARA PRUEBAS LOCALES (spec 011).
 *
 * No es un backend: no guarda nada en disco, el usuario es un fixture de demostración y
 * los tokens se firman con un secreto de juguete. Sirve para ver el login JWT (opción A)
 * funcionando mientras no existe el backend real. Nunca la use fuera de su equipo.
 *
 * Contrato (el mismo de `src/js/services/auth-service.js`):
 *   POST /auth/login    { email, password }  → { accessToken, expiresIn, user } + cookie de renovación
 *   POST /auth/refresh  cookie               → { accessToken, expiresIn } y rota la cookie · 401 sin sesión
 *   POST /auth/logout   Authorization+cookie → 204 y borra la cookie
 *   GET  /me            Authorization        → { user, roles, permissions, institution }
 *
 * La cookie de renovación es `httpOnly`, `SameSite=Lax`, `Path=/auth`: el JavaScript de la página
 * nunca la ve. CORS refleja el origen de la solicitud con credenciales.
 *
 * Uso: `npm run mock` (puerto 3100, o `PORT=…`), y en la página:
 *   <meta name="au-config" content='{"apiBaseUrl":"http://localhost:3100","auth":{"loginUrl":"/auth/login","refreshUrl":"/auth/refresh","logoutUrl":"/auth/logout","meUrl":"/me"}}'>
 * (la API y la página comparten sitio `localhost`; los puertos distintos no cuentan para `SameSite`).
 */
import { createServer } from 'node:http';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { pathToFileURL } from 'node:url';

/** Usuario de demostración (fixture; no representa a ninguna persona real). */
export const DEMO_USER = Object.freeze({
  id: 'u-demo',
  email: 'demo@aulard.test',
  password: 'demo1234',
  name: 'Usuario de demostración',
});

const DEMO_INSTITUTION = Object.freeze({ id: 'inst-demo', name: 'Institución de demostración', plan: 'Demostración' });
const DEMO_ROLES = Object.freeze(['director']);
const DEMO_PERMISSIONS = Object.freeze(['students.read', 'billing.read']);
/** Secreto de juguete: los tokens de esta API no valen en ningún otro lado. */
const MOCK_SECRET = 'aulard-mock-secret-no-usar-en-produccion';
const COOKIE = 'au_refresh';

/**
 * Codifica en base64url.
 * @param {string | Buffer} input Datos.
 * @returns {string} Texto base64url.
 */
const b64 = (input) => Buffer.from(input).toString('base64url');

/**
 * Firma un JWT HS256.
 * @param {Record<string, unknown>} claims Declaraciones.
 * @returns {string} JWT.
 */
function sign(claims) {
  const head = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64(JSON.stringify(claims));
  const sig = createHmac('sha256', MOCK_SECRET).update(`${head}.${body}`).digest('base64url');
  return `${head}.${body}.${sig}`;
}

/**
 * Verifica un JWT firmado por esta API y no vencido.
 * @param {string} token JWT.
 * @returns {Record<string, any> | null} Declaraciones, o `null` si es inválido o venció.
 */
function verify(token) {
  const [head, body, sig] = token.split('.');
  if (!head || !body || !sig) return null;
  const expected = createHmac('sha256', MOCK_SECRET).update(`${head}.${body}`).digest();
  const given = Buffer.from(sig, 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const claims = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return claims.exp > Math.floor(Date.now() / 1000) ? claims : null;
  } catch {
    return null;
  }
}

/**
 * Crea el servidor de la API simulada (sin ponerlo a escuchar).
 * @param {{ accessTtl?: number }} [options] `accessTtl`: vida del token de acceso, en segundos.
 * @returns {import('node:http').Server} Servidor HTTP.
 */
export function createMockApi({ accessTtl = 900 } = {}) {
  /** Cookies de renovación vigentes (se rotan en cada renovación). */
  const refreshTokens = new Set();

  /**
   * Emite un token de acceso.
   * @returns {string} JWT.
   */
  const issueAccess = () =>
    sign({ sub: DEMO_USER.id, email: DEMO_USER.email, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + accessTtl });

  /**
   * Emite una cookie de renovación nueva y la registra.
   * @returns {string} Cabecera `Set-Cookie`.
   */
  const issueRefreshCookie = () => {
    const value = randomBytes(24).toString('base64url');
    refreshTokens.add(value);
    return `${COOKIE}=${value}; HttpOnly; SameSite=Lax; Path=/auth; Max-Age=${60 * 60 * 24 * 7}`;
  };

  return createServer(async (req, res) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    }
    /**
     * Responde con JSON.
     * @param {number} status Código HTTP.
     * @param {unknown} [body] Cuerpo.
     * @returns {void}
     */
    const json = (status, body) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(body === undefined ? undefined : JSON.stringify(body));
    };

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': req.headers['access-control-request-headers'] ?? 'Authorization,Content-Type,X-Institution-Id',
        'Access-Control-Max-Age': '600',
      });
      return res.end();
    }

    const path = new URL(req.url ?? '/', 'http://x').pathname;
    const cookieValue = (req.headers.cookie ?? '')
      .split(';')
      .map((c) => c.trim().split('='))
      .find(([k]) => k === COOKIE)?.[1];
    const bearer = /^Bearer (.+)$/.exec(req.headers.authorization ?? '')?.[1];

    if (req.method === 'POST' && path === '/auth/login') {
      /** @type {Buffer[]} */
      const chunks = [];
      for await (const c of req) chunks.push(/** @type {Buffer} */ (c));
      /** @type {any} */
      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
      } catch {
        return json(400, { message: 'JSON inválido.' });
      }
      if (body.email !== DEMO_USER.email || body.password !== DEMO_USER.password) {
        return json(401, { message: 'Correo o contraseña incorrectos.' });
      }
      res.setHeader('Set-Cookie', issueRefreshCookie());
      return json(200, {
        accessToken: issueAccess(),
        expiresIn: accessTtl,
        user: { id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email },
      });
    }

    if (req.method === 'POST' && path === '/auth/refresh') {
      if (!cookieValue || !refreshTokens.delete(cookieValue)) return json(401, { message: 'No hay sesión.' });
      res.setHeader('Set-Cookie', issueRefreshCookie());
      return json(200, { accessToken: issueAccess(), expiresIn: accessTtl });
    }

    if (req.method === 'POST' && path === '/auth/logout') {
      if (cookieValue) refreshTokens.delete(cookieValue);
      res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Lax; Path=/auth; Max-Age=0`);
      res.writeHead(204);
      return res.end();
    }

    if (req.method === 'GET' && path === '/me') {
      if (!bearer || !verify(bearer)) return json(401, { message: 'No autenticado.' });
      return json(200, {
        user: { id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email },
        roles: DEMO_ROLES,
        permissions: DEMO_PERMISSIONS,
        institution: DEMO_INSTITUTION,
      });
    }

    return json(404, { message: 'Ruta no encontrada.' });
  });
}

// Ejecución directa: `node scripts/mock-api.mjs` o `npm run mock`.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 3100);
  createMockApi().listen(port, '127.0.0.1', () => {
    console.warn(`API simulada (solo pruebas locales) en http://localhost:${port}`);
    console.warn(`Usuario de demostración: ${DEMO_USER.email} / ${DEMO_USER.password}`);
  });
}
