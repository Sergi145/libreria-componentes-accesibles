/**
 * Componente: Popover
 * La APG no define un patrón «popover». Este componente cubre solo el
 * caso de contenido de texto, que se comporta como un Disclosure
 * (https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/): un botón con
 * aria-expanded + aria-controls muestra u oculta un panel `hidden` que
 * va justo después en el DOM, para conservar el orden de lectura y de
 * Tab. Si el contenido tiene controles, usa Modal o Disclosure.
 *
 * Reutiliza `Disclosure` para aria-expanded + hidden y añade
 * `dismissable` mientras está abierto:
 *  - Escape lo cierra y devuelve el foco al botón (WCAG 1.4.13:
 *    descartable).
 *  - Un clic o el foco fuera lo cierra sin mover el foco.
 *
 * Uso:
 *   import { Popover } from './popover.js';
 *   new Popover(document.querySelector('[data-popover]'));
 */

import { Disclosure } from '../disclosure/disclosure.js';
import { dismissable } from '../../utils/dismiss.js';

export class Popover {
  /** @param {HTMLButtonElement} trigger */
  constructor(trigger) {
    if (!trigger) {
      throw new Error('Popover: se requiere un elemento <button> disparador.');
    }
    this.trigger = trigger;
    this._disclosure = new Disclosure(trigger);
    this._dismissDestroy = null;

    // Se registra después del listener de Disclosure, así que al llegar
    // aquí aria-expanded ya refleja el nuevo estado.
    this._onClick = this._onClick.bind(this);
    trigger.addEventListener('click', this._onClick);
    this._sync();
  }

  get _panel() {
    const id = this.trigger.getAttribute('aria-controls');
    return id ? document.getElementById(id) : null;
  }

  /** @returns {boolean} */
  get expanded() {
    return this._disclosure.expanded;
  }

  open() {
    this._disclosure.open();
    this._sync();
  }

  /** @param {{ returnFocus?: boolean }} [options] */
  close({ returnFocus = false } = {}) {
    this._disclosure.close();
    this._sync();
    if (returnFocus) this.trigger.focus();
  }

  toggle() {
    if (this.expanded) this.close();
    else this.open();
  }

  destroy() {
    this._dismissDestroy?.();
    this._dismissDestroy = null;
    this.trigger.removeEventListener('click', this._onClick);
    this._disclosure.destroy();
  }

  _onClick() {
    this._sync();
  }

  _sync() {
    const panel = this._panel;
    if (this.expanded && panel && !this._dismissDestroy) {
      this._dismissDestroy = dismissable(panel, {
        trigger: this.trigger,
        onDismiss: (reason) => this.close({ returnFocus: reason === 'escape' }),
      });
    } else if (!this.expanded && this._dismissDestroy) {
      this._dismissDestroy();
      this._dismissDestroy = null;
    }
  }
}

/**
 * Inicializa todos los disparadores con [data-popover] dentro de un
 * contenedor.
 * @param {ParentNode} [root]
 * @returns {Popover[]}
 */
export function initPopovers(root = document) {
  return Array.from(root.querySelectorAll('[data-popover]')).map(
    (el) => new Popover(el)
  );
}
