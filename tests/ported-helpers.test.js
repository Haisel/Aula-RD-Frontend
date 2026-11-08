import { describe, it, expect, beforeEach } from 'vitest';
import {
  isValidCedula,
  isValidPlaca,
  isValidCurrency,
  isNullOrEmpty,
  isEmpty,
} from '../src/js/helpers/validators.js';
import { truncate, normalizeSpaces } from '../src/js/helpers/strings.js';
import { humanize } from '../src/js/helpers/format.js';
import { createIframe, assetUrl, listen, customSet, customGet } from '../src/js/helpers/browser.js';
import { setBusy, isBusy, setProgress, showInlineAlert } from '../src/js/components/feedback.js';
import { tabsComponent } from '../src/js/components/tabs.js';
import { setContext, getContext, can } from '../src/js/core/context.js';
import { session, institution } from '../src/js/kernel.js';

describe('validadores portados', () => {
  it('cédula rechaza municipio 000', () => {
    expect(isValidCedula('000-0000001-8')).toBe(false);
    expect(isValidCedula('001-0000001-8')).toBe(isValidCedula('00100000018'));
  });
  it('placa, monto, vacíos', () => {
    expect(isValidPlaca('a123456')).toBe(true);
    expect(isValidPlaca('AB-12345')).toBe(true);
    expect(isValidPlaca('ABC12345')).toBe(false);
    expect(isValidCurrency('12,500.00')).toBe(true);
    expect(isValidCurrency('12500.5')).toBe(true);
    expect(isValidCurrency('12,50')).toBe(false);
    expect(isValidCurrency(10.123)).toBe(false);
    expect(isNullOrEmpty('  ')).toBe(true);
    expect(isNullOrEmpty(0)).toBe(false);
    expect(isEmpty({})).toBe(true);
    expect(isEmpty(new Map())).toBe(true);
    expect(isEmpty(new Date())).toBe(false);
    expect(isEmpty(0)).toBe(false);
  });
});

describe('texto y formato', () => {
  it('truncate no parte emojis; normalizeSpaces colapsa', () => {
    expect(truncate('Hola mundo', 6)).toBe('Hola …');
    expect(truncate('ab😀cd', 4)).toBe('ab…');
    expect(truncate('corto', 80)).toBe('corto');
    expect(normalizeSpaces('  a \n\t b  c ')).toBe('a b c');
  });
  it('humanize', () => {
    expect(humanize(1234567)).toMatch(/1[.,]2/);
    expect(humanize('abc')).toBe('');
    expect(humanize(null)).toBe('');
  });
});

describe('navegador', () => {
  it('createIframe solo admite http(s) o relativas', () => {
    expect(createIframe('/reportes/1', { title: 'Reporte' }).title).toBe('Reporte');
    expect(() => createIframe('javascript:alert(1)')).toThrow(/http/);
    expect(() => createIframe('data:text/html,hola')).toThrow(/http/);
  });
  it('assetUrl', () => {
    expect(assetUrl('/img/a.svg', 'https://cdn.x/aula/')).toBe('https://cdn.x/aula/img/a.svg');
    expect(assetUrl('img/a.svg')).toBe('img/a.svg');
    expect(assetUrl('https://otro/a.svg', 'https://cdn')).toBe('https://otro/a.svg');
  });
  it('listen con delegate', () => {
    document.body.innerHTML = '<ul id="l"><li><button data-id="7"><span>x</span></button></li></ul>';
    const hits = [];
    const off = listen(document.getElementById('l'), 'click', (e, m) => hits.push(m.dataset.id), {
      delegate: '[data-id]',
    });
    document.querySelector('span').click();
    off();
    document.querySelector('span').click();
    expect(hits).toEqual(['7']);
  });
  it('customSet / customGet', () => {
    customSet('hola', () => 'h');
    customSet('mala', 'no-fn');
    expect(customGet('hola')?.()).toBe('h');
    expect(customGet('mala')).toBeNull();
  });
});

describe('retroalimentación', () => {
  beforeEach(() => {
    document.body.innerHTML =
      '<div id="r" aria-busy="false"><p>x</p></div><div class="progress" id="p"><div class="progress-bar"></div></div><main></main>';
  });
  it('busy restaura el aria-busy previo', () => {
    setBusy('#r', true, { label: 'Cargando cursos…' });
    expect(isBusy('#r')).toBe(true);
    expect(document.querySelector('#r .au-busy-overlay')?.textContent).toBe('Cargando cursos…');
    setBusy('#r', true);
    expect(document.querySelectorAll('#r .au-busy-overlay')).toHaveLength(1);
    setBusy('#r', false);
    expect(document.getElementById('r').getAttribute('aria-busy')).toBe('false');
  });
  it('progress acota y pone ARIA', () => {
    expect(setProgress('#p', 150)).toBe(100);
    expect(setProgress('#p', 30, { label: '30 de 100' })).toBe(30);
    const p = document.getElementById('p');
    expect(p.getAttribute('aria-valuenow')).toBe('30');
    expect(p.getAttribute('aria-valuetext')).toBe('30 de 100');
    expect(p.querySelector('.progress-bar').style.getPropertyValue('--au-progress')).toBe('30%');
  });
  it('inlineAlert inserta texto plano (sin HTML)', () => {
    const a = showInlineAlert('<img src=x onerror=alert(1)>', { variant: 'error', title: 'Ojo' });
    expect(a.className).toContain('alert-danger');
    expect(a.getAttribute('role')).toBe('alert');
    expect(a.querySelector('img')).toBeNull();
    expect(document.querySelector('main').firstElementChild).toBe(a);
  });
});

describe('tabs accesibles', () => {
  it('añade roles y relaciones ARIA', () => {
    document.body.innerHTML = `<div data-au-tabs><ul class="nav nav-tabs">
      <li><button class="nav-link active" data-bs-target="#t1">A</button></li>
      <li><button class="nav-link" data-bs-target="#t2">B</button></li></ul>
      <div class="tab-content"><div class="tab-pane active" id="t1"></div><div class="tab-pane" id="t2"></div></div></div>`;
    const root = document.querySelector('[data-au-tabs]');
    const cleanup = tabsComponent.init(root);
    const [b1, b2] = root.querySelectorAll('button');
    expect(root.querySelector('.nav').getAttribute('role')).toBe('tablist');
    expect(b1.getAttribute('role')).toBe('tab');
    expect(b1.getAttribute('aria-selected')).toBe('true');
    expect(b2.getAttribute('aria-controls')).toBe('t2');
    expect(document.getElementById('t2').getAttribute('aria-labelledby')).toBe(b2.id);
    expect(b1.getAttribute('type')).toBe('button');
    cleanup();
  });
});

describe('contexto sobre el núcleo', () => {
  it('setContext alimenta sesión, institución y acceso (una sola fuente de verdad)', () => {
    setContext({
      user: { id: 'u1', name: 'Ana' },
      institution: { id: 'inst-1', name: 'Colegio San Rafael', plan: 'Profesional' },
      roles: ['institution-admin'],
      permissions: ['cobros.registrar'],
    });
    expect(session.status()).toBe('authenticated');
    expect(institution.current()).toMatchObject({
      id: 'inst-1',
      displayName: 'Colegio San Rafael',
      plan: 'Profesional',
    });
    expect(getContext().institution.plan).toBe('Profesional');
    expect(can('cobros.registrar')).toBe(true);
    setContext({});
    expect(session.status()).toBe('unauthenticated');
    expect(can('cobros.registrar')).toBe(false);
  });
});
