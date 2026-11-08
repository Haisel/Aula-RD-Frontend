/**
 * Activación declarativa de las librerías diferidas y de las plantillas.
 * Cada componente descarga su librería SOLO si su atributo aparece en la página.
 *
 * | Atributo                    | Librería          | Fachada equivalente      |
 * |-----------------------------|-------------------|--------------------------|
 * | `data-au-chart`             | Chart.js          | `AU.openChart()`         |
 * | `data-au-datatable`         | DataTables 2      | `AU.createDataTable()`   |
 * | `data-au-select`            | Choices.js        | `AU.createSelect()`      |
 * | `data-au-datepicker`        | Flatpickr         | `AU.createDatepicker()`  |
 * | `data-au-calendar`          | FullCalendar      | `AU.openCalendar()`      |
 * | `data-au-editor`            | Quill             | `AU.editWithQuill()`     |
 * | `data-au-signature`         | Signature Pad     | `AU.attachSignature()`   |
 * | `data-au-sortable`          | SortableJS        | `AU.dragSort()`          |
 * | `data-au-barcode`           | JsBarcode         | `AU.barcode()`           |
 * | `data-au-qrcode`            | qr-code-styling   | `AU.qrcode()`            |
 * | `data-au-render` + `data-au-source` | Handlebars + Axios | `AU.render()`    |
 * | `data-au-export`            | SheetJS           | `AU.exportRows()`        |
 *
 * Un valor que empieza por `{` o `[` es JSON en línea; si no, es una URL que se pide con `AU.api.get`.
 * @module components/widgets
 */
import { createChart } from '../adapters/chart.js';
import { createDataTable } from '../adapters/datatable.js';
import { createSelect } from '../adapters/select.js';
import { createDatepicker } from '../adapters/datepicker.js';
import { createCalendar } from '../adapters/calendar.js';
import { createEditor } from '../adapters/editor.js';
import { attachSignature } from '../adapters/signature.js';
import { dragSort } from '../adapters/sortable.js';
import { barcode, qrcode } from '../adapters/codes.js';
import { exportRows } from '../adapters/excel.js';
import { emit, EVENTS } from '../core/events.js';
import { api } from '../core/http.js';
import { render } from '../core/templates.js';
import { initAll } from '../core/registry.js';
import { toast } from './dialogs.js';

/** @typedef {import('../types.js').ComponentDefinition} ComponentDefinition */

/**
 * JSON en línea o URL → datos.
 * @param {string} value Atributo.
 * @returns {Promise<any>} Datos.
 */
export async function resolveData(value) {
  const v = value.trim();
  if (v.startsWith('{') || v.startsWith('[')) return JSON.parse(v);
  return api.get(v);
}

/**
 * Ejecuta una inicialización asíncrona y reporta errores sin romper la página.
 * @param {HTMLElement} el Elemento.
 * @param {string} name Componente.
 * @param {() => Promise<any>} fn Inicialización.
 * @returns {{ ref: any }} Referencia que se llena cuando termina.
 */
function run(el, name, fn) {
  const holder = { ref: /** @type {any} */ (null) };
  el.setAttribute('aria-busy', 'true');
  fn()
    .then((r) => (holder.ref = r))
    .catch((error) => {
      console.error(`[AU] ${name}:`, error);
      el.dataset.auError = error?.message ?? 'error';
    })
    .finally(() => el.removeAttribute('aria-busy'));
  return holder;
}

/** @type {ComponentDefinition[]} */
export const widgetComponents = [
  {
    name: 'chart',
    selector: 'canvas[data-au-chart]',
    init(el) {
      const h = run(el, 'chart', async () =>
        createChart(/** @type {HTMLCanvasElement} */ (el), await resolveData(el.dataset.auChart ?? '')),
      );
      return () => h.ref?.destroy();
    },
  },
  {
    name: 'datatable',
    selector: 'table[data-au-datatable]',
    init(el) {
      const h = run(el, 'datatable', () => createDataTable(/** @type {HTMLTableElement} */ (el)));
      return () => h.ref?.destroy();
    },
  },
  {
    name: 'select',
    selector: 'select[data-au-select]',
    init(el) {
      const h = run(el, 'select', () => createSelect(/** @type {HTMLSelectElement} */ (el)));
      return () => h.ref?.destroy();
    },
  },
  {
    name: 'datepicker',
    selector: 'input[data-au-datepicker]',
    init(el) {
      const h = run(el, 'datepicker', () => createDatepicker(/** @type {HTMLInputElement} */ (el)));
      return () => h.ref?.destroy();
    },
  },
  {
    name: 'calendar',
    selector: '[data-au-calendar]',
    init(el) {
      const src = el.dataset.auCalendar ?? '';
      const h = run(el, 'calendar', async () =>
        createCalendar(el, { events: src ? await resolveData(src) : [] }),
      );
      return () => h.ref?.destroy();
    },
  },
  {
    name: 'editor',
    selector: '[data-au-editor]',
    init(el) {
      run(el, 'editor', () => createEditor(el));
    },
  },
  {
    name: 'signature',
    selector: 'canvas[data-au-signature]',
    init(el) {
      const h = run(el, 'signature', () => attachSignature(/** @type {HTMLCanvasElement} */ (el)));
      const clearBtns = document.querySelectorAll(`[data-au-signature-clear="#${el.id}"]`);
      const onClear = () => h.ref?.clear();
      clearBtns.forEach((b) => b.addEventListener('click', onClear));
      return () => {
        clearBtns.forEach((b) => b.removeEventListener('click', onClear));
        h.ref?.destroy();
      };
    },
  },
  {
    name: 'sortable',
    selector: '[data-au-sortable]',
    init(el) {
      const h = run(el, 'sortable', () => dragSort(el));
      return () => h.ref?.destroy();
    },
  },
  {
    name: 'barcode',
    selector: 'svg[data-au-barcode]',
    init(el) {
      run(el, 'barcode', () =>
        barcode(el.dataset.auBarcode ?? '', {
          target: /** @type {SVGElement} */ (/** @type {unknown} */ (el)),
        }),
      );
    },
  },
  {
    name: 'qrcode',
    selector: '[data-au-qrcode]',
    init(el) {
      run(el, 'qrcode', () => qrcode(el, el.dataset.auQrcode ?? ''));
    },
  },
  {
    name: 'render',
    selector: '[data-au-render][data-au-source]',
    init(el) {
      run(el, 'render', async () => {
        const data = await resolveData(el.dataset.auSource ?? '');
        const list = el.dataset.auPath ? el.dataset.auPath.split('.').reduce((a, k) => a?.[k], data) : data;
        el.innerHTML = await render(el.dataset.auRender ?? '', list);
        initAll(el);
        emit(EVENTS.RENDER_DONE, { data: list }, el);
      });
    },
  },
  {
    name: 'export',
    selector: '[data-au-export]',
    init(btn) {
      const onClick = async () => {
        const table = /** @type {HTMLTableElement | null} */ (
          document.querySelector(btn.dataset.auExport ?? '')
        );
        if (!table) return;
        const headers = Array.from(table.querySelectorAll('thead th')).map(
          (th) => th.textContent?.trim() ?? '',
        );
        const keep = headers.map((h, i) => (h ? i : -1)).filter((i) => i >= 0);
        const rows = Array.from(table.querySelectorAll('tbody tr')).map((tr) => {
          const cells = Array.from(tr.querySelectorAll('td'));
          return Object.fromEntries(keep.map((i) => [headers[i], cells[i]?.textContent?.trim() ?? '']));
        });
        const format = btn.dataset.auFormat === 'csv' ? 'csv' : 'xlsx';
        try {
          await exportRows({ rows, fileName: btn.dataset.auFilename ?? 'exportacion', format });
          toast('Archivo descargado', 'success');
        } catch (e) {
          toast(/** @type {Error} */ (e).message, 'error');
        }
      };
      btn.addEventListener('click', onClick);
      return () => btn.removeEventListener('click', onClick);
    },
  },
];
