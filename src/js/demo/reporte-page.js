/**
 * Demostración del reporte (spec 012, T-17 · RF-04).
 *
 * Lee `data/reporte.json` con `AU.api.get`, filtra con {@link filtrar} y recalcula en cada cambio los
 * indicadores, los dos gráficos y la tabla. Exporta lo que se ve con `AU.exportRows` y se imprime
 * con `data-au-action="print"`. Nada se guarda en el navegador (RN-02). Usa solo la fachada `AU`.
 * @module demo/reporte-page
 */
import { filtrar, resumen, porGrado, GRADOS } from './reporte.js';

/** Columnas del archivo de Excel (el orden es el de la hoja). */
const COLUMNS = [
  { key: 'nombre', label: 'Estudiante' },
  { key: 'grado', label: 'Grado' },
  { key: 'estado', label: 'Estado' },
  { key: 'asistencia', label: 'Asistencia (%)' },
  { key: 'promedio', label: 'Promedio' },
  { key: 'pagos', label: 'Pagos' },
  { key: 'monto', label: 'Cuota (RD$)' },
];

/**
 * @typedef {import('./reporte.js').FilaReporte & { estudianteId: string, nombre: string }} Fila
 */

/**
 * Activa la demostración del reporte sobre su contenedor.
 * @param {HTMLElement} root Contenedor `[data-demo="reporte"]`.
 * @param {any} au Fachada `window.AU`.
 * @returns {Promise<void>}
 */
export async function reporte(root, au) {
  /**
   * Busca un elemento de la demostración por su marca `data-rep`.
   * @param {string} name Valor de `data-rep`.
   * @returns {any} Elemento.
   */
  const el = (name) => root.querySelector(`[data-rep="${name}"]`);

  /** @type {HTMLSelectElement} */
  const fGrado = el('filtro-grado');
  /** @type {HTMLSelectElement} */
  const fEstado = el('filtro-estado');
  /** @type {HTMLSelectElement} */
  const fPagos = el('filtro-pagos');
  /** @type {HTMLElement} */
  const region = el('region');
  /** @type {HTMLElement} */
  const results = el('resultados');
  /** @type {HTMLElement} */
  const empty = el('vacio');
  /** @type {HTMLElement} */
  const live = el('anuncio');
  /** @type {HTMLButtonElement} */
  const exportBtn = el('exportar');
  /** @type {HTMLCanvasElement} */
  const gradoCanvas = el('grafico-grado');
  /** @type {HTMLCanvasElement} */
  const pagosCanvas = el('grafico-pagos');

  /** @type {Fila[]} */
  let all = [];
  /** @type {Fila[]} */
  let shown = [];
  /** @type {any} */
  let table = null;
  /** @type {{ grado: any, pagos: any }} */
  const charts = { grado: null, pagos: null };
  /** Número del último repintado pedido; los anteriores que sigan en curso se descartan. */
  let latest = 0;

  for (const g of GRADOS) fGrado.append(new Option(g, g));

  /**
   * Escribe el texto de un indicador.
   * @param {string} name Marca `data-rep-stat`.
   * @param {string} text Texto.
   * @returns {void}
   */
  const setStat = (name, text) => {
    const target = root.querySelector(`[data-rep-stat="${name}"]`);
    if (target) target.textContent = text;
  };

  /**
   * HTML de una fila de la tabla (todo el texto va escapado).
   * @param {Fila} r Fila del reporte.
   * @returns {string} Fila `<tr>`.
   */
  const rowHtml = (r) => `<tr>
      <td>${au.escapeHtml(r.nombre)}</td><td>${au.escapeHtml(r.grado)}</td>
      <td><span class="au-status au-status-${au.statusVariant(r.estado)}">${au.escapeHtml(r.estado)}</span></td>
      <td class="text-end">${au.formatPercent(r.asistencia, { decimals: 0 })}</td>
      <td class="text-end">${au.formatNumber(r.promedio)}</td>
      <td><span class="au-status au-status-${au.statusVariant(r.pagos)}">${au.escapeHtml(r.pagos)}</span></td>
      <td class="text-end">${au.formatCurrency(r.monto)}</td></tr>`;

  /**
   * Destruye un gráfico si existe.
   * @param {'grado' | 'pagos'} key Cuál.
   * @returns {void}
   */
  const dropChart = (key) => {
    charts[key]?.destroy?.();
    charts[key] = null;
  };

  /**
   * Recalcula y pinta indicadores, gráficos y tabla con los filtros actuales. Los repintados se
   * hacen de uno en uno (un `<canvas>` no admite dos gráficos a la vez) y solo el último cuenta.
   * @param {number} turn Número de este repintado.
   * @returns {Promise<void>}
   */
  async function paintReport(turn) {
    if (turn !== latest) return;
    shown = /** @type {Fila[]} */ (
      filtrar(all, { grado: fGrado.value, estado: fEstado.value, pagos: fPagos.value })
    );
    table?.destroy?.();
    table = null;
    dropChart('grado');
    dropChart('pagos');
    exportBtn.disabled = shown.length === 0;
    results.hidden = shown.length === 0;
    empty.hidden = shown.length > 0;
    live.textContent = shown.length
      ? `Mostrando ${shown.length} de ${all.length} estudiantes.`
      : 'Ningún estudiante coincide con los filtros.';
    if (!shown.length) return;

    const s = resumen(shown);
    setStat('total', au.formatNumber(s.total));
    setStat('asistencia', au.formatPercent(s.asistenciaMedia));
    setStat('promedio', au.formatNumber(s.promedioMedio, 1));
    setStat('pendiente', au.formatCurrency(s.montoPendiente));
    setStat('total-nota', `de ${au.formatNumber(all.length)} en el período`);

    const g = porGrado(shown);
    gradoCanvas.setAttribute(
      'aria-label',
      `Gráfico de barras: promedio por grado. ${g.labels.map((l, i) => `${l}, ${g.promedio[i]}`).join('; ')}.`,
    );
    pagosCanvas.setAttribute(
      'aria-label',
      `Gráfico de dona: pagados ${s.pagos.Pagado}, pendientes ${s.pagos.Pendiente}, vencidos ${s.pagos.Vencido}.`,
    );
    const gradoChart = await au.openChart(gradoCanvas, {
      type: 'bar',
      labels: g.labels,
      series: [{ label: 'Promedio', data: g.promedio }],
      min: 0,
      max: 100,
    });
    const pagosChart = await au.openChart(pagosCanvas, {
      type: 'doughnut',
      labels: ['Pagado', 'Pendiente', 'Vencido'],
      series: [{ label: 'Estudiantes', data: [s.pagos.Pagado, s.pagos.Pendiente, s.pagos.Vencido] }],
    });
    // Si el usuario cambió un filtro mientras se dibujaba, este repintado ya quedó viejo: se descarta.
    if (turn !== latest) {
      gradoChart.destroy();
      pagosChart.destroy();
      return;
    }
    charts.grado = gradoChart;
    charts.pagos = pagosChart;

    region.innerHTML = `<div class="au-table-card"><div class="table-responsive"><table class="table table-hover align-middle w-100" aria-label="Detalle del reporte de estudiantes">
      <thead><tr><th scope="col">Estudiante</th><th scope="col">Grado</th><th scope="col">Estado</th><th scope="col" class="text-end">Asistencia</th><th scope="col" class="text-end">Promedio</th><th scope="col">Pagos</th><th scope="col" class="text-end">Cuota</th></tr></thead>
      <tbody>${shown.map(rowHtml).join('')}</tbody></table></div></div>`;
    table = await au.createDataTable(region.querySelector('table'), { pageLength: 10 });
  }

  /** Cola de repintados. */
  let queue = Promise.resolve();

  /**
   * Pide un repintado con los filtros actuales y espera a que termine.
   * @returns {Promise<void>}
   */
  const render = () => {
    latest += 1;
    const turn = latest;
    // Un fallo anterior no frena los siguientes, pero sí le llega a quien lo pidió.
    queue = queue.catch(() => undefined).then(() => paintReport(turn));
    return queue;
  };

  for (const select of [fGrado, fEstado, fPagos]) select.addEventListener('change', () => void render());

  root.addEventListener('click', async (event) => {
    const button = /** @type {HTMLElement} */ (event.target).closest('button');
    if (!button) return;
    if (button.matches('[data-rep="limpiar"]')) {
      fGrado.value = '';
      fEstado.value = '';
      fPagos.value = '';
      await render();
      fGrado.focus();
    } else if (button.matches('[data-rep="exportar"]') && shown.length) {
      const name = await au.exportRows({
        rows: shown,
        columns: COLUMNS,
        fileName: 'reporte-estudiantes-demostracion',
        sheetName: 'Reporte',
        format: 'xlsx',
      });
      au.toast(`Se descargó ${name} con ${shown.length} filas.`, 'success');
    }
  });

  try {
    all = /** @type {Fila[]} */ (await au.api.get('data/reporte.json'));
    await render();
  } catch {
    results.hidden = true;
    empty.hidden = true;
    /** @type {HTMLElement} */ (el('error')).hidden = false;
    exportBtn.disabled = true;
  }
}
