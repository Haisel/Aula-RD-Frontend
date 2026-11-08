/**
 * Gestión del tema claro/oscuro.
 *
 * - El tema se aplica con `<html data-bs-theme="light|dark">` (Bootstrap 5.3 + tokens --au-*).
 * - La preferencia (`light`, `dark` o `system`) se guarda en `localStorage` (`au-theme`).
 * - Con `system`, sigue `prefers-color-scheme` y reacciona a cambios del sistema.
 * - Para evitar el parpadeo inicial, incluya en el `<head>` el snippet de
 *   `src/partials/layouts/theme-boot.hbs` ANTES del CSS.
 *
 * Botones: `<button data-au-theme-toggle>` alterna; `<button data-au-theme-set="dark">` fija.
 * @module core/theme
 */
import { getItem, setItem } from './storage.js';
import { emit, EVENTS } from './events.js';

/** @typedef {import('../types.js').ThemeName} ThemeName */
/** @typedef {import('../types.js').ThemePreference} ThemePreference */

const STORAGE_KEY = 'theme'; // → localStorage "au-theme" (ver public/js/theme-boot.js)
const media =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

/**
 * Preferencia guardada (por defecto `system`).
 * @returns {ThemePreference} Preferencia actual.
 */
export function getPreference() {
  const pref = /** @type {string} */ (getItem(STORAGE_KEY, 'system'));
  return pref === 'light' || pref === 'dark' ? pref : 'system';
}

/**
 * Resuelve una preferencia a un tema concreto.
 * @param {ThemePreference} pref Preferencia.
 * @returns {ThemeName} Tema efectivo.
 */
export function resolveTheme(pref) {
  if (pref === 'system') return media?.matches ? 'dark' : 'light';
  return pref;
}

/**
 * Tema aplicado actualmente en `<html>`.
 * @returns {ThemeName} Tema actual.
 */
export function getTheme() {
  return document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light';
}

/**
 * Aplica y guarda una preferencia de tema. Emite `au:theme-change`.
 * @param {ThemePreference} pref Preferencia a aplicar.
 * @returns {ThemeName} Tema efectivo aplicado.
 */
export function setTheme(pref) {
  const theme = resolveTheme(pref);
  document.documentElement.setAttribute('data-bs-theme', theme);
  setItem(STORAGE_KEY, pref);
  syncToggles(theme);
  emit(EVENTS.THEME_CHANGE, { theme, preference: pref });
  return theme;
}

/**
 * Alterna entre claro y oscuro (la preferencia deja de ser `system`).
 * @returns {ThemeName} Nuevo tema.
 */
export function toggleTheme() {
  return setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

/**
 * Actualiza `aria-pressed` e íconos de los botones de tema.
 * @param {ThemeName} theme Tema actual.
 * @returns {void}
 */
function syncToggles(theme) {
  document.querySelectorAll('[data-au-theme-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(theme === 'dark'));
    btn.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
    const icon = btn.querySelector('.bi');
    if (icon) {
      icon.classList.toggle('bi-moon-stars', theme === 'light');
      icon.classList.toggle('bi-sun', theme === 'dark');
    }
  });
}

/**
 * Inicializa el tema: aplica la preferencia guardada y escucha cambios del sistema.
 * Lo llama `AU` automáticamente.
 * @returns {void}
 */
export function initTheme() {
  const pref = getPreference();
  document.documentElement.setAttribute('data-bs-theme', resolveTheme(pref));
  syncToggles(getTheme());
  media?.addEventListener('change', () => {
    if (getPreference() === 'system') setTheme('system');
  });
  document.addEventListener('click', (event) => {
    const target = /** @type {HTMLElement} */ (event.target);
    const toggle = target.closest('[data-au-theme-toggle]');
    if (toggle) {
      toggleTheme();
      return;
    }
    const setter = /** @type {HTMLElement | null} */ (target.closest('[data-au-theme-set]'));
    if (setter) setTheme(/** @type {ThemePreference} */ (setter.dataset.auThemeSet ?? 'system'));
  });
}

/**
 * Lee el valor actual de una variable CSS de marca (`--au-<name>`).
 * Útil para librerías que necesitan colores en JS (Chart.js).
 * @param {string} name Nombre del token sin prefijo (p. ej. `accent`, `text-muted`).
 * @returns {string} Valor CSS (p. ej. `#18b6a4`).
 */
export function cssToken(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(`--au-${name}`).trim();
}
