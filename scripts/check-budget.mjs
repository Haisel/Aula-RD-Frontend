// Verifica el presupuesto de peso de `dist/js/app.js` (spec 006 RNF-01, decisión 016).
// Se ejecuta después del build: `npm run check` falla si el núcleo supera el límite.
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

/** Límite en kB decimales (1 kB = 1000 bytes), igual que el informe de Vite. */
const LIMITE_KB = 110;
const archivo = new URL('../dist/js/app.js', import.meta.url);

let contenido;
try {
  contenido = readFileSync(archivo);
} catch {
  console.error('✖ Presupuesto: no existe dist/js/app.js. Ejecute primero `npm run build`.');
  process.exit(1);
}

const kb = gzipSync(contenido, { level: 9 }).length / 1000;
const texto = `app.js ${kb.toFixed(2)} kB gzip (límite ${LIMITE_KB} kB)`;

if (kb > LIMITE_KB) {
  console.error(`✖ Presupuesto excedido: ${texto}. Vea docs/decisions/016-limite-de-peso-de-app-js.md.`);
  process.exit(1);
}
process.stdout.write(`✔ Presupuesto: ${texto}\n`);
