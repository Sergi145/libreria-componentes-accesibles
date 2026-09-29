/**
 * Componente: Tabs
 * Implementa el patrón WAI-ARIA APG "Tabs":
 * https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 *
 * El elemento con role="tablist" agrupa los botones role="tab" en una
 * sola parada de Tab (roving tabindex, como Toolbar). Cada tab controla
 * un role="tabpanel" con tabindex="0", así que el siguiente Tab tras la
 * pestaña activa lleva directamente a su panel.
 *
 * Activación:
 *  - 'automatic' (por defecto): mover el foco (flechas/Home/End) ya
 *    selecciona la pestaña. Úsalo si los paneles no tardan en cargar.
 *  - 'manual': mover el foco NO selecciona; hace falta clic o
 *    Enter/Espacio (el <button> nativo los convierte en clic). Úsalo si
 *    cambiar de panel es costoso (por ejemplo, carga por red).
 *
 * Uso:
 *   import { Tabs } from './tabs.js';
 *   new Tabs(document.querySelector('[data-tabs]'));
 *   new Tabs(el, { activation: 'manual' });
 */

import { rovingTabindex } from '../../utils/roving-tabindex.js';

const TAB_SELECTOR = '[role="tab"]';

export class Tabs {
  /**
   * @param {HTMLElement} el Contenedor con role="tablist".
   * @param {{ activation?: 'automatic' | 'manual' }} [options]
   */
  constructor(el, { activation = 'automatic' } = {}) {
    if (!el) {
      throw new Error('Tabs: se requiere el elemento con role="tablist".');
    }
    this.el = el;
    this.activation = activation;
    this.tabs = Array.from(el.querySelectorAll(TAB_SELECTOR));

    const orientation =
      el.getAttribute('aria-orientation') === 'vertical'
        ? 'vertical'
        : 'horizontal';

    this._onFocusChange = this._onFocusChange.bind(this);
    this._onClick = this._onClick.bind(this);

    this._destroyRoving = rovingTabindex(el, TAB_SELECTOR, {
      orientation,
      onFocusChange: this._onFocusChange,
    });

    this.el.addEventListener('click', this._onClick);

    // Estado inicial: respeta un aria-selected="true" ya presente en el
    // HTML; si no hay ninguna, selecciona la primera pestaña.
    const initial =
      this.tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ??
      this.tabs[0];
    if (initial) this._activate(initial, { focus: false });
  }

  /** @param {HTMLElement | number} tabOrIndex */
  select(tabOrIndex) {
    const tab =
      typeof tabOrIndex === 'number' ? this.tabs[tabOrIndex] : tabOrIndex;
    if (tab) this._activate(tab, { focus: false });
  }

  destroy() {
    this._destroyRoving();
    this.el.removeEventListener('click', this._onClick);
  }

  _panelFor(tab) {
    const id = tab.getAttribute('aria-controls');
    return id ? document.getElementById(id) : null;
  }

  _activate(tab, { focus = true } = {}) {
    this.tabs.forEach((other) => {
      const selected = other === tab;
      other.setAttribute('aria-selected', String(selected));
      other.setAttribute('tabindex', selected ? '0' : '-1');
      this._panelFor(other)?.toggleAttribute('hidden', !selected);
    });
    if (focus) tab.focus();
  }

  // Con activación automática, cualquier cambio de foco (flechas,
  // Home/End o clic) selecciona la pestaña. Con activación manual, el
  // foco por sí solo no selecciona nada: hace falta _onClick.
  _onFocusChange(tab) {
    if (this.activation === 'automatic') {
      this._activate(tab, { focus: false });
    }
  }

  _onClick(event) {
    if (this.activation !== 'manual') return;
    const tab = event.target.closest(TAB_SELECTOR);
    if (tab && this.tabs.includes(tab)) this._activate(tab, { focus: false });
  }
}

/**
 * Inicializa todos los tablist con [data-tabs] dentro de un contenedor.
 * @param {ParentNode} [root]
 * @param {{ activation?: 'automatic' | 'manual' }} [options]
 * @returns {Tabs[]}
 */
export function initTabs(root = document, options = {}) {
  return Array.from(root.querySelectorAll('[data-tabs]')).map(
    (el) => new Tabs(el, options)
  );
}
