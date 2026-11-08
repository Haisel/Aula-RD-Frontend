import { describe, it, expect } from 'vitest';
import { sanitize, escapeHtml } from '../src/js/helpers/sanitize.js';
import { statusVariant } from '../src/js/helpers/status.js';

describe('sanitize', () => {
  it('elimina scripts y manejadores', () => {
    const out = sanitize('<img src=x onerror="alert(1)"><script>alert(2)</script><b>ok</b>');
    expect(out).not.toMatch(/onerror|script/);
    expect(out).toContain('<b>ok</b>');
  });
  it('conserva filas de tabla (contexto <tbody>)', () => {
    expect(sanitize('<tr><td>A</td><td onclick="x()">B</td></tr>')).toBe('<tr><td>A</td><td>B</td></tr>');
  });
  it('escapeHtml', () =>
    expect(escapeHtml('<a href="x">&</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;'));
});

describe('statusVariant', () => {
  it.each([
    ['Pagado', 'success'],
    ['Pendiente', 'warning'],
    ['Vencido', 'danger'],
    ['Becada 50%', 'info'],
    ['Inactivo', 'neutral'],
    ['En prueba', 'brand'],
    ['Desconocido', 'neutral'],
  ])('%s → %s', (label, v) => expect(statusVariant(label)).toBe(v));
});
