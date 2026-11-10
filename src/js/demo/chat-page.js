/**
 * Demostración de chat (spec 013, T-19): enviar un mensaje lo agrega a la conversación, con la
 * respuesta automática de ejemplo. Nada se envía ni se guarda (RN-02). Los mensajes se insertan con
 * `textContent`, nunca como HTML.
 * @module demo/chat-page
 */

/** Respuestas de ejemplo, en orden. */
const RESPUESTAS = [
  'Recibido, lo reviso y le respondo hoy.',
  'Gracias por avisar. Quedo atenta.',
  'Perfecto, nos vemos en la reunión.',
];

/**
 * Activa el chat sobre su contenedor.
 * @param {HTMLElement} root Contenedor `[data-demo="chat"]`.
 * @returns {void}
 */
export function chat(root) {
  const form = /** @type {HTMLFormElement} */ (root.querySelector('[data-chat="form"]'));
  const input = /** @type {HTMLInputElement} */ (root.querySelector('[data-chat="texto"]'));
  const log = /** @type {HTMLElement} */ (root.querySelector('[data-chat="mensajes"]'));
  let n = 0;

  /**
   * Agrega una burbuja a la conversación.
   * @param {string} text Texto del mensaje.
   * @param {boolean} mine `true` si es del usuario.
   * @returns {void}
   */
  const add = (text, mine) => {
    const li = document.createElement('li');
    li.className = `au-chat-msg${mine ? ' is-mine' : ''}`;
    li.textContent = text;
    log.append(li);
    log.scrollTop = log.scrollHeight;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) {
      input.focus();
      return;
    }
    add(text, true);
    input.value = '';
    input.focus();
    window.setTimeout(() => add(RESPUESTAS[n++ % RESPUESTAS.length], false), 600);
  });
}
