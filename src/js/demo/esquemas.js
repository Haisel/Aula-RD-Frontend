/**
 * Esquemas de validación de las páginas de autenticación y cuenta de la galería (spec 013, T-14, T-15).
 *
 * Se registran desde el código de demostración y no desde `helpers/schemas.js` para que `app.js` no
 * crezca (RF-10). Usan solo la fachada `window.AU`.
 * @module demo/esquemas
 */

/**
 * Registra los esquemas de las páginas de cuenta.
 * @param {HTMLElement} _root Contenedor `[data-demo="esquemas"]` (no se usa).
 * @param {any} au Fachada `window.AU`.
 * @returns {void}
 */
export function esquemas(_root, au) {
  const claveNueva = (/** @type {any} */ z, /** @type {any} */ f) => f.password;
  const coinciden =
    (/** @type {any} */ campo, /** @type {string} */ otro) =>
    (/** @type {any} */ v, /** @type {any} */ ctx) => {
      if (v[campo] !== v[otro]) {
        ctx.addIssue({ code: 'custom', path: [otro], message: 'Las contraseñas no coinciden.' });
      }
    };

  au.registerSchema('registro-usuario', (/** @type {any} */ z, /** @type {any} */ f) =>
    z
      .object({
        nombre: f.nombre('su nombre'),
        email: f.email,
        password: claveNueva(z, f),
        confirmar: z.string().min(1, { message: 'Repita la contraseña.' }),
        terminos: f.aceptar,
      })
      .superRefine(coinciden('password', 'confirmar')),
  );
  au.registerSchema('restablecer', (/** @type {any} */ z, /** @type {any} */ f) =>
    z
      .object({
        password: claveNueva(z, f),
        confirmar: z.string().min(1, { message: 'Repita la contraseña.' }),
      })
      .superRefine(coinciden('password', 'confirmar')),
  );
  au.registerSchema('dos-pasos', (/** @type {any} */ z) =>
    z.object({ codigo: z.string().regex(/^\d{6}$/, { message: 'Escriba los 6 dígitos del código.' }) }),
  );
  au.registerSchema('desbloqueo', (/** @type {any} */ z) =>
    z.object({ password: z.string().min(1, { message: 'Escriba su contraseña.' }) }),
  );
  au.registerSchema('cuenta-password', (/** @type {any} */ z, /** @type {any} */ f) =>
    z
      .object({
        actual: z.string().min(1, { message: 'Escriba su contraseña actual.' }),
        password: claveNueva(z, f),
        confirmar: z.string().min(1, { message: 'Repita la contraseña.' }),
      })
      .superRefine(coinciden('password', 'confirmar')),
  );
}
