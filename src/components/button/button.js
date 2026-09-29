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
