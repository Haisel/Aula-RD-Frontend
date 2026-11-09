/**
 * Esquemas Zod de los formularios de Aula RD. Este módulo se descarga la primera vez
 * que se valida un formulario (Zod pesa ~60 KB gzip; no hace falta en todas las páginas).
 *
 * Desde HTML: `<form data-au-validate="login">`. Esquemas propios:
 * ```js
 * AU.registerSchema('evaluacion', (z, f) => z.object({ titulo: f.nombre('el título'), fecha: f.fecha }));
 * ```
 * La fábrica recibe `z` (Zod) y `f` (campos reutilizables con mensajes en español).
 * @module helpers/schemas
 */
import { z } from 'zod';
import { isValidCedula, isValidRnc, isValidPhoneDO } from './validators.js';

// ---------------------------------------------------------------- campos reutilizables
const required = (label) =>
  z
    .string()
    .trim()
    .min(1, { message: `Escriba ${label}.` });

export const fields = {
  nombre: (label = 'el nombre') => required(label).max(120, { message: 'Use 120 caracteres o menos.' }),
  email: z
    .string()
    .trim()
    .min(1, { message: 'Escriba el correo.' })
    .pipe(z.email({ message: 'Escriba un correo válido, p. ej. nombre@colegio.edu.do.' })),
  password: z
    .string()
    .min(8, { message: 'Use al menos 8 caracteres.' })
    .regex(/[A-Za-z]/, { message: 'Incluya al menos una letra.' })
    .regex(/\d/, { message: 'Incluya al menos un número.' }),
  cedula: z
    .string()
    .trim()
    .min(1, { message: 'Escriba la cédula.' })
    .refine(isValidCedula, { message: 'La cédula no es válida. Verifique los 11 dígitos.' }),
  rnc: z
    .string()
    .trim()
    .min(1, { message: 'Escriba el RNC.' })
    .refine(isValidRnc, { message: 'El RNC no es válido. Verifique los 9 dígitos.' }),
  telefono: z
    .string()
    .trim()
    .min(1, { message: 'Escriba el teléfono.' })
    .refine(isValidPhoneDO, { message: 'Use un número dominicano: (809), (829) o (849) + 7 dígitos.' }),
  fecha: z
    .string()
    .trim()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'Use el formato DD/MM/AAAA.' }),
  monto: z
    .string()
    .trim()
    .min(1, { message: 'Escriba el monto.' })
    .refine((v) => Number(v.replace(/[^\d.]/g, '')) > 0, { message: 'El monto debe ser mayor que cero.' }),
  aceptar: z.literal('on', { message: 'Debe aceptar para continuar.' }),
};

// ---------------------------------------------------------------- esquemas de formularios
/** Inicio de sesión. */
export const loginSchema = z.object({
  email: fields.email,
  password: z.string().min(1, { message: 'Escriba su contraseña.' }),
});

/** Olvidé mi contraseña: solo el correo (recuperar-contrasena.html). */
export const recuperarSchema = z.object({
  email: fields.email,
});

/** Inicio de sesión sin contraseña: correo y código de un solo uso de 6 dígitos (login-codigo.html). */
export const codigoAccesoSchema = z.object({
  email: fields.email,
  codigo: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { message: 'Escriba los 6 dígitos del código.' }),
});

/** Registro / suscripción de una institución (suscribir.html). */
export const registroInstitucionSchema = z.object({
  institucion: fields.nombre('el nombre de la institución'),
  rnc: fields.rnc,
  provincia: z.string().min(1, { message: 'Seleccione la provincia.' }),
  telefono: fields.telefono,
  plan: z.enum(['basico', 'profesional', 'premium'], { message: 'Elija un plan.' }),
  director: fields.nombre('el nombre de quien dirige'),
  cedula: fields.cedula,
  email: fields.email,
  inicio: fields.fecha,
  password: fields.password,
  terminos: fields.aceptar,
});

/** Alta de estudiante (ejemplo de dashboard). */
export const estudianteSchema = z.object({
  nombre: fields.nombre('el nombre del estudiante'),
  grado: z.string().min(1, { message: 'Seleccione el grado.' }),
  tutor: fields.nombre('el nombre del tutor'),
  cedulaTutor: fields.cedula,
  telefonoTutor: fields.telefono,
  cuota: fields.monto,
});

/** Registro de pago. */
export const pagoSchema = z.object({
  estudiante: z.string().min(1, { message: 'Seleccione el estudiante.' }),
  monto: fields.monto,
  fecha: fields.fecha,
  metodo: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cheque'], {
    message: 'Seleccione el método de pago.',
  }),
});

/** Asistencia rápida: cada estudiante (e1…eN) debe tener un estado. */
export const asistenciaSchema = z.record(
  z.string().regex(/^e\d+$/),
  z.enum(['presente', 'tardanza', 'ausente'], { message: 'Marque presente, tardanza o ausente.' }),
);

/** Comunicado a familias. */
export const comunicadoSchema = z.object({
  grados: z.array(z.string()).min(1, { message: 'Elija al menos una sección.' }),
  asunto: fields.nombre('el asunto'),
  mensaje: z.string().trim().min(12, { message: 'Escriba el mensaje (al menos una oración).' }),
});

/** Autorización firmada por el tutor. */
export const autorizacionSchema = z.object({
  firma: z.string().startsWith('data:image/', { message: 'Firme en el recuadro antes de enviar.' }),
});

/**
 * Esquemas disponibles por nombre para `data-au-validate`.
 * @type {Map<string, z.ZodType>}
 */
export const schemas = new Map(
  /** @type {Array<[string, z.ZodType]>} */ ([
    ['login', loginSchema],
    ['recuperar', recuperarSchema],
    ['codigo-acceso', codigoAccesoSchema],
    ['registro-institucion', registroInstitucionSchema],
    ['estudiante', estudianteSchema],
    ['pago', pagoSchema],
    ['asistencia', asistenciaSchema],
    ['comunicado', comunicadoSchema],
    ['autorizacion', autorizacionSchema],
  ]),
);

/**
 * Valida un objeto y devuelve errores por campo (primer mensaje de cada uno).
 * @param {z.ZodType} schema Esquema Zod.
 * @param {Record<string, unknown>} data Datos.
 * @returns {{ success: true, data: any, errors: {} } | { success: false, data: null, errors: Record<string, string> }} Resultado.
 */
export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data, errors: {} };
  /** @type {Record<string, string>} */
  const errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path.map(String).join('.') || '_form';
    if (!errors[key]) errors[key] = issue.message;
  }
  return { success: false, data: null, errors };
}

export { z };
