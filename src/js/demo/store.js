/**
 * Almacén en memoria con historial para deshacer (demostraciones de la galería, spec 012).
 * No persiste nada (RN-02): al recargar la página vuelven los datos originales.
 * @module demo/store
 */

/** Cantidad máxima de cambios que se pueden deshacer. */
const MAX_HISTORY = 20;

/**
 * @typedef {object} Change
 * @property {'create' | 'update' | 'remove'} type Tipo de cambio.
 * @property {{ id: string }} row Fila afectada (en `update`, la fila ya actualizada).
 * @property {number} [index] Posición original (solo `remove`).
 * @property {{ id: string }} [before] Valores anteriores (solo `update`).
 */

/**
 * Crea un almacén de filas con identificador `id`.
 * @template {{ id: string }} T
 * @param {T[]} initial Filas iniciales (se copian).
 * @param {string} [prefix] Prefijo de los identificadores nuevos (`est` → `est-004`).
 * @returns {{
 *   list: () => T[],
 *   get: (id: string) => T | null,
 *   create: (data: Partial<T>) => T,
 *   update: (id: string, patch: Partial<T>) => T | null,
 *   remove: (id: string) => T | null,
 *   undo: () => { type: Change['type'], row: T } | null,
 *   canUndo: () => boolean,
 * }} Almacén.
 */
export function createStore(initial, prefix = 'est') {
  /** @type {T[]} */
  let rows = initial.map((r) => ({ ...r }));
  /** @type {Change[]} */
  const history = [];
  let seq = Math.max(0, ...rows.map((r) => Number(/(\d+)$/.exec(r.id)?.[1] ?? 0)));

  /**
   * Anota un cambio, descartando el más antiguo si se supera el límite.
   * @param {Change} change Cambio.
   * @returns {void}
   */
  const record = (change) => {
    history.push(change);
    if (history.length > MAX_HISTORY) history.shift();
  };

  return {
    list: () => rows.map((r) => ({ ...r })),
    get: (id) => {
      const row = rows.find((r) => r.id === id);
      return row ? { ...row } : null;
    },
    create: (data) => {
      seq += 1;
      const row = /** @type {T} */ ({ ...data, id: `${prefix}-${String(seq).padStart(3, '0')}` });
      rows.push(row);
      record({ type: 'create', row: { ...row } });
      return { ...row };
    },
    update: (id, patch) => {
      const index = rows.findIndex((r) => r.id === id);
      if (index < 0) return null;
      const before = { ...rows[index] };
      rows[index] = { ...before, ...patch, id };
      record({ type: 'update', row: { ...rows[index] }, before });
      return { ...rows[index] };
    },
    remove: (id) => {
      const index = rows.findIndex((r) => r.id === id);
      if (index < 0) return null;
      const [row] = rows.splice(index, 1);
      record({ type: 'remove', row: { ...row }, index });
      return { ...row };
    },
    undo: () => {
      const change = history.pop();
      if (!change) return null;
      if (change.type === 'create') {
        rows = rows.filter((r) => r.id !== change.row.id);
      } else if (change.type === 'update') {
        rows = rows.map((r) => (r.id === change.row.id ? /** @type {T} */ ({ ...change.before }) : r));
      } else {
        rows.splice(change.index ?? rows.length, 0, /** @type {T} */ ({ ...change.row }));
      }
      return { type: change.type, row: /** @type {T} */ ({ ...(change.before ?? change.row) }) };
    },
    canUndo: () => history.length > 0,
  };
}
