/**
 * Componente: Switch
 * Patrón WAI-ARIA APG "Switch":
 * https://www.w3.org/WAI/ARIA/apg/patterns/switch/
 *
 * Es un <button type="button" role="switch" aria-checked="true|false">.
 * El <button> nativo da foco y activación con Enter/Espacio (ambos
 * generan un clic); este script alterna aria-checked en cada clic.
 * aria-checked es la única fuente de verdad del estado (el CSS lee
 * [aria-checked="true"]). Si el botón está disabled, no hay clic.
 *
 * Emite un evento `change` (burbujea) tras alternar, con
 * detail.checked, para que la página reaccione al cambio inmediato.
 *
 * Uso:
 *   import { Switch } from './switch.js';
 *   new Switch(document.querySelector('.c-switch'));
 */

export class Switch {
  /**
   * @param {HTMLButtonElement} el <button role="switch">.
   */
  constructor(el) {
    if (!el) {
      throw new Error('Switch: se requiere el <button role="switch">.');
    }
    this.el = el;
    this._onClick = this._onClick.bind(this);

    if (el.getAttribute('aria-checked') !== 'true') {
      el.setAttribute('aria-checked', 'false');
    }

    el.addEventListener('click', this._onClick);
  }

  get checked() {
    return this.el.getAttribute('aria-checked') === 'true';
  }

  set checked(value) {
    this.el.setAttribute('aria-checked', String(Boolean(value)));
  }

  toggle() {
    this.checked = !this.checked;
    this.el.dispatchEvent(
      new CustomEvent('change', {
        bubbles: true,
        detail: { checked: this.checked },
      })
    );
  }

  _onClick() {
    this.toggle();
  }

  destroy() {
    this.el.removeEventListener('click', this._onClick);
  }
}

/**
 * Instancia un Switch por cada button[role="switch"] dentro de `root`.
 * @param {ParentNode} [root]
 * @returns {Switch[]}
 */
export function initSwitch(root = document) {
  return Array.from(root.querySelectorAll('button[role="switch"]')).map(
    (el) => new Switch(el)
  );
}
