/** Versión de la plantilla (inyectada por Vite desde package.json). */
declare const __AU_VERSION__: string;

interface Window {
  /** Fachada pública de Aula RD. */
  AU: Readonly<Record<string, any>>;
  /** Bootstrap 5 (para uso avanzado). */
  bootstrap: typeof import("bootstrap");
}
