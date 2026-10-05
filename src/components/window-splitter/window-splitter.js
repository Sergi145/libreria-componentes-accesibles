/**
 * Componente: Window splitter
 * Implementa el patrón WAI-ARIA APG "Window Splitter":
 * https://www.w3.org/WAI/ARIA/apg/patterns/window-splitter/
 *
 * El valor es un **porcentaje (0–100) del panel principal**, no
 * píxeles: así no depende del tamaño de la ventana. `window-splitter.js`
 * añade `tabindex="0"` y los `aria-value*` al construirse — el `.html`
 * de referencia no los lleva a mano, porque sin JS no tiene sentido
 * una parada de tabulación que no hace nada.
 *
 * Decisiones no obvias:
 * - `aria-orientation` describe la orientación del **separador**
 *   (línea divisoria), no la de los paneles: con `"vertical"`
 *   (variante `--horizontal`, paneles lado a lado) `←`/`→` lo mueven;
 *   con `"horizontal"` (variante `--vertical`, paneles apilados)
 *   `↑`/`↓` lo mueven. Se lee del HTML; si falta, se asume
 *   `"vertical"` (el valor por defecto de la propia APG).
 * - `aria-valuemin`/`aria-valuemax`/`aria-valuenow` se leen del HTML
 *   si ya están escritos (por si el autor quiere un rango o un valor
 *   inicial distinto del 50 %), y si no, se asume 0/100/50 — el mismo
 *   50 % que ya tienen los paneles por la variable CSS antes de que
 *   exista el JS.
 * - El valor se aplica con `--c-splitter-position` en `.c-splitter`
 *   (no en el separador): la misma variable sirve para las dos
 *   variantes, porque `flex-basis` se mide en el eje principal de
 *   `flex-direction` (ancho en `row`, alto en `column`).
 * - `Enter` colapsa al mínimo; si ya está colapsado, restaura el
 *   valor que tenía justo antes de colapsar (no un valor fijo).
 * - `splitter:change` solo se dispara si el valor cambia de verdad.
 * - `set value()` no dispara el evento (como `Listbox`); solo lo
 *   disparan las acciones del usuario (flechas, Inicio/Fin, Enter, o
 *   arrastrar con el puntero).
 * - Arrastre: `setPointerCapture()` en `pointerdown` para que
 *   `pointermove`/`pointerup` sigan llegando al separador aunque el
 *   puntero salga de su franja (el ratón se mueve más rápido que el
 *   reflow); el separador recibe el foco real al empezar a arrastrar,
 *   igual que al activarlo con teclado. `getBoundingClientRect()` del
 *   contenedor da el porcentaje; jsdom no implementa
 *   `setPointerCapture` (los tests la simulan con `?.`), así que el
 *   arrastre real solo se comprueba con Playwright.
 *
 * Uso:
 *   import { WindowSplitter } from './window-splitter.js';
 *   new WindowSplitter(document.querySelector('[data-splitter]'));
 */

export class WindowSplitter {
  /** @param {HTMLElement} separator [data-splitter] con role="separator". */
  constructor(separator) {
    if (!separator) {
      throw new Error(
        'WindowSplitter: se requiere el elemento con role="separator".'
      );
    }
    this.separator = separator;

    this._container = separator.closest('.c-splitter');
    if (!this._container) {
      throw new Error(
        'WindowSplitter: el separador debe estar dentro de un .c-splitter.'
      );
    }

    // Busca en getRootNode(), no document.getElementById(): el
    // separador puede construirse antes de insertar su envoltorio en
    // el documento (ver la misma nota en tooltip.js y en Combobox).
    const paneId = separator.getAttribute('aria-controls');
    this._pane = paneId
      ? separator.getRootNode().querySelector(`[id="${paneId}"]`)
      : null;
    if (!this._pane) {
      throw new Error(
        'WindowSplitter: aria-controls debe apuntar al panel principal.'
      );
    }

    this._orientation =
      separator.getAttribute('aria-orientation') === 'horizontal'
        ? 'horizontal'
        : 'vertical';
    this._min = separator.hasAttribute('aria-valuemin')
      ? parseFloat(separator.getAttribute('aria-valuemin'))
      : 0;
    this._max = separator.hasAttribute('aria-valuemax')
      ? parseFloat(separator.getAttribute('aria-valuemax'))
      : 100;
    this._step = parseFloat(separator.getAttribute('data-step')) || 5;
    this._collapsedFrom = null;

    const initial = separator.hasAttribute('aria-valuenow')
      ? parseFloat(separator.getAttribute('aria-valuenow'))
      : 50;

    separator.tabIndex = 0;
    separator.setAttribute('aria-valuemin', String(this._min));
    separator.setAttribute('aria-valuemax', String(this._max));
    this._syncDisplay(this._clamp(initial));

    this._dragging = false;

    this._onKeydown = this._onKeydown.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    separator.addEventListener('keydown', this._onKeydown);
    separator.addEventListener('pointerdown', this._onPointerDown);
    separator.addEventListener('pointermove', this._onPointerMove);
    separator.addEventListener('pointerup', this._onPointerUp);
    separator.addEventListener('pointercancel', this._onPointerUp);
  }

  /** @returns {number} Porcentaje (0–100) del panel principal. */
  get value() {
    return parseFloat(this.separator.getAttribute('aria-valuenow'));
  }

  /** @param {number} v Se acota a aria-valuemin/max; no dispara el evento. */
  set value(v) {
    this._syncDisplay(this._clamp(v));
  }

  /** @returns {boolean} */
  get collapsed() {
    return this.value <= this._min;
  }

  collapse() {
    if (this.collapsed) return;
    this._collapsedFrom = this.value;
    this._setClamped(this._min);
  }

  restore() {
    if (!this.collapsed) return;
    this._setClamped(this._collapsedFrom ?? (this._min + this._max) / 2);
    this._collapsedFrom = null;
  }

  destroy() {
    this.separator.removeEventListener('keydown', this._onKeydown);
    this.separator.removeEventListener('pointerdown', this._onPointerDown);
    this.separator.removeEventListener('pointermove', this._onPointerMove);
    this.separator.removeEventListener('pointerup', this._onPointerUp);
    this.separator.removeEventListener('pointercancel', this._onPointerUp);
  }

  _clamp(value) {
    return Math.min(Math.max(value, this._min), this._max);
  }

  _syncDisplay(value) {
    this.separator.setAttribute('aria-valuenow', String(value));
    const rounded = Math.round(value * 100) / 100;
    this.separator.setAttribute('aria-valuetext', `${rounded} %`);
    this._container.style.setProperty('--c-splitter-position', `${value}%`);
  }

  _setClamped(value) {
    const clamped = this._clamp(value);
    if (clamped === this.value) return;
    this._syncDisplay(clamped);
    this._dispatchChange();
  }

  _dispatchChange() {
    this.separator.dispatchEvent(
      new CustomEvent('splitter:change', {
        bubbles: true,
        detail: { value: this.value },
      })
    );
  }

  _onKeydown(event) {
    const increaseKey =
      this._orientation === 'horizontal' ? 'ArrowDown' : 'ArrowRight';
    const decreaseKey =
      this._orientation === 'horizontal' ? 'ArrowUp' : 'ArrowLeft';

    switch (event.key) {
      case increaseKey:
        event.preventDefault();
        this._setClamped(this.value + this._step);
        break;
      case decreaseKey:
        event.preventDefault();
        this._setClamped(this.value - this._step);
        break;
      case 'Home':
        event.preventDefault();
        this._setClamped(this._min);
        break;
      case 'End':
        event.preventDefault();
        this._setClamped(this._max);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.collapsed) this.restore();
        else this.collapse();
        break;
      default:
        break;
    }
  }

  _onPointerDown(event) {
    event.preventDefault();
    this._dragging = true;
    this.separator.setPointerCapture?.(event.pointerId);
    this.separator.focus();
    this._setClamped(this._percentageFromPoint(event));
  }

  _onPointerMove(event) {
    if (!this._dragging) return;
    this._setClamped(this._percentageFromPoint(event));
  }

  _onPointerUp(event) {
    if (!this._dragging) return;
    this._dragging = false;
    this.separator.releasePointerCapture?.(event.pointerId);
  }

  /** @param {PointerEvent} event */
  _percentageFromPoint(event) {
    const rect = this._container.getBoundingClientRect();
    const ratio =
      this._orientation === 'horizontal'
        ? (event.clientY - rect.top) / rect.height
        : (event.clientX - rect.left) / rect.width;
    return ratio * 100;
  }
}

/**
 * Inicializa todos los separadores con [data-splitter] dentro de un
 * contenedor.
 * @param {ParentNode} [root]
 * @returns {WindowSplitter[]}
 */
export function initWindowSplitters(root = document) {
  return Array.from(root.querySelectorAll('[data-splitter]')).map(
    (el) => new WindowSplitter(el)
  );
}
