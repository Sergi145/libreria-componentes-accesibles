/**
 * Componente: Spinbutton
 * Implementa el patrón WAI-ARIA APG "Spinbutton":
 * https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/
 *
 * Sobre un `<input type="text" inputmode="decimal" role="spinbutton">`,
 * no `<input type="number">`: así se controla `aria-valuetext`, se
 * admite la coma decimal (algunos navegadores la rechazan en
 * `type="number"`) y la rueda del ratón no cambia el valor sin
 * querer. Los botones −/+ los crea esta clase con `tabindex="-1"` —
 * sin JS no existen, y con JS no añaden paradas de Tab propias (APG).
 *
 * Decisiones no obvias:
 * - El valor se redondea al número de decimales de `data-step` (no a
 *   un número fijo), para que sumar pasos decimales varias veces no
 *   acumule errores de coma flotante (p. ej. 0.1 + 0.2).
 * - `mousedown` en los botones cancela su propio evento
 *   (`preventDefault()`) antes de que el navegador les dé el foco: el
 *   foco se queda en el input, como pide el spec, en vez de saltar al
 *   botón y tener que devolverlo después.
 * - `aria-valuetext` se fija siempre (con `data-format` o, si no hay,
 *   con el número formateado solo), nunca se omite: así el lector no
 *   depende de que `aria-valuenow` sea exactamente el número mostrado.
 * - `spinbutton:change` solo se dispara si el valor cambia de verdad
 *   (p. ej. subir ya estando en el máximo no hace nada ni lo dispara).
 * - `set value()` no dispara el evento (como `Listbox`); solo lo
 *   disparan las acciones del usuario (flechas, RePág/AvPág,
 *   Inicio/Fin, los botones, o escribir a mano y salir del campo).
 * - Escritura a mano (`validate()`, en `blur`): admite coma y punto
 *   como separador decimal («2,5» y «2.5» valen igual); un valor
 *   fuera de rango se acota a min/max y se reescribe, pero **sin**
 *   redondearlo al paso (a diferencia de subir/bajar con flechas): un
 *   valor escrito a mano no tiene por qué caer en un múltiplo exacto
 *   de `data-step`, así que «90,25» con paso 0,5 se queda en 90,25,
 *   no salta a 90,5. Un texto que no es un número deja el texto
 *   escrito tal cual (para que el usuario vea qué corregir) y no toca
 *   `aria-valuenow`. No se valida hasta que el campo pierde el foco
 *   por primera vez («se toca»); desde entonces, también en cada
 *   `input`, solo para retirar el error en cuanto se corrige (mismo
 *   patrón que `TextField`, SPEC 04).
 *
 * Uso:
 *   import { Spinbutton } from './spinbutton.js';
 *   new Spinbutton(document.querySelector('[data-spinbutton]'));
 *   new Spinbutton(el, { format: (value) => `${value} kg` });
 */

import {
  setFieldError,
  clearFieldError,
  DEFAULT_MESSAGES,
} from '../../utils/field-validation.js';

const NUMBER_FORMAT = new Intl.NumberFormat('es-ES', {
  useGrouping: false,
  maximumFractionDigits: 10,
});

function formatNumber(value) {
  return NUMBER_FORMAT.format(value);
}

/** @param {number} step */
function decimalPlaces(step) {
  const text = String(step);
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
}

/** Redondea `value` al número de decimales de `step`, evitando ruido de coma flotante. */
function roundToStep(value, step) {
  const factor = 10 ** decimalPlaces(step);
  return Math.round(value * factor) / factor;
}

/**
 * Admite coma o punto como separador decimal, sin separador de miles.
 * @param {string} raw
 * @returns {number | null} `null` si no tiene forma de número.
 */
function parseTypedNumber(raw) {
  if (!/^-?\d+([.,]\d+)?$/.test(raw)) return null;
  return Number(raw.replace(',', '.'));
}

export class Spinbutton {
  /**
   * @param {HTMLInputElement} input [data-spinbutton] con role="spinbutton".
   * @param {{ format?: (value: number) => string }} [options]
   */
  constructor(input, { format } = {}) {
    if (!input) {
      throw new Error('Spinbutton: se requiere el <input role="spinbutton">.');
    }
    this.input = input;

    this._min = parseFloat(input.getAttribute('aria-valuemin'));
    this._max = parseFloat(input.getAttribute('aria-valuemax'));
    this._step = parseFloat(input.getAttribute('data-step')) || 1;
    this._stepLarge =
      parseFloat(input.getAttribute('data-step-large')) || this._step * 10;
    this._format = format ?? this._defaultFormat();

    this._wrapper = document.createElement('div');
    this._wrapper.className = 'c-spinbutton';
    input.replaceWith(this._wrapper);

    this._decrementButton = this._createButton('Disminuir', 'M5 12h14');
    this._incrementButton = this._createButton('Aumentar', 'M12 5v14M5 12h14');
    this._wrapper.append(this._decrementButton, input, this._incrementButton);

    this._touched = false;

    this._onKeydown = this._onKeydown.bind(this);
    this._onBlur = this._onBlur.bind(this);
    this._onInput = this._onInput.bind(this);
    input.addEventListener('keydown', this._onKeydown);
    input.addEventListener('blur', this._onBlur);
    input.addEventListener('input', this._onInput);

    this._decrementButton.addEventListener('mousedown', preventFocus);
    this._incrementButton.addEventListener('mousedown', preventFocus);
    this._decrementButton.addEventListener('click', () => this.stepDown());
    this._incrementButton.addEventListener('click', () => this.stepUp());

    this._syncDisplay(parseFloat(input.getAttribute('aria-valuenow')));
  }

  /** @returns {number} */
  get value() {
    return parseFloat(this.input.getAttribute('aria-valuenow'));
  }

  /** @param {number} v Se acota a min/max y se redondea al paso; no dispara el evento. */
  set value(v) {
    this._syncDisplay(this._clamp(v));
  }

  /** @param {number} [n] */
  stepUp(n = 1) {
    this._applyDelta(n * this._step);
  }

  /** @param {number} [n] */
  stepDown(n = 1) {
    this._applyDelta(-n * this._step);
  }

  /** @returns {boolean} */
  get invalid() {
    return this.input.getAttribute('aria-invalid') === 'true';
  }

  /**
   * Valida el texto escrito a mano y pinta o quita el mensaje de
   * error. Se puede llamar en cualquier momento (p. ej. al enviar el
   * formulario), no solo tras el blur.
   * @returns {boolean}
   */
  validate() {
    const raw = this.input.value.trim();

    if (raw === '') {
      if (this.input.required) {
        const message =
          this.input.getAttribute('data-error-required') ||
          DEFAULT_MESSAGES.valueMissing;
        setFieldError(this.input, message);
        return false;
      }
      clearFieldError(this.input);
      this._syncDisplay(this.value);
      return true;
    }

    const parsed = parseTypedNumber(raw);
    if (parsed === null) {
      const message =
        this.input.getAttribute('data-error-badinput') || 'Introduce un número';
      setFieldError(this.input, message);
      return false;
    }

    clearFieldError(this.input);
    // Solo acota a min/max, sin redondear al paso: a diferencia de
    // subir/bajar con flechas, escribir a mano no tiene por qué caer
    // en un múltiplo exacto del paso.
    const clamped = this._clampRange(parsed);
    const changed = clamped !== this.value;
    this._syncDisplay(clamped);
    if (changed) this._dispatchChange();
    return true;
  }

  destroy() {
    this.input.removeEventListener('keydown', this._onKeydown);
    this.input.removeEventListener('blur', this._onBlur);
    this.input.removeEventListener('input', this._onInput);
    this._wrapper.replaceWith(this.input);
  }

  _defaultFormat() {
    const template = this.input.getAttribute('data-format');
    return (value) => {
      const text = formatNumber(value);
      return template ? template.replace('{value}', text) : text;
    };
  }

  _createButton(label, pathD) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'c-spinbutton__button';
    button.tabIndex = -1;
    button.setAttribute('aria-label', label);
    button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="${pathD}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>`;
    return button;
  }

  /** Solo acota a min/max, sin redondear al paso (para la escritura a mano). */
  _clampRange(value) {
    return Math.min(Math.max(value, this._min), this._max);
  }

  /** Acota a min/max y redondea al paso (para flechas, botones y RePág/AvPág). */
  _clamp(value) {
    return roundToStep(this._clampRange(value), this._step);
  }

  _syncDisplay(value) {
    this.input.setAttribute('aria-valuenow', String(value));
    this.input.value = formatNumber(value);
    this.input.setAttribute('aria-valuetext', this._format(value));
    this._decrementButton.disabled = value <= this._min;
    this._incrementButton.disabled = value >= this._max;
  }

  _setClamped(value) {
    const clamped = this._clamp(value);
    if (clamped === this.value) return;
    this._syncDisplay(clamped);
    this._dispatchChange();
  }

  _applyDelta(delta) {
    this._setClamped(this.value + delta);
  }

  _dispatchChange() {
    this.input.dispatchEvent(
      new CustomEvent('spinbutton:change', {
        bubbles: true,
        detail: { value: this.value },
      })
    );
  }

  _onKeydown(event) {
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.stepUp();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.stepDown();
        break;
      case 'PageUp':
        event.preventDefault();
        this._applyDelta(this._stepLarge);
        break;
      case 'PageDown':
        event.preventDefault();
        this._applyDelta(-this._stepLarge);
        break;
      case 'Home':
        event.preventDefault();
        this._setClamped(this._min);
        break;
      case 'End':
        event.preventDefault();
        this._setClamped(this._max);
        break;
      default:
        break;
    }
  }

  _onBlur() {
    this._touched = true;
    this.validate();
  }

  _onInput() {
    if (this._touched && this.invalid) this.validate();
  }
}

function preventFocus(event) {
  event.preventDefault();
}

/**
 * Inicializa todos los spinbutton con [data-spinbutton] dentro de un
 * contenedor.
 * @param {ParentNode} [root]
 * @returns {Spinbutton[]}
 */
export function initSpinbuttons(root = document) {
  return Array.from(root.querySelectorAll('[data-spinbutton]')).map(
    (input) => new Spinbutton(input)
  );
}
