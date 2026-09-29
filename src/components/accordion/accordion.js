/**
 * Componente: Accordion
 * Implementa el patrón WAI-ARIA APG "Accordion":
 * https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
 *
 * Comportamiento:
 *  - Click/Espacio/Enter en el trigger alterna aria-expanded y el
 *    atributo `hidden` del panel asociado.
 *  - Flecha ↑ / ↓ mueve el foco entre triggers.
 *  - Home / End mueven el foco al primer/último trigger.
 *  - Por defecto varios paneles pueden estar abiertos a la vez; pásale
 *    { allowMultiple: false } para forzar que solo uno lo esté.
 *
 * Uso:
 *   import { Accordion } from './accordion.js';
 *   new Accordion(document.querySelector('[data-accordion]'));
 */

export class Accordion {
  /**
   * @param {HTMLElement} el Contenedor con los pares heading/trigger + panel.
   * @param {{ allowMultiple?: boolean }} [options]
   */
  constructor(el, { allowMultiple = true } = {}) {
    if (!el) throw new Error('Accordion: se requiere un elemento contenedor.');
    this.el = el;
    this.allowMultiple = allowMultiple;
    this.triggers = Array.from(el.querySelectorAll('.c-accordion__trigger'));

    this._onClick = this._onClick.bind(this);
    this._onKeydown = this._onKeydown.bind(this);

    this.triggers.forEach((trigger) => {
      trigger.addEventListener('click', this._onClick);
      trigger.addEventListener('keydown', this._onKeydown);
    });
  }

  /** Libera los listeners (útil en apps de una sola página). */
  destroy() {
    this.triggers.forEach((trigger) => {
      trigger.removeEventListener('click', this._onClick);
      trigger.removeEventListener('keydown', this._onKeydown);
    });
  }

  _panelFor(trigger) {
    return document.getElementById(trigger.getAttribute('aria-controls'));
  }

  _onClick(event) {
    this._toggle(event.currentTarget);
  }

  _toggle(trigger) {
    const panel = this._panelFor(trigger);
    const willExpand = trigger.getAttribute('aria-expanded') !== 'true';

    if (willExpand && !this.allowMultiple) {
      this.triggers.forEach((other) => {
        if (other !== trigger) this._setExpanded(other, false);
      });
    }

    this._setExpanded(trigger, willExpand);
    panel?.toggleAttribute('hidden', !willExpand);
  }

  _setExpanded(trigger, expanded) {
    trigger.setAttribute('aria-expanded', String(expanded));
    const panel = this._panelFor(trigger);
    panel?.toggleAttribute('hidden', !expanded);
  }

  _onKeydown(event) {
    const currentIndex = this.triggers.indexOf(event.currentTarget);
    let targetIndex = null;

    switch (event.key) {
      case 'ArrowDown':
        targetIndex = (currentIndex + 1) % this.triggers.length;
        break;
      case 'ArrowUp':
        targetIndex =
          (currentIndex - 1 + this.triggers.length) % this.triggers.length;
        break;
      case 'Home':
        targetIndex = 0;
        break;
      case 'End':
        targetIndex = this.triggers.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    this.triggers[targetIndex].focus();
  }
}

/**
 * Inicializa todos los acordeones con [data-accordion] dentro de un
 * contenedor.
 * @param {ParentNode} [root]
 * @param {{ allowMultiple?: boolean }} [options]
 * @returns {Accordion[]}
 */
export function initAccordions(root = document, options = {}) {
  return Array.from(root.querySelectorAll('[data-accordion]')).map(
    (el) => new Accordion(el, options)
  );
}
