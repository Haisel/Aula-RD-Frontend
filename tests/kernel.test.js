import { describe, it, expect, vi } from 'vitest';
import {
  AppError,
  CancelledError,
  ERRORS,
  NotFoundError,
  ValidationError,
  fromHttpStatus,
  isAbortError,
  toAppError,
} from '../src/js/core/errors.js';
import { EventBus, EVENTS } from '../src/js/core/events.js';
import { Logger } from '../src/js/core/logger.js';
import { Scope } from '../src/js/core/scope.js';
import { ServiceContainer } from '../src/js/core/container.js';
import { ModuleLoader } from '../src/js/core/module-loader.js';
import { ErrorHandler } from '../src/js/core/error-handler.js';
import { StorageService, createMemoryStorage } from '../src/js/core/storage.js';

const silent = () => new Logger({ sink: { debug() {}, info() {}, warn() {}, error() {} } });

describe('errores tipados', () => {
  it('fromHttpStatus elige la clase y conserva fieldErrors', () => {
    const e = fromHttpStatus(422, { message: 'Datos inválidos', fieldErrors: { correo: ['Requerido'] } });
    expect(e).toBeInstanceOf(ValidationError);
    expect(e).toBeInstanceOf(AppError);
    expect(e.code).toBe('VALIDATION_ERROR');
    expect(e.status).toBe(422);
    expect(e.fieldErrors.correo).toEqual(['Requerido']);
    expect(fromHttpStatus(404)).toBeInstanceOf(NotFoundError);
    expect(fromHttpStatus(419).code).toBe('PAGE_EXPIRED');
    expect(fromHttpStatus(503).code).toBe('SERVER_ERROR');
    expect(fromHttpStatus(0).code).toBe('NETWORK_ERROR');
  });
  it('name explícito (sobrevive a la minificación) y mensaje por defecto en español', () => {
    const e = new ERRORS.ForbiddenError();
    expect(e.name).toBe('ForbiddenError');
    expect(e.status).toBe(403);
    expect(e.message).toMatch(/permiso/);
  });
  it('toAppError respeta AppError y convierte abortos', () => {
    const own = new AppError('x', { code: 'X' });
    expect(toAppError(own)).toBe(own);
    const abort = Object.assign(new Error('a'), { name: 'AbortError' });
    expect(isAbortError(abort)).toBe(true);
    expect(toAppError(abort)).toBeInstanceOf(CancelledError);
    expect(toAppError('raro').code).toBe('UNKNOWN_ERROR');
  });
});

describe('EventBus', () => {
  it('on / once / off / clear', () => {
    const target = new EventTarget();
    const b = new EventBus(target);
    const seen = [];
    b.on('au:x:y', (e) => seen.push(['on', e.detail.n]));
    b.once('au:x:y', (e) => seen.push(['once', e.detail.n]));
    b.emit('au:x:y', { n: 1 });
    b.emit('au:x:y', { n: 2 });
    b.clear();
    b.emit('au:x:y', { n: 3 });
    expect(seen).toEqual([
      ['on', 1],
      ['once', 1],
      ['on', 2],
    ]);
  });
  it('nombres con patrón au:<ámbito>:<evento>', () => {
    for (const name of Object.values(EVENTS)) expect(name).toMatch(/^au:[a-z]+:[a-z]+$/);
  });
});

describe('Logger', () => {
  it('filtra por nivel y redacta datos sensibles', () => {
    const sink = { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() };
    const log = new Logger({ level: 'info', sink, context: 'pagos' });
    log.debug('no sale');
    log.info('pago', { id: 1, token: 'abc', password: 'x' });
    expect(sink.debug).not.toHaveBeenCalled();
    expect(sink.info).toHaveBeenCalledWith(
      '[AU · pagos]',
      'pago',
      '{"id":1,"token":"[redacted]","password":"[redacted]"}',
    );
    log.warn('Bearer xyz');
    expect(sink.warn).toHaveBeenCalledWith('[AU · pagos]', '[redacted]');
  });
});

describe('Scope', () => {
  it('destroy aborta la señal, retira listeners y ejecuta limpiezas una vez', () => {
    const scope = new Scope();
    const target = new EventTarget();
    const handler = vi.fn();
    const cleanup = vi.fn();
    scope.on(target, 'ping', handler);
    scope.addCleanup(cleanup);
    target.dispatchEvent(new Event('ping'));
    scope.destroy();
    scope.destroy();
    target.dispatchEvent(new Event('ping'));
    expect(handler).toHaveBeenCalledTimes(1);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(scope.signal.aborted).toBe(true);
  });
  it('child se destruye con el padre', () => {
    const parent = new Scope();
    const child = parent.child();
    parent.destroy();
    expect(child.destroyed).toBe(true);
  });
});

describe('ServiceContainer', () => {
  it('perezoso, singleton, override y freeze', () => {
    const c = new ServiceContainer();
    const factory = vi.fn(() => ({ n: 1 }));
    c.provide('svc', factory);
    expect(factory).not.toHaveBeenCalled();
    expect(c.resolve('svc')).toBe(c.resolve('svc'));
    expect(factory).toHaveBeenCalledTimes(1);
    c.override('svc', 'fake');
    expect(c.resolve('svc')).toBe('fake');
    c.freeze();
    expect(() => c.provide('otro', () => 1)).toThrow(/congelado/);
  });
});

describe('ModuleLoader', () => {
  it('carga una sola vez (también en paralelo) y respeta dependsOn', async () => {
    const m = new ModuleLoader({ logger: silent() });
    const order = [];
    m.define({ id: 'base', portals: ['teacher'], load: async () => (order.push('base'), { base: true }) });
    m.define({
      id: 'notas',
      portals: ['teacher'],
      dependsOn: ['base'],
      navigation: [{ portal: 'teacher', section: 'Aula', label: 'Notas', icon: 'journal', to: '/notas' }],
      load: async () => (order.push('notas'), { notas: true }),
    });
    const [a, b] = await Promise.all([m.load('notas'), m.load('notas')]);
    expect(a).toBe(b);
    expect(order).toEqual(['base', 'notas']);
    expect(m.navigationFor('teacher')).toHaveLength(1);
    expect(() => m.define({ id: 'Mal', portals: [], load: async () => ({}) })).toThrow(/kebab/);
  });
});

describe('ErrorHandler', () => {
  it('reporta con código y emite au:app:error; ignora cancelaciones', () => {
    const target = new EventTarget();
    const b = new EventBus(target);
    const errorSpy = vi.fn();
    const h = new ErrorHandler({
      logger: new Logger({ sink: { debug() {}, info() {}, warn() {}, error: errorSpy } }),
      bus: b,
    });
    const seen = [];
    b.on(EVENTS.APP_ERROR, (e) => seen.push(e.detail));
    const r = h.report(fromHttpStatus(500));
    h.report(new CancelledError());
    expect(r.code).toBe('SERVER_ERROR');
    expect(seen).toEqual([{ code: 'SERVER_ERROR', status: 500 }]);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});

describe('StorageService', () => {
  it('prefijo au-, JSON, rechazo de claves sensibles', () => {
    const backend = createMemoryStorage();
    const s = new StorageService({ storage: backend });
    expect(s.set('filtros', { grado: '4S' })).toBe(true);
    expect(backend.getItem('au-filtros')).toBe('{"grado":"4S"}');
    expect(s.get('filtros', null)).toEqual({ grado: '4S' });
    expect(s.get('no-existe', 7)).toBe(7);
    expect(() => s.set('auth-token', 'x')).toThrow(/sensible/);
    expect(() => s.get('session', null)).toThrow(/sensible/);
  });
  it('clear borra solo su espacio de nombres y conserva tema y sidebar', () => {
    const backend = createMemoryStorage();
    backend.setItem('otra-app', '1');
    const s = new StorageService({ storage: backend });
    s.set('theme', 'dark');
    s.set('sidebar-collapsed', true);
    s.set('filtros', {});
    s.set('borrador', 'x');
    expect(s.clear()).toBe(2);
    expect(backend.getItem('otra-app')).toBe('1');
    expect(s.get('theme', null)).toBe('dark');
    expect(s.get('sidebar-collapsed', false)).toBe(true);
    expect(s.get('filtros', null)).toBeNull();
  });
});
