/**
 * Componente: Menubar (barra de menús)
 * Una <ul role="menubar"> horizontal con botones que abren menús verticales.
 * Implementa el patrón WAI-ARIA APG "Menu Bar":
 * https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 *
 * Teclado:
 *  - Barra: Tab entra una sola vez (roving tabindex), ←/→ recorren con envoltura.
 *  - ↓ y Enter/Espacio abren el menú enfocando el primer elemento; ↑ abre y
 *    enfoca el último.
 *  - Un botón sin menú se activa con Enter, Espacio o clic (sin cerrar).
 *  - Typeahead en la barra busca el siguiente elemento cuyo texto empieza
 *    por esa letra.
 *
 * Uso:
 *   import { Menubar, initMenubars } from './menubar.js';
 *   new Menubar(document.querySelector('[role="menubar"]'));
 */

import { rovingTabindex } from '../../utils/roving-tabindex.js';
import { dismissable } from '../../utils/dismiss.js';
import { createTypeahead } from '../../utils/typeahead.js';
import {
  getMenuItems,
  focusMenuItem,
  toggleMenuItem,
} from '../../utils/menu.js';

const ITEM_SELECTOR = '[role="menuitem"]';

export class Menubar {
  /** @param {HTMLElement} el [role="menubar"] */
  constructor(el) {
    if (!el || el.getAttribute('role') !== 'menubar') {
      throw new Error('Menubar: se requiere un elemento [role="menubar"].');
    }
    this.el = el;
    this._rovingDestroy = null;
    this._typeahead = null;
    this._openMenu = null;
    this._openMenuBarItem = null;
    this._rovingMenuDestroy = null;
    this._typeaheadMenu = null;
    this._dismissDestroy = null;
    this._menuListeners = [];
    this._listeners = [];

    const items = Array.from(
      el.querySelectorAll(`:scope > li > ${ITEM_SELECTOR}`)
    );
    if (items.length === 0) return;

    // Roving tabindex en los botones de la barra
    this._rovingDestroy = rovingTabindex(el, ITEM_SELECTOR, {
      orientation: 'horizontal',
      wrap: true,
    });

    // Typeahead en la barra
    this._typeahead = createTypeahead();
    this._barItems = items;

    items.forEach((button) => {
      const onClick = () => this._onBarButtonClick(button);
      const onKeydown = (event) => this._onBarKeydown(event, button);
      button.addEventListener('click', onClick);
      button.addEventListener('keydown', onKeydown);
      this._listeners.push({ button, onClick, onKeydown });
    });
  }

  get openMenu() {
    return this._openMenu;
  }

  open(barItem, { focus = 'first' } = {}) {
    if (!barItem) return;
    const menuId = barItem.getAttribute('aria-controls');
    if (!menuId) return;

    const root = barItem.getRootNode();
    const menu =
      root.getElementById?.(menuId) ?? root.querySelector(`[id="${menuId}"]`);
    if (!menu) return;

    // Cierra el menú anterior si hay otro abierto
    if (this._openMenu && this._openMenu !== menu) {
      this.close({ returnFocus: false });
    }

    if (this._openMenu === menu) return;

    barItem.setAttribute('aria-expanded', 'true');
    menu.hidden = false;

    const menuItems = getMenuItems(menu);
    const target =
      focus === 'last' ? menuItems[menuItems.length - 1] : menuItems[0];
    if (target) focusMenuItem(menu, target);

    this._openMenu = menu;
    this._openMenuBarItem = barItem;

    // Roving tabindex vertical en el menú
    this._rovingMenuDestroy = rovingTabindex(menu, '[role^="menuitem"]', {
      orientation: 'vertical',
      wrap: true,
    });

    // Typeahead en el menú
    this._typeaheadMenu = createTypeahead();

    // Listeners de teclado y clic
    const onKeydown = (event) => this._onMenuKeydown(event);
    const onMenuClick = (event) => this._onMenuClick(event);
    menu.addEventListener('keydown', onKeydown);
    menu.addEventListener('click', onMenuClick);
    this._menuListeners = [
      { target: menu, listener: onKeydown, type: 'keydown' },
      { target: menu, listener: onMenuClick, type: 'click' },
    ];

    // dismissable para Escape y clic fuera
    this._dismissDestroy = dismissable(menu, {
      trigger: barItem,
      onDismiss: (reason) => this.close({ returnFocus: reason === 'escape' }),
    });
  }

  close({ returnFocus = true } = {}) {
    if (!this._openMenu) return;

    const barItem = this._openMenuBarItem;
    if (barItem) {
      barItem.setAttribute('aria-expanded', 'false');
    }
    this._openMenu.hidden = true;

    // Limpiar listeners y destructores del menú
    this._menuListeners.forEach(({ target, listener, type }) => {
      target.removeEventListener(type, listener);
    });
    this._menuListeners = [];
    this._rovingMenuDestroy?.();
    this._rovingMenuDestroy = null;
    this._typeaheadMenu = null;
    this._dismissDestroy?.();
    this._dismissDestroy = null;

    this._openMenu = null;
    this._openMenuBarItem = null;

    if (returnFocus && barItem) {
      barItem.focus();
    }
  }

  destroy() {
    this._rovingDestroy?.();
    this._rovingDestroy = null;
    this._typeahead = null;
    this._listeners.forEach(({ button, onClick, onKeydown }) => {
      button.removeEventListener('click', onClick);
      button.removeEventListener('keydown', onKeydown);
    });
    this._listeners = [];
    this.close({ returnFocus: false });
    this._rovingMenuDestroy?.();
    this._rovingMenuDestroy = null;
    this._typeaheadMenu = null;
    this._menuListeners = [];
  }

  _onBarButtonClick(barItem) {
    if (this._openMenu) {
      const menuId = barItem.getAttribute('aria-controls');
      const root = barItem.getRootNode();
      const menu =
        root.getElementById?.(menuId) ?? root.querySelector(`[id="${menuId}"]`);
      if (this._openMenu === menu) {
        this.close({ returnFocus: false });
        return;
      }
    }
    this.open(barItem, { focus: 'first' });
  }

  _onBarKeydown(event, barItem) {
    const { key } = event;

    // ↓ y Enter/Espacio: abrir menú
    if (key === 'ArrowDown' || key === 'Enter' || key === ' ') {
      event.preventDefault();
      const menuId = barItem.getAttribute('aria-controls');
      if (menuId) {
        this.open(barItem, { focus: 'first' });
      }
      return;
    }

    // ↑: abrir menú y enfoca el último
    if (key === 'ArrowUp') {
      event.preventDefault();
      const menuId = barItem.getAttribute('aria-controls');
      if (menuId) {
        this.open(barItem, { focus: 'last' });
      }
      return;
    }

    // Typeahead (una letra)
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (key.length === 1 && key !== ' ') {
      const currentIndex = this._barItems.indexOf(barItem);
      const nextIndex = this._typeahead?.search(
        key,
        this._barItems,
        currentIndex
      );
      if (nextIndex !== -1 && nextIndex !== undefined) {
        this._barItems[nextIndex].focus();
      }
    }
  }

  _onMenuKeydown(event) {
    const { key } = event;
    const barItems = Array.from(
      this.el.querySelectorAll(`:scope > li > ${ITEM_SELECTOR}`)
    );
    const currentBarItem = this._openMenuBarItem;
    const currentIndex = barItems.indexOf(currentBarItem);

    // → cierra el menú y abre el siguiente
    if (key === 'ArrowRight') {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % barItems.length;
      const nextItem = barItems[nextIndex];
      this.close({ returnFocus: false });
      this.open(nextItem, { focus: 'first' });
      return;
    }

    // ← cierra el menú y abre el anterior
    if (key === 'ArrowLeft') {
      event.preventDefault();
      const prevIndex = (currentIndex - 1 + barItems.length) % barItems.length;
      const prevItem = barItems[prevIndex];
      this.close({ returnFocus: false });
      this.open(prevItem, { focus: 'first' });
      return;
    }

    // Tab cierra el menú sin forzar foco
    if (key === 'Tab') {
      this.close({ returnFocus: false });
      return;
    }

    // Escape cierra y devuelve foco al botón de la barra
    if (key === 'Escape') {
      event.preventDefault();
      this.close({ returnFocus: true });
      return;
    }

    // Typeahead (una letra)
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (key.length === 1 && key !== ' ') {
      const menuItems = getMenuItems(this._openMenu);
      const currentItem = document.activeElement;
      const currentItemIndex = menuItems.indexOf(currentItem);
      const nextIndex = this._typeaheadMenu?.search(
        key,
        menuItems,
        currentItemIndex
      );
      if (nextIndex !== -1 && nextIndex !== undefined) {
        focusMenuItem(this._openMenu, menuItems[nextIndex]);
      }
    }
  }

  _onMenuClick(event) {
    const item = event.target.closest('[role^="menuitem"]');
    if (!item) return;

    const isToggleable = toggleMenuItem(item, this._openMenu);
    if (!isToggleable) {
      this.close({ returnFocus: true });
    }
  }
}

/**
 * Inicializa todas las [role="menubar"] dentro de un contenedor.
 * @param {ParentNode} [root]
 * @returns {Menubar[]}
 */
export function initMenubars(root = document) {
  return Array.from(root.querySelectorAll('[role="menubar"]')).map(
    (el) => new Menubar(el)
  );
}
