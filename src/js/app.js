/**
 * Punto de entrada único de Aula RD (decisión 003 · constitución 1.3).
 *
 * 1. Importa los estilos (que Vite compila a `dist/css/app.css`).
 * 2. Lee la configuración y el contexto entregados por el backend.
 * 3. Registra los componentes declarativos `data-au-*`.
 * 4. Publica la fachada congelada `window.AU` y Bootstrap en `window.bootstrap`.
 * 5. Inicializa la página cuando el DOM está listo.
 * @module app
 */

// ── Estilos: fuentes e íconos primero, luego librerías, al final la marca (gana la cascada)
import '@fontsource/plus-jakarta-sans/latin-400.css';
import '@fontsource/plus-jakarta-sans/latin-500.css';
import '@fontsource/plus-jakarta-sans/latin-600.css';
import '@fontsource/plus-jakarta-sans/latin-700.css';
import '@fontsource/plus-jakarta-sans/latin-800.css';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import 'choices.js/public/assets/styles/choices.min.css';
import 'flatpickr/dist/flatpickr.min.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'quill/dist/quill.snow.css';
import '../scss/app.scss';

import * as bootstrap from 'bootstrap';
import { loadConfig, BREAKPOINTS } from './config/index.js';
import { configureHttp } from './core/http.js';
import { initTheme } from './core/theme.js';
import { register, initAll } from './core/registry.js';
import { readContextFromPage, applyContext } from './core/context.js';
import { ready } from './helpers/dom.js';
import { confirmComponent } from './components/dialogs.js';
import { appShellComponent } from './components/sidebar.js';
import { formComponent } from './components/forms.js';
import { maskComponent } from './components/masks.js';
import {
  navbarComponent,
  passwordToggleComponent,
  billingComponent,
  relativeTimeComponent,
  formatComponent,
  tooltipComponent,
  actionComponent,
} from './components/misc.js';
import { widgetComponents } from './components/widgets.js';
import { createFacade } from './facade.js';

const config = loadConfig();
configureHttp({ baseURL: config.apiBaseUrl, timeout: config.apiTimeoutMs });

[
  appShellComponent,
  navbarComponent,
  confirmComponent,
  formComponent,
  maskComponent,
  passwordToggleComponent,
  billingComponent,
  relativeTimeComponent,
  formatComponent,
  tooltipComponent,
  actionComponent,
  ...widgetComponents,
].forEach(register);

const AU = createFacade({ config, breakpoints: BREAKPOINTS });

Object.defineProperty(window, 'AU', { value: AU, writable: false, configurable: false, enumerable: true });
window.bootstrap = bootstrap;

initTheme();
ready(() => {
  readContextFromPage();
  initAll(document);
  applyContext(document);
  document.documentElement.classList.add('au-ready');
});
