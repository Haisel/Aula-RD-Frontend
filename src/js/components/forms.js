/**
 * Validación de formularios con Zod + estilos de Bootstrap (`.is-invalid`, `.invalid-feedback`).
 *
 * ```html
 * <form data-au-validate="login" data-au-submit="ajax" action="/api/login" method="post" novalidate>
 * ```
 * - `data-au-validate="<esquema>"`: nombre registrado (ver `helpers/validators.js`).
 * - `data-au-submit`:
 *   - `native` (por defecto): si es válido, el navegador envía el formulario normalmente.
 *   - `ajax`: envía JSON con `AU.http` a `action`/`method`; aplica errores del servidor
 *     por campo; emite `au:form:success` / `au:form:error`.
 *   - `event`: no envía; emite `au:form:submit` con `{ form, data }` para que su código decida.
 * - `data-au-success="Mensaje"`: toast al terminar con éxito (modo ajax).
 * - `data-au-redirect="/ruta"`: redirige tras el éxito (modo ajax).
 *
 * Accesibilidad: marca `aria-invalid`, enlaza el mensaje con `aria-describedby`
 * y mueve el foco al primer campo con error.
 * @module components/forms
 */
import { getSchema, validateWith } from '../helpers/schema-registry.js';
import { client } from '../core/http.js';
import { emit, EVENTS } from '../core/events.js';
import { toAppError } from '../core/errors.js';
import { toast } from './dialogs.js';

/**
 * Convierte un formulario en objeto plano. Checkboxes sin marcar no se incluyen;
 * campos con el mismo nombre (multiple) se agrupan en arreglo.
 * @param {HTMLFormElement} form Formulario.
 * @returns {Record<string, any>} Datos.
 */
export function formToObject(form) {
  /** @type {Record<string, any>} */
  const out = {};
  for (const [key, value] of new FormData(form).entries()) {
    const v = typeof value === 'string' ? value : value.name;
    if (key in out) out[key] = Array.isArray(out[key]) ? [...out[key], v] : [out[key], v];
    else out[key] = v;
  }
  form.querySelectorAll('select[multiple]').forEach((s) => {
    const sel = /** @type {HTMLSelectElement} */ (s);
    if (sel.name) out[sel.name] = Array.from(sel.selectedOptions).map((o) => o.value);
  });
  return out;
}

/**
 * Busca el contenedor donde va el mensaje de error de un campo.
 * @param {HTMLElement} field Campo.
 * @returns {HTMLElement} Elemento `.invalid-feedback` (lo crea si no existe).
 */
function feedbackFor(field) {
  const id = `${field.id || field.getAttribute('name')}-error`;
  let fb = /** @type {HTMLElement | null} */ (document.getElementById(id));
  if (!fb) {
    fb = document.createElement('div');
    fb.className = 'invalid-feedback';
    fb.id = id;
    const anchor = field.closest('.choices, .input-group, .form-check, .au-choice-group') ?? field;
    anchor.insertAdjacentElement('afterend', fb);
  }
  return fb;
}

/**
 * Limpia los errores visibles de un formulario.
 * @param {HTMLFormElement} form Formulario.
 * @returns {void}
 */
export function clearErrors(form) {
  form.querySelectorAll('.is-invalid').forEach((el) => {
    el.classList.remove('is-invalid');
    el.removeAttribute('aria-invalid');
  });
  form.querySelectorAll('.invalid-feedback').forEach((el) => (el.textContent = ''));
  form.querySelector('[data-au-form-error]')?.classList.add('d-none');
}

/**
 * Muestra errores por campo (y un error general opcional).
 * @param {HTMLFormElement} form Formulario.
 * @param {Record<string, string | string[]>} errors Mensajes por `name` del campo.
 * @param {string} [general] Mensaje general (se muestra en `[data-au-form-error]` si existe).
 * @returns {void}
 */
export function showErrors(form, errors, general) {
  let first = /** @type {HTMLElement | null} */ (null);
  for (const [name, msg] of Object.entries(errors)) {
    const fields = /** @type {HTMLElement[]} */ (
      Array.from(form.querySelectorAll(`[name="${CSS.escape(name)}"]`))
    );
    if (!fields.length) continue;
    const text = Array.isArray(msg) ? msg[0] : msg;
    fields.forEach((f) => {
      f.classList.add('is-invalid');
      f.setAttribute('aria-invalid', 'true');
    });
    const fb = feedbackFor(fields[fields.length - 1]);
    fb.textContent = text;
    fb.style.display = 'block';
    fields.forEach((f) => {
      // `aria-describedby` es una lista de ids: se compara id por id para no duplicar el del error.
      const ids = (f.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean);
      if (!ids.includes(fb.id)) ids.push(fb.id);
      f.setAttribute('aria-describedby', ids.join(' '));
    });
    first ??= fields[0];
  }
  const box = /** @type {HTMLElement | null} */ (form.querySelector('[data-au-form-error]'));
  if (box && general) {
    box.textContent = general;
    box.classList.remove('d-none');
  }
  first?.focus();
}

/**
 * Valida un formulario contra un esquema registrado y muestra los errores.
 * @param {HTMLFormElement} form Formulario.
 * @param {string} [schemaName] Nombre de esquema (por defecto `data-au-validate`).
 * @returns {Promise<{ valid: boolean, data: Record<string, any> }>} Resultado con los datos (validados si `valid`).
 */
export async function validateForm(form, schemaName = form.dataset.auValidate ?? '') {
  clearErrors(form);
  const raw = formToObject(form);
  const schema = await getSchema(schemaName);
  if (!schema) {
    console.warn(`[AU] Esquema "${schemaName}" no registrado; se omite la validación.`);
    return { valid: true, data: raw };
  }
  const result = await validateWith(schema, raw);
  if (!result.success) {
    showErrors(form, result.errors);
    return { valid: false, data: raw };
  }
  return { valid: true, data: result.data };
}

/**
 * Activa/desactiva el estado de carga del botón de envío.
 * @param {HTMLFormElement} form Formulario.
 * @param {boolean} loading Estado.
 * @returns {void}
 */
function setLoading(form, loading) {
  const btn = form.querySelector('[type="submit"]');
  if (!btn) return;
  btn.classList.toggle('is-loading', loading);
  btn.toggleAttribute('disabled', loading);
  btn.setAttribute('aria-busy', String(loading));
}

/** @type {import('../types.js').ComponentDefinition} */
export const formComponent = {
  name: 'form',
  selector: 'form[data-au-validate]',
  init(el) {
    const form = /** @type {HTMLFormElement} */ (el);
    form.noValidate = true;

    const onInput = (/** @type {Event} */ e) => {
      const f = /** @type {HTMLElement} */ (e.target);
      if (f.classList?.contains('is-invalid')) {
        const name = f.getAttribute('name');
        form.querySelectorAll(`[name="${CSS.escape(name ?? '')}"]`).forEach((x) => {
          x.classList.remove('is-invalid');
          x.removeAttribute('aria-invalid');
        });
      }
    };

    const onSubmit = async (/** @type {SubmitEvent} */ e) => {
      // La validación es asíncrona (Zod se carga bajo demanda): se detiene el envío
      // y, si todo es válido en modo nativo, se reenvía con form.submit().
      e.preventDefault();
      const { valid, data } = await validateForm(form);
      const mode = form.dataset.auSubmit ?? 'native';
      if (!valid) return;
      if (mode === 'native') {
        form.submit();
        return;
      }
      if (mode === 'event') {
        emit(EVENTS.FORM_SUBMIT, { form, data }, form);
        if (form.dataset.auSuccess) toast(form.dataset.auSuccess, 'success');
        return;
      }
      setLoading(form, true);
      try {
        const response = await client.request({
          url: form.getAttribute('action') ?? '',
          method: form.getAttribute('method') ?? 'post',
          body: data,
        });
        emit(EVENTS.FORM_SUCCESS, { form, data, response }, form);
        if (form.dataset.auSuccess) toast(form.dataset.auSuccess, 'success');
        if (form.dataset.auRedirect) window.location.assign(form.dataset.auRedirect);
      } catch (error) {
        const err = toAppError(error);
        showErrors(form, err.fieldErrors ?? {}, err.message);
        if (!form.querySelector('[data-au-form-error]')) toast(err.message, 'error');
        emit(EVENTS.FORM_ERROR, { form, error: err }, form);
      } finally {
        setLoading(form, false);
      }
    };

    form.addEventListener('input', onInput);
    form.addEventListener('change', onInput);
    form.addEventListener('submit', onSubmit);
    return () => {
      form.removeEventListener('input', onInput);
      form.removeEventListener('change', onInput);
      form.removeEventListener('submit', onSubmit);
    };
  },
};
