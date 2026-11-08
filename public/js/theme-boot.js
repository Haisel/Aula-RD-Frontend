/* Aula RD · arranque de tema. Se carga SIN defer en <head>, antes del CSS, para
   aplicar el tema guardado antes de pintar y evitar el destello claro→oscuro.
   Mantiene la misma lógica que src/js/core/theme.js (clave localStorage "au-theme"). */
(function () {
  let pref = 'system';
  try {
    pref = JSON.parse(localStorage.getItem('au-theme')) || 'system';
  } catch {
    /* almacenamiento no disponible */
  }
  const dark =
    pref === 'dark' ||
    (pref === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-bs-theme', dark ? 'dark' : 'light');
})();
