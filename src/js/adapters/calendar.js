/**
 * Adaptador de FullCalendar 6 (carga diferida): calendario escolar.
 *
 * ```html
 * <div data-au-calendar="data/eventos.json" data-au-view="dayGridMonth" data-au-initial-date="2026-11-01"></div>
 * ```
 * Los eventos usan el formato de FullCalendar (`{ title, start, end, allDay, className }`).
 * Clases de color: `au-event-accent`, `au-event-navy`, `au-event-gold`, `au-event-danger`.
 * @module adapters/calendar
 */
import { lazy } from './lazy.js';

export const loadCalendar = lazy('FullCalendar', async () => {
  const [core, dayGrid, timeGrid, list, interaction, es] = await Promise.all([
    import('@fullcalendar/core'),
    import('@fullcalendar/daygrid'),
    import('@fullcalendar/timegrid'),
    import('@fullcalendar/list'),
    import('@fullcalendar/interaction'),
    import('@fullcalendar/core/locales/es'),
  ]);
  return {
    Calendar: core.Calendar,
    plugins: [dayGrid.default, timeGrid.default, list.default, interaction.default],
    locale: es.default,
  };
});

/**
 * Crea un calendario.
 * @param {HTMLElement} el Contenedor.
 * @param {object} [options] Opciones de FullCalendar (`events` puede ser arreglo o URL).
 * @returns {Promise<any>} Instancia de Calendar (ya renderizada).
 */
export async function createCalendar(el, options = {}) {
  const { Calendar, plugins, locale } = await loadCalendar();
  const narrow = window.matchMedia?.('(max-width: 767.98px)').matches;
  const calendar = new Calendar(el, {
    plugins,
    locale,
    initialView: el.dataset.auView ?? (narrow ? 'listWeek' : 'dayGridMonth'),
    initialDate: el.dataset.auInitialDate,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: narrow ? 'listWeek,dayGridMonth' : 'dayGridMonth,timeGridWeek,listWeek',
    },
    buttonText: { today: 'Hoy', month: 'Mes', week: 'Semana', list: 'Agenda' },
    height: 'auto',
    firstDay: 1,
    nowIndicator: true,
    dayMaxEventRows: 3,
    eventTimeFormat: { hour: 'numeric', minute: '2-digit', meridiem: 'short' },
    ...options,
  });
  calendar.render();
  return calendar;
}
