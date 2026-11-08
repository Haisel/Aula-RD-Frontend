import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
  formatPercent,
  formatDate,
  formatDateTime,
  formatCedula,
  formatRnc,
  formatPhone,
  initials,
  onlyDigits,
  parseDate,
} from '../src/js/helpers/format.js';

describe('formatCurrency', () => {
  it('usa RD$, coma de miles y punto decimal', () => expect(formatCurrency(12500)).toBe('RD$ 12,500.00'));
  it('maneja negativos', () => expect(formatCurrency(-50.5)).toBe('-RD$ 50.50'));
  it('sin símbolo', () => expect(formatCurrency(1234.5, { symbol: false })).toBe('1,234.50'));
  it('devuelve — si no es número', () => expect(formatCurrency(Number.NaN)).toBe('—'));
});

describe('formatCompactCurrency', () => {
  it('abrevia miles y millones', () => {
    expect(formatCompactCurrency(386450)).toBe('RD$ 386.5K');
    expect(formatCompactCurrency(1300000)).toBe('RD$ 1.3M');
  });
  it('no abrevia montos pequeños', () => expect(formatCompactCurrency(950)).toBe('RD$ 950.00'));
});

describe('números y porcentajes', () => {
  it('formatNumber', () => expect(formatNumber(1248)).toBe('1,248'));
  it('formatPercent 0–100', () => expect(formatPercent(94.6)).toBe('94.6%'));
  it('formatPercent fracción', () => expect(formatPercent(0.5, { fraction: true })).toBe('50%'));
});

describe('fechas', () => {
  it('ISO → DD/MM/AAAA', () => expect(formatDate('2026-11-08')).toBe('08/11/2026'));
  it('DD/MM/AAAA estricto', () => {
    expect(parseDate('08/11/2026').month()).toBe(10);
    expect(formatDate('31/02/2026')).toBe('—');
  });
  it('fecha y hora con a. m. / p. m.', () =>
    expect(formatDateTime('2026-11-08T14:30:00')).toBe('08/11/2026 2:30 p. m.'));
});

describe('documentos dominicanos', () => {
  it('cédula', () => expect(formatCedula('00112345678')).toBe('001-1234567-8'));
  it('RNC', () => expect(formatRnc('101123456')).toBe('1-01-12345-6'));
  it('teléfono con y sin prefijo 1', () => {
    expect(formatPhone('8095551234')).toBe('(809) 555-1234');
    expect(formatPhone('+1 829 555 1234')).toBe('(829) 555-1234');
  });
  it('deja el texto si no tiene la longitud correcta', () => expect(formatCedula('123')).toBe('123'));
  it('onlyDigits', () => expect(onlyDigits('(809) 555-12a34')).toBe('809555123' + '4'));
});

describe('initials', () => {
  it('toma dos iniciales', () => expect(initials('Ana Martínez Peña')).toBe('AM'));
  it('soporta un nombre', () => expect(initials('  rosa ')).toBe('R'));
});
