/**
 * Tipos mínimos de las pocas funciones de Node que usa `src/data/pages.js` al GENERAR las páginas
 * (nunca llegan al navegador). Se declaran aquí en lugar de instalar `@types/node`, para no añadir
 * una dependencia solo por tres funciones.
 */
declare module 'node:fs' {
  export function readFileSync(path: string, encoding: 'utf8'): string;
}

declare module 'node:path' {
  export function resolve(...parts: string[]): string;
}

declare module 'node:url' {
  export function fileURLToPath(url: string | URL): string;
}
