/**
 * Utilidad: typeahead
 * Implementa la búsqueda por teclado del capítulo 1 de la guía
 * (secciones "Keyboard navigation within components"): al escribir una
 * letra imprimible, mueve el foco o la selección a la siguiente opción
 * cuyo texto empiece por el texto acumulado. La usan Listbox, Combobox
 * y, desde el SPEC 06, Tree view y Grid.
 *
 * Decisiones no obvias:
 * - El búfer se vacía solo si pasan `timeout` ms sin teclas; escribir
 *   "ma" seguido busca "ma" (p. ej. encuentra "Málaga"), no "m" y luego
 *   "a" por separado.
 * - Repetir la misma letra («aaa») es un caso especial de APG: en vez de
 *   buscar el texto "aaa" (que no coincide con nada), recorre las
 *   opciones que empiezan por esa letra, una por pulsación.
 * - La búsqueda siempre empieza en `currentIndex + 1` y da la vuelta al
 *   llegar al final, para no quedarse en la opción ya activa y para que
 *   repetir la letra avance a la siguiente coincidencia.
 * - `normalizeText()` quita tildes y mayúsculas para que escribir sin
 *   tildes encuentre igualmente "Málaga" o "Ávila".
 *
 * APG / referencia: WAI-ARIA APG, "Note about Keyboard Navigation"
 * https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
 *
 * Uso:
 *   const typeahead = createTypeahead();
 *   // en el manejador de keydown de un grupo de opciones:
 *   const index = typeahead.search(event.key, options, currentIndex);
 *   if (index !== -1) activate(options[index]);
 */

/**
 * @param {string} text
 * @returns {string} En minúsculas, sin diacríticos y sin espacios en los extremos.
 */
export function normalizeText(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/**
 * @param {{
 *   timeout?: number,
 *   getText?: (item: Element) => string,
 * }} [options]
 * @returns {{
 *   search: (key: string, items: Element[], currentIndex: number) => number,
 *   reset: () => void,
 * }}
 */
export function createTypeahead({
  timeout = 500,
  getText = (el) => el.textContent,
} = {}) {
  let buffer = '';
  let lastTime = 0;

  function reset() {
    buffer = '';
    lastTime = 0;
  }

  function search(key, items, currentIndex) {
    if (typeof key !== 'string' || key.length !== 1) return -1;

    const now = Date.now();
    if (buffer && now - lastTime > timeout) {
      buffer = '';
    }
    lastTime = now;

    const char = normalizeText(key);
    const previousBuffer = buffer;
    const isRepeat =
      previousBuffer !== '' && [...previousBuffer].every((c) => c === char);
    buffer = previousBuffer + char;
    const query = isRepeat ? char : buffer;

    const count = items.length;
    if (!query || count === 0) return -1;

    for (let offset = 1; offset <= count; offset += 1) {
      const index = (currentIndex + offset + count) % count;
      const text = normalizeText(getText(items[index]));
      if (text.startsWith(query)) {
        return index;
      }
    }
    return -1;
  }

  return { search, reset };
}
