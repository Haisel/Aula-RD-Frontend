import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus, EVENTS } from '../src/js/core/events.js';
import { Logger } from '../src/js/core/logger.js';
import { SessionService, normalizeUser } from '../src/js/services/session-service.js';
import { InstitutionContext, normalizeInstitution } from '../src/js/services/institution-context.js';
import { AccessPolicy } from '../src/js/services/access-policy.js';

const logger = new Logger({ sink: { debug() {}, info() {}, warn() {}, error() {} } });
const setup = () => {
  const target = new EventTarget();
  const bus = new EventBus(target);
  const seen = [];
  for (const name of [EVENTS.SESSION_CHANGED, EVENTS.SESSION_EXPIRED, EVENTS.INSTITUTION_CHANGED]) {
    bus.on(name, (e) => seen.push([name, e.detail]));
  }
  return { bus, seen };
};

describe('SessionService', () => {
  it('sin puerto queda en unauthenticated: nunca finge identidad', async () => {
    const { bus } = setup();
    const s = new SessionService({ logger, bus });
    expect(s.status()).toBe('unknown');
    expect(await s.resolve()).toBe('unauthenticated');
    expect(s.user()).toBeNull();
  });
  it('resuelve con el puerto, una sola llamada concurrente', async () => {
    const { bus, seen } = setup();
    const resolve = vi.fn(async () => ({
      status: 'authenticated',
      user: { id: 'u1', name: 'Ana', permissions: ['a'] },
    }));
    const s = new SessionService({ logger, bus, ports: { resolve } });
    await Promise.all([s.resolve(), s.resolve()]);
    expect(resolve).toHaveBeenCalledTimes(1);
    expect(s.user()).toMatchObject({ id: 'u1', displayName: 'Ana', permissions: ['a'], roles: [] });
    expect(seen[0]).toEqual([EVENTS.SESSION_CHANGED, { from: 'unknown', to: 'authenticated' }]);
  });
  it('si el puerto falla queda en unauthenticated', async () => {
    const { bus } = setup();
    const s = new SessionService({
      logger,
      bus,
      ports: { resolve: async () => Promise.reject(new Error('caído')) },
    });
    expect(await s.resolve()).toBe('unauthenticated');
  });
  it('handleUnauthorized emite au:session:expired una sola vez', () => {
    const { bus, seen } = setup();
    const s = new SessionService({ logger, bus });
    s.apply({ user: { name: 'Ana' } });
    s.handleUnauthorized();
    s.handleUnauthorized();
    expect(s.status()).toBe('expired');
    expect(s.user()).toBeNull();
    expect(seen.filter(([n]) => n === EVENTS.SESSION_EXPIRED)).toHaveLength(1);
  });
  it('un 401 sin sesión no la marca como expirada ni emite el evento', () => {
    const { bus, seen } = setup();
    const s = new SessionService({ logger, bus });
    s.handleUnauthorized();
    expect(s.status()).toBe('unauthenticated');
    expect(seen.filter(([n]) => n === EVENTS.SESSION_EXPIRED)).toHaveLength(0);
  });
  it('signOut llama al puerto y limpia aunque falle', async () => {
    const { bus } = setup();
    const s = new SessionService({
      logger,
      bus,
      ports: { signOut: async () => Promise.reject(new Error('x')) },
    });
    s.apply({ user: { name: 'Ana' } });
    await expect(s.signOut()).rejects.toThrow('x');
    expect(s.status()).toBe('unauthenticated');
  });
  it('normalizeUser acepta name o displayName y roles de nivel superior', () => {
    expect(normalizeUser({ name: 'Ana' }, { roles: ['teacher'] })).toMatchObject({
      displayName: 'Ana',
      roles: ['teacher'],
    });
    expect(normalizeUser(null)).toBeNull();
  });
});

describe('InstitutionContext', () => {
  it('apply emite cambio solo si cambia el id e informa el anterior', () => {
    const { bus, seen } = setup();
    const i = new InstitutionContext({ logger, bus });
    i.apply({ id: 'a', name: 'Colegio A', plan: 'Pro' });
    i.apply({ id: 'a', name: 'Colegio A (renombrado)' });
    i.apply({ id: 'b', name: 'Colegio B' });
    const changes = seen.filter(([n]) => n === EVENTS.INSTITUTION_CHANGED).map(([, d]) => d);
    expect(changes).toEqual([
      { id: 'a', previous: null },
      { id: 'b', previous: 'a' },
    ]);
    expect(i.current()).toMatchObject({ id: 'b', displayName: 'Colegio B' });
  });
  it('select sin puerto lanza: el frontend no elige institución por su cuenta', async () => {
    const { bus } = setup();
    const i = new InstitutionContext({ logger, bus });
    await expect(i.select('x')).rejects.toThrow(/puerto/);
  });
  it('select con puerto vuelve a leer la activa', async () => {
    const { bus } = setup();
    let current = { id: 'a', name: 'A' };
    const i = new InstitutionContext({
      logger,
      bus,
      ports: {
        select: async (id) => void (current = { id, name: id.toUpperCase() }),
        resolveCurrent: async () => current,
        available: async () => [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, null],
      },
    });
    expect(await i.available()).toHaveLength(2);
    expect(await i.select('b')).toMatchObject({ id: 'b', displayName: 'B' });
  });
  it('normalizeInstitution exige identificador', () => {
    expect(normalizeInstitution({})).toBeNull();
    expect(normalizeInstitution({ name: 'Solo nombre' })?.id).toBe('Solo nombre');
  });
});

describe('AccessPolicy', () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<button data-au-can="cobros.registrar">A</button><button data-au-can="planes.editar">B</button>';
  });
  it('oculta sin permiso, con aria-hidden; super-admin no tiene comodín', () => {
    const p = new AccessPolicy({ roles: ['super-admin'], permissions: ['cobros.registrar'] });
    p.applyTo(document);
    const [a, b] = document.querySelectorAll('button');
    expect(a.hidden).toBe(false);
    expect(b.hidden).toBe(true);
    expect(b.getAttribute('aria-hidden')).toBe('true');
    expect(p.can('planes.editar')).toBe(false);
    expect(p.hasRole('super-admin')).toBe(true);
    p.syncFromUser(null);
    expect(p.can('cobros.registrar')).toBe(false);
  });
});
