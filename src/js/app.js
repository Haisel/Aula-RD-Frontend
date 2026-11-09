/**
 * Punto de entrada único de Aula RD (decisión 003 · constitución 1.3).
 *
 * 1. Importa los estilos (que Vite compila a `dist/css/app.css`).
 * 2. Lee la configuración y cablea el núcleo (`kernel.js`: errores, sesión, institución, acceso).
 * 3. Registra los componentes declarativos `data-au-*`.
 * 4. Publica la fachada congelada `window.AU` y Bootstrap en `window.bootstrap`.
 * 5. Con el DOM listo: lee `#au-context`, inicializa componentes, resuelve sesión e
 *    institución con los puertos conectados y emite `au:app:ready`.
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
import { configureHttp, headerContextStrategy } from './core/http.js';
import { initTheme } from './core/theme.js';
import { register, initAll } from './core/registry.js';
import { readContextFromPage, applyContext } from './core/context.js';
import { bus, EVENTS } from './core/events.js';
import { wireKernel, bootKernel, session, errorHandler, configureAuth, auth } from './kernel.js';
import { tabsComponent } from './components/tabs.js';
import { ready } from './helpers/dom.js';
import { confirmComponent, toast } from './components/dialogs.js';
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
// Decisión 014: la institución activa viaja en una cabecera (vacía en au-config = no se envía).
// Un nombre inválido se registra y no impide arrancar la página.
let contextStrategy = null;
if (config.institutionHeader) {
  try {
    contextStrategy = headerContextStrategy(config.institutionHeader);
  } catch (error) {
    console.error(/** @type {Error} */ (error).message);
  }
}
configureHttp({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeoutMs,
  retries: config.apiRetries,
  contextStrategy,
});
wireKernel({ config, notify: (msg, type) => toast(msg, type) });
// Decisión 015: JWT con token en memoria. Una configuración inválida se registra y la página arranca.
if (config.auth) {
  try {
    configureAuth(config.auth);
  } catch (error) {
    console.error(/** @type {Error} */ (error).message);
  }
}
errorHandler.install();

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
  tabsComponent,
  ...widgetComponents,
].forEach(register);

const AU = createFacade({ config, breakpoints: BREAKPOINTS });

Object.defineProperty(window, 'AU', { value: AU, writable: false, configurable: false, enumerable: true });
window.bootstrap = bootstrap;

initTheme();
ready(async () => {
  readContextFromPage();
  if (auth.isEnabled()) {
    // JWT (decisión 015): token, usuario e institución deben estar listos ANTES de que los
    // widgets pidan datos; si no, saldrían sin Authorization ni X-Institution-Id.
    await bootKernel();
    initAll(document);
  } else {
    // Sin JWT: los componentes se activan sin esperar a la red.
    const booting = bootKernel();
    initAll(document);
    await booting;
  }
  applyContext(document);
  document.documentElement.classList.add('au-ready');
  bus.emit(EVENTS.APP_READY, { session: session.status() });
});
