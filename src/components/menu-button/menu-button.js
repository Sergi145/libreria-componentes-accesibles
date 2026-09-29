/**
 * Componente: Menu Button (acciones)
 * Implementa el patrón WAI-ARIA APG "Menu Button":
 * https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
 *
 * Un botón con aria-haspopup="menu" abre un `<ul role="menu">` de
 * acciones de aplicación (Editar, Duplicar, Eliminar…). Para una lista
 * de enlaces de navegación usa `Dropdown`: no es un menú ARIA.
 *
 * Teclado:
 *  - Botón: Enter, Espacio y ↓ abren y enfocan el primer elemento; ↑
 *    abre y enfoca el último.
 *  - Menú: ↓/↑ recorren con envoltura, Inicio/Fin van al primero y al
 *    último, y se saltan los deshabilitados (`rovingTabindex`).
 *  - Una tecla imprimible enfoca el siguiente elemento cuyo texto
 *    empieza por esa letra, dando la vuelta al final (sin búfer).
 *  - Escape cierra y devuelve el foco al botón (`dismissable`, que
 *    cancela el evento para no cerrar un <dialog> contenedor).
 *  - Tab cierra y deja que el foco siga su orden natural.
 *  - Activar un `menuitem` cierra y devuelve el foco al botón.
 *  - `menuitemcheckbox` alterna `aria-checked` y `menuitemradio` marca
 *    uno de su `role="group"` y desmarca el resto; ninguno cierra.
 *
 * El estado vive en `aria-expanded`, `aria-checked` y `hidden`.
 * Variante de botón partido: el `MenuButton` se engancha al botón de la
 * flecha; la acción principal es otro botón del envoltorio.
 *
 * Uso:
 *   import { MenuButton } from './menu-button.js';
 *   new MenuButton(document.querySelector('[data-menu-button]'));
 */

import { rovingTabindex } from '../../utils/roving-tabindex.js';
import { dismissable } from '../../utils/dismiss.js';

const ITEM_SELECTOR = '[role^="menuitem"]';

function isEnabled(el) {
  return (
    !el.disabled &&
    !el.hasAttribute('disabled') &&
    el.getAttribute('aria-disabled') !== 'true'
  );
}

export class MenuButton {
  /** @param {HTMLButtonElement} button */
  constructor(button) {
    if (!button) {
      throw new Error('MenuButton: se requiere un elemento <button>.');
    }
    this.button = button;

    // Busca el menú en el árbol del propio botón: puede construirse
    // antes de insertarse en el documento (p. ej. en Storybook), y
    // entonces `document.getElementById` no lo alcanzaría todavía.
    const id = button.getAttribute('aria-controls');
    const root = button.getRootNode();
    this.menu = id
      ? (root.getElementById?.(id) ?? root.querySelector(`[id="${id}"]`))
      : null;
    if (!this.menu) {
      throw new Error(
        'MenuButton: el botón necesita aria-controls apuntando al menú.'
      );
    }

    if (!button.hasAttribute('aria-expanded')) {
      button.setAttribute('aria-expanded', 'false');
    }

    this._rovingDestroy = null;
    this._dismissDestroy = null;

    this._onButtonClick = this._onButtonClick.bind(this);
    this._onButtonKeydown = this._onButtonKeydown.bind(this);
    this._onMenuKeydown = this._onMenuKeydown.bind(this);
    this._onMenuClick = this._onMenuClick.bind(this);

    button.addEventListener('click', this._onButtonClick);
    button.addEventListener('keydown', this._onButtonKeydown);
    this.menu.addEventListener('keydown', this._onMenuKeydown);
    this.menu.addEventListener('click', this._onMenuClick);
  }

  /** @returns {boolean} */
  get expanded() {
    return this.button.getAttribute('aria-expanded') === 'true';
  }

  get _items() {
    return Array.from(this.menu.querySelectorAll(ITEM_SELECTOR)).filter(
      isEnabled
    );
  }

  /** @param {{ focus?: 'first' | 'last' }} [options] */
  open({ focus = 'first' } = {}) {
    if (!this.expanded) {
      this.button.setAttribute('aria-expanded', 'true');
      this.menu.hidden = false;
      this._rovingDestroy = rovingTabindex(this.menu, ITEM_SELECTOR, {
        orientation: 'vertical',
      });
      this._dismissDestroy = dismissable(this.menu, {
        trigger: this.button,
        onDismiss: (reason) => this.close({ returnFocus: reason === 'escape' }),
      });
    }
    const items = this._items;
    const target = focus === 'last' ? items[items.length - 1] : items[0];
    if (target) this._focusItem(target);
  }

  /** @param {{ returnFocus?: boolean }} [options] */
  close({ returnFocus = true } = {}) {
    if (this.expanded) {
      this.button.setAttribute('aria-expanded', 'false');
      this.menu.hidden = true;
      this._rovingDestroy?.();
      this._rovingDestroy = null;
      this._dismissDestroy?.();
      this._dismissDestroy = null;
    }
    if (returnFocus) this.button.focus();
  }

  destroy() {
    this._rovingDestroy?.();
    this._dismissDestroy?.();
    this._rovingDestroy = null;
    this._dismissDestroy = null;
    this.button.removeEventListener('click', this._onButtonClick);
    this.button.removeEventListener('keydown', this._onButtonKeydown);
    this.menu.removeEventListener('keydown', this._onMenuKeydown);
    this.menu.removeEventListener('click', this._onMenuClick);
  }

  _focusItem(item) {
    this._items.forEach((el) =>
      el.setAttribute('tabindex', el === item ? '0' : '-1')
    );
    item.focus();
  }

  _onButtonClick() {
    if (this.expanded) this.close({ returnFocus: false });
    else this.open({ focus: 'first' });
  }

  _onButtonKeydown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.open({ focus: 'first' });
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.open({ focus: 'last' });
    }
  }

  _onMenuKeydown(event) {
    if (event.key === 'Tab') {
      // Cierra sin cancelar el evento: el foco sigue su orden natural.
      this.close({ returnFocus: false });
      return;
    }
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key.length === 1 && event.key !== ' ') {
      this._typeahead(event.key, event.target.closest(ITEM_SELECTOR));
    }
  }

  _typeahead(char, current) {
    const items = this._items;
    if (items.length === 0) return;
    const start = items.indexOf(current) + 1;
    const letter = char.toLocaleLowerCase();
    for (let i = 0; i < items.length; i++) {
      const item = items[(start + i) % items.length];
      if (item.textContent.trim().toLocaleLowerCase().startsWith(letter)) {
        this._focusItem(item);
        return;
      }
    }
  }

  _onMenuClick(event) {
    const item = event.target.closest(ITEM_SELECTOR);
    if (!item || !isEnabled(item)) return;
    const role = item.getAttribute('role');

    if (role === 'menuitemcheckbox') {
      const checked = item.getAttribute('aria-checked') === 'true';
      item.setAttribute('aria-checked', String(!checked));
    } else if (role === 'menuitemradio') {
      const group = item.closest('[role="group"]') ?? this.menu;
      group
        .querySelectorAll('[role="menuitemradio"]')
        .forEach((radio) =>
          radio.setAttribute('aria-checked', String(radio === item))
        );
    } else {
      this.close({ returnFocus: true });
    }
  }
}

/**
 * Inicializa todos los botones con [data-menu-button] dentro de un
 * contenedor.
 * @param {ParentNode} [root]
 * @returns {MenuButton[]}
 */
export function initMenuButtons(root = document) {
  return Array.from(root.querySelectorAll('[data-menu-button]')).map(
    (el) => new MenuButton(el)
  );
}
