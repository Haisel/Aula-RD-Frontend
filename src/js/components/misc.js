/**
 * Comportamientos pequeños declarativos.
 *
 * | Atributo                         | Qué hace |
 * |----------------------------------|----------|
 * | `data-au-navbar`                | Añade `.is-scrolled` a la navbar al desplazarse. |
 * | `data-au-password-toggle="#id"` | Botón que muestra/oculta una contraseña. |
 * | `data-au-billing`               | Grupo mensual/anual: cambia `[data-au-price-mensual]`/`[data-au-price-anual]`. |
 * | `data-au-relative-time="ISO"`   | Muestra "hace 5 minutos" y actualiza cada minuto. |
 * | `data-au-format="currency"`     | Formatea el número del texto (currency, compact-currency, number, percent, date, cedula, rnc, phone). |
 * | `data-bs-toggle="tooltip"`       | Inicializa tooltips de Bootstrap. |
 * @module components/misc
 */
import { Tooltip } from 'bootstrap';
import * as d from './dialogs.js';
import { customGet } from '../helpers/browser.js';
import {
  formatCurrency,
  formatCompactCurrency,
  formatNumber,
  formatPercent,
  formatDate,
  formatCedula,
  formatRnc,
  formatPhone,
  formatRelative,
} from '../helpers/format.js';

/** @type {import('../types.js').ComponentDefinition} */
export const navbarComponent = {
  name: 'navbar',
  selector: '[data-au-navbar]',
  init(el) {
    const update = () => el.classList.toggle('is-scrolled', window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  },
};

/** @type {import('../types.js').ComponentDefinition} */
export const passwordToggleComponent = {
  name: 'password-toggle',
  selector: '[data-au-password-toggle]',
  init(btn) {
    const input = /** @type {HTMLInputElement | null} */ (
      document.querySelector(btn.dataset.auPasswordToggle ?? '')
    );
    if (!input) return;
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Mostrar contraseña');
    const onClick = () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
      btn.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
      btn
        .querySelector('.bi')
        ?.classList.replace(show ? 'bi-eye' : 'bi-eye-slash', show ? 'bi-eye-slash' : 'bi-eye');
    };
    btn.addEventListener('click', onClick);
    return () => btn.removeEventListener('click', onClick);
  },
};

/** @type {import('../types.js').ComponentDefinition} */
export const billingComponent = {
  name: 'billing',
  selector: '[data-au-billing]',
  init(group) {
    const scope = group.closest('section') ?? document;
    const apply = (/** @type {string} */ period) => {
      group.querySelectorAll('[data-au-billing-option]').forEach((b) => {
        const active = /** @type {HTMLElement} */ (b).dataset.auBillingOption === period;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      scope.querySelectorAll(`[data-au-price-${period}]`).forEach((p) => {
        const el = /** @type {HTMLElement} */ (p);
        el.textContent = el.getAttribute(`data-au-price-${period}`);
      });
      scope
        .querySelectorAll('[data-au-period-label]')
        .forEach((l) => (l.textContent = period === 'anual' ? ' /mes, facturado anual' : ' /mes'));
    };
    const onClick = (/** @type {Event} */ e) => {
      const opt = /** @type {HTMLElement | null} */ (
        /** @type {HTMLElement} */ (e.target).closest('[data-au-billing-option]')
      );
      if (opt) apply(opt.dataset.auBillingOption ?? 'mensual');
    };
    group.addEventListener('click', onClick);
    apply(group.dataset.auBilling || 'mensual');
    return () => group.removeEventListener('click', onClick);
  },
};

/** @type {import('../types.js').ComponentDefinition} */
export const relativeTimeComponent = {
  name: 'relative-time',
  selector: '[data-au-relative-time]',
  init(el) {
    const iso = el.dataset.auRelativeTime ?? '';
    const update = () => (el.textContent = formatRelative(iso));
    update();
    if (el instanceof HTMLTimeElement && !el.dateTime) el.dateTime = iso;
    const t = window.setInterval(update, 60000);
    return () => window.clearInterval(t);
  },
};

/** @type {Record<string, (v: string) => string>} */
const FORMATTERS = {
  currency: (v) => formatCurrency(Number(v)),
  'compact-currency': (v) => formatCompactCurrency(Number(v)),
  number: (v) => formatNumber(Number(v)),
  percent: (v) => formatPercent(Number(v)),
  date: (v) => formatDate(v),
  cedula: (v) => formatCedula(v),
  rnc: (v) => formatRnc(v),
  phone: (v) => formatPhone(v),
};

/** @type {import('../types.js').ComponentDefinition} */
export const formatComponent = {
  name: 'format',
  selector: '[data-au-format]',
  init(el) {
    const fn = FORMATTERS[el.dataset.auFormat ?? ''];
    const raw = (el.textContent ?? '').trim();
    if (!fn || !raw) return;
    if (el.dataset.auFormat === 'compact-currency') el.title = formatCurrency(Number(raw));
    el.textContent = fn(raw);
  },
};

/** @type {import('../types.js').ComponentDefinition} */
export const tooltipComponent = {
  name: 'tooltip',
  selector: '[data-bs-toggle="tooltip"]',
  init(el) {
    const t = new Tooltip(el);
    return () => t.dispose();
  },
};

/**
 * Acciones declarativas de diálogo — útiles en prototipos y en botones de ayuda.
 *
 * | `data-au-action`   | Llama a |
 * |--------------------|---------|
 * | `success` · `error` · `warning` · `info` | `AU.success(mensaje)` … |
 * | `toast`            | `AU.toast(mensaje, data-au-type)` |
 * | `confirm`          | `AU.confirm({ text: mensaje })` y muestra un toast con la respuesta |
 * | `confirm-delete`   | `AU.confirmDelete(mensaje)` |
 * | `loading`          | `AU.loading(mensaje)` y lo cierra a los `data-au-duration` ms (por defecto 1500) |
 * | `print`            | Abre el diálogo de impresión del navegador (`window.print()`) |
 *
 * Mensaje: `data-au-message`.
 * @type {import('../types.js').ComponentDefinition}
 */
export const actionComponent = {
  name: 'action',
  selector: '[data-au-action]',
  init(el) {
    const onClick = async (/** @type {MouseEvent} */ event) => {
      const msg = el.dataset.auMessage ?? '';
      const action = el.dataset.auAction;
      if (action === 'success' || action === 'error' || action === 'warning' || action === 'info')
        d.alert(msg, action);
      else if (action === 'print') window.print();
      else if (action === 'toast') d.toast(msg, el.dataset.auType ?? 'success');
      else if (action === 'confirm')
        d.toast((await d.confirm({ text: msg })) ? 'Confirmado' : 'Cancelado', 'info');
      else if (action === 'confirm-delete')
        d.toast((await d.confirmDelete(msg)) ? 'Eliminado (demostración)' : 'Cancelado', 'info');
      else if (action === 'loading') {
        d.loading(msg || 'Procesando…');
        setTimeout(d.close, Number(el.dataset.auDuration ?? 1500));
      } else if (action) {
        // Acción propia registrada con AU.customSet('nombre', (el, event) => …)
        const fn = customGet(action);
        if (fn) await fn(el, event);
        else console.warn(`[AU] data-au-action="${action}" no está registrada (AU.customSet).`);
      }
    };
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  },
};
