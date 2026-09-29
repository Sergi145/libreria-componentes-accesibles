/**
 * Componente: Button
 *
 * El botón funciona sin JavaScript: un <button> nativo ya es accesible
 * por teclado y para lectores de pantalla. Este módulo es opcional y
 * solo añade un estado de "cargando" accesible (por ejemplo, tras enviar
 * un formulario), usando aria-disabled + aria-busy en lugar de la
 * propiedad disabled, para que el botón siga siendo enfocable y su
 * cambio de estado se pueda anunciar.
 *
 * Uso:
 *   import { Button } from './button.js';
 *   const btn = new Button(document.querySelector('.c-button'));
 *   btn.setLoading(true, 'Guardando…');
 */

export class Button {
  /** @param {HTMLButtonElement} el */
  constructor(el) {
    if (!el) throw new Error('Button: se requiere un elemento <button>.');
    this.el = el;
    this._label = el.textContent;
  }

  /**
   * Activa o desactiva el estado de carga.
   * @param {boolean} isLoading
   * @param {string} [loadingLabel] Texto a mostrar mientras carga.
   */
  setLoading(isLoading, loadingLabel = 'Cargando…') {
    if (isLoading) {
      this._label = this.el.textContent;
      this.el.setAttribute('aria-disabled', 'true');
      this.el.setAttribute('aria-busy', 'true');
      this.el.textContent = loadingLabel;
    } else {
      this.el.removeAttribute('aria-disabled');
      this.el.removeAttribute('aria-busy');
      this.el.textContent = this._label;
    }
  }
}

/**
 * Inicializa todos los botones con [data-button] dentro de un contenedor.
 * @param {ParentNode} [root]
 * @returns {Button[]}
 */
export function initButtons(root = document) {
  return Array.from(root.querySelectorAll('[data-button]')).map(
    (el) => new Button(el)
  );
}

/**
 * ToggleButton
 * Implementa el patrón WAI-ARIA APG "Button (Toggle)": un botón con dos
 * estados (pulsado/no pulsado) expuestos con aria-pressed, sin cambiar
 * su texto visible.
 * https://www.w3.org/WAI/ARIA/apg/patterns/button/
 *
 * Uso:
 *   import { ToggleButton } from './button.js';
 *   const fav = new ToggleButton(document.querySelector('[data-toggle-button]'));
 *   fav.pressed; // true | false
 */
export class ToggleButton {
  /** @param {HTMLButtonElement} el */
  constructor(el) {
    if (!el) throw new Error('ToggleButton: se requiere un elemento <button>.');
    this.el = el;
    if (!el.hasAttribute('aria-pressed')) {
      el.setAttribute('aria-pressed', 'false');
    }
    this._onClick = this._onClick.bind(this);
    this.el.addEventListener('click', this._onClick);
  }

  /** @returns {boolean} */
  get pressed() {
    return this.el.getAttribute('aria-pressed') === 'true';
  }

  /** @param {boolean} value */
  set pressed(value) {
    this.el.setAttribute('aria-pressed', String(Boolean(value)));
  }

  toggle() {
    this.pressed = !this.pressed;
  }

  destroy() {
    this.el.removeEventListener('click', this._onClick);
  }

  _onClick() {
    this.toggle();
  }
}

/**
 * Inicializa todos los botones con [data-toggle-button] dentro de un
 * contenedor.
 * @param {ParentNode} [root]
 * @returns {ToggleButton[]}
 */
export function initToggleButtons(root = document) {
  return Array.from(root.querySelectorAll('[data-toggle-button]')).map(
    (el) => new ToggleButton(el)
  );
}
