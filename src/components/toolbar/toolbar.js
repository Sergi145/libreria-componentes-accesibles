/**
 * Componente: Toolbar
 * Implementa el patrón WAI-ARIA APG "Toolbar":
 * https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/
 *
 * El contenedor (role="toolbar") agrupa varios controles relacionados en
 * una sola parada de Tab: las flechas mueven el foco entre todos ellos
 * (cruzando los subgrupos role="group" que pueda tener), con roving
 * tabindex. La orientación se lee de aria-orientation en el propio HTML.
 *
 * Uso:
 *   import { Toolbar } from './toolbar.js';
 *   new Toolbar(document.querySelector('[data-toolbar]'));
 */

import { rovingTabindex } from '../../utils/roving-tabindex.js';

const ITEM_SELECTOR = '.c-toolbar__item';

export class Toolbar {
  /** @param {HTMLElement} el Contenedor con role="toolbar". */
  constructor(el) {
    if (!el) throw new Error('Toolbar: se requiere un elemento contenedor.');
    this.el = el;
    const orientation =
      el.getAttribute('aria-orientation') === 'vertical'
        ? 'vertical'
        : 'horizontal';

    this._destroyRoving = rovingTabindex(el, ITEM_SELECTOR, { orientation });
  }

  /** Libera los listeners de la utilidad de roving tabindex. */
  destroy() {
    this._destroyRoving();
  }
}

/**
 * Inicializa todos los toolbars con [data-toolbar] dentro de un
 * contenedor.
 * @param {ParentNode} [root]
 * @returns {Toolbar[]}
 */
export function initToolbars(root = document) {
  return Array.from(root.querySelectorAll('[data-toolbar]')).map(
    (el) => new Toolbar(el)
  );
}
