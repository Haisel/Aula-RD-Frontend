import { describe, it, expect, beforeEach } from 'vitest';
import { labelToolbar } from '../src/js/adapters/editor.js';

/**
 * Spec 008: la barra de Quill debe tener nombre accesible en español (WCAG 4.1.2).
 * El DOM de prueba replica la estructura que genera Quill 2.0.3: botones con `aria-label` en
 * inglés ("bold", "list: ordered") y un selector de títulos (`.ql-picker`) sin nombre alguno.
 */
const TOOLBAR = `
<div class="ql-toolbar ql-snow" role="toolbar">
  <span class="ql-formats">
    <span class="ql-header ql-picker">
      <span class="ql-picker-label" role="button" tabindex="0" aria-expanded="false" aria-controls="ql-picker-options-0"></span>
      <span class="ql-picker-options" aria-hidden="true" id="ql-picker-options-0">
        <span class="ql-picker-item" role="button" tabindex="0" data-value="2"></span>
        <span class="ql-picker-item" role="button" tabindex="0" data-value="3"></span>
        <span class="ql-picker-item ql-selected" role="button" tabindex="0"></span>
      </span>
    </span>
  </span>
  <span class="ql-formats">
    <button type="button" class="ql-bold" aria-pressed="false" aria-label="bold"></button>
    <button type="button" class="ql-italic" aria-pressed="false" aria-label="italic"></button>
    <button type="button" class="ql-underline" aria-pressed="false" aria-label="underline"></button>
  </span>
  <span class="ql-formats">
    <button type="button" class="ql-list" value="ordered" aria-pressed="false" aria-label="list: ordered"></button>
    <button type="button" class="ql-list" value="bullet" aria-pressed="false" aria-label="list: bullet"></button>
  </span>
  <span class="ql-formats">
    <button type="button" class="ql-link" aria-pressed="false" aria-label="link"></button>
    <button type="button" class="ql-clean" aria-label="clean"></button>
  </span>
</div>`;

describe('barra de Quill con nombre accesible (spec 008)', () => {
  /** @type {HTMLElement} */
  let toolbar;

  beforeEach(() => {
    document.body.innerHTML = TOOLBAR;
    toolbar = /** @type {HTMLElement} */ (document.querySelector('.ql-toolbar'));
    labelToolbar(toolbar);
  });

  /**
   * Devuelve el `aria-label` del primer elemento que cumple el selector.
   * @param {string} selector Selector CSS.
   * @returns {string | null} Etiqueta accesible.
   */
  const label = (selector) => toolbar.querySelector(selector)?.getAttribute('aria-label') ?? null;

  it('el selector de títulos tiene nombre (era el único elemento sin él)', () => {
    expect(label('.ql-header .ql-picker-label')).toBe('Estilo del párrafo');
  });

  it('las opciones del selector tienen nombre', () => {
    expect(label('.ql-picker-item[data-value="2"]')).toBe('Título 2');
    expect(label('.ql-picker-item[data-value="3"]')).toBe('Título 3');
    expect(label('.ql-picker-item:not([data-value])')).toBe('Texto normal');
  });

  it('los botones usan etiquetas en español, no las de Quill en inglés', () => {
    expect(label('.ql-bold')).toBe('Negrita');
    expect(label('.ql-italic')).toBe('Cursiva');
    expect(label('.ql-underline')).toBe('Subrayado');
    expect(label('.ql-list[value="ordered"]')).toBe('Lista numerada');
    expect(label('.ql-list[value="bullet"]')).toBe('Lista con viñetas');
    expect(label('.ql-link')).toBe('Enlace');
    expect(label('.ql-clean')).toBe('Quitar formato');
  });

  it('ningún elemento enfocable de la barra queda sin nombre', () => {
    const focusable = toolbar.querySelectorAll('button, [role="button"], [tabindex="0"]');
    const sinNombre = [...focusable].filter((e) => !e.getAttribute('aria-label') && !e.textContent?.trim());
    expect(sinNombre).toEqual([]);
  });

  it('es idempotente y no toca otros atributos de Quill', () => {
    labelToolbar(toolbar);
    expect(label('.ql-bold')).toBe('Negrita');
    expect(toolbar.querySelector('.ql-bold')?.getAttribute('aria-pressed')).toBe('false');
    expect(toolbar.querySelector('.ql-picker-label')?.getAttribute('aria-expanded')).toBe('false');
    expect(toolbar.getAttribute('role')).toBe('toolbar');
  });

  it('la barra completa recibe un nombre', () => {
    expect(toolbar.getAttribute('aria-label')).toBe('Formato del texto');
  });
});
