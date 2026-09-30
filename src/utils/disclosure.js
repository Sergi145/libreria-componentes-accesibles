/**
 * Utilidad: disclosure
 * Implementa el patrón WAI-ARIA APG "Disclosure (Show/Hide)":
 * https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 * La usan Navbar, Dropdown y Popover. Ya no es un componente con estilos
 * propios: cada uno de ellos pone su marcado y su CSS.
 *
 * Si no necesitas gestionar el estado desde JS, usa el elemento nativo
 * <details>/<summary>: el navegador resuelve el toggle, el estado y el
 * foco sin JavaScript ni ARIA.
 *
 * Un botón con aria-expanded + aria-controls muestra u oculta el
 * elemento que referencia, alternando también su atributo hidden. Solo
 * escucha "click": Espacio/Enter ya activan el trigger de forma nativa
 * al ser un <button>, sin necesidad de gestionar el teclado a mano.
 *
 * El estado inicial se lee del propio HTML (aria-expanded ya presente
 * en el trigger); si falta, se asume "false".
 *
 * Uso:
 *   import { Disclosure } from '../../utils/disclosure.js';
 *   new Disclosure(document.querySelector('[data-disclosure]'));
 */

export class Disclosure {
  /** @param {HTMLButtonElement} trigger */
  constructor(trigger) {
    if (!trigger) {
      throw new Error(
        'Disclosure: se requiere un elemento <button> disparador.'
      );
    }
    this.trigger = trigger;
    if (!trigger.hasAttribute('aria-expanded')) {
      trigger.setAttribute('aria-expanded', 'false');
    }
    this._onClick = this._onClick.bind(this);
    this.trigger.addEventListener('click', this._onClick);
  }

  get _panel() {
    const id = this.trigger.getAttribute('aria-controls');
    return id ? document.getElementById(id) : null;
  }

  /** @returns {boolean} */
  get expanded() {
    return this.trigger.getAttribute('aria-expanded') === 'true';
  }

  open() {
    this._setExpanded(true);
  }

  close() {
    this._setExpanded(false);
  }

  toggle() {
    this._setExpanded(!this.expanded);
  }

  destroy() {
    this.trigger.removeEventListener('click', this._onClick);
  }

  _setExpanded(expanded) {
    this.trigger.setAttribute('aria-expanded', String(expanded));
    this._panel?.toggleAttribute('hidden', !expanded);
  }

  _onClick() {
    this.toggle();
  }
}

/**
 * Inicializa todos los triggers con [data-disclosure] dentro de un
 * contenedor.
 * @param {ParentNode} [root]
 * @returns {Disclosure[]}
 */
export function initDisclosures(root = document) {
  return Array.from(root.querySelectorAll('[data-disclosure]')).map(
    (el) => new Disclosure(el)
  );
}
