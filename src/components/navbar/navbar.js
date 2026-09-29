/**
 * Componente: Navbar
 * Combina un landmark de navegación (<nav aria-label>), un botón
 * *disclosure* para el menú móvil (la hamburguesa) y la indicación de
 * página actual (aria-current="page", en el marcado).
 *
 * El botón hamburguesa reutiliza Disclosure (../disclosure/disclosure.js)
 * en vez de reimplementar el mismo alternado de aria-expanded/hidden.
 * En ancho de escritorio el menú se muestra siempre por CSS, con
 * independencia de ese estado (ver navbar.css).
 *
 * Uso:
 *   import { Navbar } from './navbar.js';
 *   new Navbar(document.querySelector('[data-navbar]'));
 */

import { Disclosure } from '../disclosure/disclosure.js';

const TOGGLE_SELECTOR = '.c-navbar__toggle';

export class Navbar {
  /** @param {HTMLElement} el Elemento <nav>. */
  constructor(el) {
    if (!el) throw new Error('Navbar: se requiere el elemento <nav>.');
    this.el = el;
    const toggle = el.querySelector(TOGGLE_SELECTOR);
    this._disclosure = toggle ? new Disclosure(toggle) : null;
  }

  destroy() {
    this._disclosure?.destroy();
  }
}

/**
 * Inicializa todos los navbar con [data-navbar] dentro de un
 * contenedor.
 * @param {ParentNode} [root]
 * @returns {Navbar[]}
 */
export function initNavbars(root = document) {
  return Array.from(root.querySelectorAll('[data-navbar]')).map(
    (el) => new Navbar(el)
  );
}
