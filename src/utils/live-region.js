/**
 * Utilidad: live-region
 * Anuncia mensajes dinámicos a los lectores de pantalla sin mover el
 * foco. Mantiene dos regiones vivas persistentes al final de <body>,
 * visualmente ocultas: una cortés (`role="status"`) y otra asertiva
 * (`role="alert"`). La usan Alert, Toast y Progress.
 *
 * Decisiones no obvias:
 * - Las regiones existen en el DOM antes de recibir el texto: un
 *   `role="status"` o `role="alert"` insertado a la vez que su contenido
 *   no se anuncia de forma fiable.
 * - `announce()` vacía la región y escribe el texto en el siguiente tick,
 *   para que se anuncie aunque la región se acabe de crear o el mensaje
 *   se repita.
 * - Si algo quita las regiones del DOM (p. ej. un test que limpia
 *   `document.body`), se recrean en la siguiente llamada.
 * - El estilo va en línea (patrón `clip` de `.visually-hidden`) para que
 *   la utilidad no dependa de ningún CSS.
 *
 * APG / referencia: WAI-ARIA live regions
 * https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/
 *
 * Uso:
 *   initLiveRegions();                       // opcional, al cargar la página
 *   announce('Cambios guardados');           // cortés
 *   announce('Error al guardar', { politeness: 'assertive' });
 */

const HIDDEN_STYLE =
  'position:absolute;width:1px;height:1px;margin:-1px;padding:0;' +
  'overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);' +
  'white-space:nowrap;border:0;';

const ROLES = { polite: 'status', assertive: 'alert' };

/** Mensaje pendiente por región, para descartar el anterior si se repite. */
const pending = new WeakMap();

/**
 * Devuelve la región de la cortesía indicada; la crea si no existe o si
 * se desconectó del documento.
 * @param {'polite' | 'assertive'} politeness
 * @param {HTMLElement} [root]
 * @returns {HTMLElement}
 */
function getRegion(politeness, root = document.body) {
  const existing = document.querySelector(`[data-live-region="${politeness}"]`);
  if (existing?.isConnected) return existing;

  const region = document.createElement('div');
  region.setAttribute('data-live-region', politeness);
  region.setAttribute('role', ROLES[politeness]);
  region.setAttribute('style', HIDDEN_STYLE);
  root.appendChild(region);
  return region;
}

/**
 * Crea las dos regiones si no existen. Idempotente.
 * @param {HTMLElement} [root]
 */
export function initLiveRegions(root = document.body) {
  getRegion('polite', root);
  getRegion('assertive', root);
}

/**
 * Anuncia `message` a los lectores de pantalla.
 * @param {string} message
 * @param {{ politeness?: 'polite' | 'assertive' }} [options]
 */
export function announce(message, { politeness = 'polite' } = {}) {
  const region = getRegion(politeness);
  region.textContent = '';
  clearTimeout(pending.get(region));
  pending.set(
    region,
    setTimeout(() => {
      region.textContent = message;
    }, 0)
  );
}
