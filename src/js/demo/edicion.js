/**
 * Lógica pura de la edición con cambios sin guardar y deshacer (spec 012, T-20 · RF-09).
 * No toca el DOM ni guarda nada en el navegador (RN-02).
 * @module demo/edicion
 */

/**
 * @typedef {Record<string, string>} Valores Valores de los campos por nombre.
 */

/**
 * Crea un borrador editable con historial de cambios.
 * @param {Valores} initial Valores guardados.
 * @returns {{
 *   values: () => Valores,
 *   set: (field: string, value: string) => boolean,
 *   isDirty: () => boolean,
 *   changed: () => string[],
 *   canUndo: () => boolean,
 *   undo: () => { field: string, value: string } | null,
 *   save: () => Valores,
 *   discard: () => void,
 * }} Borrador.
 */
export function createDraft(initial) {
  /** @type {Valores} */
  let saved = { ...initial };
  /** @type {Valores} */
  let current = { ...initial };
  /** @type {{ field: string, previous: string }[]} */
  let history = [];

  return {
    values: () => ({ ...current }),
    set(field, value) {
      if (!(field in current) || current[field] === value) return false;
      history.push({ field, previous: current[field] });
      current[field] = value;
      return true;
    },
    isDirty: () => Object.keys(saved).some((k) => saved[k] !== current[k]),
    changed: () => Object.keys(saved).filter((k) => saved[k] !== current[k]),
    canUndo: () => history.length > 0,
    undo() {
      const last = history.pop();
      if (!last) return null;
      current[last.field] = last.previous;
      return { field: last.field, value: last.previous };
    },
    save() {
      saved = { ...current };
      history = [];
      return { ...saved };
    },
    discard() {
      current = { ...saved };
      history = [];
    },
  };
}
