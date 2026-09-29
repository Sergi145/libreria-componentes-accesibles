/**
 * Componente: Dropdown (navegación)
 * Lista de enlaces que se despliega desde un botón. Es un Disclosure
 * (https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), NO un menú
 * WAI-ARIA: sin role="menu" ni "menuitem", y sin flechas ↑/↓ — se
 * recorre con Tab como cualquier lista de enlaces. Para acciones de
 * aplicación (Editar, Duplicar, Eliminar…) usa `MenuButton`.
 *
 * Reutiliza `Disclosure` para aria-expanded + hidden y añade
 * `dismissable` mientras está abierto:
 *  - Escape lo cierra y devuelve el foco al botón.
 *  - Un clic o el foco fuera lo cierra sin mover el foco (así, al
 *    salir con Tab de la lista, el foco sigue su orden).
 *
 * Uso:
 *   import { Dropdown } from './dropdown.js';
 *   new Dropdown(document.querySelector('[data-dropdown]'));
 */

import { Disclosure } from '../disclosure/disclosure.js';
import { dismissable } from '../../utils/dismiss.js';

export class Dropdown {
  /** @param {HTMLButtonElement} trigger */
  constructor(trigger) {
    if (!trigger) {
      throw new Error('Dropdown: se requiere un elemento <button> disparador.');
    }
    this.trigger = trigger;
    this._disclosure = new Disclosure(trigger);
    this._dismissDestroy = null;

    // Se registra después del listener de Disclosure, así que al llegar
    // aquí aria-expanded ya refleja el nuevo estado.
    this._onClick = this._sync.bind(this);
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
 * Inicializa todos los disparadores con [data-dropdown] dentro de un
 * contenedor.
 * @param {ParentNode} [root]
 * @returns {Dropdown[]}
 */
export function initDropdowns(root = document) {
  return Array.from(root.querySelectorAll('[data-dropdown]')).map(
    (el) => new Dropdown(el)
  );
}
