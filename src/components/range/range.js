/**
 * Componente: Range
 * `Range` mantiene sincronizado el `<output for>` de un
 * `<input type="range">` y escribe `aria-valuetext` con el mismo texto
 * formateado, para que el lector anuncie «40 %» en vez de solo «40».
 *
 * Decisiones no obvias:
 * - El `<output>` tiene un rol implícito `status` (región viva
 *   cortés): por eso el marcado de referencia le pone
 *   `aria-live="off"`. Sin eso, arrastrar el tirador anunciaría cada
 *   valor intermedio. `aria-valuetext` sigue anunciando el valor, al
 *   ritmo que decide el propio lector de pantalla.
 * - El formato por defecto sale de `data-format` en el `input`, con
 *   `{value}` como marcador de posición (p. ej. `"{value} %"`). Una
 *   función `format` pasada por opciones tiene prioridad sobre
 *   `data-format`.
 * - El estado inicial se pinta en el constructor a partir del `value`
 *   que ya trae el HTML: no hace falta esperar a la primera
 *   interacción.
 * - El `<output>` se busca desde la raíz del propio `input`
 *   (`getRootNode()`), no desde `document`: así funciona con marcado
 *   que aún no está insertado en la página (p. ej. las historias de
 *   Storybook, que construyen el DOM antes de montarlo).
 *
 * Uso:
 *   import { Range, initRanges } from './range.js';
 *   new Range(document.querySelector('[data-range]'));
 *   // O con formato propio:
 *   new Range(input, { format: (value) => `${value} €` });
 *   // O, para inicializar todos los [data-range] de la página:
 *   initRanges();
 */

export class Range {
  /**
   * @param {HTMLInputElement} input
   * @param {{ format?: (value: number) => string }} [options]
   */
  constructor(input, { format } = {}) {
    if (!input || input.tagName !== 'INPUT' || input.type !== 'range') {
      throw new Error('Range: se requiere un <input type="range">.');
    }
    this.el = input;
    this._format = format || this._formatFromData();
    this._output = this._resolveOutput();

    this._onInput = this._onInput.bind(this);
    input.addEventListener('input', this._onInput);

    this._render();
  }

  /** @returns {number} */
  get value() {
    return Number(this.el.value);
  }

  destroy() {
    this.el.removeEventListener('input', this._onInput);
  }

  /** @returns {(value: number) => string} */
  _formatFromData() {
    const template = this.el.getAttribute('data-format');
    if (!template) return (value) => String(value);
    return (value) => template.replace('{value}', String(value));
  }

  /** @returns {HTMLOutputElement | null} */
  _resolveOutput() {
    const id = this.el.id;
    if (!id) return null;
    return this.el.getRootNode().querySelector(`output[for="${id}"]`);
  }

  _onInput() {
    this._render();
  }

  _render() {
    const text = this._format(this.value);
    if (this._output) this._output.textContent = text;
    this.el.setAttribute('aria-valuetext', text);
  }
}

/**
 * Inicializa todos los [data-range] de un contenedor.
 * @param {ParentNode} [root]
 * @returns {Range[]}
 */
export function initRanges(root = document) {
  return Array.from(root.querySelectorAll('[data-range]')).map(
    (input) => new Range(input)
  );
}
